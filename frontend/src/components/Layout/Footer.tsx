import React from 'react';
import { motion } from 'framer-motion';
import { Phone, ExternalLink, Twitter, Github, Linkedin, Mail, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../Common/Logo';

export function Footer() {
  return (
    <footer className="bg-[#0A0F14] border-t border-white/5 pt-24 pb-12 relative z-10 overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#00F5D4]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="md:col-span-1">
            <Logo className="mb-8" />
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
              Transitioning mental care from reactive treatment to proactive, AI-driven support for higher-education students in India.
            </p>
            <div className="flex space-x-5 text-slate-500">
              <Twitter className="w-5 h-5 hover:text-[#00F5D4] cursor-pointer transition-colors" />
              <Github className="w-5 h-5 hover:text-[#00F5D4] cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 hover:text-[#00F5D4] cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">Platform</h4>
            <ul className="space-y-4 text-slate-500 text-sm font-medium">
              <li><Link to="/student" className="hover:text-[#00F5D4] transition-colors">Digital Twin</Link></li>
              <li><Link to="/resources" className="hover:text-[#00F5D4] transition-colors">Resource Library</Link></li>
              <li><Link to="/admin" className="hover:text-[#00F5D4] transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-[#00F5D4] transition-colors">Auth Terminal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">Resources</h4>
            <ul className="space-y-4 text-slate-500 text-sm font-medium">
              <li><a href="#" className="hover:text-[#00F5D4] transition-colors">About MindCare</a></li>
              <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Community Forum</a></li>
              <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Project Status</a></li>
              <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Contact Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">Legal & Safety</h4>
            <ul className="space-y-4 text-slate-500 text-sm font-medium">
              <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Clinical Guidelines</a></li>
              <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Data Residency</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors flex items-center font-bold italic"><ShieldAlert className="w-4 h-4 mr-2" /> SOS: 9152987821</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
          <p>© 2025 MindCare Platform. All rights reserved.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}