import React from 'react';
import { motion, useInView } from 'motion/react';
import { Terminal, Database, Code2, Cloud, Smartphone, Palette, Zap, Shield, Cpu, Globe } from 'lucide-react';
import { useRef } from 'react';

interface SkillGroup {
  category: string;
  items: string[];
}

interface ModernSkillsProps {
  skills: SkillGroup[];
  onContact: () => void;
}

const icons = [Terminal, Database, Code2, Cloud, Smartphone, Palette];

// Extended icons for variety
const extendedIcons = [Terminal, Database, Code2, Cloud, Smartphone, Palette, Zap, Shield, Cpu, Globe];

export const ModernSkills = ({ skills, onContact }: ModernSkillsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="skills" className="py-24 bg-white relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-violet-500/5 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Technical Skills</span>
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-primary mt-3 mb-4">
            Skills & Technologies
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Technologies I work with to bring ideas to life.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((group, index) => {
            const Icon = extendedIcons[index % extendedIcons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative p-8 bg-slate-50 rounded-3xl overflow-hidden hover:bg-white hover:shadow-2xl transition-all duration-500"
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-violet-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/20 rounded-3xl transition-colors duration-500" />
                </div>
                
                {/* Glow Effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon */}
                <div className="relative z-10">
                  <motion.div
                    className="w-14 h-14 bg-gradient-to-br from-accent to-violet-600 rounded-2xl flex items-center justify-center text-white mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon size={28} />
                  </motion.div>
                </div>

                {/* Category */}
                <h3 className="relative z-10 text-xl font-display font-bold text-primary mb-4 group-hover:text-accent transition-colors">
                  {group.category}
                </h3>

                {/* Skills List */}
                <div className="relative z-10 flex flex-wrap gap-2">
                  {group.items?.map((skill, i) => (
                    <motion.span 
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: index * 0.1 + i * 0.05 }}
                      className="px-3 py-1.5 bg-white text-slate-600 text-sm font-medium rounded-xl border border-slate-100 group-hover:border-accent/30 group-hover:text-accent hover:bg-accent hover:text-white transition-all cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View More Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          <button 
            onClick={onContact}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          >
            View All Skills
          </button>
        </motion.div>
      </div>
    </section>
  );
};
