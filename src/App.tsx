/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

import { 
  getExperience, 
  getEducation, 
  getSkills, 
  auth,
  testConnection,
  signInAdmin,
  recordVisit,
  updateHeartbeat,
  ensureAuthInited,
  seedPortfolioData,
  DEFAULT_EXPERIENCE,
  DEFAULT_EDUCATION,
  DEFAULT_SKILLS
} from './lib/firebase';
import { subscribeToAdminSettings } from './lib/messaging';
import { onAuthStateChanged } from 'firebase/auth';
import { ChatWidget } from './components/ChatWidget';
import { AdminInbox } from './components/AdminInbox';
import { ContactModal } from './components/ContactModal';

// Modern Components
import { ModernNav } from './components/ModernNav';
import { ModernHero } from './components/ModernHero';
import { ModernAbout } from './components/ModernAbout';
import { ModernSkills } from './components/ModernSkills';
import { ModernExperience } from './components/ModernExperience';
import { ModernProjects } from './components/ModernProjects';
import { ModernFooter } from './components/ModernFooter';

// Default data
const DEFAULT_PROFILE = {
  name: "John Vince Paisan",
  titles: ["Full-Stack Developer", "Data Operations Specialist", "Systems Administrator"],
  bio: "Results-driven IT professional with experience in software development, data operations, technical support, and financial systems. Proven ability to analyze large datasets, troubleshoot system issues, and develop high-accuracy web applications in fast-paced environments.",
  email: "jvpaisan@gmail.com",
  phone: "+63 970 763 9960",
  location: "Quezon City, Philippines",
  languages: ["English", "Filipino"],
  resumeUrl: "/John_Vince_Paisan_Resume.pdf",
  githubUrl: "https://github.com/jayveee07",
  linkedinUrl: "https://www.linkedin.com/in/john-vince-p-b82409239"
};

const DEFAULT_PROJECTS = [
  {
    title: "CloudNotes",
    description: "A secure, cloud-based note management system with real-time data sync, secure Auth, and intuitive UI for efficient document handling.",
    techStack: ["React", "Firebase", "Auth", "Firestore"],
    featured: true,
    link: "https://cloudnotes-492733998894.asia-southeast1.run.app/",
    github: "https://github.com/jayveee07/CloudNotes.git"
  },
  {
    title: "Financial Reconciliation System",
    description: "High-accuracy transaction processing engine designed for high-volume settlement scenarios with strict compliance standards.",
    techStack: ["Python", "Macros", "Data Validation"],
    featured: true,
    link: "#"
  }
];

