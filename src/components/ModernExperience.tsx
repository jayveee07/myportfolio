import { motion, useInView } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

interface Experience {
  role: string;
  company: string;
  period: string;
  description: string[];
}

interface Education {
  degree: string;
  school: string;
  period: string;
  description?: string[];
}


interface ModernExperienceProps {
  experience: Experience[];
  education?: Education[];
  onContact: () => void;
}

export const ModernExperience = ({ experience, education, onContact }: ModernExperienceProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="experience" className="py-24 bg-surface-alt">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Professional Background</span>
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-primary mt-3 mb-4">
            Work Experience
          </h2>
          <p className="text-secondary max-w-xl mx-auto">
            My journey through various roles and companies, building expertise in software development.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-violet-500 to-rose-500 hidden lg:block" />

          <div className="space-y-12">
            {experience.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className={`relative flex items-center gap-8 max-lg:flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Content Card */}
                <div className={`flex-1 max-lg:flex-none max-lg:w-full max-lg:max-w-2xl ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <div className="bg-card p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 group">
                    {/* Date Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4 ${index % 2 === 0 ? 'lg:ml-auto' : ''}`}>
                      <Calendar size={14} />
                      {exp.period}
                    </div>

                    {/* Role & Company */}
                    <h3 className="text-2xl font-display font-bold text-primary mb-2">
                      {exp.role}
                    </h3>
                    <p className="text-secondary font-medium mb-4">
                      {exp.company}
                    </p>

                    {/* Description */}
                    <ul className="space-y-3">
                      {exp.description?.map((point, i) => (
                        <li key={i} className={`flex items-start gap-3 text-secondary ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                          <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Center Dot (Desktop) */}
                <div className="hidden lg:flex w-6 h-6 bg-accent rounded-full items-center justify-center z-10 shadow-lg shadow-accent/30">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>

                {/* Spacer */}
                <div className="flex-1 max-lg:hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <motion.div 
          id="education"
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Education</span>
            <h3 className="text-2xl font-display font-bold text-primary mt-2">
              Academic Background
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {education?.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-2 text-accent text-sm font-semibold mb-2">
                  <Calendar size={14} />
                  {edu.period}
                </div>
                <h4 className="text-lg font-display font-bold text-primary">
                  {edu.degree}
                </h4>
                <p className="text-secondary text-sm mt-1">
                  {edu.school}
                </p>
                {edu.description && edu.description.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {edu.description.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-secondary text-sm">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}

          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <button 
            onClick={onContact}
            className="inline-flex items-center gap-2 px-8 py-4 bg-btn text-white rounded-2xl font-semibold hover:bg-slate-800 transition-all hover:scale-105"
          >
           Let's Work Together
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
