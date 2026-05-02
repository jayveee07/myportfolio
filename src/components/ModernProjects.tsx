import React from 'react';
import { motion, useInView } from 'motion/react';
import { ExternalLink, ArrowUpRight, Star, TrendingUp } from 'lucide-react';

// Custom Github SVG component
const Github = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.2-.3 2.4 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import { useRef, useState } from 'react';

interface Project {
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  github?: string;
}

interface ModernProjectsProps {
  projects: Project[];
  onContact: () => void;
}

export const ModernProjects = ({ projects, onContact }: ModernProjectsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Project gradient combinations
  const gradientPairs = [
    { from: 'from-blue-500', via: 'via-violet-500', to: 'to-purple-600' },
    { from: 'from-emerald-500', via: 'via-cyan-500', to: 'to-teal-600' },
    { from: 'from-orange-500', via: 'via-amber-500', to: 'to-yellow-600' },
    { from: 'from-rose-500', via: 'via-pink-500', to: 'to-red-600' },
  ];

  return (
    <section ref={ref} id="projects" className="py-24 bg-slate-50 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-gradient-to-r from-accent/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-l from-violet-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Featured Work</span>
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-primary mt-3 mb-4">
            Recent Projects
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            A selection of projects I've worked on, showcasing my skills in full-stack development and problem-solving.
          </p>
        </motion.div>

        {/* Project Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => {
            const gradients = gradientPairs[index % gradientPairs.length];
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 card-hover"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Enhanced Image Placeholder with Dynamic Gradient */}
                <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                  {/* Animated Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients.from} ${gradients.via} ${gradients.to} opacity-80 transition-all duration-700 ${isHovered ? 'opacity-90 scale-105' : 'opacity-75'}`} />
                  
                  {/* Pattern Overlay */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,_rgba(255,255,255,0.3)_1px,_transparent_0)] bg-[size:24px_24px]" />
                  </div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-20 group-hover:animate-shimmer transition-all duration-700" />
                  </div>
                  
                  {/* Floating Icons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {project.link && (
                      <motion.a
                        href={project.link}
                        target="_blank"
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-xl text-slate-700 hover:text-accent hover:scale-110 transition-all shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ExternalLink size={18} />
                      </motion.a>
                    )}
                    {project.github && (
                      <motion.a
                        href={project.github}
                        target="_blank"
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-xl text-slate-700 hover:text-primary hover:scale-110 transition-all shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Github size={18} />
                      </motion.a>
                    )}
                  </div>
                  
                  {/* Project Type Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                      {index === 0 ? (
                        <>
                          <Star size={14} className="text-amber-500" />
                          <span className="text-xs font-semibold text-slate-700">Featured</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp size={14} className="text-emerald-500" />
                          <span className="text-xs font-semibold text-slate-700">Active</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 relative">
                  {/* Hover Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-violet-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  
                  <h3 className="text-2xl font-display font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-6">
                    {project.description}
                  </p>
                  
                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.techStack?.map((tech, i) => (
                      <motion.span 
                        key={i}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full group-hover:bg-accent/10 group-hover:text-accent transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Projects Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          <motion.button 
            onClick={onContact}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Projects
            <ArrowUpRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