export default function App() {
// State
  const [profile] = useState(DEFAULT_PROFILE);
  const [projects] = useState(DEFAULT_PROJECTS);
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [resumeUrl, setResumeUrl] = useState(DEFAULT_PROFILE.resumeUrl);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Scroll progress indicator
  useEffect(() => {
    const checkPath = () => {
      setIsAdminView(window.location.pathname === '/admin');
    };
    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  // Handle scroll for the "Scroll to Top" button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const isAdmin = user?.email === "jvpaisan@gmail.com";

  // Fetch data on mount
  useEffect(() => {
    let isMounted = true;
    let unsubSettings: (() => void) | undefined;

    const fetchData = async () => {
      try {
        setLoading(true);
        await testConnection();

        const results = await Promise.allSettled([
          getExperience(),
          getSkills(),
          getEducation()
        ]);

        const [expResult, skillsResult, eduResult] = results;
        const names = ['experience', 'skills', 'education'];

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.warn(`Failed to fetch ${names[index]}:`, result.reason);
          }
        });

        setExperience(expResult.status === 'fulfilled' && expResult.value.length > 0 ? expResult.value : DEFAULT_EXPERIENCE);
        setSkills(skillsResult.status === 'fulfilled' && skillsResult.value.length > 0 ? skillsResult.value : DEFAULT_SKILLS);
        setEducation(eduResult.status === 'fulfilled' && eduResult.value.length > 0 ? eduResult.value : DEFAULT_EDUCATION);
      } catch (err) {
        console.error("Critical: Data fetch failure:", err);
        setExperience(DEFAULT_EXPERIENCE);
        setSkills(DEFAULT_SKILLS);
        setEducation(DEFAULT_EDUCATION);
      } finally {
        setLoading(false);
      }
    };


    const init = async () => {
      await Promise.race([
        ensureAuthInited(),
        new Promise(resolve => setTimeout(resolve, 5000))
      ]);
      await ensureAuthInited();
      
      if (isMounted) {
        await fetchData();
        
        unsubSettings = subscribeToAdminSettings((settings) => {
          if (isMounted && settings.resumeUrl) {
            setResumeUrl(settings.resumeUrl);
          }
        });

        const isAdminSession = localStorage.getItem('is_admin') === 'true';
        if (!isAdminSession) {
          recordVisit(window.location.pathname).catch(console.error);
        }
      }
    };

    init();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const heartbeatInterval = setInterval(() => {
      if (localStorage.getItem('is_admin') !== 'true') {
        updateHeartbeat();
      }
    }, 30000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(heartbeatInterval);
      if (unsubSettings) unsubSettings();
    };
  }, []);

  // Handlers
  const handleContact = () => {
    setIsChatOpen(true);
  };

  const handleOpenContact = () => {
    setIsContactModalOpen(true);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthError('');
      await signInAdmin(adminEmail, adminPassword);
      localStorage.setItem('is_admin', 'true');
    } catch (err: any) {
      setAuthError(err.message || "Login failed");
    }
  };

  const handleSeed = async () => {
    if (window.confirm("This will populate your database with default Experience and Skills. Continue?")) {
      try {
        await seedPortfolioData();
        window.location.reload();
      } catch (err) {
        alert("Seed failed");
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin-only view
  if (isAdminView) {
    if (loading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50 font-mono">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-[2px] bg-accent animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">System Hydrating...</span>
          </div>
        </div>
      );
    }
    
    if (!user || user.email !== "jvpaisan@gmail.com") {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-md">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Secure Access</h1>
              <p className="text-slate-400 text-sm">Administrative Authentication Required</p>
            </div>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <input 
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@instance.com"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-accent transition-all"
                />
              </div>
              <div>
                <input 
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-accent transition-all"
                />
              </div>
              {authError && <p className="text-red-500 text-sm">{authError}</p>}
              <button 
                type="submit"
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-semibold hover:bg-slate-700 transition-all"
              >
                Authorize Access
              </button>
            </form>

            {user && isAdmin && (
              <div className="mt-8 p-4 border border-slate-200 rounded-2xl">
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
              className="w-full mt-6 text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Return to Public
            </button>
          </div>
        </div>
      );
    }

    return <AdminInbox user={user} />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white font-mono">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-[2px] bg-accent animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">System Initializing</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <ModernNav profile={profile} onChat={handleContact} onEmail={handleOpenContact} />


      {/* Hero Section */}
      <ModernHero profile={profile} resumeUrl={resumeUrl} onContact={handleContact} />


      {/* About Section */}
      <ModernAbout profile={profile} />

      {/* Skills Section */}
      <ModernSkills skills={skills} onContact={handleOpenContact} />

{/* Education Data */}
      <ModernExperience experience={experience} education={education} onContact={handleOpenContact} />

      {/* Projects Section */}
      <ModernProjects projects={projects} onContact={handleOpenContact} />


      {/* Footer */}
      <ModernFooter profile={profile} onChat={handleContact} onEmail={handleOpenContact} />

      {/* Scroll to Top Button - Positioned below chat bubble */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 bg-white text-primary border border-slate-200 rounded-full shadow-lg z-[250] flex items-center justify-center hover:bg-slate-50 hover:text-accent transition-all active:scale-90 group"
            title="Scroll to Top"
          >
            <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform" />
            <div className="absolute inset-0 rounded-full bg-accent/5 scale-0 group-hover:scale-100 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>


      {/* Chat Widget */}
      <ChatWidget 
        isOpen={isChatOpen} 
        onOpen={() => setIsChatOpen(true)} 
        onClose={() => setIsChatOpen(false)} 
        adminName={profile.name} 
        isShifted={showScrollTop}
      />

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        profile={profile} 
      />
    </div>
  );
}
