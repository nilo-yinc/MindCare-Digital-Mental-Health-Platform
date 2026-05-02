import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  Bot, 
  X, 
  Maximize2, 
  Minimize2, 
  Send, 
  User as UserIcon, 
  Wind, 
  Moon, 
  Users, 
  Calendar, 
  PenTool, 
  BookOpen, 
  Phone, 
  Zap,
  MessageCircle,
  Activity,
  Brain,
  History,
  Lock,
  ChevronLeft,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  mood?: string;
  actions?: Array<{ label: string; action: string; icon: string }>;
}

export function AICopilotWidget() {
  const { token, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isHiddenPage = ['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    const handleToggle = () => setIsOpen(true);
    window.addEventListener('toggle-ai-widget', handleToggle);
    return () => window.removeEventListener('toggle-ai-widget', handleToggle);
  }, []);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchHistory();
    } else if (!isAuthenticated && isOpen) {
      setMessages([{
        id: 'welcome-unauth',
        type: 'bot',
        content: 'You are not logged in. To chat with me and build your Digital Twin profile, please login first.',
        timestamp: new Date(),
        actions: [
          { label: 'Login Now', action: 'navigate_to_login', icon: 'zap' }
        ]
      }]);
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const data = await apiRequest<any>('/api/ai/chat/history', { token });
      const history = data.messages || [];
      if (history.length === 0) {
        setMessages([{
          id: 'initial-greeting',
          type: 'bot',
          content: 'Hello! I am your MindCare Copilot. I can help you with stress management, guided breathing, and connecting with peer support. How are you feeling today?',
          timestamp: new Date(),
          actions: [
            { label: 'Breathing Exercise', action: 'start_breathing', icon: 'wind' },
            { label: 'Peer Support', action: 'open_peer_buddy', icon: 'users' },
            { label: 'Check Resources', action: 'navigate_to_resources', icon: 'book-open' }
          ]
        }]);
      } else {
        setMessages(history);
      }
    } catch (err) {
      console.error(err);
      setMessages([{
        id: 'error-greeting',
        type: 'bot',
        content: 'Hello! I am having a bit of trouble syncing your history, but I am still here to support you. How can I help?',
        timestamp: new Date()
      }]);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      setIsOpen(false);
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: string, label: string) => {
    switch (action) {
      case 'navigate_to_login':
        navigate('/login');
        setIsOpen(false);
        break;
      case 'open_peer_buddy':
        navigate('/peer-buddy');
        setIsOpen(false);
        break;
      case 'navigate_to_resources':
        navigate('/resources');
        setIsOpen(false);
        break;
      case 'navigate_to_booking':
        navigate('/student/appointments');
        setIsOpen(false);
        break;
      case 'start_breathing':
        toast.success('Starting mindful breathing session...');
        navigate('/resources'); // Or specific breathing route if exists
        setIsOpen(false);
        break;
      case 'emergency_contact':
        toast.error(`Crisis Support: Contacting institutional helpline...`, { duration: 5000 });
        window.open('tel:9152987821', '_self');
        break;
      default:
        toast.success(`Action initiated: ${label}`);
    }
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'wind': return <Wind className="w-3.5 h-3.5" />;
      case 'moon': return <Moon className="w-3.5 h-3.5" />;
      case 'users': return <Users className="w-3.5 h-3.5" />;
      case 'calendar': return <Calendar className="w-3.5 h-3.5" />;
      case 'pen-tool': return <PenTool className="w-3.5 h-3.5" />;
      case 'book-open': return <BookOpen className="w-3.5 h-3.5" />;
      case 'phone': return <Phone className="w-3.5 h-3.5" />;
      case 'activity': return <Activity className="w-3.5 h-3.5" />;
      default: return <Zap className="w-3.5 h-3.5" />;
    }
  };

  if (isHiddenPage) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,245,212,0.4)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-[#00F5D4] text-[#0A0F14] shadow-[0_0_40px_rgba(0,245,212,0.2)] z-[100] flex items-center justify-center border-4 border-[#0A0F14]"
      >
        {isOpen ? <X className="w-8 h-8" /> : <Bot className="w-8 h-8" />}
      </motion.button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              filter: 'blur(0px)',
              width: isFullScreen ? 'calc(100% - 64px)' : '450px',
              height: isFullScreen ? 'calc(100% - 140px)' : '700px',
              bottom: '100px',
              right: isFullScreen ? '32px' : '32px',
              borderRadius: '32px',
            }}
            exit={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="fixed z-[99] bg-[#0A0F14]/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-[#141C24]/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#00F5D4]/10 flex items-center justify-center border border-[#00F5D4]/20">
                  <Brain className="w-6 h-6 text-[#00F5D4]" />
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-tight">MindCare Copilot</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00F5D4]/70">Agentic Engine Active</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                >
                  {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] space-y-4`}>
                    <div className={`p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.type === 'user' 
                        ? 'bg-[#00F5D4] text-[#0A0F14] font-bold rounded-tr-none shadow-[0_0_20px_rgba(0,245,212,0.1)]' 
                        : 'bg-[#141C24] text-slate-300 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.type === 'bot' && (msg.mood || msg.actions) && (
                      <div className="flex flex-col space-y-3">
                        {msg.mood && (
                          <div className="flex items-center space-x-2">
                            <Activity className="w-3 h-3 text-[#00F5D4]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#00F5D4]/60">
                              Detected State: {msg.mood}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {msg.actions?.map((action, i) => (
                            <motion.button
                              key={i}
                              onMouseEnter={(e) => {
                                gsap.to(e.currentTarget, { 
                                  scale: 1.05, 
                                  backgroundColor: 'rgba(0, 245, 212, 0.1)',
                                  borderColor: 'rgba(0, 245, 212, 0.5)',
                                  duration: 0.3 
                                });
                              }}
                              onMouseLeave={(e) => {
                                gsap.to(e.currentTarget, { 
                                  scale: 1, 
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  borderColor: 'rgba(255, 255, 255, 0.1)',
                                  duration: 0.3 
                                });
                              }}
                              onClick={() => handleAction(action.action, action.label)}
                              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-bold transition-all flex items-center space-x-2 group"
                            >
                              <span className="text-[#00F5D4] group-hover:scale-110 transition-transform">
                                {getIcon(action.icon)}
                              </span>
                              <span className="tracking-wide uppercase font-black text-[9px]">{action.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                    {!isAuthenticated && msg.id === 'welcome-unauth' && (
                      <button
                        onClick={() => { setIsOpen(false); navigate('/login'); }}
                        className="px-6 py-2 rounded-xl bg-[#00F5D4] text-[#0A0F14] text-[10px] font-black uppercase tracking-widest hover:bg-[#00D1B2] transition-all"
                      >
                        Login to Chat
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex space-x-1 p-2 bg-white/5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/5 bg-[#141C24]/50">
              <form onSubmit={handleSendMessage} className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isAuthenticated ? "Type your message..." : "Login to chat..."}
                  disabled={!isAuthenticated}
                  className="w-full bg-[#0A0F14] border border-white/10 rounded-xl py-4 px-5 pr-14 text-white focus:outline-none focus:border-[#00F5D4]/50 transition-all text-sm disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={loading || (!isAuthenticated && !input)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00F5D4] text-[#0A0F14] rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                >
                  {isAuthenticated ? <Send className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

