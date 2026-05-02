import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { 
  MessageCircle, 
  Calendar, 
  HeartPulse, 
  Activity, 
  BookOpen,
  Users,
  Target,
  Clock,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../lib/api';
import toast from 'react-hot-toast';

export function StudentDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [moodValue, setMoodValue] = useState(50);
  const [isSaving, setIsSaving] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    moodScore: 0,
    streakDays: 0,
    totalSessions: 0,
    stressLevel: 0,
    history: [] as { value: number }[]
  });
  
  const greetingRef = useRef<HTMLHeadingElement>(null);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const data = await apiRequest<any>('/api/user/stats', { token });
      try {
        const twin = await apiRequest<any>('/api/ai/stress-predict', { method: 'POST', token });
        data.stressLevel = twin.stressScore || data.stressLevel;
      } catch { /* ignore */ }
      setDashboardStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const handleSaveCheckIn = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      await apiRequest('/api/user/check-in', {
        method: 'POST',
        body: JSON.stringify({ score: moodValue }),
        token
      });
      toast.success('Sanctuary check-in successful.');
      fetchStats();
    } catch (error: any) {
      toast.error('Failed to save check-in.');
    } finally {
      setIsSaving(false);
    }
  };

  const getMoodColor = (val: number) => {
    const red = Math.max(0, 255 - (val * 2.55));
    const green = Math.max(0, val * 2.55);
    return `rgba(${red}, ${green}, 0, 0.08)`;
  };

  const getMoodHex = (val: number) => {
    const red = Math.max(0, 255 - (val * 2.55));
    const green = Math.max(0, val * 2.55);
    return `rgb(${red}, ${green}, 0)`;
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  useEffect(() => {
    if (greetingRef.current) {
      gsap.fromTo(greetingRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
    }

    statRefs.current.forEach((el, index) => {
      if (!el) return;
      const targetVal = parseFloat(el.getAttribute('data-target') || '0');
      gsap.fromTo(el, 
        { innerHTML: '0' },
        {
          innerHTML: targetVal,
          duration: 1.5,
          ease: 'power2.out',
          delay: 0.2 + (index * 0.1),
          onUpdate: function() {
            if (el) el.innerHTML = Number(this.targets()[0].innerHTML).toFixed(statRefs.current[index]?.getAttribute('data-decimal') === 'true' ? 1 : 0);
          }
        }
      );
    });
  }, [user, dashboardStats]);

  const stats = [
    { label: 'Mood Score', target: dashboardStats.moodScore, suffix: '/10', decimal: true },
    { label: 'Streak Days', target: dashboardStats.streakDays, suffix: '', decimal: false },
    { label: 'Total Sessions', target: dashboardStats.totalSessions, suffix: '', decimal: false },
    { label: 'Stress Level', target: dashboardStats.stressLevel, suffix: '%', decimal: false },
  ];

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    if (dashboardStats.recentActivities) {
      setRecentActivities(dashboardStats.recentActivities.map((a: any) => ({
        ...a,
        icon: a.type === 'check-in' ? HeartPulse : a.type === 'appointment' ? Calendar : MessageCircle
      })));
    }
  }, [dashboardStats]);

  return (
    <div className="min-h-screen bg-[#0A0F14] text-slate-200 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12 pt-24">
        
        {/* Header */}
        <header className="mb-16">
          <h1 
            ref={greetingRef}
            className="text-4xl md:text-6xl font-bold text-white tracking-tight"
          >
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl font-medium">
            Your digital twin has been calibrated. Continue your journey to mindfulness and expert care.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#141C24] border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-16 h-16 text-[#00F5D4]" />
              </div>
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">{stat.label}</div>
              <div className="flex items-baseline">
                <div 
                  ref={el => statRefs.current[i] = el}
                  data-target={stat.target}
                  data-decimal={stat.decimal}
                  className="text-4xl font-bold text-white"
                >
                  0
                </div>
                <div className="text-xl text-[#00F5D4] ml-1 font-bold">{stat.suffix}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Check-in Card */}
            <motion.div 
              style={{ backgroundColor: getMoodColor(moodValue) }}
              className="bg-[#141C24] border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Activity className="w-6 h-6 mr-4 text-[#00F5D4]" />
                  State Check-in
                </h2>
                <div className="px-5 py-2 rounded-full bg-black/20 font-black text-[10px] uppercase tracking-widest" style={{ color: getMoodHex(moodValue) }}>
                  {moodValue < 30 ? 'Low State' : moodValue < 70 ? 'Neutral State' : 'Peak State'}
                </div>
              </div>

              <div className="mb-12 px-2">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={moodValue}
                  onChange={(e) => setMoodValue(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-[#0A0F14] outline-none cursor-pointer accent-[#00F5D4]"
                  style={{
                    background: `linear-gradient(to right, #ef4444, #eab308, #22c55e)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-6 font-black uppercase tracking-widest">
                  <span>Struggling</span>
                  <span>Baseline</span>
                  <span>Thriving</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={isSaving}
                onClick={handleSaveCheckIn}
                className="w-full py-5 rounded-2xl bg-[#00F5D4] text-[#0A0F14] font-black uppercase tracking-widest text-xs hover:bg-[#00D1B2] transition-all disabled:opacity-50"
              >
                {isSaving ? 'Syncing...' : 'Commit to Record'}
              </motion.button>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                whileHover={{ y: -5 }}
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-widget'))}
                className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#141C24] to-[#0D1219] border border-white/5 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#00F5D4]/10 flex items-center justify-center mb-6 group-hover:bg-[#00F5D4] transition-all">
                  <MessageCircle className="w-8 h-8 text-[#00F5D4] group-hover:text-[#0A0F14] transition-all" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Sanctuary</h3>
                <p className="text-slate-500 text-sm">Enter your stateful care terminal.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                onClick={() => navigate('/student/appointments')}
                className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#141C24] to-[#0D1219] border border-white/5 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-all">
                  <Calendar className="w-8 h-8 text-blue-400 group-hover:text-white transition-all" />
                </div>
                <h3 className="text-xl font-bold mb-2">Expert Care</h3>
                <p className="text-slate-500 text-sm">Schedule a clinical consultation.</p>
              </motion.div>
            </div>
          </div>

          {/* Timeline Sidebar */}
          <div className="space-y-8">
            <div className="bg-[#141C24] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
              <h3 className="text-lg font-black text-white mb-8 flex items-center uppercase tracking-widest">
                <Clock className="w-5 h-5 mr-3 text-[#00F5D4]" />
                Recent History
              </h3>
              <div className="space-y-6">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="flex items-start group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-4 shrink-0 group-hover:bg-[#00F5D4]/10 transition-all">
                      <act.icon className="w-5 h-5 text-slate-400 group-hover:text-[#00F5D4]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm">{act.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">
                        {new Date(act.time).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-[#00F5D4] transition-all self-center" />
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Twin Focus Areas */}
            <div className="p-8 rounded-[2.5rem] bg-[#141C24] border border-white/5 backdrop-blur-xl">
              <h3 className="text-sm font-black text-[#00F5D4] mb-6 uppercase tracking-[0.2em] flex items-center">
                <Target className="w-4 h-4 mr-3" />
                Digital Twin Insights
              </h3>
              <div className="flex flex-wrap gap-3">
                {dashboardStats.stressLevel > 60 ? (
                  <>
                    <span className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest">High Burnout Risk</span>
                    <span className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-widest">Sleep Priority</span>
                  </>
                ) : (
                  <>
                    <span className="px-4 py-2 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/20 text-[#00F5D4] text-[9px] font-black uppercase tracking-widest">Emotional Stability</span>
                    <span className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">Mindful Progress</span>
                  </>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-6 leading-relaxed font-medium">
                Your profile indicates a focus on academic resilience and stress management.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />
    </div>
  );
}