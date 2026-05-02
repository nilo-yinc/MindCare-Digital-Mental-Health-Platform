import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldAlert,
  Search,
  Filter,
  Activity
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface StudentRisk {
  id: string;
  name: string;
  email: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  stressScore: number;
  dominantMood: string;
  stressors: string[];
  lastInteraction: string;
}

export function CounsellorDashboard() {
  const { user, token } = useAuth();
  const [students, setStudents] = useState<StudentRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'High' | 'Critical'>('All');

  useEffect(() => {
    // Mock data for initial build, replace with real API call
    const fetchStudents = async () => {
      try {
        // const data = await apiRequest<StudentRisk[]>('/api/counsellor/high-risk-students', { token });
        // setStudents(data);
        
        // Mock data for demo
        setStudents([
          {
            id: '1',
            name: 'Rahul Sharma',
            email: 'rahul@univ.edu',
            riskLevel: 'Critical',
            stressScore: 0.92,
            dominantMood: 'Overwhelmed',
            stressors: ['Exam Stress', 'Sleep Deprivation'],
            lastInteraction: '2 hours ago'
          },
          {
            id: '2',
            name: 'Priya Singh',
            email: 'priya@univ.edu',
            riskLevel: 'High',
            stressScore: 0.78,
            dominantMood: 'Anxious',
            stressors: ['Academic Pressure'],
            lastInteraction: '5 hours ago'
          },
          {
            id: '3',
            name: 'Amit Patel',
            email: 'amit@univ.edu',
            riskLevel: 'Moderate',
            stressScore: 0.45,
            dominantMood: 'Stressed',
            stressors: ['Financial Worry'],
            lastInteraction: '1 day ago'
          }
        ]);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token]);


  const filteredStudents = filter === 'All' 
    ? students 
    : students.filter(s => s.riskLevel === filter);

  return (
    <div className="min-h-screen bg-[#0A0F14] text-white p-8">
      <div className="max-w-7xl mx-auto pt-16">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 mb-2"
            >
              <div className="w-8 h-8 bg-[#00F5D4] rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#0A0F14]" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#00F5D4]">Counsellor Terminal</span>
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="text-slate-400 mt-1">Reviewing high-risk student profiles and AI insights.</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-[#141C24] border border-white/5 rounded-2xl px-6 py-3 flex items-center space-x-4">
              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Cases</div>
                <div className="text-xl font-bold">{students.length}</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-red-500 tracking-widest">High Risk</div>
                <div className="text-xl font-bold text-red-500">
                  {students.filter(s => s.riskLevel === 'High' || s.riskLevel === 'Critical').length}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Risk Queue */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                Risk Monitoring Queue
              </h2>
              <div className="flex bg-[#141C24] p-1 rounded-xl border border-white/5">
                {['All', 'High', 'Critical'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filter === f ? 'bg-[#00F5D4] text-[#0A0F14]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student, idx) => (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-3xl bg-[#141C24]/50 border border-white/5 hover:border-[#00F5D4]/30 transition-all group relative overflow-hidden"
                  >
                    {/* Background Glow for Critical */}
                    {student.riskLevel === 'Critical' && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                    )}

                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-start space-x-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#00F5D4]/10 flex items-center justify-center border border-[#00F5D4]/20">
                          <Users className="w-7 h-7 text-[#00F5D4]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold group-hover:text-[#00F5D4] transition-colors">{student.name}</h3>
                          <div className="text-xs text-slate-500 mb-4">{student.email}</div>
                          
                          <div className="flex flex-wrap gap-2">
                            {student.stressors.map((s, i) => (
                              <span key={i} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${
                          student.riskLevel === 'Critical' ? 'text-red-500' : 
                          student.riskLevel === 'High' ? 'text-orange-500' : 'text-[#00F5D4]'
                        }`}>
                          {student.riskLevel} RISK
                        </div>
                        <div className="text-2xl font-black">{(student.stressScore * 100).toFixed(0)}%</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Stress Score</div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center text-xs text-slate-400">
                          <Activity className="w-4 h-4 mr-2 text-[#00F5D4]" />
                          Mood: <span className="text-white font-bold ml-1">{student.dominantMood}</span>
                        </div>
                        <div className="flex items-center text-xs text-slate-400">
                          <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
                          Last Interaction: <span className="text-white font-bold ml-1">{student.lastInteraction}</span>
                        </div>
                      </div>
                      <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#00F5D4] hover:text-[#0A0F14] transition-all text-xs font-black uppercase tracking-widest flex items-center group">
                        Digital Twin Report
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar Tools */}
          <div className="space-y-8">
            
            {/* Appointment Manager */}
            <div className="p-8 rounded-[2.5rem] bg-[#141C24] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar className="w-24 h-24 text-[#00F5D4]" />
              </div>
              <h3 className="text-xl font-bold mb-8 relative z-10">Today's Sessions</h3>
              <div className="space-y-4 relative z-10">
                {[
                  { time: '14:30', name: 'Rahul Sharma', type: 'Clinical' },
                  { time: '16:00', name: 'Waitlist Check', type: 'System' }
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00F5D4]/30 transition-all flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-[#00F5D4] mb-1">{s.time}</div>
                      <div className="font-bold">{s.name}</div>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {s.type}
                    </div>
                  </div>
                ))}
                <button className="w-full py-4 mt-4 rounded-2xl border border-dashed border-white/10 hover:border-[#00F5D4] hover:bg-[#00F5D4]/5 transition-all text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[#00F5D4]">
                  Manage Schedule
                </button>
              </div>
            </div>

            {/* AI Insights Summary */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#00F5D4]/10 to-blue-500/10 border border-[#00F5D4]/10 relative overflow-hidden group">
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#00F5D4]/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="flex items-center space-x-3 mb-6">
                <Brain className="w-6 h-6 text-[#00F5D4]" />
                <h3 className="text-lg font-bold">System Insights</h3>
              </div>
              <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                <p>
                  AI analysis shows a <span className="text-white font-bold">12% increase</span> in academic stress across the CS department this week.
                </p>
                <p>
                  <span className="text-white font-bold">Sleep Deprivation</span> has emerged as the top stressor for 60% of high-risk cases.
                </p>
                <div className="pt-4 flex items-center text-[#00F5D4] text-xs font-black uppercase tracking-widest cursor-pointer hover:translate-x-1 transition-transform">
                  View Full Report <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

