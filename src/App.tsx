/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Code2, 
  Briefcase, 
  GraduationCap, 
  Languages,
  Database,
  Cpu,
  Terminal,
  Send,
  User,
  Menu,
  X,
  Filter,
  Search,
  ChevronDown,
  Download,
  Layers,
  Activity,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

import { 
  getUserProfile, 
  getExperience, 
  getSkills, 
  getProjects, 
  signInWithGoogle, 
  logOut,
  auth,
  testConnection,
  signInAdmin,
  recordVisit,
  updateHeartbeat,
  ensureAuthInited,
  seedPortfolioData,
  dataConnect,
  DEFAULT_EXPERIENCE,
  DEFAULT_SKILLS
} from './lib/firebase';
import { useGetMyProfile, useListPublicProjects } from './dataconnect-generated/react';
import { subscribeToAdminSettings, AdminSettings } from './lib/messaging';
import { onAuthStateChanged } from 'firebase/auth';
import { ChatWidget } from './components/ChatWidget';
import { AdminInbox } from './components/AdminInbox';
import { SiteLogo } from './components/Logo';
import { ContactModal } from './components/ContactModal';

const Github = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.2-.3 2.4 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const SectionHeader = ({ title, subtitle, number }: { title: string; subtitle?: string; number?: string }) => (
  <div className="mb-20 relative px-4 sm:px-0">
    {number && (
      <span className="absolute -left-8 top-0 text-slate-100 font-display font-bold text-8xl -z-10 select-none hidden lg:block opacity-40">
        {number}
      </span>
    )}
    <div className="flex items-center gap-4 mb-4">
      <div className="h-[2px] w-12 bg-accent" />
      <span className="text-accent font-mono text-[10px] font-bold uppercase tracking-[0.2em]">{subtitle}</span>
    </div>
    <h2 className="text-5xl md:text-7xl font-display font-bold text-primary tracking-tight leading-none uppercase">
      {title}
    </h2>
  </div>
);

