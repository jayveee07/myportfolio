import React from 'react';
import { motion, useInView } from 'motion/react';
import { Terminal, Database, Code2, Cloud, Smartphone, Palette } from 'lucide-react';
import { useRef } from 'react';

interface SkillGroup {
  category: string;
  items: string[];
}

interface ModernSkillsProps {
  skills: SkillGroup[]; // Keep existing skills prop
  onContact: () => void; // Add onContact prop
}

const icons = [Terminal, Database, Code2, Cloud, Smartphone, Palette];

export const ModernSkills = ({ skills, onContact }: ModernSkillsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="skills" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
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
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group p-8 bg-slate-50 rounded-3xl hover:bg-white hover:shadow-2xl transition-all duration-500"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-accent to-violet-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <Icon size={28} />
                </div>

                {/* Category */}
                <h3 className="text-xl font-display font-bold text-primary mb-4">
                  {group.category}
                </h3>

                {/* Skills List */}
                <div className="flex flex-wrap gap-2">
                  {group.items?.map((skill, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1.5 bg-white text-slate-600 text-sm font-medium rounded-xl border border-slate-100 group-hover:border-accent/30 group-hover:text-accent transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
