import React from 'react';
import { motion, useInView } from 'motion/react';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { useRef, useState } from 'react';

const Github = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.2-.3 2.4 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

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

  return (
    <section ref={ref} id="projects" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
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
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 card-hover"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Image Placeholder with Gradient */}
              <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${index === 0 ? 'from-blue-400 to-violet-500' : 'from-emerald-400 to-cyan-500'} opacity-75 transition-opacity duration-500 ${hoveredIndex === index ? 'opacity-90' : 'opacity-75'}`} />
                
                {/* Floating Icons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      className="p-3 bg-white/90 rounded-xl text-slate-700 hover:text-accent hover:scale-110 transition-all shadow-lg"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
{project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      className="p-3 bg-white/90 rounded-xl text-slate-700 hover:text-primary hover:scale-110 transition-all shadow-lg"
                    >
<Github size={18} />
                    </a>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-display font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-6">
                  {project.description}
                </p>
                
                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.techStack?.map((tech, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
          >
            View All Projects
            <ArrowUpRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