const TechnicalOverlay = () => (
  <div className="fixed inset-0 pointer-events-none opacity-[0.05] overflow-hidden z-[100]">
    <div 
      className="absolute top-0 left-0 w-full h-full" 
      style={{ 
        backgroundImage: `linear-gradient(90deg, #1e293b 1px, transparent 1px), linear-gradient(#1e293b 1px, transparent 1px)`, 
        backgroundSize: '100px 100px' 
      }} 
    />
    <div className="absolute top-1/4 left-4 text-[8px] font-mono font-bold text-primary uppercase tracking-[0.4em] rotate-90 origin-left hidden xl:block">SYSTEM_X: 40.7128</div>
    <div className="absolute bottom-1/4 right-4 text-[8px] font-mono font-bold text-primary uppercase tracking-[0.4em] -rotate-90 origin-right hidden xl:block">SYSTEM_Y: 74.0060</div>
  </div>
);

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
  // Use Generated Data Connect Hooks for better state management
  const { data: profileData, isPending: profileLoading } = useGetMyProfile(dataConnect);
  const { data: projectsData, isPending: projectsLoading } = useListPublicProjects(dataConnect);

  // Map Data Connect results to local state or use directly
  const profile = profileData?.user 
    ? { ...DEFAULT_PROFILE, ...profileData.user } 
    : DEFAULT_PROFILE;
    
  // Fallback to DEFAULT_PROJECTS if database is empty or connection fails
  const projects = projectsData?.projects && projectsData.projects.length > 0
    ? projectsData.projects 
    : DEFAULT_PROJECTS;
  
  // Keep local state for non-DataConnect managed values
  const [experience, setExperience] = useState<any[]>([]); // Will be populated from Firebase
  const [skills, setSkills] = useState<any[]>([]);       // Will be populated from Firebase

  const [resumeUrl, setResumeUrl] = useState<string>(DEFAULT_PROFILE.resumeUrl);
  const [education, setEducation] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const checkPath = () => {
      setIsAdminView(window.location.pathname === '/admin');
    };
    checkPath();
    window.addEventListener('popstate', checkPath);
    
    // Intersection observer for nav highlights
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.3 });

    // Delay observer to let content load
    setTimeout(() => {
      document.querySelectorAll('section[id]').forEach((section) => {
        observer.observe(section);
      });
    }, 1000);

    return () => {
      window.removeEventListener('popstate', checkPath);
      observer.disconnect();
    };
  }, [loading]);

  const isAdmin = user?.email === "jvpaisan@gmail.com";

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setAuthError('');
    try {
      await signInAdmin(adminEmail, adminPassword);
      localStorage.setItem('is_admin', 'true');
    } catch (err: any) {
      setAuthError(err.message || "Login failed");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSeed = async () => {
    if (window.confirm("This will populate your database with your default Experience and Skills. Continue?")) {
      try {
        await seedPortfolioData();
        window.location.reload();
      } catch (err) {
        alert("Seed failed");
      }
    }
  };

  const handleAdminShortcut = () => {
    if (user) {
      logOut();
      localStorage.removeItem('is_admin');
    } else {
      window.history.pushState({}, '', '/admin');
      setIsAdminView(true);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleContact = () => {
    setIsChatOpen(true);
  };

  const handleOpenContact = () => {
    setIsContactModalOpen(true);
  };

  const allTech = Array.from(new Set(projects.flatMap(p => p.techStack || [])));
  const allTags = Array.from(new Set(projects.flatMap(p => p.tags || [])));
  const availableFilters = Array.from(new Set([...allTech, ...allTags])).sort() as string[];

  const filteredProjects = selectedFilters.length === 0
    ? projects
    : projects.filter(p => 
        selectedFilters.some(f => 
          (p.techStack || []).includes(f) || (p.tags || []).includes(f)
        )
      );

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  useEffect(() => {
    let unsubSettings: (() => void) | undefined;

    const fetchData = async () => {
      try {
        setLoading(true);
        await testConnection();

        const [e, s] = await Promise.all([
          getExperience(),
          getSkills()
        ]);

        setExperience(e.length > 0 ? e : DEFAULT_EXPERIENCE);
        setSkills(s.length > 0 ? s : DEFAULT_SKILLS);

        setEducation([
          {
            degree: "Bachelor of Science: Information Systems",
            school: "Advance Central College",
            period: "Graduated 2022"
          }
        ]);
      } catch (err) {
        console.error("Critical: Data fetch failure:", err);
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      // 1. Establish a single source of truth for Identity
      // Race against a timeout to prevent the "Hydrating" loop if Firebase is slow
      await Promise.race([
        ensureAuthInited(),
        new Promise(resolve => setTimeout(resolve, 5000))
      ]);
      
      if (isMounted) {
        // 2. Fetch public data
        await fetchData();
        
        // Subscribe to admin settings to get the latest dynamic resume URL
        unsubSettings = subscribeToAdminSettings((settings) => {
          if (settings.resumeUrl) {
            setResumeUrl(settings.resumeUrl);
          }
        });

        // 3. Track the session
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

  if (isAdminView) {
    if (loading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-bg font-mono">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-[2px] bg-accent animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">System Hydrating...</span>
          </div>
        </div>
      );
    }
    
    if (!user || user.email !== "jvpaisan@gmail.com") {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg p-6">
          <div className="w-full max-sm:px-4">
            <div className="mb-12 text-center">
              <SiteLogo size="lg" className="mb-8 mx-auto" />
              <h1 className="text-3xl font-display font-bold text-primary tracking-tight uppercase">Secure Access</h1>
              <p className="text-slate-400 text-sm mt-2 tracking-tight">Administrative Authentication Required</p>
            </div>
            
            <form onSubmit={handleAdminLogin} className="space-y-6 max-w-sm mx-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Master Credential</label>
                <input 
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@instance.com"
                  className="w-full px-5 py-4 rounded-xl border border-line bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Passkey</label>
                <input 
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-xl border border-line bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono text-sm"
                />
              </div>
              {authError && <p className="text-red-600 text-[10px] font-bold tracking-tight uppercase bg-red-50 p-3 rounded-lg border border-red-100">{authError}</p>}
              <button 
                type="submit"
                disabled={isSigningIn}
                className="ink-button w-full h-[60px]"
              >
                {isSigningIn ? 'VALIDATING...' : 'AUTHORIZE ACCESS'}
              </button>
            </form>

            {user && isAdmin && (
              <div className="mt-12 p-4 border border-dashed border-accent/20 rounded-2xl bg-accent/5 max-w-sm mx-auto">
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 text-center">Database Maintenance</p>
                <button 
                  onClick={handleSeed}
                  className="w-full py-3 bg-white text-accent border border-accent rounded-xl text-[11px] font-bold hover:bg-accent hover:text-white transition-all uppercase tracking-widest"
                >
                  Seed Initial Data
                </button>
              </div>
            )}

            <button 
              onClick={() => {
                window.history.pushState({}, '', '/');
                if (user && !isAdmin) logOut();
                setIsAdminView(false);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="w-full mt-8 text-[11px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-[0.2em]"
            >
              Terminate Session / Return to Public
            </button>
          </div>
        </div>
      );
    }

    return <AdminInbox user={user} />;
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg font-mono">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-16 h-[2px] bg-accent animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">System Initializing</span>
        </motion.div>
      </div>
    );
  }

  const NavItem = ({ id, label, number }: { id: string; label: string; number: string }) => {
    const isActive = activeSection === id;
    return (
      <a 
        href={`#${id}`}
        className={`group flex items-center gap-6 transition-all duration-700 ease-out ${isActive ? 'translate-x-6' : 'hover:translate-x-2 opacity-50 hover:opacity-100'}`}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className={`font-mono text-[9px] font-bold transition-colors duration-500 ${isActive ? 'text-accent' : 'text-slate-400'}`}>{number}</span>
        <div className="flex flex-col">
          <span className={`font-display font-bold text-xs uppercase tracking-[0.25em] transition-colors duration-500 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>{label}</span>
          <div className={`h-[1px] bg-accent transition-all duration-700 mt-1 ${isActive ? 'w-12 opacity-100' : 'w-0 opacity-0 group-hover:w-6 group-hover:opacity-40'}`} />
        </div>
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-bg transition-colors duration-500">
      <TechnicalOverlay />
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent z-[100] origin-left"
        style={{ scaleX }}
      />

      <nav className="w-45 fixed top-0 bottom-0 left-0 bg-white border-r border-line z-50 flex flex-col items-center justify-between py-12 hidden xl:flex">
        <SiteLogo size="sm" />
        <div className="flex flex-col gap-16">
          <NavItem id="about" label="Overview" number="01" />
          <NavItem id="experience" label="Path" number="02" />
          <NavItem id="skills" label="Stack" number="03" />
          <NavItem id="projects" label="Work" number="04" />
        </div>
        <div className="flex flex-col items-center gap-8">
           <div className="flex flex-col gap-6 text-slate-300">
             <a href={profile?.githubUrl || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Github size={18} /></a>
             <a href={profile?.linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Linkedin size={18} /></a>
           </div>
           <div className="h-12 w-[1px] bg-line" />
           <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-[0.2em] -rotate-90">v2.1.4</span>
        </div>
      </nav>

      <nav className="xl:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-line z-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <SiteLogo size="sm" />
          <div className="flex items-center gap-4">
             <button onClick={handleContact} className="ink-button !px-4 !py-2 !text-[10px]">HIRE ME</button>
             <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-primary">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-primary/95 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center p-12"
          >
             <div className="flex flex-col gap-12 text-center">
                {['about', 'experience', 'skills', 'projects'].map((id, i) => (
                  <motion.a 
                    key={id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    href={`#${id}`} 
                    className="text-6xl font-display font-bold text-white uppercase tracking-tighter hover:text-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {id}
                  </motion.a>
                ))}
             </div>
             <button onClick={() => setIsMenuOpen(false)} className="absolute top-12 right-12 p-4 text-white/40 hover:text-white transition-colors">
                <X size={32} />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="xl:pl-45">
        <section id="about" className="min-h-screen flex flex-col items-center justify-center relative border-b border-line overflow-hidden bg-white px-6">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.03),transparent)] pointer-events-none" />
           <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-100 -translate-y-1/2 hidden lg:block" />
           <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2 hidden lg:block" />
           <div className="max-w-7xl w-full relative z-20 text-center py-20">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex items-center gap-3 mb-10 px-4 py-2 bg-slate-50 rounded-full border border-line">
                   <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                   <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.4em]">Integrated Development Environment v2.0</span>
                </div>
                <h1 className="text-6xl sm:text-8xl xl:text-[7vw] font-display font-bold text-primary tracking-tighter leading-[0.8] uppercase mb-12">
                   Strategic<br />
                   <span className="text-accent underline decoration-accent/20 underline-offset-8 italic">Systems</span><br />
                   Engineer.
                </h1>
                <div className="max-w-2xl mx-auto">
                   <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-16 px-4">
                     {profile?.bio || "Architecting high-performance digital ecosystems with a narrative driven by data integrity and professional excellence."}
                   </p>
                   <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
                      <button onClick={handleContact} className="ink-button group !w-full sm:!w-auto">
                         EXECUTE CONNECTION
                         <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <a 
                        href={resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`ghost-button !w-full sm:!w-auto ${!resumeUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => !resumeUrl && e.preventDefault()}
                      >
                        <Download size={16} className="text-accent" />
                        DOWNLOAD RESUME
                      </a>
                   </div>
                </div>
                <div className="pt-12 border-t border-line flex flex-wrap justify-center gap-x-16 gap-y-8">
                   {[
                     { label: 'Ecosystem', value: 'Laravel / PHP' },
                     { label: 'Infrastructure', value: 'GCP / Docker' },
                     { label: 'Integrity', value: '99.9% Accuracy' },
                     { label: 'Architecture', value: 'Event-Driven' }
                   ].map((node, i) => (
                     <div key={i} className="flex flex-col items-start gap-1">
                        <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">{node.label}</span>
                        <span className="text-xs font-bold text-primary uppercase tracking-tight">{node.value}</span>
                     </div>
                   ))}
                </div>
              </motion.div>
           </div>
        </section>

        <section id="experience" className="section-container border-b border-line bg-white">
           <SectionHeader title="Experience" subtitle="Professional Timeline" number="02" />
           <div className="grid lg:grid-cols-2 gap-px bg-line border border-line rounded-3xl overflow-hidden">
              {experience.map((exp: any, index: number) => (
                <div key={index} className="bg-white p-12 transition-colors flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-8">
                       <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full border border-accent/10">{exp.period}</span>
                    </div>
                    <h3 className="text-3xl font-display font-bold text-primary mb-2 uppercase tracking-tight">{exp.role}</h3>
                    <p className="font-mono text-xs text-slate-400 font-bold mb-8 uppercase tracking-widest">{exp.company}</p>
                    <ul className="space-y-6">
                      {exp.description.map((point: string, i: number) => (
                        <li key={i} className="flex gap-4 items-start">
                          <div className="mt-2.5 w-1.5 h-1.5 border border-slate-300 rounded-full flex-shrink-0" />
                          <p className="text-slate-500 font-medium leading-relaxed">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
           </div>
        </section>

        <section id="skills" className="section-container border-b border-line">
           <SectionHeader title="Capabilities" subtitle="Tech Ecosystem" number="03" />
           <div className="grid md:grid-cols-3 gap-8">
              {skills.map((group: any, idx: number) => (
                <div key={idx} className="glass-card flex flex-col">
                   <div className="mb-8 flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg text-white">
                         {idx === 0 ? <Terminal size={20} /> : idx === 1 ? <Database size={20} /> : <Code2 size={20} />}
                      </div>
                      <h4 className="font-display font-bold text-lg uppercase tracking-tight text-primary">{group.category}</h4>
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                      {group.items.map((skill: string) => (
                        <div key={skill} className="flex flex-col gap-2">
                           <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                              <span>{skill}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </section>

        <section id="projects" className="section-container border-b border-line bg-white">
           <SectionHeader title="Featured" subtitle="System Deliverables" number="04" />
           <div className="grid md:grid-cols-2 gap-12">
              {filteredProjects.map((project: any, i: number) => (
                <div key={i} className="group relative">
                   <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-8 border border-line bg-slate-100 p-2">
                      <img 
                        src={`https://picsum.photos/seed/${project.title}/1200/800`} 
                        alt={project.title} 
                        className="absolute inset-0 w-full h-full object-cover rounded-[2rem]"
                      />
                   </div>
                   <div className="px-4">
                      <h3 className="text-4xl font-display font-bold text-primary tracking-tight uppercase mb-4">{project.title}</h3>
                      <p className="text-slate-500 font-medium leading-relaxed mb-8">{project.description}</p>
                      <div className="flex gap-4">
                         {project.link && <a href={project.link} target="_blank" className="text-accent hover:underline text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ExternalLink size={14} /> LIVE</a>}
                         {project.github && <a href={project.github} target="_blank" className="text-slate-400 hover:text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1"><Github size={14} /> CODE</a>}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <footer className="section-container bg-[#050505] text-white">
           <div className="grid lg:grid-cols-2 gap-24 py-20 border-b border-white/10">
              <div>
                 <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-none mb-12 uppercase">Let's Talk<br /><span className="text-white/20">Strategy.</span></h2>
                 <button onClick={handleContact} className="ink-button !bg-white !text-primary">INITIATE CONNECTION</button>
              </div>
              <div className="grid grid-cols-2 gap-12 text-sm font-bold uppercase tracking-tight">
                 <ul className="space-y-4">
                    <li><a href="#about" className="hover:text-accent">01. Overview</a></li>
                    <li><a href="#experience" className="hover:text-accent">02. Path</a></li>
                 </ul>
                 <ul className="space-y-4">
                    <li><a href="#skills" className="hover:text-accent">03. Stack</a></li>
                    <li><a href="#projects" className="hover:text-accent">04. Work</a></li>
                 </ul>
              </div>
           </div>
           <div className="py-12 text-[9px] font-mono font-bold text-white/20 uppercase tracking-[0.4em] text-center">© 2026 John Vince Paisan // All Rights Reserved</div>
        </footer>
      </main>

      <ChatWidget isOpen={isChatOpen} onOpen={() => setIsChatOpen(true)} onClose={() => setIsChatOpen(false)} adminName={profile?.name || "John Vince"} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} profile={profile} />
      
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]">
         <button onClick={handleContact} className="px-8 py-4 bg-accent text-white rounded-full font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"><Send size={14} /> Initialize</button>
      </div>
    </div>
  );
}