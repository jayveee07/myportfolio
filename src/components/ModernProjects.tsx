import { useRef, useState, useMemo, type MouseEvent } from 'react';
import { motion, useInView } from 'motion/react';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { Github } from '../lib/icons';
import type { Project } from '../types/portfolio';

interface ModernProjectsProps {
  projects: Project[];
  onContact: () => void;
}

export const ModernProjects = ({ projects, onContact }: ModernProjectsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState('All');

  const allTechs = useMemo(() => {
    const techs = new Set<string>();
    projects.forEach(p => p.techStack?.forEach(t => techs.add(t)));
    return ['All', ...Array.from(techs).sort()];
  }, [projects]);

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.techStack?.includes(activeFilter));

  return (
    <section ref={ref} id="projects" className="py-24 bg-surface-alt">
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
          <p className="text-secondary max-w-xl mx-auto">
            A selection of projects I've worked on, showcasing my skills in full-stack development and problem-solving.
          </p>
        </motion.div>

        {/* Filter Bar */}
        {allTechs.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {allTechs.map((tech) => (
              <button
                key={tech}
                onClick={() => setActiveFilter(tech)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeFilter === tech
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'bg-card text-secondary hover:text-accent border border-border hover:border-accent/30'
                }`}
              >
                {tech}
              </button>
            ))}
          </motion.div>
        )}

        {/* Project Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {filtered.map((project, index) => (
            <TiltCard key={index}>
              <div className="group relative bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 card-hover h-full">
                {/* Image Placeholder with Gradient */}
                <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${index === 0 ? 'from-blue-400 to-violet-500' : 'from-emerald-400 to-cyan-500'} opacity-75 transition-opacity duration-500`} />
                  
                  {/* Floating Icons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-card/90 rounded-xl text-secondary hover:text-accent hover:scale-110 transition-all shadow-lg"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-card/90 rounded-xl text-secondary hover:text-primary hover:scale-110 transition-all shadow-lg"
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
                  <p className="text-secondary font-medium leading-relaxed mb-6">
                    {project.description}
                  </p>
                  
                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.techStack?.map((tech, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1.5 bg-tag text-secondary text-xs font-semibold rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-btn text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
          >
            View All Projects
            <ArrowUpRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s ease';
    setTimeout(() => { if (card) card.style.transition = ''; }, 500);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tilt-card"
    >
      {children}
    </div>
  );
};
