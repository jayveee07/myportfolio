import React from 'react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

interface ModernAboutProps {
  profile: any;
}

export const ModernAbout = ({ profile }: ModernAboutProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const highlights = [
    "Full-Stack Development",
    "Data Operations",
    "System Administration",
    "Process Automation",
  ];

  return (
    <section ref={ref} id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Decorative boxes */}
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Main gradient box */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent via-violet-500 to-rose-500 rounded-3xl rotate-3 opacity-80" />
              
              {/* Secondary box */}
              <div className="absolute inset-8 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl font-display font-bold text-primary mb-2">
                    {profile?.name?.split(' ')[0]?.[0] || 'J'}V
                  </div>
                  <div className="text-slate-400 text-sm uppercase tracking-wider">
                    Portfolio
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -right-4 top-8 px-4 py-2 bg-white rounded-xl shadow-lg"
              >
                <div className="text-xs font-semibold text-accent uppercase">Available</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -left-4 bottom-16 px-4 py-2 bg-primary rounded-xl shadow-lg"
              >
                <div className="text-xs font-semibold text-white uppercase">Open to Work</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Content */}
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

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl"
                >
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-slate-400 block">Location</span>
                <span className="font-medium text-primary">{profile?.location || 'Quezon City, Philippines'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email</span>
                <span className="font-medium text-primary">{profile?.email || 'jvpaisan@gmail.com'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Languages</span>
                <span className="font-medium text-primary">{(profile?.languages || []).join(', ') || 'English, Filipino'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
