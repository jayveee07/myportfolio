import React from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Download, Send, Mail, ExternalLink } from 'lucide-react';

const Github = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.2-.3 2.4 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
  </svg>
);

interface ModernHeroProps {
  profile: any;
  resumeUrl: string;
  onContact: () => void;
}

export const ModernHero = ({ profile, resumeUrl, onContact }: ModernHeroProps) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-white px-6">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="hero-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ y }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-100 to-cyan-50 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-rose-50 to-orange-50 rounded-full blur-3xl opacity-30" />
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#e5e7eb_1px,transparent_1px),linear-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
      
      <motion.div 
        style={{ opacity }}
        className="max-w-6xl mx-auto relative z-10 text-center py-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Available for Projects</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-6xl sm:text-7xl lg:text-8xl font-display font-bold text-primary tracking-tight leading-[0.9] uppercase mb-8"
        >
          Building <br />
          <span className="gradient-text">Digital</span> <br />
          Experiences.
        </motion.h1>

        {/* Bio */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg sm:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto mb-12"
        >
          {profile?.bio || "Full-Stack Developer crafting innovative solutions with modern technologies."}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16"
        >
          <button 
            onClick={onContact}
            className="group relative px-8 py-5 bg-primary text-white rounded-2xl font-semibold text-base hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-2xl shadow-primary/20"
          >
            Let's Talk
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a 
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-5 rounded-2xl border-2 border-slate-200 font-semibold text-base hover:border-accent hover:text-accent transition-all flex items-center gap-3 bg-white/50 backdrop-blur-sm"
          >
            <Download className="w-5 h-5" />
            Download CV
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-12 pt-8 border-t border-slate-200"
        >
          {[
            { label: 'Years Experience', value: '4+' },
            { label: 'Projects Completed', value: '15+' },
            { label: 'Technologies', value: '20+' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-display font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex items-start justify-center p-2">
          <motion.div 
            className="w-1.5 h-1.5 bg-accent rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.div>
    </section>
  );
};
