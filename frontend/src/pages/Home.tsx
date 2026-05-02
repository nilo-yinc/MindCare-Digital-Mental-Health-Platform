import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  BookOpenText, 
  ActivitySquare, 
  ShieldCheck,
  ArrowRight,
  Star,
  Quote,
  Shield,
  Languages,
  Users,
  Brain,
  ChevronDown,
  Layout,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Zap,
  CheckCircle2,
  Lock,
  Globe2,
  Stethoscope,
  Search,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

gsap.registerPlugin(ScrollTrigger);



const PrimaryButton = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });

    if (shimmerRef.current) {
      gsap.fromTo(shimmerRef.current, 
        { x: '-100%', opacity: 0.5 }, 
        { x: '200%', opacity: 0, duration: 0.8, ease: 'power2.out', overwrite: true }
      );
    }
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full bg-[#00F5D4] text-[#0A0F14] font-bold tracking-wide hover:bg-[#00D1B2] transition-colors overflow-hidden ${className}`}
    >
      <span className="relative z-10 flex items-center">{children}</span>
      <div 
        ref={shimmerRef} 
        className="absolute top-0 bottom-0 left-0 w-1/3 bg-white/40 -skew-x-12 z-0 transform -translate-x-full" 
      />
    </motion.button>
  );
};

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
      className={`relative rounded-3xl bg-[#141C24]/80 backdrop-blur-md border border-white/10 p-8 hover:border-[#00F5D4]/50 transition-colors duration-500 overflow-hidden ${className}`}
    >
      <div style={{ transform: "translateZ(30px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

const Counter = ({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) => {
  const countRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!countRef.current) return;
    ScrollTrigger.create({
      trigger: countRef.current,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(countRef.current, { innerHTML: '0' }, {
          innerHTML: end, duration, ease: "power2.out", snap: { innerHTML: 1 },
          onUpdate: function () {
            if (countRef.current) countRef.current.innerHTML = Math.round(this.targets()[0].innerHTML).toLocaleString() + suffix;
          }
        });
      }
    });
  }, [end, suffix, duration]);

  return <div ref={countRef} className="text-5xl font-bold text-white tracking-tight">0{suffix}</div>;
};



