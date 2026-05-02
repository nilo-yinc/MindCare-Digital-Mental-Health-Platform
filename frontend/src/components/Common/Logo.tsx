import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

interface LogoProps {
  className?: string;
  withText?: boolean;
}

export function Logo({ className = '', withText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F5D4] to-[#00D1B2] shadow-[0_0_20px_rgba(0,245,212,0.4)]"
      >
        {/* Animated Pulse Ring */}
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 border border-white/50 rounded-xl"
        />
        
        {/* Core Icon */}
        <HeartPulse className="w-6 h-6 text-[#0A0F14] relative z-10" strokeWidth={1.5} />
      </motion.div>
      
      {withText && (
        <span className="text-2xl font-extrabold tracking-tight text-white group-hover:text-[#00F5D4] transition-colors duration-300">
          MindCare
        </span>
      )}
    </div>
  );
}

