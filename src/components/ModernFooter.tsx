import React from 'react';
import { motion, useInView } from 'motion/react';
import { Mail, MapPin, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

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

interface FooterProps {
  profile: any;
  onChat: () => void;
  onEmail: () => void;
}

export const ModernFooter = ({ profile, onChat, onEmail }: FooterProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

const socialLinks = [
    { icon: Github, href: profile?.githubUrl, label: 'GitHub' },
    { icon: Linkedin, href: profile?.linkedinUrl, label: 'LinkedIn' },
  ];

  return (
    <footer ref={ref} className="bg-primary text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-6xl font-display font-bold leading-tight mb-6">
              Let's Build <br />
              <span className="text-accent">Something</span> Great
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>
            <button 
              onClick={onChat}
              className="inline-flex items-center gap-3 px-8 py-5 bg-accent text-white rounded-2xl font-semibold hover:bg-accent/90 transition-all hover:scale-105"
            >
              Start a Conversation
              <ArrowRight size={20} />
            </button>
          </motion.div>

          {/* Right - Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-8"
          >
            {/* Email */}
            <div>
              <span className="text-sm text-slate-500 uppercase tracking-wider">Email</span>
              <a 
                href={`mailto:${profile?.email}`}
                className="block text-2xl font-semibold hover:text-accent transition-colors mt-2"
              >
                {profile?.email || 'jvpaisan@gmail.com'}
              </a>
            </div>

            {/* Location */}
            <div>
              <span className="text-sm text-slate-500 uppercase tracking-wider">Location</span>
              <div className="flex items-center gap-2 mt-2 text-slate-300">
                <MapPin size={18} className="text-accent" />
                <span>{profile?.location || 'Quezon City, Philippines'}</span>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <span className="text-sm text-slate-500 uppercase tracking-wider">Connect</span>
<div className="flex gap-4 mt-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-accent hover:scale-110 transition-all"
                  >
                    <social.icon size={20} />
                  </a>
                ))}
                <button // This is the Mail icon in the footer
                  onClick={onEmail}
                  className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-accent hover:scale-110 transition-all"
                  title="Contact"
                >
                  <Mail size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-20 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {profile?.name || 'John Vince Paisan'}. All rights reserved.
          </p>
          <p className="text-slate-500 text-sm">
            Built with React, Tailwind CSS & Firebase
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
