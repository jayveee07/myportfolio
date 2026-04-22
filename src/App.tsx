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
  ensureAuthInited
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ChatWidget } from './components/ChatWidget';
import { AdminInbox } from './components/AdminInbox';
import { Logo } from './components/Logo';

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
  <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden z-[100]">
    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'linear-gradient(90deg, #1e293b 1px, transparent 1px), linear-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
    <div className="absolute top-1/4 left-4 text-[8px] font-mono font-bold text-primary uppercase tracking-[0.4em] rotate-90 origin-left hidden xl:block">SYSTEM_X: 40.7128</div>
    <div className="absolute bottom-1/4 right-4 text-[8px] font-mono font-bold text-primary uppercase tracking-[0.4em] -rotate-90 origin-right hidden xl:block">SYSTEM_Y: 74.0060</div>
  </div>
);

export default function App() {
  const [profile, setProfile] = useState<any>(null);
  const [experience, setExperience] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
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
    } catch (err: any) {
      setAuthError(err.message || "Login failed");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAdminShortcut = () => {
    if (user) {
      logOut();
    } else {
      window.history.pushState({}, '', '/admin');
      setIsAdminView(true);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleContact = () => {
    setIsChatOpen(true);
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
    const fetchData = async () => {
      try {
        setLoading(true);
        await testConnection();

        const [p, e, s, pr] = await Promise.all([
          getUserProfile(),
          getExperience(),
          getSkills(),
          getProjects()
        ]);
        
        setProfile(p || {
          name: "John Vince Paisan",
          titles: ["Full-Stack Developer", "Data Operations Specialist", "Systems Administrator"],
          bio: "Results-driven IT professional with experience in software development, data operations, technical support, and financial systems. Proven ability to analyze large datasets, troubleshoot system issues, and develop high-accuracy web applications in fast-paced environments.",
          email: "jvpaisan@gmail.com",
          phone: "+63 970 763 9960",
          location: "Quezon City, Philippines",
          languages: ["English", "Filipino"]
        });
        
        setExperience(e.length ? e : [
          {
            company: "Guild Securities, Inc.",
            role: "Settlement Associate",
            period: "08/2025 – 01/2026",
            description: [
              "Processed and reconciled high-volume financial transactions with 99%+ accuracy",
              "Investigated discrepancies and coordinated with banks/counterparties for resolution",
              "Ensured compliance with financial regulations and internal audit standards"
            ],
            order: 1
          },
          {
            company: "IQVIA",
            role: "Senior Data Input Associate",
            period: "05/2023 – 05/2025",
            description: [
              "Processed large-scale datasets while maintaining strict quality standards",
              "Consistently achieved high productivity and quality KPIs in a fast-paced environment",
              "Identified data inconsistencies and improved data integrity processes"
            ],
            order: 2
          },
          {
            company: "Acaciasoft Corporation",
            role: "Junior Software Engineer",
            period: "04/2022 – 04/2023",
            description: [
              "Developed and maintained web applications using Laravel, PHP, and MySQL",
              "Debugged and resolved system issues, improving stability and performance",
              "Collaborated with cross-functional teams to deliver system enhancements"
            ],
            order: 3
          },
          {
            company: "Virtual Experts PH",
            role: "Virtual Assistant / Data Support",
            period: "04/2021 – 04/2022",
            description: [
              "Automated repetitive workflows using Python scripts, reducing manual workload",
              "Managed and organized client data systems for accuracy and accessibility",
              "Provided technical and operational support to diverse client accounts"
            ],
            order: 4
          }
        ]);
        
        setSkills(s.length ? s : [
          { category: "Web Development", items: ["Node.js", "React", "Laravel", "PHP", "JavaScript", "HTML", "CSS", "jQuery"], order: 1 },
          { category: "Data & Systems", items: ["Python Automation", "Data Analysis", "MySQL", "System Monitoring", "Excel Macros", "Financial Systems"], order: 2 },
          { category: "Tools & Cloud", items: ["Google Cloud", "Firebase", "Git", "VS Code", "Google Sheets", "Financial Reconciliation"], order: 3 }
        ]);

        setEducation([
          {
            degree: "Bachelor of Science: Information Systems",
            school: "Advance Central College",
            period: "Graduated 2022"
          }
        ]);
        
        setProjects(pr.length ? pr : [
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
        ]);
      } catch (err) {
        console.error("Critical: Data fetch failure:", err);
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      // 1. Establish a single source of truth for Identity
      await ensureAuthInited();
      
      // 2. Fetch public data
      fetchData();
      
      // 3. Track the session
      const trackSession = async () => {
        const isAdminSession = localStorage.getItem('is_admin') === 'true';
        if (!isAdminSession) {
          try {
            await recordVisit(window.location.pathname);
          } catch (e) {
            console.error("Visit tracking failed:", e);
          }
        }
      };
      trackSession();
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
      unsubscribe();
      clearInterval(heartbeatInterval);
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
          <div className="w-full max-w-sm">
            <div className="mb-12">
              <Logo size="lg" className="mb-8 mx-auto" />
              <h1 className="text-3xl font-display font-bold text-primary tracking-tight text-center uppercase">Secure Access</h1>
              <p className="text-slate-400 text-sm text-center mt-2 tracking-tight">Administrative Authentication Required</p>
            </div>
            
            <form onSubmit={handleAdminLogin} className="space-y-6">
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

            <button 
              onClick={() => {
                window.history.pushState({}, '', '/');
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
    <div className="min-h-screen">
      <TechnicalOverlay />
      {/* Precision Scroll Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Side Rail Navigation (Desktop) */}
      <nav className="w-28 fixed top-0 bottom-0 left-0 bg-white border-r border-line z-50 flex flex-col items-center justify-between py-12 hidden xl:flex">
        <Logo size="sm" />
        
        <div className="flex flex-col gap-16">
          <NavItem id="about" label="Overview" number="01" />
          <NavItem id="experience" label="Path" number="02" />
          <NavItem id="skills" label="Stack" number="03" />
          <NavItem id="projects" label="Work" number="04" />
        </div>

        <div className="flex flex-col items-center gap-8">
           <div className="flex flex-col gap-6 text-slate-300">
             <a href="#" className="hover:text-accent transition-colors"><Github size={18} /></a>
             <a href="#" className="hover:text-accent transition-colors"><Linkedin size={18} /></a>
           </div>
           <div className="h-12 w-[1px] bg-line" />
           <span className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-[0.2em] -rotate-90">v2.1.4</span>
        </div>
      </nav>

      {/* Top Nav (Mobile) */}
      <nav className="xl:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-line z-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
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

      <main className="xl:pl-28">
        {/* Hero Section - Architectural Mastery */}
        <section id="about" className="min-h-screen flex flex-col items-center justify-center relative border-b border-line overflow-hidden bg-white px-6">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.03),transparent)] pointer-events-none" />
           <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-100 -translate-y-1/2 hidden lg:block" />
           <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2 hidden lg:block" />
           
           {/* Architectural Hero Content - Z-Indexed for clarity */}
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
                      <button className="ghost-button !w-full sm:!w-auto">
                         <Download size={16} className="text-accent" />
                         RETRIEVE DOSSIER
                      </button>
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

        {/* Productivity Dashboard - Metrics Bento */}
        <div className="bg-slate-50 py-24 border-b border-line">
           <div className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'Data Accuracy', value: '99%+', icon: <CheckCircle size={22} />, color: 'bg-emerald-500' },
                   { label: 'Technical Depth', value: '18+ Tools', icon: <Cpu size={22} />, color: 'bg-purple-500' },
                   { label: 'Dataset Flux', value: 'Large-Scale', icon: <Database size={22} />, color: 'bg-blue-500' },
                   { label: 'Process Efficiency', value: 'Optimized', icon: <Zap size={22} />, color: 'bg-amber-500' }
                 ].map((item, i) => (
                   <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-3xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                   >
                      <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                         {item.icon}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-[0.2em] mb-2">{item.label}</div>
                      <div className="text-3xl font-display font-bold text-primary uppercase tracking-tight">{item.value}</div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>

        {/* Strategic Accolades - New Section */}
        <div className="bg-primary py-20 border-b border-white/10 overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                 <div>
                    <span className="text-accent font-mono text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Recognition & Milestones</span>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight uppercase mb-8">
                       Distinguished<br />Performance.
                    </h2>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    {[
                      { title: 'Programmer of the Year', desc: 'Recognized as a top-performing developer among peers based on coding proficiency and system development.' },
                      { title: 'Best Capstone Project', desc: 'Led development of a system-based solution recognized for innovation, functionality, and real-world applicability.' }
                    ].map((award, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ x: 10 }}
                        className="p-6 border-l-2 border-accent bg-white/5 backdrop-blur-sm"
                      >
                         <h4 className="text-white font-display font-bold text-lg uppercase mb-2 tracking-tight">{award.title}</h4>
                         <p className="text-white/40 text-sm leading-relaxed">{award.desc}</p>
                      </motion.div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Tech Stack Horizontal Scroll */}
        <div className="bg-white border-b border-line overflow-hidden py-10">
           <div className="flex gap-20 animate-infinite-scroll">
              {[...['React', 'Node.js', 'Python', 'Firebase', 'GCP', 'PostgreSQL', 'TypeScript', 'Docker', 'Kubernetes'], ...['React', 'Node.js', 'Python', 'Firebase', 'GCP', 'PostgreSQL', 'TypeScript', 'Docker', 'Kubernetes']].map((tech, i) => (
                <div key={i} className="text-slate-200 font-display font-bold text-4xl whitespace-nowrap uppercase tracking-tighter hover:text-primary transition-colors cursor-default">
                  {tech}
                </div>
              ))}
           </div>
        </div>

        {/* Experience Section - Grid Pattern */}
        <section id="experience" className="section-container border-b border-line bg-white">
           <SectionHeader title="Experience" subtitle="Professional Timeline" number="02" />
           <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             variants={{
               hidden: { opacity: 0 },
               visible: {
                 opacity: 1,
                 transition: { staggerChildren: 0.2 }
               }
             }}
             className="grid lg:grid-cols-2 gap-px bg-line border border-line rounded-3xl overflow-hidden"
           >
              {experience.map((exp: any, index: number) => (
                <motion.div 
                  key={exp.id || index}
                  variants={{
                    hidden: { opacity: 0, scale: 0.98 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ backgroundColor: 'rgb(252 252 252)' }}
                  className="bg-white p-12 transition-colors flex flex-col justify-between group"
                >
                  <div className="mb-12">
                    <div className="flex items-center justify-between gap-4 mb-8">
                       <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full border border-accent/10">{exp.period}</span>
                       <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">EXP.ID // {index + 1}</span>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                       </div>
                    </div>
                    <h3 className="text-3xl font-display font-bold text-primary mb-2 uppercase tracking-tight group-hover:text-accent transition-colors duration-500">{exp.role}</h3>
                    <p className="font-mono text-xs text-slate-400 font-bold mb-8 uppercase tracking-widest leading-none flex items-center gap-2">
                       <ArrowRight size={12} className="text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                       {exp.company}
                    </p>
                    <ul className="space-y-6">
                      {exp.description.map((point: string, i: number) => (
                        <li key={i} className="flex gap-4 items-start group/li">
                          <div className="mt-2.5 w-1.5 h-1.5 border border-slate-300 rounded-full flex-shrink-0 group-hover/li:border-accent group-hover/li:bg-accent transition-all duration-300" />
                          <p className="text-slate-500 font-medium leading-relaxed group-hover/li:text-slate-900 transition-colors">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
           </motion.div>
        </section>

        {/* Skills - Data Grid Style */}
        <section id="skills" className="section-container border-b border-line">
           <SectionHeader title="Capabilities" subtitle="Tech Ecosystem" number="03" />
           <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             variants={{
               hidden: { opacity: 0 },
               visible: {
                 opacity: 1,
                 transition: { staggerChildren: 0.1 }
               }
             }}
             className="grid md:grid-cols-3 gap-8"
           >
              {skills.map((group: any, idx: number) => (
                <motion.div 
                  key={idx} 
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="glass-card flex flex-col group hover:scale-[1.02] active:scale-[0.98]"
                >
                   <div className="mb-8 flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg text-white group-hover:bg-accent transition-colors duration-500">
                         {idx === 0 ? <Terminal size={20} /> : idx === 1 ? <Database size={20} /> : <Code2 size={20} />}
                      </div>
                      <h4 className="font-display font-bold text-lg uppercase tracking-tight group-hover:text-accent transition-colors duration-500">{group.category}</h4>
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                      {group.items.map((skill: string, sIdx: number) => (
                        <div key={skill} className="flex flex-col gap-2 group/item">
                           <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                              <span className="group-hover/item:text-accent transition-colors">{skill}</span>
                              <span className="text-accent/60 opacity-0 group-hover/item:opacity-100 transition-opacity">SYS.LOAD_{sIdx + 1}0%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/50">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${80 + (Math.random() * 15)}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, delay: 0.1 + (sIdx * 0.05), ease: "circOut" }}
                                className="h-full bg-gradient-to-r from-primary to-accent relative"
                              >
                                 <motion.div 
                                   animate={{ x: ['100%', '-100%'] }}
                                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                   className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] opacity-30" 
                                   style={{ backgroundSize: '50% 100%' }}
                                 />
                              </motion.div>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
              ))}
           </motion.div>
        </section>

        {/* Projects - Masonry-ish Grid */}
        <section id="projects" className="section-container border-b border-line bg-white">
           <SectionHeader title="Featured" subtitle="System Deliverables" number="04" />
           
           <div className="mb-16 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                 {['React', 'Firebase', 'Node.js', 'Python'].map(f => (
                   <button 
                    key={f}
                    onClick={() => toggleFilter(f)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${selectedFilters.includes(f) ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-line hover:border-primary hover:text-primary'}`}
                   >
                     {f}
                   </button>
                 ))}
              </div>
              <p className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-[0.2em]">{filteredProjects.length} Modules Loaded</p>
           </div>

           <div className="grid md:grid-cols-2 gap-12">
              {filteredProjects.map((project: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative"
                >
                   <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-8 border border-line bg-slate-100 p-2">
                      <div className="absolute inset-2 rounded-[2rem] overflow-hidden">
                        <img 
                          src={`https://picsum.photos/seed/${project.title}/1200/800`} 
                          alt={project.title} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                           <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-mono font-bold text-primary flex items-center gap-2 shadow-xl">
                              <Activity size={12} className="text-accent" />
                              SYSTEM ACTIVE
                           </div>
                        </div>
                      </div>
                   </div>
                   <div className="px-4">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.techStack?.map((tag: string) => (
                           <span key={tag} className="px-3 py-1 bg-slate-50 border border-line rounded-lg text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest group-hover:border-accent/40 group-hover:text-accent transition-colors duration-500">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="text-4xl font-display font-bold text-primary tracking-tight uppercase group-hover:text-accent transition-colors duration-500">{project.title}</h3>
                         <div className="flex gap-2">
                            {project.link && (
                              <a href={project.link} className="w-12 h-12 border border-line rounded-2xl flex items-center justify-center text-slate-400 hover:text-accent hover:border-accent hover:bg-accent/5 transition-all duration-300">
                                <ExternalLink size={20} />
                              </a>
                            )}
                            {project.github && (
                              <a href={project.github} className="w-12 h-12 border border-line rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:bg-slate-50 transition-all duration-300">
                                <Github size={20} />
                              </a>
                            )}
                         </div>
                      </div>
                      <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-lg">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest group-hover:text-slate-400 transition-colors">
                         <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-accent group-hover:text-white transition-all duration-500">
                            <Zap size={14} />
                         </div>
                         <span>Performance Node</span>
                         <div className="w-12 h-[1px] bg-line" />
                         <span>Verified Build</span>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </section>

        {/* Academic Genesis - Resume Verified */}
        <section className="section-container border-b border-line bg-slate-50">
           <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={{
               hidden: { opacity: 0 },
               visible: {
                 opacity: 1,
                 transition: { staggerChildren: 0.2 }
               }
             }}
             className="flex flex-col md:flex-row items-center justify-between gap-12"
           >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="max-w-xl"
              >
                 <SectionHeader title="Education" subtitle="Academic Origin" number="05" />
                 <p className="text-slate-500 font-medium leading-relaxed mb-12">
                   Foundation built on systematic information management and software engineering principles at Advance Central College.
                 </p>
                 <div className="flex items-center gap-4 py-6 border-t border-line">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Credentials System Verified</span>
                 </div>
              </motion.div>
              <div className="w-full max-w-md flex flex-col gap-6">
                 {education.map((edu, i) => (
                   <motion.div 
                    key={i}
                    variants={{
                      hidden: { opacity: 0, scale: 0.9 },
                      visible: { opacity: 1, scale: 1 }
                    }}
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="bg-white p-10 rounded-[2.5rem] border border-line shadow-sm hover:shadow-xl transition-all group"
                   >
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 bg-primary group-hover:bg-accent rounded-xl flex items-center justify-center text-white transition-colors duration-500">
                            <GraduationCap size={24} />
                         </div>
                         <div className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest">{edu.period}</div>
                      </div>
                      <h4 className="text-2xl font-display font-bold text-primary uppercase mb-2 tracking-tight">{edu.degree}</h4>
                      <p className="font-mono text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                         {edu.school}
                         <CheckCircle size={12} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                   </motion.div>
                 ))}
              </div>
           </motion.div>
        </section>

        {/* Global Footer */}
        <footer className="section-container bg-[#050505] text-white">
           <div className="grid lg:grid-cols-2 gap-24 py-20 border-b border-white/10">
              <div>
                 <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-none mb-12 uppercase">
                   Let's Talk<br /><span className="text-white/20">Strategy.</span>
                 </h2>
                 <p className="text-white/40 text-lg font-medium max-w-sm mb-12">
                   Currently accepting new full-stack partnerships and high-impact development roles.
                 </p>
                 <button onClick={handleContact} className="ink-button !bg-white !text-primary !w-full md:!w-auto">INITIATE CONNECTION</button>
              </div>
              <div className="grid grid-cols-2 gap-12">
                 <div>
                    <h5 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-8">Directories</h5>
                    <ul className="space-y-4 text-sm font-bold tracking-tight">
                       <li><a href="#about" className="hover:text-accent transition-colors">01. Overview</a></li>
                       <li><a href="#experience" className="hover:text-accent transition-colors">02. Path</a></li>
                       <li><a href="#skills" className="hover:text-accent transition-colors">03. Stack</a></li>
                       <li><a href="#projects" className="hover:text-accent transition-colors">04. Work</a></li>
                    </ul>
                 </div>
                 <div>
                    <h5 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-8">Comm Channels</h5>
                    <ul className="space-y-4 text-sm font-bold tracking-tight">
                       <li><button onClick={handleContact} className="hover:text-accent transition-colors">Live Integrated Chat</button></li>
                       <li><a href={`mailto:${profile?.email}`} className="hover:text-accent transition-colors">Email Transmission</a></li>
                       <li><a href="#" className="hover:text-accent transition-colors">LinkedIn Node</a></li>
                       <li><a href="#" className="hover:text-accent transition-colors">GitHub Repository</a></li>
                    </ul>
                 </div>
              </div>
           </div>
           <div className="py-12 flex flex-col md:flex-row justify-between items-center gap-8">
              <span className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-[0.4em]">© 2026 John Vince Paisan // All Rights Reserved</span>
              <div className="flex gap-12">
                 <span className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-[0.4em] pointer-events-none">Stable Build 2.1.4</span>
                 <button onClick={handleAdminShortcut} className="text-[9px] font-mono font-bold text-white/20 hover:text-white transition-colors uppercase tracking-[0.4em]">Node Access</button>
              </div>
           </div>
        </footer>
      </main>

      <ChatWidget 
        isOpen={isChatOpen} 
        onOpen={() => setIsChatOpen(true)}
        onClose={() => setIsChatOpen(false)} 
        adminName={profile?.name || "John Vince Paisan"} 
      />

      {/* Productivity Command Center - Floating Bottom Bar */}
      <motion.div 
        initial={{ y: 100, x: "-50%" }}
        animate={{ y: 0, x: "-50%" }}
        className="fixed bottom-8 left-1/2 z-[200] hidden md:flex items-center gap-2 bg-primary/95 backdrop-blur-2xl border border-white/10 p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
      >
         <div className="flex items-center gap-3 px-4 py-2 border-r border-white/10">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest">Connected</span>
         </div>
         <button 
           onClick={handleContact}
           className="px-6 py-3 bg-accent text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-primary transition-all duration-500 flex items-center gap-2 shadow-lg shadow-accent/20"
         >
            <Send size={14} />
            Initialize
         </button>
         <div className="flex items-center gap-1 ml-2">
            {[
              { icon: <Github size={16} />, label: 'Git', href: '#' },
              { icon: <Linkedin size={16} />, label: 'In', href: '#' },
              { icon: <Mail size={16} />, label: 'Email', href: `mailto:${profile?.email}` }
            ].map((link, i) => (
              <a 
                key={i}
                href={link.href}
                className="w-11 h-11 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all duration-300"
                title={link.label}
              >
                {link.icon}
              </a>
            ))}
         </div>
         <div className="w-px h-6 bg-white/20 mx-2" />
         <button 
          onClick={handleAdminShortcut}
          className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          title="Admin Terminal"
         >
            <Terminal size={16} />
         </button>
      </motion.div>
    </div>
  );
}