export function Home() {
  const blobRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [morphIndex, setMorphIndex] = useState(0);
  const morphWords = ["Matters Most", "Is Essential", "Starts Here", "Is Personal"];

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (blobRef.current) {
        gsap.to(blobRef.current, { x: e.clientX, y: e.clientY, duration: 1.5, ease: "power2.out" });
      }
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);

    const interval = setInterval(() => setMorphIndex((prev) => (prev + 1) % morphWords.length), 3000);
    return () => { window.removeEventListener("mousemove", handleGlobalMouseMove); clearInterval(interval); };
  }, [morphWords.length]);

  return (
    <div className="min-h-screen bg-[#0A0F14] text-slate-200 font-sans selection:bg-[#00F5D4] selection:text-[#0A0F14] overflow-hidden relative">
      
      {/* Dynamic Cursor Blob */}
      <div 
        ref={blobRef}
        className="fixed top-0 left-0 w-[600px] h-[600px] bg-[#00F5D4]/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0 mix-blend-screen"
      />

      {/* Animated Gradient Background - Google Style Blurry */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Primary blob - Cyan/Turquoise */}
        <motion.div
          animate={{
            x: [0, 150, -100, 50, 0],
            y: [0, -150, 100, -50, 0],
            scale: [1, 1.3, 0.95, 1.1, 1],
            opacity: [0.6, 0.8, 0.65, 0.75, 0.6]
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-[#00F5D4]/40 via-cyan-500/25 to-blue-500/15 rounded-full blur-[140px] mix-blend-lighten"
        />
        
        {/* Secondary blob - Blue/Purple */}
        <motion.div
          animate={{
            x: [0, -120, 100, -80, 0],
            y: [0, 120, -100, 80, 0],
            scale: [0.9, 1.2, 1, 1.15, 0.9],
            opacity: [0.5, 0.75, 0.6, 0.7, 0.5]
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-blue-500/35 via-indigo-500/25 to-purple-500/15 rounded-full blur-[150px] mix-blend-lighten"
        />
        
        {/* Tertiary blob - Teal/Green */}
        <motion.div
          animate={{
            x: [0, 100, -80, 40, 0],
            y: [0, 100, -120, 60, 0],
            scale: [0.95, 1.15, 0.9, 1.2, 0.95],
            opacity: [0.4, 0.7, 0.55, 0.65, 0.4]
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute -bottom-1/3 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-[#00F5D4]/35 via-teal-500/20 to-cyan-500/15 rounded-full blur-[130px] mix-blend-lighten"
        />

        {/* Extra accent blob for depth - Pink/Red */}
        <motion.div
          animate={{
            x: [0, -100, 80, -60, 0],
            y: [0, -80, 120, -100, 0],
            scale: [0.8, 1.1, 1, 1.05, 0.8],
            opacity: [0.3, 0.5, 0.4, 0.45, 0.3]
          }}
          transition={{
            duration: 55,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-bl from-pink-500/20 via-red-500/10 to-orange-500/5 rounded-full blur-[160px] mix-blend-lighten"
        />
      </div>

      {/* Text clarity overlay - subtle gradient for readability */}
      <div className="fixed inset-0 z-1 pointer-events-none bg-gradient-to-b from-[#0A0F14]/40 via-[#0A0F14]/10 to-[#0A0F14]/50" />

      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="relative z-10 pt-32 pb-48 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-3 px-6 py-3 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/20 text-[#00F5D4] text-sm font-black uppercase tracking-widest mb-12 backdrop-blur-xl"
          >
            <Zap className="w-4 h-4" />
            <span>Advanced Mental Health Sanctuary</span>
          </motion.div>
          
          <h1 className="text-7xl md:text-[10rem] font-bold tracking-tighter text-white mb-12 leading-[0.9]">
            Mind<span className="text-[#00F5D4]">Care</span>
            <div className="text-3xl md:text-5xl font-medium tracking-normal text-slate-500 mt-8">
              Because Your Mental Health
              <div className="text-[#00F5D4] inline-block ml-4 min-w-[300px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={morphIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="absolute"
                  >
                    {morphWords[morphIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-16 font-medium"
          >
            A digital sanctuary transitions mental care from reactive treatment to proactive, AI-driven support. Built for higher-education students in India.
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link to="/student">
              <PrimaryButton className="px-16 py-8 text-2xl group shadow-[0_0_50px_rgba(0,245,212,0.3)]">
                Enter Sanctuary <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Data Nodes (Moved to global) */}
      <div className="fixed top-1/4 left-10 w-24 h-24 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl p-6 animate-float shadow-2xl z-10 opacity-40">
        <ActivitySquare className="w-full h-full text-[#00F5D4]" />
      </div>
      <div className="fixed bottom-1/4 right-10 w-24 h-24 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl p-6 animate-float shadow-2xl z-10 opacity-40" style={{ animationDelay: '2s' }}>
        <ShieldCheck className="w-full h-full text-[#00F5D4]" />
      </div>

      {/* 2. THE CRISIS (Problem Statement) */}
      <section className="relative z-10 py-32 bg-[#141C24]/30 border-y border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">The Academic Stress Crisis</h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Rising academic pressure, exam anxiety, and the stigma surrounding mental health are silent epidemics in Indian institutions. MindCare addresses these head-on.
            </p>
            <div className="space-y-4">
              {[
                { text: "Cultural & Language Barriers", icon: Globe2 },
                { text: "Extreme Academic Pressure", icon: Zap },
                { text: "Stigma in Seeking Help", icon: Lock },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <item.icon className="w-6 h-6 text-red-400" />
                  <span className="text-white font-bold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">72%</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Students feel burnt out</div>
            </div>
            <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center translate-y-8">
              <div className="text-4xl font-bold text-red-500 mb-2">1 in 4</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Face chronic anxiety</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (The 3-Step Journey) */}
      <section className="relative z-10 py-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">The MindCare Protocol</h2>
          <p className="text-xl text-slate-400">A seamless journey from distress to digital peace.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />
          
          {[
            { step: "01", title: "Anonymous Detection", desc: "Interact with our AI Copilot anonymously to identify hidden stress patterns.", icon: Search },
            { step: "02", title: "Agentic Analysis", desc: "Our 'Digital Twin' AI analyzes your sentiment scores and academic pressure points.", icon: Brain },
            { step: "03", title: "Holistic Healing", desc: "Receive automated interventions or book encrypted clinical counseling sessions.", icon: HeartPulse },
          ].map((item, i) => (
            <TiltCard key={i} className="relative z-10">
              <div className="p-8 rounded-[2.5rem] bg-[#141C24] border border-white/5 h-full">
                <div className="w-16 h-16 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center mb-8">
                  <item.icon className="w-8 h-8 text-[#00F5D4]" />
                </div>
                <div className="text-[#00F5D4] text-xs font-black mb-2 uppercase tracking-[0.2em]">{item.step} — System</div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* 4. DIGITAL TWIN SHOWCASE */}
      <section className="relative z-10 py-32 bg-gradient-to-br from-[#141C24] to-[#0A0F14]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">Agentic AI Engine</div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter leading-tight">The "Digital Twin" of Student Mental Health.</h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-12">
              Our standout feature creates a stateful, private profile of your mental well-being. It learns from your interactions to predict burnout before it happens.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "Long-term Memory", desc: "Persistence across sessions" },
                { title: "Sentiment Gating", desc: "Real-time risk assessment" },
                { title: "Academic Predictor", desc: "Exam stress forecasting" },
                { title: "Clinical Handoff", desc: "Seamless expert routing" },
              ].map((f, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00F5D4] mt-1 shrink-0" />
                  <div>
                    <div className="text-white font-bold">{f.title}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 relative">
            <motion.div 
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              initial={{ opacity: 0, scale: 0.9, rotateY: -30 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F5D4]/20 via-cyan-500/10 to-blue-500/5 blur-[100px] rounded-full" />
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80" 
                alt="Mental Health Wellness Meditation" 
                className="relative z-10 w-full h-auto rounded-3xl shadow-2xl filter brightness-95 contrast-110 hover:brightness-100 transition-all duration-500"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-[#0A0F14]/40 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. REGIONAL SUPPORT */}
      <section className="relative z-10 py-32 px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Mental Health in Your Voice.</h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-16">Multilingual support designed to overcome cultural barriers across India.</p>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {["Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese"].map((lang, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-[#00F5D4] hover:text-[#0A0F14] transition-all cursor-default"
            >
              {lang}
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. CLINICAL STANDARDS */}
      <section className="relative z-10 py-32 bg-[#0A0F14]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 border border-white/5 rounded-[3rem] bg-[#141C24]/30 p-16 md:p-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5"><Stethoscope className="w-64 h-64 text-white" /></div>
          <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center space-x-2 text-[#00F5D4] text-xs font-black uppercase tracking-widest mb-6">
                <ShieldCheck className="w-4 h-4" />
                <span>Clinical Integrity Platform</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Clinical Privacy & Institutional Safety</h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                MindCare is not just a bot. It is a supervised ecosystem where critical risks are immediately flagged for human intervention, while maintaining 100% student anonymity.
              </p>
              <ul className="space-y-6">
                <li className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10"><Lock className="w-6 h-6 text-[#00F5D4]" /></div>
                  <div>
                    <h4 className="text-white font-bold">AES-256 Encryption</h4>
                    <p className="text-sm text-slate-500 uppercase tracking-widest mt-1">End-to-end secure data storage</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10"><Shield className="w-6 h-6 text-[#00F5D4]" /></div>
                  <div>
                    <h4 className="text-white font-bold">Institutional Accountability</h4>
                    <p className="text-sm text-slate-500 uppercase tracking-widest mt-1">Aggregated heatmaps for administration</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-[#0A0F14]/50 border border-white/10 rounded-3xl p-12">
              <h3 className="text-2xl font-bold text-white mb-8">Accreditation Compliant</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-4">
                  <span>Data Protection</span>
                  <span className="text-[#00F5D4] font-bold">Verified</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-4">
                  <span>Clinical Oversight</span>
                  <span className="text-[#00F5D4] font-bold">Certified</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Global Standard Alignment</span>
                  <span className="text-[#00F5D4] font-bold">100% Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA & FOOTER */}
      <section className="relative z-10 py-32 px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-8 leading-tight">Your Digital Sanctuary Awaits.</h2>
        <p className="text-xl text-slate-400 mb-12 leading-relaxed">Join the next generation of mental wellness support for Indian institutions. Take the first step towards a healthier academic journey.</p>
        <Link to="/login">
          <PrimaryButton className="px-16 py-8 text-2xl shadow-[0_0_50px_rgba(0,245,212,0.3)]">
            Get Started Now
          </PrimaryButton>
        </Link>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
