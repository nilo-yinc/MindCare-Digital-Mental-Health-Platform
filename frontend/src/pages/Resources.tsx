import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { 
  BookOpen, 
  Headphones, 
  Heart, 
  Download, 
  Play, 
  Globe, 
  Star,
  Search,
  Volume2,
  Video,
  Flower2,
  Leaf,
  X,
  Clock
} from 'lucide-react';

// Reusable 3D Tilt Card Wrapper
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`relative bg-[#141C24]/80 backdrop-blur-md border border-white/10 hover:border-[#00F5D4]/50 transition-colors duration-500 rounded-2xl overflow-hidden ${className}`}
    >
      <div style={{ transform: "translateZ(30px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

export function Resources() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [playingResource, setPlayingResource] = useState<any>(null);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handlePlay = (resource: any) => {
    setPlayingResource(resource);
    toast('Media playback coming soon!', { icon: '⏳' });
  };

  const handleDownload = (resource: any) => {
    toast.loading(`Preparing ${resource.title} for download...`, { duration: 1500 });
    setTimeout(() => {
      toast.success(`${resource.title} downloaded successfully!`);
    }, 2000);
  };


  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'meditation', name: 'Meditation' },
    { id: 'yoga', name: 'Yoga' },
    { id: 'breathing', name: 'Breathing' },
    { id: 'sleep', name: 'Sleep Stories' },
    { id: 'ayurveda', name: 'Ayurveda' },
  ];

  const languages = [
    { id: 'all', name: 'All Languages' },
    { id: 'english', name: 'English' },
    { id: 'spanish', name: 'Spanish' },
    { id: 'hindi', name: 'Hindi' },
  ];

  const resources = [
    {
      id: 1,
      title: '10-Minute Morning Focus',
      description: 'Start your day with clarity and calmness to conquer your exams.',
      category: 'meditation',
      language: 'english',
      duration: '10 min',
      rating: 4.9,
      downloads: 12500,
      type: 'audio',
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 2,
      title: 'Pranayama Deep Breathing',
      description: 'Ancient yogic breathing techniques for immediate stress relief.',
      category: 'breathing',
      language: 'hindi',
      duration: '15 min',
      rating: 4.9,
      downloads: 8200,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 3,
      title: 'Dorm Room Yoga Flow',
      description: 'Gentle stretching routine designed for confined spaces.',
      category: 'yoga',
      language: 'english',
      duration: '20 min',
      rating: 4.7,
      downloads: 15600,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 4,
      title: 'Midterm Anxiety Relief',
      description: 'A guided meditation to calm your nerves before an important test.',
      category: 'meditation',
      language: 'spanish',
      duration: '12 min',
      rating: 4.8,
      downloads: 9300,
      type: 'audio',
      thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 5,
      title: 'Ayurvedic Sleep Ritual',
      description: 'Traditional practices and soundscapes for deep, restorative sleep.',
      category: 'ayurveda',
      language: 'english',
      duration: '25 min',
      rating: 4.8,
      downloads: 6700,
      type: 'audio',
      thumbnail: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 6,
      title: 'Library Focus Sounds',
      description: 'Binaural beats and ambient textures to enhance your concentration.',
      category: 'sleep',
      language: 'all',
      duration: '60 min',
      rating: 4.5,
      downloads: 22100,
      type: 'audio',
      thumbnail: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&q=80&w=600&h=400'
    },
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'all' || resource.language === selectedLanguage;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesLanguage && matchesSearch;
  });

  // GSAP Animations
  useEffect(() => {
    // Headline Split Text
    if (titleRef.current) {
      const text = titleRef.current.innerText;
      titleRef.current.innerHTML = '';
      text.split(' ').forEach((word, idx) => {
        const span = document.createElement('span');
        span.innerText = word + ' ';
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(20px)';
        titleRef.current?.appendChild(span);
      });

      gsap.to(titleRef.current.children, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
      });
    }

    // Grid Stagger Fade-in
    if (gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.3
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F14] text-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 pt-8">
          <h1 
            ref={titleRef}
            className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Mindful Library
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Curated, professional wellness resources to optimize your mental performance and bring peace to your academic journey.
          </motion.p>
        </div>

        {/* Filters & Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141C24]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-12 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#0A0F14] border border-white/10 rounded-xl focus:ring-1 focus:ring-[#00F5D4] focus:border-[#00F5D4] text-white outline-none transition-all placeholder:text-slate-500"
              />
            </div>
            
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#0A0F14] border border-white/10 rounded-xl focus:ring-1 focus:ring-[#00F5D4] focus:border-[#00F5D4] text-white outline-none transition-all appearance-none"
              >
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-[#0A0F14] border border-white/10 rounded-xl focus:ring-1 focus:ring-[#00F5D4] focus:border-[#00F5D4] text-white outline-none transition-all appearance-none"
              >
                {languages.map(lang => <option key={lang.id} value={lang.id}>{lang.name}</option>)}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resource Grid */}
        <motion.div layout className="min-h-[400px]">
          <AnimatePresence>
            {filteredResources.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-slate-500"
              >
                <Search className="w-12 h-12 mb-4 opacity-50" strokeWidth={1.5} />
                <p className="text-xl">No resources match your filters.</p>
              </motion.div>
            ) : (
              <motion.div ref={gridRef} layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredResources.map((resource) => (
                  <TiltCard key={resource.id} className="group">
                    {/* Thumbnail Section */}
                    <div 
                      className="relative h-56 overflow-hidden bg-[#0A0F14]"
                      onMouseEnter={() => setHoveredCardId(resource.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                    >
                      <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141C24] via-transparent to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full text-[#0A0F14] flex items-center ${
                          resource.type === 'video' ? 'bg-[#00F5D4]' : 'bg-white'
                        }`}>
                          {resource.type === 'video' ? <Video className="w-3 h-3 mr-1" strokeWidth={2}/> : <Volume2 className="w-3 h-3 mr-1" strokeWidth={2}/>}
                          {resource.type}
                        </span>
                      </div>
                      
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 text-xs font-bold bg-[#0A0F14]/80 text-white rounded-full border border-white/10 backdrop-blur-md">
                          {resource.duration}
                        </span>
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="relative">
                          {hoveredCardId === resource.id && (
                            <motion.div 
                              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                              className="absolute inset-0 bg-[#00F5D4] rounded-full"
                            />
                          )}
                          <div 
                            className="w-16 h-16 bg-[#00F5D4]/10 backdrop-blur-sm border border-[#00F5D4]/50 rounded-full flex items-center justify-center relative z-10 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-[#0A0F14] transition-colors cursor-pointer"
                            onClick={() => handlePlay(resource)}
                          >
                            <Play className="w-6 h-6 ml-1" strokeWidth={1.5} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-white line-clamp-1">{resource.title}</h3>
                        <div className="flex items-center text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md text-xs font-bold ml-3 shrink-0">
                          <Star className="w-3 h-3 fill-current mr-1" strokeWidth={1.5} />
                          {resource.rating}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-6 h-10">
                        {resource.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium border-t border-white/5 pt-4 mt-auto">
                        <button 
                          onClick={() => handleDownload(resource)}
                          className="flex items-center hover:text-[#00F5D4] transition-colors"
                        >
                          <Download className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                          {resource.downloads.toLocaleString()}
                        </button>
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                          <span className="capitalize">{resource.language}</span>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Featured Collections */}
        <div className="mt-32 border-t border-white/10 pt-20 pb-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white tracking-tight mb-4">Master Your Routine</h2>
            <p className="text-slate-400 text-lg">Curated collections for specific academic challenges.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Collection 1: Focus */}
            <motion.div 
              whileHover="hover"
              onClick={() => { setSelectedCategory('meditation'); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
              className="relative group cursor-pointer bg-[#141C24] rounded-3xl p-8 border border-white/5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/5 transition-colors duration-500" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/20 blur-[60px] group-hover:bg-pink-500/40 transition-colors duration-500 rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <BookOpen className="w-10 h-10 text-pink-400 mb-6" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold text-white mb-3">Deep Work Protocol</h3>
                <p className="text-slate-400 text-sm mb-12">Binaural beats and Pomodoro guides to lock in during finals week.</p>
                
                <motion.div 
                  variants={{
                    hover: { y: 0, opacity: 1 }
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  className="inline-flex items-center text-sm font-bold text-pink-400"
                >
                  Explore Collection <span className="ml-2">→</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Collection 2: Anxiety */}
            <motion.div 
              whileHover="hover"
              onClick={() => { setSelectedCategory('breathing'); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
              className="relative group cursor-pointer bg-[#141C24] rounded-3xl p-8 border border-white/5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/5 transition-colors duration-500" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/20 blur-[60px] group-hover:bg-teal-500/40 transition-colors duration-500 rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <Leaf className="w-10 h-10 text-teal-400 mb-6" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold text-white mb-3">Anxiety Toolkit</h3>
                <p className="text-slate-400 text-sm mb-12">Rapid-relief breathing exercises for immediate nervous system regulation.</p>
                
                <motion.div 
                  variants={{
                    hover: { y: 0, opacity: 1 }
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  className="inline-flex items-center text-sm font-bold text-teal-400"
                >
                  Explore Collection <span className="ml-2">→</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Collection 3: Sleep */}
            <motion.div 
              whileHover="hover"
              onClick={() => { setSelectedCategory('sleep'); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
              className="relative group cursor-pointer bg-[#141C24] rounded-3xl p-8 border border-white/5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-500" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 blur-[60px] group-hover:bg-blue-500/40 transition-colors duration-500 rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <Headphones className="w-10 h-10 text-blue-400 mb-6" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold text-white mb-3">Circadian Reset</h3>
                <p className="text-slate-400 text-sm mb-12">Sleep stories and soundscapes designed specifically for overactive minds.</p>
                
                <motion.div 
                  variants={{
                    hover: { y: 0, opacity: 1 }
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  className="inline-flex items-center text-sm font-bold text-blue-400"
                >
                  Explore Collection <span className="ml-2">→</span>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>

      </div>

      {/* Media Player Modal */}
      <AnimatePresence>
        {playingResource && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0F14]/90 backdrop-blur-xl p-4"
            onClick={() => setPlayingResource(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141C24] border border-white/10 rounded-[2.5rem] overflow-hidden w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <img 
                  src={playingResource.thumbnail} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl scale-110"
                />
                <div className="relative z-10 text-center px-8">
                  <div className="w-24 h-24 bg-[#00F5D4]/10 border border-[#00F5D4]/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    {playingResource.type === 'video' ? <Video className="w-10 h-10 text-[#00F5D4]" /> : <Volume2 className="w-10 h-10 text-[#00F5D4]" />}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{playingResource.title}</h2>
                  <p className="text-slate-400 text-lg max-w-xl mx-auto">{playingResource.description}</p>
                  
                  <div className="mt-12 flex items-center justify-center gap-8">
                    <div className="h-1.5 w-64 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full bg-[#00F5D4]/50"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Content Coming Soon</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setPlayingResource(null)}
                  className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white transition-all z-20"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 flex items-center justify-between bg-[#141C24]">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" /> {playingResource.rating} Rating
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
                    <Clock className="w-4 h-4" /> {playingResource.duration}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDownload(playingResource)}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00F5D4] text-[#0A0F14] font-bold hover:bg-[#00D1B2] transition-all shadow-[0_0_20px_rgba(0,245,212,0.3)]"
                >
                  <Download className="w-4 h-4" /> Download Offline
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}