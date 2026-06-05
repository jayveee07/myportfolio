import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import { Mail, MapPin, ArrowRight } from 'lucide-react';
import { Github, Linkedin } from '../lib/icons';
import { subscribeToAdminSettings } from '../lib/supabase-messaging';
import type { Profile } from '../types/portfolio';

interface FooterProps {
  profile: Profile;
  onChat: () => void;
  onEmail: () => void;
}

export const ModernFooter = ({ profile, onChat, onEmail }: FooterProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [builtWith, setBuiltWith] = useState('React, Tailwind CSS & Supabase');

  useEffect(() => {
    const unsub = subscribeToAdminSettings((settings) => {
      if (settings.builtWith) setBuiltWith(settings.builtWith);
    });
    return () => unsub();
  }, []);

const socialLinks = [
    { icon: Github, href: profile?.githubUrl, label: 'GitHub' },
    { icon: Linkedin, href: profile?.linkedinUrl, label: 'LinkedIn' },
  ];

  return (
    <footer ref={ref} className="bg-footer text-white py-20">
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
            <p className="text-muted text-lg mb-8 max-w-md">
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
              <span className="text-sm text-muted uppercase tracking-wider">Email</span>
              <a 
                href={`mailto:${profile?.email}`}
                className="block text-2xl font-semibold hover:text-accent transition-colors mt-2"
              >
                {profile?.email || 'jvpaisan@gmail.com'}
              </a>
            </div>

            {/* Location */}
            <div>
              <span className="text-sm text-muted uppercase tracking-wider">Location</span>
              <div className="flex items-center gap-2 mt-2 text-slate-300">
                <MapPin size={18} className="text-accent" />
                <span>{profile?.location || 'Quezon City, Philippines'}</span>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <span className="text-sm text-muted uppercase tracking-wider">Connect</span>
<div className="flex gap-4 mt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
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
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} {profile?.name || 'John Vince Paisan'}. All rights reserved.
          </p>
          <p className="text-muted text-sm">
            Built with {builtWith}
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
