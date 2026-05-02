import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Plus, 
  X, 
  Send, 
  Shield, 
  Globe, 
  Lock,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Group {
  _id: string;
  name: string;
  members: number;
  mood: string;
  language: string;
}

interface Message {
  alias: string;
  content: string;
  timestamp: string;
}

export function PeerBuddy() {
  const { token, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeTab, setActiveTab] = useState<'groups' | 'chat'>('groups');
  const [activeGroup, setActiveGroup] = useState<{id: string, name: string} | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [buddyChat, setBuddyChat] = useState<Message[]>([]);
  const [buddyInput, setBuddyInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', mood: 'Calm', language: 'English' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userAlias = user?.name ? `Buddy_${user.name.split(' ')[0]}` : 'Buddy_Anonymous';
  const buddyAlias = "Peer_Guide_Zen";

  useEffect(() => {
    if (isAuthenticated) {
      fetchGroups();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, buddyChat]);

  const fetchGroups = async () => {
    try {
      // In a real app, this would be an API call
      const mockGroups = [
        { _id: '1', name: 'Engineering Stress Circle', members: 12, mood: 'Calm', language: 'English' },
        { _id: '2', name: 'Late Night Study Support', members: 45, mood: 'Focused', language: 'Hindi' },
        { _id: '3', name: 'General Wellbeing', members: 128, mood: 'Supportive', language: 'Multilingual' },
        { _id: '4', name: 'Creative Arts & Mental Health', members: 24, mood: 'Energetic', language: 'English' }
      ];
      setGroups(mockGroups);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinGroup = (groupId: string, name: string) => {
    setActiveGroup({ id: groupId, name });
    setMessages([
      { alias: 'System', content: `You joined ${name}. Say hello to your peers!`, timestamp: new Date().toISOString() },
      { alias: 'Buddy_Rohan', content: 'Hey everyone! Glad to have another peer here.', timestamp: new Date().toISOString() }
    ]);
  };

  const handleSendMessage = () => {
    if (!msgInput.trim()) return;
    const newMsg = { alias: userAlias, content: msgInput, timestamp: new Date().toISOString() };
    setMessages([...messages, newMsg]);
    setMsgInput('');
  };

  const handleBuddySend = () => {
    if (!buddyInput.trim()) return;
    const newMsg = { alias: 'You', content: buddyInput, timestamp: new Date().toISOString() };
    setBuddyChat([...buddyChat, newMsg]);
    setBuddyInput('');
    
    // Simple bot response
    setTimeout(() => {
      const responses = [
        "I hear you. That sounds really challenging.",
        "Thank you for sharing that with me. You're not alone in this.",
        "How long have you been feeling this way?",
        "It's completely okay to feel like that. Many students go through similar phases.",
        "Would you like to talk more about what's causing this?"
      ];
      setBuddyChat(prev => [...prev, { alias: buddyAlias, content: responses[Math.floor(Math.random() * responses.length)], timestamp: new Date().toISOString() }]);
    }, 1500);
  };

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) return;
    const created = { _id: Date.now().toString(), ...newGroup, members: 1 };
    setGroups([created, ...groups]);
    setShowCreateModal(false);
    toast.success('Group Circle created successfully!');
  };

  return (
    <div className="min-h-screen bg-[#0A0F14] text-slate-200 pb-20">
      {!isAuthenticated ? (
        <div className="min-h-screen bg-[#0A0F14] flex items-center justify-center p-6 relative overflow-hidden text-white">
          <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-[#00F5D4]/10 rounded-full blur-[150px] pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-[#141C24]/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 text-center relative z-10"
          >
            <div className="w-20 h-20 bg-[#00F5D4]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#00F5D4]/20">
              <Lock className="w-10 h-10 text-[#00F5D4]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Shielded Access</h2>
            <p className="text-slate-400 mb-10 leading-relaxed">
              Peer support requires a verified student identity to maintain a safe and supportive environment.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full py-5 rounded-2xl bg-[#00F5D4] text-[#0A0F14] font-black uppercase tracking-widest hover:bg-[#00D1B2] transition-all shadow-[0_0_40px_rgba(0,245,212,0.2)]"
            >
              Enter Sanctuary
            </button>
          </motion.div>
        </div>
      ) : activeGroup ? (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-[#141C24] border border-white/5 rounded-3xl overflow-hidden flex flex-col" style={{ height: '75vh' }}>
            <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button onClick={() => setActiveGroup(null)} className="p-2 hover:bg-white/5 rounded-xl transition-all"><ChevronLeft className="w-5 h-5" /></button>
                <div>
                  <h3 className="font-bold text-white leading-none mb-1">{activeGroup.name}</h3>
                  <span className="text-[10px] text-[#00F5D4] uppercase font-black tracking-widest">Active Circle</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                <Shield className="w-3 h-3" /> <span>Encrypted Session</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.alias === userAlias ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl ${m.alias === 'System' ? 'bg-white/5 text-slate-500 text-xs text-center w-full' : m.alias === userAlias ? 'bg-[#00F5D4] text-[#0A0F14] rounded-tr-sm' : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-sm'}`}>
                    {m.alias !== 'System' && m.alias !== userAlias && <div className="text-[10px] font-black uppercase tracking-tighter mb-1 opacity-50">{m.alias}</div>}
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-white/5 flex items-center space-x-3">
              <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-[#00F5D4]" />
              <button onClick={handleSendMessage} className="bg-[#00F5D4] text-[#0A0F14] p-3 rounded-xl"><Send className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold text-white tracking-tight flex items-center">
                <Users className="w-10 h-10 mr-4 text-[#00F5D4]" /> Peer Buddy System
              </h1>
              <p className="text-slate-400 mt-2 text-lg">Connect anonymously with peers across India. No names, no judgment—just support.</p>
            </div>
            <div className="flex bg-[#141C24] p-1.5 rounded-2xl border border-white/5">
              <button onClick={() => setActiveTab('groups')} className={`px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'groups' ? 'bg-[#00F5D4] text-[#0A0F14]' : 'text-slate-500'}`}>Explore Groups</button>
              <button onClick={() => setActiveTab('chat')} className={`px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'chat' ? 'bg-[#00F5D4] text-[#0A0F14]' : 'text-slate-500'}`}>Private Chat</button>
            </div>
          </div>
  
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="space-y-6">
              <div className="bg-[#141C24] border border-white/5 rounded-3xl p-8 backdrop-blur-md">
                <div className="flex items-center mb-6"><Shield className="w-5 h-5 mr-2 text-[#00F5D4]" /><h3 className="text-white font-bold">Safety First</h3></div>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li className="flex items-start"><Sparkles className="w-4 h-4 mr-3 text-[#00F5D4] mt-1 shrink-0" />Your identity is hidden behind your "Buddy Alias".</li>
                  <li className="flex items-start"><Lock className="w-4 h-4 mr-3 text-[#00F5D4] mt-1 shrink-0" />All chats are end-to-end encrypted and anonymous.</li>
                </ul>
                <button onClick={() => setShowSafetyModal(true)} className="w-full mt-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-bold text-sm">Safety Guidelines</button>
              </div>
              <div className="bg-gradient-to-br from-[#00F5D4]/10 to-transparent border border-[#00F5D4]/20 rounded-3xl p-8">
                <h3 className="text-white font-bold mb-4">Start a Movement</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">Can't find a group for your department? Create a new anonymous circle.</p>
                <button onClick={() => setShowCreateModal(true)} className="w-full py-3 rounded-xl bg-[#00F5D4] text-[#0A0F14] font-bold flex items-center justify-center"><Plus className="w-4 h-4 mr-2" />Create Group</button>
              </div>
            </div>
  
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {activeTab === 'groups' ? (
                  <motion.div key="groups" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid md:grid-cols-2 gap-6">
                    {groups.map((group) => (
                      <motion.div key={group._id} whileHover={{ y: -5, borderColor: 'rgba(0,245,212,0.3)' }} className="bg-[#141C24] border border-white/5 rounded-3xl p-8 transition-all cursor-pointer relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity"><Users className="w-24 h-24 text-[#00F5D4]" /></div>
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="px-3 py-1 rounded-full bg-[#0A0F14] text-[#00F5D4] text-[10px] font-bold uppercase tracking-widest border border-[#00F5D4]/20">{group.mood}</span>
                          <span className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest"><Globe className="w-3 h-3 mr-1" />{group.language}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{group.name}</h3>
                        <div className="flex items-center text-slate-400 mb-8"><Users className="w-4 h-4 mr-2" /><span className="text-sm">{group.members} Peers Active</span></div>
                        <button onClick={() => handleJoinGroup(group._id, group.name)} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-[#00F5D4] group-hover:text-[#0A0F14] transition-all font-bold">Join Circle</button>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="chat" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#141C24] border border-white/5 rounded-[2rem] flex flex-col overflow-hidden" style={{ height: '600px' }}>
                    {buddyChat.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 rounded-full bg-[#0A0F14] border border-white/5 flex items-center justify-center mb-8"><MessageCircle className="w-10 h-10 text-slate-600" /></div>
                        <h3 className="text-3xl font-bold text-white mb-4">Secure Private Chat</h3>
                        <p className="text-slate-400 max-w-sm mb-12">Request a one-on-one session with a peer buddy. All identities are masked by system-generated aliases.</p>
                        <button onClick={() => { setBuddyChat([{ alias: buddyAlias, content: 'Hello there. I am your anonymous peer buddy. This is a safe space — feel free to share whatever is on your mind.', timestamp: new Date().toISOString() }]); toast.success('Connected to a peer buddy!'); }} className="px-12 py-5 rounded-full bg-[#00F5D4] text-[#0A0F14] font-bold text-lg shadow-[0_0_30px_rgba(0,245,212,0.2)]">Find a Buddy</button>
                        <div className="mt-12 flex items-center text-xs text-slate-600 space-x-4">
                          <span className="flex items-center"><Shield className="w-3 h-3 mr-1" /> End-to-End Encrypted</span>
                          <span className="flex items-center"><Heart className="w-3 h-3 mr-1" /> Peer Support Only</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                          <div><h3 className="text-white font-bold">Private Chat</h3><p className="text-[10px] text-slate-400 uppercase tracking-widest">With: {buddyAlias}</p></div>
                          <button onClick={() => { setBuddyChat([]); toast.success('Chat ended.'); }} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                          {buddyChat.map((m, i) => (
                            <div key={i} className={`flex ${m.alias === 'You' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${m.alias === 'You' ? 'bg-[#00F5D4] text-[#0A0F14] rounded-tr-sm' : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-sm'}`}>
                                {m.content}
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-white/5 flex items-center space-x-3">
                          <input value={buddyInput} onChange={e => setBuddyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuddySend()} placeholder="Share what's on your mind..." className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-[#00F5D4]" />
                          <button onClick={handleBuddySend} className="bg-[#00F5D4] text-[#0A0F14] p-3 rounded-xl"><Send className="w-5 h-5" /></button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0F14]/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="bg-[#141C24] border border-white/10 rounded-3xl p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-white mb-6">Create New Circle</h3>
              <div className="space-y-4">
                <div><label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Circle Name</label><input value={newGroup.name} onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))} placeholder="e.g. CS Exam Support" className="w-full mt-2 p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#00F5D4]" /></div>
                <div><label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mood</label><select value={newGroup.mood} onChange={e => setNewGroup(p => ({ ...p, mood: e.target.value }))} className="w-full mt-2 p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none appearance-none"><option value="Calm">Calm</option><option value="Energetic">Energetic</option><option value="Focused">Focused</option><option value="Supportive">Supportive</option></select></div>
                <div><label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Language</label><select value={newGroup.language} onChange={e => setNewGroup(p => ({ ...p, language: e.target.value }))} className="w-full mt-2 p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none appearance-none"><option value="English">English</option><option value="Hindi">Hindi</option><option value="Multilingual">Multilingual</option></select></div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleCreateGroup} className="flex-1 py-3 rounded-xl bg-[#00F5D4] text-[#0A0F14] font-bold">Create Circle</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safety Guidelines Modal */}
      <AnimatePresence>
        {showSafetyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0F14]/80 backdrop-blur-md" onClick={() => setShowSafetyModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="bg-[#141C24] border border-white/10 rounded-3xl p-8 w-full max-w-lg">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center"><Shield className="w-6 h-6 mr-3 text-[#00F5D4]" />Safety Guidelines</h3>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5"><strong className="text-white">1. Anonymity is Sacred.</strong> Never share personal details like your real name, phone number, or address.</div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5"><strong className="text-white">2. Respect Boundaries.</strong> If someone is not comfortable discussing a topic, respect their limits.</div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5"><strong className="text-white">3. No Harassment.</strong> Zero tolerance for bullying, trolling, or any form of abuse.</div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5"><strong className="text-white">4. Seek Professional Help.</strong> If you or someone else is in danger, contact the emergency helpline: 9152987821.</div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5"><strong className="text-white">5. Report Violations.</strong> Use the report button to flag any inappropriate behavior.</div>
              </div>
              <button onClick={() => setShowSafetyModal(false)} className="w-full mt-8 py-3 rounded-xl bg-[#00F5D4] text-[#0A0F14] font-bold">I Understand</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
