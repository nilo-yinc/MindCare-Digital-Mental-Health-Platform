import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageSquare, 
  User, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Counsellor {
  _id: string;
  name: string;
  avatar?: string;
  professional: {
    title: string;
    bio: string;
    skills: string[];
  };
}

interface Appointment {
  _id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  counsellor: Counsellor;
}

export function Appointments() {
  const { token, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    type: 'Chat',
    reason: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      fetchCounsellors();
    }
  }, [isAuthenticated]);

  const fetchAppointments = async () => {
    try {
      const data = await apiRequest<Appointment[]>('/api/appointments', { token });
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounsellors = async () => {
    try {
      const data = await apiRequest<Counsellor[]>('/api/user/counsellors', { token });
      setCounsellors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounsellor) return;

    try {
      await apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          counsellorId: selectedCounsellor._id,
          ...bookingData
        }),
        token
      });
      toast.success('Session booked successfully!');
      setIsBooking(false);
      fetchAppointments();
    } catch (err) {
      toast.error('Booking failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F14] text-white p-8">
      {!isAuthenticated ? (
        <div className="min-h-screen bg-[#0A0F14] flex items-center justify-center p-6 relative overflow-hidden text-white">
          <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-[#141C24]/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 text-center relative z-10"
          >
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
              <Lock className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-10 leading-relaxed">
              Clinical consultations require a secure identity verification. Please sign in to access professional care.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full py-5 rounded-2xl bg-[#00F5D4] text-[#0A0F14] font-black uppercase tracking-widest hover:bg-[#00D1B2] transition-all shadow-[0_0_40px_rgba(0,245,212,0.2)]"
            >
              Enter Sanctuary
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto pt-16">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <Link to="/student" className="flex items-center text-slate-500 hover:text-[#00F5D4] transition-colors mb-4 text-xs font-black uppercase tracking-widest group">
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Return to Sanctuary
            </Link>
            <h1 className="text-4xl font-bold tracking-tight">Clinical Sessions</h1>
            <p className="text-slate-400 mt-2">Book and manage your expert consultations.</p>
          </div>

          <button 
            onClick={() => setIsBooking(true)}
            className="px-8 py-4 rounded-2xl bg-[#00F5D4] text-[#0A0F14] font-black uppercase tracking-widest text-xs hover:bg-[#00D1B2] transition-all flex items-center shadow-[0_0_20px_rgba(0,245,212,0.3)]"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book New Session
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Appointment List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center">
              <Clock className="w-5 h-5 text-[#00F5D4] mr-2" />
              Upcoming Sessions
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : appointments.length > 0 ? (
              <div className="grid gap-4">
                {appointments.map((appt) => (
                  <motion.div
                    key={appt._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-[#141C24]/50 border border-white/5 flex items-center justify-between hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00F5D4]/20 to-blue-500/20 flex items-center justify-center border border-white/5">
                        {appt.type === 'Video' ? <Video className="w-8 h-8 text-[#00F5D4]" /> : <MessageSquare className="w-8 h-8 text-blue-400" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{appt.counsellor.name}</h3>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(appt.date).toLocaleDateString()}</span>
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {appt.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        appt.status === 'Confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        appt.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-white/5 text-slate-500 border-white/5'
                      }`}>
                        {appt.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl border border-dashed border-white/10 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-400">No sessions scheduled</h3>
                <p className="text-slate-600 text-sm mt-1">Book your first session with an expert.</p>
              </div>
            )}
          </div>

          {/* Sidebar: Digital Health Passport */}
          <div className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#141C24] to-[#0D1219] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck className="w-24 h-24 text-[#00F5D4]" />
              </div>
              <h3 className="text-xl font-bold mb-6 relative z-10">Clinical Protocol</h3>
              <div className="space-y-6 relative z-10 text-sm text-slate-400 leading-relaxed">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-lg bg-[#00F5D4]/10 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-[#00F5D4]" />
                  </div>
                  <p>All sessions are end-to-end encrypted and HIPAA compliant.</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <p>Clinical notes are isolated from your academic profile.</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <p>Reschedule up to 2 hours before the start time.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Booking Modal */}
        <AnimatePresence>
          {isBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBooking(false)}
                className="absolute inset-0 bg-[#0A0F14]/90 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-2xl bg-[#141C24] border border-white/10 rounded-[3rem] p-10 relative z-10 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Calendar className="w-64 h-64 text-[#00F5D4]" />
                </div>

                <h2 className="text-3xl font-bold mb-8">Schedule Consultation</h2>
                
                <form onSubmit={handleBooking} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Select Counsellor</label>
                      <select 
                        required
                        className="w-full bg-[#0A0F14] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00F5D4] transition-all"
                        onChange={(e) => setSelectedCounsellor(counsellors.find(c => c._id === e.target.value) || null)}
                      >
                        <option value="">Choose an expert</option>
                        {counsellors.map(c => (
                          <option key={c._id} value={c._id}>{c.name} — {c.professional.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Session Type</label>
                      <select 
                        required
                        className="w-full bg-[#0A0F14] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00F5D4] transition-all"
                        onChange={(e) => setBookingData({...bookingData, type: e.target.value})}
                      >
                        <option value="Chat">Secure Chat</option>
                        <option value="Video">Video Session</option>
                        <option value="Audio">Audio Call</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Date</label>
                      <input 
                        type="date" 
                        required
                        className="w-full bg-[#0A0F14] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00F5D4] transition-all"
                        onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Time Slot</label>
                      <input 
                        type="time" 
                        required
                        className="w-full bg-[#0A0F14] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00F5D4] transition-all"
                        onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Focus Area (Optional)</label>
                    <textarea 
                      placeholder="e.g. Anxiety, Career guidance, Stress management"
                      className="w-full bg-[#0A0F14] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00F5D4] transition-all h-24"
                      onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="submit"
                      className="flex-1 py-4 rounded-2xl bg-[#00F5D4] text-[#0A0F14] font-black uppercase tracking-widest text-xs hover:bg-[#00D1B2] transition-all"
                    >
                      Confirm Booking
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsBooking(false)}
                      className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        </div>
      )}
    </div>
  );
}

