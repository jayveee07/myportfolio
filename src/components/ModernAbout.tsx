import React from 'react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Code, Database, Server, Cog, ArrowRight, Sparkles, CheckCircle, MapPin, Mail, Globe } from 'lucide-react';

interface ModernAboutProps {
  profile: any;
}

export const ModernAbout = ({ profile }: ModernAboutProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const highlights = [
    { icon: Code, label: "Full-Stack Development", color: "text-accent", bg: "bg-accent/10" },
    { icon: Database, label: "Data Operations", color: "text-violet-500", bg: "bg-violet-500/10" },
    { icon: Server, label: "System Administration", color: "text-rose-500", bg: "bg-rose-500/10" },
    { icon: Cog, label: "Process Automation", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <section ref={ref} id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-accent/5 via-violet-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-rose-500/5 via-amber-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-accent/3 via-violet-500/3 to-rose-500/3 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Enhanced Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Decorative boxes with enhanced effects */}
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Main gradient box */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-accent via-violet-500 to-rose-500 rounded-3xl"
                animate={{ 
                  rotate: [3, -3, 3],
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ opacity: 0.85 }}
              />
              
              {/* Secondary box */}
              <motion.div 
                className="absolute inset-4 bg-white rounded-2xl shadow-2xl flex items-center justify-center"
                initial={{ rotate: 0 }}
                animate={{ rotate: 0 }}
              >
                <div className="text-center p-8 relative">
                  {/* Glow effect behind initials */}
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl" />
                  
                  <motion.div 
                    className="relative text-7xl font-display font-bold bg-gradient-to-br from-primary to-slate-600 bg-clip-text text-transparent"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {profile?.name?.split(' ')[0]?.[0] || 'J'}V
                  </motion.div>
                  <div className="text-slate-400 text-sm uppercase tracking-widest mt-2 relative">Portfolio</div>
                </div>
              </motion.div>

              {/* Floating badges with enhanced styling */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -right-4 top-8 px-5 py-3 bg-white rounded-xl shadow-xl border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <div className="text-xs font-bold text-accent uppercase">Available</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -left-4 bottom-20 px-5 py-3 bg-primary rounded-xl shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-white/80" />
                  <div className="text-xs font-bold text-white uppercase">Open to Work</div>
                </div>
              </motion.div>

              {/* Extra decorative badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute -right-8 bottom-8 px-4 py-2 bg-gradient-to-r from-violet-500 to-rose-500 rounded-lg shadow-lg"
              >
                <div className="text-xs font-bold text-white uppercase">4+ Years</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Enhanced Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">About Me</span>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-primary mt-3 mb-6">
              Turning Ideas into<br />
              <span className="gradient-text">Real Solutions</span>
            </h2>
            
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              {profile?.bio || "I'm a results-driven IT professional with experience in software development, data operations, technical support, and financial systems. Proven ability to analyze large datasets, troubleshoot system issues, and develop high-accuracy web applications in fast-paced environments."}
            </p>

            {/* Enhanced Highlights */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {highlights.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl hover:bg-white hover:shadow-lg transition-all group"
                >
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center ${item.icon}`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">{item.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Quick Info with enhanced styling */}
            <div className="flex flex-wrap gap-8 p-6 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <MapPin size={18} className="text-accent" />
                </div>
                <div>
                  <span className="text-slate-400 block text-xs uppercase tracking-wider">Location</span>
                  <span className="font-medium text-primary">{profile?.location || 'Quezon City, Philippines'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                  <Mail size={18} className="text-violet-500" />
                </div>
                <div>
                  <span className="text-slate-400 block text-xs uppercase tracking-wider">Email</span>
                  <span className="font-medium text-primary">{profile?.email || 'jvpaisan@gmail.com'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                  <Globe size={18} className="text-rose-500" />
                </div>
                <div>
                  <span className="text-slate-400 block text-xs uppercase tracking-wider">Languages</span>
                  <span className="font-medium text-primary">{(profile?.languages || []).join(', ') || 'English, Filipino'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
