import React from 'react';
import { motion, useInView } from 'motion/react';
import { Mail, MapPin, ArrowRight, Send, Sparkles, Zap } from 'lucide-react';
import { useRef } from 'react';

interface FooterProps {
  profile: any;
  onChat: () => void;
  onEmail: () => void;
}

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

export const ModernFooter = ({ profile, onChat, onEmail }: FooterProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const socialLinks = [
    { icon: Github, href: profile?.githubUrl, label: 'GitHub' },
    { icon: Linkedin, href: profile?.linkedinUrl, label: 'LinkedIn' },
  ];

  return (
    <footer ref={ref} className="bg-primary text-white py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-accent/20 via-violet-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-rose-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Decorative Elements */}
            <motion.div
              className="absolute -top-10 -left-10 w-32 h-32 border border-accent/20 rounded-full"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute top-20 -left-20 w-20 h-20 bg-violet-500/10 rounded-full blur-xl"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />

            {/* Content */}
            <h2 className="text-4xl sm:text-6xl font-display font-bold leading-tight mb-6 relative">
              Let's Build <br />
              <span className="gradient-text">Something</span> Great
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md relative">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>
            <motion.button 
              onClick={onChat}
              className="inline-flex items-center gap-3 px-8 py-5 bg-accent text-white rounded-2xl font-semibold hover:bg-accent/90 transition-all hover:scale-105 relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Shine Effect */}
              <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-20 group-hover:animate-shimmer transition-all duration-700" />
              
              <span className="relative flex items-center gap-3">
                Start a Conversation
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </motion.div>

          {/* Right - Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-8 relative"
          >
            {/* Email */}
            <motion.div 
              className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-accent/30 transition-all group"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm text-slate-500 uppercase tracking-wider">Email</span>
              <a 
                href={`mailto:${profile?.email}`}
                className="block text-2xl font-semibold group-hover:text-accent transition-colors mt-2 flex items-center gap-3"
              >
                {profile?.email || 'jvpaisan@gmail.com'}
                <Send size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </motion.div>

            {/* Location */}
            <motion.div 
              className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-violet-500/30 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm text-slate-500 uppercase tracking-wider">Location</span>
              <div className="flex items-center gap-3 mt-2 text-slate-300">
                <MapPin size={18} className="text-accent" />
                <span>{profile?.location || 'Quezon City, Philippines'}</span>
              </div>
            </motion.div>

            {/* Social Links */}
            <div>
              <span className="text-sm text-slate-500 uppercase tracking-wider">Connect</span>
              <div className="flex gap-4 mt-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-accent hover:scale-110 transition-all border border-white/10 hover:border-accent"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon size={20} />
                  </motion.a>
                ))}
                <motion.button
                  onClick={onEmail}
                  className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-accent hover:scale-110 transition-all border border-white/10 hover:border-accent"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Contact"
                >
                  <Mail size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-20 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 relative"
        >
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-20 h-0.5 bg-gradient-to-r from-accent to-violet-500" />
          
          <p className="text-slate-500 text-sm order-2 sm:order-1">
            © {new Date().getFullYear()} {profile?.name || 'John Vince Paisan'}. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2 text-slate-500 text-sm order-1 sm:order-2">
            <Zap size={14} className="text-accent" />
            <span>Built with React, Tailwind CSS & Firebase</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
