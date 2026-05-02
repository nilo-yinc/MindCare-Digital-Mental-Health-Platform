import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Brain, 
  Zap, 
  Activity, 
  History,
  ShieldCheck,
  ChevronLeft,
  Wind,
  Moon,
  Users,
  Calendar,
  PenTool,
  BookOpen,
  Phone,
  Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  mood?: string;
  actions?: any[];
}

interface DigitalTwin {
  overallStressScore: number;
  riskLevel: string;
  dominantMoodState: string;
  totalInteractions: number;
  identifiedStressors: { theme: string; frequency: number }[];
}

export function AICompanion() {
  const { token, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
      fetchTwin();
    } else {
      setMessages([{
        id: 'welcome-unauth',
        type: 'bot',
        content: 'You are not logged in, so for chat with me login first.',
        timestamp: new Date()
      }]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const data = await apiRequest<any>('/api/ai/chat/history', { token });
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTwin = async () => {
    try {
      const data = await apiRequest<DigitalTwin>('/api/ai/twin-profile', { token });
      setTwin(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await apiRequest<any>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: input }),
        token
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.message,
        timestamp: new Date(),
        mood: data.currentMoodState,
        actions: data.suggestedActions
      };

      setMessages(prev => [...prev, botMsg]);
      fetchTwin(); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleAction = (action: string, label: string) => {
    switch (action) {
      case 'open_peer_buddy':
        navigate('/peer-buddy');
        break;
      case 'navigate_to_resources':
        navigate('/resources');
        break;
      case 'navigate_to_booking':
        navigate('/student/appointments');
        break;
      case 'emergency_contact':
        toast.error(`Crisis Support: ${label}. Contacting now...`, { duration: 5000 });
        window.open('tel:9152987821', '_self');
        break;
      case 'start_breathing':
        toast.success('Starting Guided Breathing Exercise...', { icon: '🌬️' });
        // Could open a specific breathing modal here
        break;
      default:
        toast(label, { icon: '✨' });
    }
  };


  const getIcon = (name: string) => {
    switch (name) {
      case 'wind': return <Wind className="w-4 h-4" />;
      case 'moon': return <Moon className="w-4 h-4" />;
      case 'users': return <Users className="w-4 h-4" />;
      case 'calendar': return <Calendar className="w-4 h-4" />;
      case 'pen-tool': return <PenTool className="w-4 h-4" />;
      case 'book-open': return <BookOpen className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4 text-red-400" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F14] flex">
      
      {/* Sidebar: Digital Twin Insights */}
      <aside className="w-96 border-r border-white/5 p-8 hidden lg:flex flex-col bg-[#0D1219]">
        <Link to="/student" className="flex items-center text-slate-500 hover:text-[#00F5D4] transition-colors mb-12 text-sm font-bold uppercase tracking-widest group">
          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Sanctuary
        </Link>

        <div className="flex-1 space-y-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-[#00F5D4]/10 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-[#00F5D4]" />
              </div>
              <h2 className="text-xl font-bold">Digital Twin</h2>
            </div>
            
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-12 h-12 text-[#00F5D4]" /></div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Stress Calibration</div>
              <div className="text-4xl font-black text-white">{(twin?.overallStressScore || 0.3 * 100).toFixed(0)}%</div>
              <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(twin?.overallStressScore || 0.3) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#00F5D4] to-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center">
              <History className="w-4 h-4 mr-2" /> Recent Stressors
            </h3>
            <div className="space-y-3">
              {twin?.identifiedStressors?.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-sm font-bold text-slate-300">{s.theme}</span>
                  <span className="text-[10px] font-black text-[#00F5D4] bg-[#00F5D4]/10 px-2 py-0.5 rounded-md">x{s.frequency}</span>
                </div>
              ))}
              {!twin?.identifiedStressors?.length && (
                <div className="text-sm text-slate-600 italic">No recurring stressors identified yet.</div>
              )}
            </div>
          </div>

          <div className="pt-12 mt-auto border-t border-white/5">
            <div className="flex items-center space-x-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-[#00F5D4]" />
              <span>Stateful Agentic Encryption Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col h-screen relative">
        
        {/* Chat Header */}
        <header className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0A0F14]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00F5D4] to-blue-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0A0F14] flex items-center justify-center">
                <Bot className="w-6 h-6 text-[#00F5D4]" />
              </div>
            </div>
            <div>
              <div className="text-lg font-bold">MindCare Copilot</div>
              <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-[#00F5D4]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse mr-2" />
                Synchronizing with Twin
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-400">
              Session ID: {new Date().toISOString().slice(0, 10)}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] flex ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-4`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    msg.type === 'user' ? 'bg-[#00F5D4]/10 text-[#00F5D4]' : 'bg-white/5 text-slate-400'
                  }`}>
                    {msg.type === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className="space-y-3">
                    <div className={`p-6 rounded-[2rem] text-sm leading-relaxed ${
                      msg.type === 'user' 
                        ? 'bg-[#00F5D4] text-[#0A0F14] font-bold rounded-br-none' 
                        : 'bg-[#141C24] text-slate-300 border border-white/5 rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                    
                    {/* Bot Mood & Actions */}
                    {msg.type === 'bot' && (msg.mood || msg.actions) && (
                      <div className="flex flex-wrap gap-2">
                        {msg.mood && (
                          <span className="px-3 py-1 rounded-lg bg-[#00F5D4]/10 text-[#00F5D4] text-[10px] font-black uppercase tracking-widest border border-[#00F5D4]/20">
                            {msg.mood}
                          </span>
                        )}
                        {msg.actions?.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleAction(action.action, action.label)}
                            className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all flex items-center space-x-2"
                          >
                            {getIcon(action.icon)}
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Unauth Login Button */}
                    {!isAuthenticated && msg.id === 'welcome-unauth' && (
                      <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2.5 rounded-xl bg-[#00F5D4] text-[#0A0F14] text-xs font-black uppercase tracking-widest hover:bg-[#00D1B2] transition-all shadow-[0_0_20px_rgba(0,245,212,0.2)]"
                      >
                        Login to Chat
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center animate-pulse">
                  <Bot className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 md:p-12 pt-0 sticky bottom-0 z-10">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto relative group"
          >
            <div className="absolute inset-0 bg-[#00F5D4]/5 blur-[40px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAuthenticated ? "How are you feeling today?" : "Login first to chat with Copilot..."}
              disabled={!isAuthenticated}
              className="w-full bg-[#141C24] border border-white/5 focus:border-[#00F5D4]/50 rounded-[2rem] py-6 px-8 pr-20 text-white focus:outline-none transition-all placeholder:text-slate-600 shadow-2xl relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              type="submit"
              disabled={loading || (!isAuthenticated && !input)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#00F5D4] hover:bg-[#00D1B2] text-[#0A0F14] rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 z-20"
            >
              {isAuthenticated ? <Send className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>
          </form>
          <div className="text-center mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
            {isAuthenticated ? 'End-to-End Encrypted Sanctuary Interaction' : 'Secure Authorization Required for Stateful Interaction'}
          </div>
        </div>

      </main>

    </div>
  );
}

