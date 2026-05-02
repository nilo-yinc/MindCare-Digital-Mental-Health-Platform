import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Building, 
  Handshake, 
  Zap,
  Globe,
  Users,
  TrendingUp,
  Shield,
  CreditCard
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Reusable 3D Tilt Card Component
const TiltCard = ({ children, glowColor }: { children: React.ReactNode, glowColor: string }) => {
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
      className="relative group h-full cursor-pointer"
    >
      <div 
        className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[40px] pointer-events-none"
        style={{ backgroundColor: glowColor }}
      />
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 h-full backdrop-blur-xl relative z-10 overflow-hidden shadow-2xl">
        <div style={{ transform: "translateZ(30px)" }} className="h-full flex flex-col">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export function About() {
  const bgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const numbersRef = useRef<(HTMLSpanElement | null)[]>([]);

  const { scrollYProgress } = useScroll();
  const auraY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const businessModel = [
    {
      title: 'Freemium SaaS Model',
      price: '₹0 - ₹200/student',
      targetPrice: 200,
      prefix: '₹',
      description: 'Basic features free, premium wellness content and advanced AI features available through an institutional subscription.',
      icon: Users,
      glowColor: 'rgba(34, 197, 94, 0.15)', // Green
      iconColor: 'text-green-400'
    },
    {
      title: 'Enterprise Partnerships',
      price: 'Custom Contracts',
      targetPrice: 0,
      prefix: '',
      description: 'B2B partnerships with universities, government initiatives, and extensive Corporate Social Responsibility programs.',
      icon: Building,
      glowColor: 'rgba(59, 130, 246, 0.15)', // Blue
      iconColor: 'text-blue-400'
    },
    {
      title: 'Marketplace Revenue',
      price: '15-20% Commission',
      targetPrice: 20,
      prefix: '%',
      description: 'Revenue sharing directly from independent therapy sessions, wellness workshops, and advanced peer mentorship programs.',
      icon: Handshake,
      glowColor: 'rgba(168, 85, 247, 0.15)', // Purple
      iconColor: 'text-purple-400'
    },
    {
      title: 'API Licensing',
      price: '$10,000 - $50,000',
      targetPrice: 50000,
      prefix: '$',
      description: 'Licensing our mental health technology, robust data analytics, and AI endpoints to major EdTech companies.',
      icon: Zap,
      glowColor: 'rgba(249, 115, 22, 0.15)', // Orange
      iconColor: 'text-orange-400'
    }
  ];

  const partners = [
    'Ministry of Health', 'UNICEF', 'WHO', 'Apollo Hospitals', 'Max Healthcare', 'Microsoft AI', 'Google Cloud', 'AWS', 'OpenAI', 'Harvard University'
  ];

  useEffect(() => {
    // Parallax & Gradient Text shifting
    if (headlineRef.current) {
      gsap.to(headlineRef.current, {
        backgroundPosition: '200% center',
        ease: 'none',
        scrollTrigger: {
          trigger: headlineRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        }
      });
    }

    // Number Count-Up Animation
    numbersRef.current.forEach((el, index) => {
      if (!el) return;
      const targetVal = parseFloat(el.getAttribute('data-target') || '0');
      if (targetVal === 0) return; // Skip if no number
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.fromTo(el,
            { innerHTML: '0' },
            {
              innerHTML: targetVal,
              duration: 2.5,
              ease: 'power3.out',
              snap: { innerHTML: 1 },
              onUpdate: function() {
                if (el) {
                  el.innerHTML = Math.round(this.targets()[0].innerHTML).toLocaleString();
                }
              }
            }
          );
        }
      });
    });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } }
  };

  return (
    <div className="min-h-screen bg-[#0A0F14] text-slate-200 overflow-hidden relative font-sans">
      
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

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 
              ref={headlineRef}
              className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-purple-500 via-teal-400 to-purple-500 bg-[length:200%_auto] bg-clip-text text-transparent pb-4"
            >
              Strategic Vision
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
              MindCare operates at the intersection of healthcare and robust enterprise technology. We are building the definitive infrastructure for global student mental wellness.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Business Model Grid */}
      <section className="relative z-10 py-24 px-6 lg:px-8 bg-[#141C24]/30 border-y border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Sustainable Economics</h2>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-8"
          >
            {businessModel.map((model, index) => (
              <motion.div key={index} variants={itemVariants} className="h-full">
                <TiltCard glowColor={model.glowColor}>
                  <div className="flex items-center justify-between mb-8">
                    <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg ${model.iconColor}`}>
                      <model.icon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">{model.title}</h3>
                  
                  <div className="text-3xl font-extrabold text-slate-200 mb-6 flex items-baseline">
                    {model.targetPrice > 0 ? (
                      <>
                        <span className="text-xl text-slate-500 mr-2">Up to</span>
                        {model.prefix === '₹' || model.prefix === '$' ? <span className="mr-1">{model.prefix}</span> : null}
                        <span 
                          ref={el => numbersRef.current[index] = el}
                          data-target={model.targetPrice}
                          className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
                        >
                          {model.targetPrice}
                        </span>
                        {model.prefix === '%' ? <span>{model.prefix}</span> : null}
                      </>
                    ) : (
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{model.price}</span>
                    )}
                  </div>
                  
                  <p className="text-slate-400 leading-relaxed font-medium mt-auto">
                    {model.description}
                  </p>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Strategic Partnerships (Infinite Marquee) */}
      <section className="relative z-10 py-32 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-16 text-center">
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">Strategic Partnerships</h2>
          <p className="text-slate-400 text-lg">Integrated with the world's most trusted institutions.</p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden flex items-center bg-[#141C24]/30 py-12 border-y border-white/5 backdrop-blur-sm">
          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0A0F14] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0F14] to-transparent z-10 pointer-events-none" />
          
          <motion.div 
            animate={{ x: [0, -1920] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            className="flex items-center space-x-16 whitespace-nowrap pl-16"
          >
            {/* Double the array for seamless infinite scroll */}
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div 
                key={index} 
                className="group flex items-center justify-center min-w-[200px]"
              >
                <span className="text-2xl font-extrabold tracking-widest uppercase text-white/30 group-hover:text-[#00F5D4] transition-all duration-300">
                  {partner}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
}