import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Mail, Sun, Moon } from 'lucide-react';
import { SiteLogo } from './Logo';
import { Github, Linkedin } from '../lib/icons';
import { useTheme } from '../context/ThemeContext';
import type { Profile } from '../types/portfolio';

interface ModernNavProps {
  profile: Profile;
  onChat: () => void;
  onEmail: () => void;
}

export const ModernNav = ({ profile, onChat, onEmail }: ModernNavProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    const sectionIds = ['about', 'skills', 'experience', 'education', 'projects', 'testimonials', 'blog'];
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Experience', href: '#experience' },
    { label: 'Education', href: '#education' },
    { label: 'Projects', href: '#projects' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Blog', href: '#blog' },
  ];

const socialLinks = [
    { icon: Github, href: profile?.githubUrl, label: 'GitHub' },
    { icon: Linkedin, href: profile?.linkedinUrl, label: 'LinkedIn' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-surface/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo - Using existing SiteLogo with logoM.png */}
          <SiteLogo size="sm" />

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`relative text-sm font-medium transition-colors ${
                  activeSection === link.href.slice(1)
                    ? 'text-accent'
                    : 'text-secondary hover:text-accent'
                }`}
              >
                {link.label}
                {activeSection === link.href.slice(1) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"
                  />
                )}
              </a>
            ))}
          </div>

          {/* Social & CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggle}
              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-accent hover:bg-accent/10 rounded-xl transition-all"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
{socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-accent hover:bg-accent/10 rounded-xl transition-all"
              >
                <social.icon size={18} />
              </a>
            ))}
            <button 
              onClick={onEmail}
              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-accent hover:bg-accent/10 rounded-xl transition-all"
              title="Contact"
            >
              <Mail size={18} />
            </button>
            <button 
              onClick={onChat}
              className="px-5 py-2.5 bg-btn text-white rounded-xl font-medium hover:bg-slate-800 transition-all"
            >
              Let's Talk
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-primary"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-50 bg-surface md:hidden"
          >
            <div className="flex flex-col h-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-12">
                <SiteLogo size="md" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Links */}
              <div className="flex flex-col gap-6">
                {navLinks.map((link, index) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-4xl font-display font-bold transition-colors ${
                      activeSection === link.href.slice(1)
                        ? 'text-accent'
                        : 'text-primary'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

{/* Social Links */}
              <div className="mt-auto flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center bg-tag rounded-xl"
                  >
                    <social.icon size={20} />
                  </a>
                ))}
                <button
                  onClick={toggle}
                  className="w-12 h-12 flex items-center justify-center bg-tag rounded-xl text-secondary hover:text-accent transition-all"
                  title="Toggle theme"
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button
                  onClick={() => { onEmail(); setIsMobileMenuOpen(false); }}
                  className="w-12 h-12 flex items-center justify-center bg-tag rounded-xl text-secondary hover:text-accent transition-all"
                  title="Contact"
                >
                  <Mail size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
