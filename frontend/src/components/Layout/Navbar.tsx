import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../Common/Logo';
import { 
  Menu, 
  X, 
  User,
  LogOut,
  Settings,
  Camera,
  Save,
  UserPlus,
  UserCircle,
  Zap,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const navLabelRefs = React.useRef<Record<string, HTMLSpanElement | null>>({});
  const [editingName, setEditingName] = useState('');
  const [editingAvatar, setEditingAvatar] = useState<string | undefined>(undefined);
  const [proTitle, setProTitle] = useState('');
  const [proOrg, setProOrg] = useState('');
  const [proBio, setProBio] = useState('');
  const [proSkills, setProSkills] = useState('');
  const [proLinkedin, setProLinkedin] = useState('');

  const [personalDob, setPersonalDob] = useState('');
  const [personalPronouns, setPersonalPronouns] = useState('');
  const [personalInterests, setPersonalInterests] = useState('');
  const [personalLocation, setPersonalLocation] = useState('');
  const [personalAbout, setPersonalAbout] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Student', href: '/student' },
    { name: 'Resources', href: '/resources' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const openProfileEditor = () => {
    if (!user) return;
    setEditingName(user.name || '');
    setEditingAvatar(user.avatar);
    // populate professional/personal fields if available
    const prof = (user as any).professional || {};
    setProTitle(prof.title || '');
    setProOrg(prof.organization || '');
    setProBio(prof.bio || '');
    setProSkills((prof.skills && prof.skills.join) ? prof.skills.join(', ') : (prof.skills || ''));
    setProLinkedin(prof.linkedin || '');

    const pers = (user as any).personal || {};
    setPersonalDob(pers.dob ? new Date(pers.dob).toISOString().slice(0,10) : '');
    setPersonalPronouns(pers.pronouns || '');
    setPersonalInterests((pers.interests && pers.interests.join) ? pers.interests.join(', ') : (pers.interests || ''));
    setPersonalLocation(pers.location || '');
    setPersonalAbout(pers.about || '');
    setIsEditingProfile(true);
  };

  const closeProfileEditor = () => {
    setIsEditingProfile(false);
    setEditingName('');
    setEditingAvatar(undefined);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please upload an image below 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!editingName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    try {
      setIsSavingProfile(true);
      const professional = {
        title: proTitle,
        organization: proOrg,
        bio: proBio,
        skills: proSkills.split(',').map(s => s.trim()).filter(Boolean),
        linkedin: proLinkedin,
      };

      const personal = {
        dob: personalDob || undefined,
        pronouns: personalPronouns,
        interests: personalInterests.split(',').map(s => s.trim()).filter(Boolean),
        location: personalLocation,
        about: personalAbout,
      };

      await updateProfile({
        name: editingName.trim(),
        avatar: editingAvatar,
        professional,
        personal,
      });
      toast.success('Profile updated successfully.');
      closeProfileEditor();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 w-full pointer-events-none">
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-panel max-w-5xl mx-auto bg-[#141C24]/80 backdrop-blur-xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-[2rem] pointer-events-auto overflow-hidden"
      >
        <div className="px-6 sm:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
              <Logo />
            </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
                {navigation.map((item) => (
                  <Link 
                    key={item.name}
                    to={item.href}
                    onMouseEnter={() => setHoveredNav(item.href)}
                    onMouseLeave={() => setHoveredNav(null)}
                    className={`relative text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                      isActive(item.href) ? 'text-[#00F5D4]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#00F5D4] rounded-full"
                      />
                    )}
                  </Link>
                ))}
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-6">
              {user ? (
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 p-1.5 pr-4 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-[#00F5D4]" strokeWidth={1.5} />
                      </div>
                    )}
                    <span className="text-xs font-bold tracking-wide hidden lg:inline">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </motion.button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    state={{ view: 'register' }}
                    className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#00F5D4] text-[#0A0F14] hover:shadow-[0_0_20px_rgba(0,245,212,0.3)] transition-all"
                  >
                    Join Now
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 mt-2"
            >
              <div className="px-2 pt-2 pb-3 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-[#00F5D4]/20 to-transparent text-white border-l-4 border-[#00F5D4]'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {!user && (
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-3 rounded-xl text-center text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-3 rounded-xl text-center text-sm font-semibold bg-[#00F5D4] text-[#0A0F14] hover:bg-[#00D1B2] transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {isEditingProfile && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeProfileEditor}
          >
            <motion.div
              initial={{ y: 16, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              className="w-full max-w-md bg-[#141C24] border border-white/10 rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-5">Edit Profile</h3>

              <div className="flex items-center gap-4 mb-5">
                {editingAvatar ? (
                  <img src={editingAvatar} alt="Profile preview" className="h-16 w-16 rounded-full object-cover border border-white/20" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
                    <UserCircle className="h-9 w-9 text-[#00F5D4]" strokeWidth={1.5} />
                  </div>
                )}
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-white/20 text-slate-200 hover:bg-white/10 cursor-pointer transition-colors">
                  <Camera className="h-4 w-4" />
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">Name</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0F14] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#00F5D4]/60"
                  placeholder="Your name"
                />
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Professional</h4>
                <div className="grid grid-cols-1 gap-2">
                  <input type="text" value={proTitle} onChange={(e) => setProTitle(e.target.value)} placeholder="Title (e.g., Student, Researcher)" className="w-full px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
                  <input type="text" value={proOrg} onChange={(e) => setProOrg(e.target.value)} placeholder="Organization" className="w-full px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
                  <input type="text" value={proSkills} onChange={(e) => setProSkills(e.target.value)} placeholder="Skills (comma separated)" className="w-full px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
                  <input type="text" value={proLinkedin} onChange={(e) => setProLinkedin(e.target.value)} placeholder="LinkedIn URL" className="w-full px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
                  <textarea value={proBio} onChange={(e) => setProBio(e.target.value)} placeholder="Short professional bio" className="w-full px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" rows={3} />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Personal</h4>
                <div className="grid grid-cols-1 gap-2">
                  <input type="date" value={personalDob} onChange={(e) => setPersonalDob(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
                  <input type="text" value={personalPronouns} onChange={(e) => setPersonalPronouns(e.target.value)} placeholder="Pronouns" className="w-full px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
                  <input type="text" value={personalInterests} onChange={(e) => setPersonalInterests(e.target.value)} placeholder="Interests (comma separated)" className="w-full px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
                  <input type="text" value={personalLocation} onChange={(e) => setPersonalLocation(e.target.value)} placeholder="Location" className="w-full px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" />
                  <textarea value={personalAbout} onChange={(e) => setPersonalAbout(e.target.value)} placeholder="About you" className="w-full px-3 py-2 rounded-xl bg-[#0A0F14] border border-white/10 text-white" rows={3} />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={closeProfileEditor}
                  className="px-4 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#00F5D4] text-[#0A0F14] hover:bg-[#00D1B2] disabled:opacity-60 transition-colors inline-flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
