import React from 'react';
import { motion, useInView } from 'motion/react';
import { Calendar, MapPin, ArrowRight, Award, BookOpen, Briefcase } from 'lucide-react';
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

const DEFAULT_EDUCATION = [
  {
    degree: "Bachelor of Science: Information Systems",
    school: "Advance Central College",
    period: "Graduated 2022",
    description: [
      "Graduated with honors",
      "Programmer of the Year: Recognized for top-tier coding proficiency and technical performance",
      "Best Capstone Project: Led development of a system solution recognized for innovation and applicability",
      "Core focus on web development and database systems",
      "Active member of the college tech club"
    ]
  },
  {
    degree: "Java Programming NCIII",
    school: "TESDA",
    period: "Certified",
    description: ["Finisher of TESDA Java Programming NCIII"]
  },
  {
    degree: "Visual Graphic Design NCIII",
    school: "TESDA",
    period: "Certified",
    description: ["Technical Education and Skills Development Authority (NCIII)"]
  }
];


export const ModernExperience = ({ experience, education, onContact }: ModernExperienceProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const displayEducation = education && education.length > 0 ? education : DEFAULT_EDUCATION;

  return (
    <section ref={ref} id="experience" className="py-24 bg-slate-50 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-b from-accent/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-t from-violet-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
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
          <p className="text-slate-500 max-w-xl mx-auto">
            My journey through various roles and companies, building expertise in software development.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Animated Vertical Line with Glow */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-b from-accent via-violet-500 to-rose-500 opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-accent via-violet-500 to-rose-500 animate-pulse opacity-60 blur-sm" />
          </div>

          <div className="space-y-12">
            {experience.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className={`relative flex items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Content Card */}
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <motion.div 
                    className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 group"
                    whileHover={{ y: -4 }}
                  >
                    {/* Date Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4 ${index % 2 === 0 ? 'lg:ml-auto' : ''}`}>
                      <Calendar size={14} />
                      {exp.period}
                    </div>

                    {/* Role & Company */}
                    <h3 className="text-2xl font-display font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                      {exp.role}
                    </h3>
                    <p className="text-slate-500 font-medium mb-4 flex items-center gap-2">
                      <Briefcase size={16} className="text-accent/60" />
                      {exp.company}
                    </p>

                    {/* Description */}
                    <ul className="space-y-3">
                      {exp.description?.map((point, i) => (
                        <li key={i} className={`flex items-start gap-3 text-slate-600 ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                          <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Center Glowing Dot (Desktop) */}
                <div className="hidden lg:flex w-6 h-6 bg-white rounded-full items-center justify-center z-10 shadow-lg">
                  <motion.div 
                    className="w-4 h-4 bg-accent rounded-full"
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 rgba(14, 165, 233, 0.4)',
                        '0 0 0 8px rgba(14, 165, 233, 0)',
                        '0 0 0 0 rgba(14, 165, 233, 0)'
                      ]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  />
                </div>

                {/* Spacer */}
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <motion.div 
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
            {displayEducation?.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-2 text-accent text-sm font-semibold mb-2">
                  <BookOpen size={14} />
                  {edu.period}
                </div>
                <h4 className="text-lg font-display font-bold text-primary group-hover:text-accent transition-colors">
                  {edu.degree}
                </h4>
                <p className="text-slate-500 text-sm mt-1">
                  {edu.school}
                </p>
                {edu.description && edu.description.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {edu.description.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform" />
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
          <motion.button 
            onClick={onContact}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-semibold hover:bg-slate-800 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
           Let's Work Together
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
