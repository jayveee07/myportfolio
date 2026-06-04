import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

import {
  recordVisit,
  updateHeartbeat,
  seedPortfolioData,
} from './lib/supabase-data';
import { subscribeToAdminSettings } from './lib/supabase-messaging';
import { useAuth } from './context/SupabaseAuthContext';
import { useProfile, useExperience, useSkills, useEducation, useProjects } from './hooks/usePortfolioData';
import { ChatWidget } from './components/ChatWidget';
import { ContactModal } from './components/ContactModal';
import { ModernNav } from './components/ModernNav';
import { ModernHero } from './components/ModernHero';
import { ModernAbout } from './components/ModernAbout';
import { ModernSkills } from './components/ModernSkills';
import { ModernExperience } from './components/ModernExperience';
import { ModernProjects } from './components/ModernProjects';
import { Testimonials } from './components/Testimonials';
import { BlogSection } from './components/BlogSection';
import { ScrollReveal } from './components/ScrollReveal';
import { ModernFooter } from './components/ModernFooter';
import { ADMIN_EMAIL } from './lib/supabase';
import type { Profile, Experience, SkillGroup, Education } from './types/portfolio';

const AdminPanel = lazy(() => import('./components/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));

const DEFAULT_PROFILE: Profile = {
  name: "John Vince Paisan",
  titles: ["Full-Stack Developer", "Data Operations Specialist", "Systems Administrator"],
  bio: "Results-driven IT professional with experience in software development, data operations, technical support, and financial systems.",
  email: ADMIN_EMAIL,
  phone: "+63 970 763 9960",
  location: "Quezon City, Philippines",
  languages: ["English", "Filipino"],
  resumeUrl: "/John_Vince_Paisan_Resume.pdf",
  githubUrl: "https://github.com/jayveee07",
  linkedinUrl: "https://www.linkedin.com/in/john-vince-p-b82409239"
};

const ALL_SECTIONS = ['hero', 'about', 'skills', 'experience', 'projects', 'testimonials', 'blog', 'footer'] as const;
type SectionKey = (typeof ALL_SECTIONS)[number];

export default function App() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [resumeUrl, setResumeUrl] = useState(DEFAULT_PROFILE.resumeUrl);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState<string[] | null>(null);

  const { user, signInAdmin } = useAuth();
  const { data: profileData } = useProfile();
  const { data: experienceData = [] } = useExperience();
  const { data: skillsData = [] } = useSkills();
  const { data: educationData = [] } = useEducation();
  const { data: projects = [] } = useProjects();

  const experience = experienceData as Experience[];
  const skills = skillsData as SkillGroup[];
  const education = educationData as Education[];

  useEffect(() => {
    if (profileData) {
      setProfile(prev => ({ ...prev, ...profileData }));
      if (profileData.resumeUrl) setResumeUrl(profileData.resumeUrl);
      if (profileData.sectionsVisible) setSectionsVisible(profileData.sectionsVisible);
    }
  }, [profileData]);

  const isSectionVisible = (key: SectionKey) =>
    !sectionsVisible?.length || sectionsVisible.includes(key);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const checkPath = () => setIsAdminView(window.location.pathname === '/admin');
    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    let isMounted = true;
    let unsubSettings: (() => void) | undefined;

    unsubSettings = subscribeToAdminSettings((settings) => {
      if (isMounted && settings.resumeUrl) {
        setResumeUrl(settings.resumeUrl);
      }
    });

    const isAdminSession = localStorage.getItem('is_admin') === 'true';
    if (!isAdminSession) {
      recordVisit(window.location.pathname);
    }

    const heartbeatInterval = setInterval(() => {
      if (localStorage.getItem('is_admin') !== 'true') {
        updateHeartbeat();
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(heartbeatInterval);
      if (unsubSettings) unsubSettings();
    };
  }, []);

  const handleContact = () => setIsChatOpen(true);
  const handleOpenContact = () => setIsContactModalOpen(true);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthError('');
      await signInAdmin(adminEmail, adminPassword);
      localStorage.setItem('is_admin', 'true');
    } catch (err: unknown) {
      setAuthError((err as { message?: string }).message || "Login failed");
    }
  };

  const handleSeed = async () => {
    if (window.confirm("This will populate your database with default Experience and Skills. Continue?")) {
      try {
        await seedPortfolioData();
        window.location.reload();
      } catch {
        alert("Seed failed");
      }
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (isAdminView) {
    return (
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-surface-alt font-mono">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-[2px] bg-accent animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">Loading Panel...</span>
          </div>
        </div>
      }>
        {!user || user.email !== ADMIN_EMAIL ? (
          <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface-alt p-6">
            <div className="w-full max-w-md">
              <div className="mb-12 text-center">
                <h1 className="text-3xl font-bold text-primary mb-2">Secure Access</h1>
                <p className="text-secondary text-sm">Administrative Authentication Required</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@instance.com"
                    className="w-full px-5 py-4 rounded-2xl border border-border bg-surface focus:outline-none focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-2xl border border-border bg-surface focus:outline-none focus:border-accent transition-all"
                  />
                </div>
                {authError && <p className="text-red-500 text-sm">{authError}</p>}
                <button
                  type="submit"
                  className="w-full py-4 bg-btn text-white rounded-2xl font-semibold hover:opacity-90 transition-all"
                >
                  Authorize Access
                </button>
              </form>

              {user && user.email === ADMIN_EMAIL && (
                <div className="mt-8 p-4 border border-border rounded-2xl">
                  <button
                    onClick={handleSeed}
                    className="w-full py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-all"
                  >
                    Seed Initial Data
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  setIsAdminView(false);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="w-full mt-6 text-sm text-secondary hover:text-primary transition-colors"
              >
                Return to Public
              </button>
            </div>
          </div>
        ) : (
          <AdminPanel />
        )}
      </Suspense>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white"
    >
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-accent z-50 origin-left"
        style={{ scaleX }}
      />

      <ModernNav profile={profile} onChat={handleContact} onEmail={handleOpenContact} />
      {isSectionVisible('hero') && <ModernHero profile={profile} resumeUrl={resumeUrl} onContact={handleContact} />}

      {isSectionVisible('about') && <ScrollReveal><ModernAbout profile={profile} /></ScrollReveal>}
      {isSectionVisible('skills') && <ScrollReveal delay={0.1}><ModernSkills skills={skills} onContact={handleOpenContact} /></ScrollReveal>}
      {isSectionVisible('experience') && <ScrollReveal delay={0.2}><ModernExperience experience={experience} education={education} onContact={handleOpenContact} /></ScrollReveal>}
      {isSectionVisible('projects') && <ScrollReveal delay={0.3}><ModernProjects projects={projects} onContact={handleOpenContact} /></ScrollReveal>}
      {isSectionVisible('testimonials') && <ScrollReveal delay={0.1}><Testimonials /></ScrollReveal>}
      {isSectionVisible('blog') && <ScrollReveal delay={0.2}><BlogSection /></ScrollReveal>}

      {isSectionVisible('footer') && <ModernFooter profile={profile} onChat={handleContact} onEmail={handleOpenContact} />}

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 bg-card text-secondary border border-border rounded-full shadow-lg z-[250] flex items-center justify-center hover:text-accent transition-all active:scale-90 group"
            title="Scroll to Top"
          >
            <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <ChatWidget
        isOpen={isChatOpen}
        onOpen={() => setIsChatOpen(true)}
        onClose={() => setIsChatOpen(false)}
        adminName={profile.name}
        isShifted={showScrollTop}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        profile={profile}
      />
    </motion.div>
  );
}
