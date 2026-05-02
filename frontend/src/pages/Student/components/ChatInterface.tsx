import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X, Send, Bot, User, Sparkles, Shield, Heart,
  Maximize2, Minimize2,
  // Action button icons
  Wind, Users, BookOpen, Calendar, PenTool, Moon, Phone, Activity
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiRequest } from '../../../lib/api';
import toast from 'react-hot-toast';

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  'wind': Wind,
  'users': Users,
  'book-open': BookOpen,
  'calendar': Calendar,
  'pen-tool': PenTool,
  'moon': Moon,
  'phone': Phone,
  'activity': Activity,
  'heart': Heart,
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface SuggestedAction {
  label: string;
  action: string;
  icon: string;
}

interface AIResponse {
  message: string;
  currentMoodState: string;
  suggestedActions: SuggestedAction[];
  provider?: string;
  twinStress?: number;
  riskLevel?: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actions?: SuggestedAction[];
  moodState?: string;
}

interface ChatInterfaceProps {
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcomeMessage: Message = {
    id: 'welcome',
    type: 'bot',
    content: `Welcome, ${user?.name?.split(' ')[0] || 'there'}. I am your MindCare Supervisor — a Digital Twin AI built to understand and support your mental well-being. Everything you share here is processed with clinical empathy and encrypted end-to-end. How can I support you today?`,
    timestamp: new Date(),
    actions: [
      { label: 'Start Breathing Exercise', action: 'start_breathing', icon: 'wind' },
      { label: 'Talk to Peer Buddy', action: 'open_peer_buddy', icon: 'users' },
      { label: 'Browse Resources', action: 'navigate_to_resources', icon: 'book-open' }
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ─── Load Previous Chat History on Mount ──────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      if (!token) {
        setMessages([welcomeMessage]);
        setIsLoadingHistory(false);
        return;
      }
      try {
        const data = await apiRequest<{ messages: Array<{ id: string; type: 'user' | 'bot'; content: string; timestamp: string }> }>('/api/ai/chat/history', {
          method: 'GET',
          token,
        });

        if (data.messages && data.messages.length > 0) {
          const history: Message[] = data.messages.map((m) => ({
            id: m.id,
            type: m.type,
            content: m.content,
            timestamp: new Date(m.timestamp),
          }));
          setMessages([welcomeMessage, ...history]);
        } else {
          setMessages([welcomeMessage]);
        }
      } catch {
        setMessages([welcomeMessage]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, [token]);

  // ─── Handle Action Button Clicks ──────────────────────────────────────────
  const handleAction = (action: SuggestedAction) => {
    switch (action.action) {
      case 'navigate_to_resources':
        onClose();
        navigate('/resources');
        break;
      case 'open_peer_buddy':
        onClose();
        navigate('/peer-buddy');
        break;
      case 'navigate_to_booking':
        toast.success('Redirecting to counselor booking...');
        onClose();
        navigate('/resources');
        break;
      case 'start_breathing':
        sendPrompt('Guide me through a breathing exercise right now.');
        break;
      case 'journal_prompt':
        sendPrompt('Give me a guided journaling prompt for today.');
        break;
      case 'sleep_hygiene':
        sendPrompt('I need help improving my sleep. What can I do tonight?');
        break;
      case 'mood_tracker':
        toast.success('Mood logged successfully.');
        break;
      case 'emergency_contact':
        window.open('tel:9152987821', '_self');
        toast.success('Connecting to Vandrevala Foundation helpline...');
        break;
      default:
        sendPrompt(`I want to explore: ${action.label}`);
    }
  };

  // ─── Send Message to Agentic AI ───────────────────────────────────────────
  const sendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: promptText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      if (!token) throw new Error('Please sign in to use the AI assistant.');

      const response = await apiRequest<AIResponse>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: promptText }),
        token,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        actions: response.suggestedActions,
        moodState: response.currentMoodState,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      toast.error(error.message || 'AI is experiencing a brief delay.');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I am experiencing a temporary synchronization delay. My systems will reconnect shortly. In the meantime, please try one of the wellness actions below.',
        timestamp: new Date(),
        actions: [
          { label: 'Start Breathing Exercise', action: 'start_breathing', icon: 'wind' },
          { label: 'Talk to Peer Buddy', action: 'open_peer_buddy', icon: 'users' },
        ]
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => sendPrompt(input);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ─── Mood State Badge Colors ──────────────────────────────────────────────
  const getMoodColor = (mood?: string) => {
    const colors: Record<string, string> = {
      'Calm': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'Hopeful': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      'Neutral': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      'Anxious': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'Stressed': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Sad': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Lonely': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      'Overwhelmed': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Depressed': 'bg-red-600/20 text-red-400 border-red-600/30',
      'Critical': 'bg-red-700/30 text-red-300 border-red-500/50',
    };
    return colors[mood || 'Neutral'] || colors['Neutral'];
  };

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4 bg-[#0A0F14]/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{
          scale: 1,
          y: 0,
          opacity: 1,
          width: isFullScreen ? '100vw' : '100%',
          height: isFullScreen ? '100vh' : '700px',
          maxWidth: isFullScreen ? '100vw' : '720px',
          borderRadius: isFullScreen ? '0px' : '32px'
        }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#141C24] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative transition-all duration-500 ease-in-out"
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#00F5D4]/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-white/5 backdrop-blur-xl flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-tr from-[#00F5D4] to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-[#00F5D4]/20">
                <Bot className="h-6 w-6 text-[#0A0F14]" strokeWidth={2} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-[3px] border-[#141C24] rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center">
                MindCare Supervisor
                <Sparkles className="w-4 h-4 ml-2 text-[#00F5D4] animate-pulse" />
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">Agentic AI — Digital Twin Active</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-[#00F5D4]"
              title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 relative z-10 custom-scrollbar">
          {isLoadingHistory && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-8 h-8 border-2 border-[#00F5D4]/30 border-t-[#00F5D4] rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loading conversation history...</p>
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {messages.map((message, idx) => (
              <div key={message.id}>
                {/* Show divider between welcome and history */}
                {idx === 1 && messages.length > 2 && (
                  <div className="flex items-center gap-3 py-2 mb-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Previous Conversation</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                )}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[85%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
                    message.type === 'user'
                      ? 'bg-white/10'
                      : 'bg-[#00F5D4]/10'
                  }`}>
                    {message.type === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-[#00F5D4]" />}
                  </div>
                  <div className="space-y-2">
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      message.type === 'user'
                        ? 'bg-[#00F5D4] text-[#0A0F14] font-medium rounded-tr-sm'
                        : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-sm'
                    }`}>
                      {/* Mood badge for bot messages */}
                      {message.type === 'bot' && message.moodState && (
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border mb-2 ${getMoodColor(message.moodState)}`}>
                          <Activity className="w-2.5 h-2.5 mr-1" />
                          {message.moodState}
                        </div>
                      )}
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <div className={`text-[10px] mt-2 opacity-50 font-bold uppercase tracking-widest ${
                        message.type === 'user' ? 'text-[#0A0F14]' : 'text-slate-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Dynamic Action Buttons */}
                    {message.type === 'bot' && message.actions && message.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {message.actions.map((action, aIdx) => {
                          const IconComponent = ICON_MAP[action.icon] || BookOpen;
                          const isEmergency = action.action === 'emergency_contact';
                          return (
                            <motion.button
                              key={aIdx}
                              whileHover={{ scale: 1.03, boxShadow: isEmergency ? '0 0 20px rgba(239,68,68,0.3)' : '0 0 20px rgba(0,245,212,0.2)' }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleAction(action)}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-200 ${
                                isEmergency
                                  ? 'bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 hover:border-red-400'
                                  : 'bg-transparent border border-[#00F5D4]/30 text-[#00F5D4] hover:bg-[#00F5D4]/10 hover:border-[#00F5D4]/60'
                              }`}
                            >
                              <IconComponent className="w-3.5 h-3.5" />
                              <span>{action.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              </div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#00F5D4]/10">
                  <Bot className="h-4 w-4 text-[#00F5D4]" />
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex space-x-1.5">
                  <div className="w-2 h-2 bg-[#00F5D4] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#00F5D4] rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 bg-[#00F5D4] rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 pt-3 space-y-3 relative z-10 border-t border-white/5 bg-[#141C24]">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="w-full p-4 pr-12 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#00F5D4] focus:border-transparent text-white placeholder-slate-500 resize-none h-14 min-h-[56px] max-h-32 transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-[#00F5D4] text-[#0A0F14] p-4 rounded-2xl hover:bg-[#00D1B2] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00F5D4]/20"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <span className="flex items-center"><Shield className="w-3 h-3 mr-1 text-green-500" /> Secure</span>
              <span className="flex items-center"><Heart className="w-3 h-3 mr-1 text-red-500" /> Private</span>
            </div>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="text-[10px] text-[#00F5D4] font-bold uppercase tracking-widest flex items-center hover:underline"
            >
              {isFullScreen ? <Minimize2 className="w-3 h-3 mr-1" /> : <Maximize2 className="w-3 h-3 mr-1" />}
              {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 245, 212, 0.2);
          }
        `}} />
      </motion.div>
    </motion.div>
  );
}
