/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  X
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
  signInAdmin
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ChatWidget } from './components/ChatWidget';
import { AdminInbox } from './components/AdminInbox';

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-12">
    <div className="flex items-center gap-2 mb-2">
      <div className="h-px w-8 bg-accent" />
      <span className="text-accent font-mono text-xs font-bold uppercase tracking-widest">{subtitle}</span>
    </div>
    <h2 className="text-4xl font-extrabold text-primary tracking-tight">{title}</h2>
  </div>
);

export default function App() {
  const [profile, setProfile] = useState<any>(null);
  const [experience, setExperience] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const checkPath = () => {
      setIsAdminView(window.location.pathname === '/admin');
    };
    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

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
    }
  };

  const handleContact = () => {
    setIsChatOpen(true);
  };

  const handleEmail = () => {
    const email = profile?.email || "jvpaisan@gmail.com";
    window.location.href = `mailto:${email}?subject=Hiring Inquiry - John Vince Paisan`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    
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
        
        // Fallback for initial state if DB is empty
        setProfile(p || {
          name: "John Vince Paisan",
          titles: ["Software Engineer", "Data Operations", "Financial Support"],
          bio: "Detail-oriented professional with experience across software development, data operations, and financial processing.",
          email: "jvpaisan@gmail.com",
          phone: "+63 970 763 9960",
          location: "Quezon City, Philippines",
          languages: ["English", "Filipino"]
        });
        
        setExperience(e.length ? e : [
          {
            company: "Guild Securities, Inc.",
            role: "Settlement Associate",
            period: "August 2025 – January 2026",
            description: [
              "Processed and reconciled cash and securities transactions",
              "Coordinated with banks and counterparties to resolve discrepancies",
              "Supported daily settlement and operational reporting"
            ],
            order: 1
          },
          {
            company: "IQVIA",
            role: "Senior Data Input Associate",
            period: "May 2023 – May 2025",
            description: [
              "Processed high-volume datasets following strict quality standards",
              "Ensured data accuracy for analytics and reporting purposes",
              "Consistently met productivity and quality targets"
            ],
            order: 2
          },
          {
            company: "Acaciasoft Corporation",
            role: "Junior Software Engineer",
            period: "April 2022 – April 2023",
            description: [
              "Developed and maintained web applications using Laravel",
              "Performed debugging, testing, and deployment activities",
              "Collaborated with cross-functional teams"
            ],
            order: 3
          },
          {
            company: "Virtual Experts PH",
            role: "Virtual Assistant / Data Support",
            period: "April 2021 – April 2022",
            description: [
              "Managed client data and maintained organized records",
              "Automated data-related tasks using Python scripts",
              "Supported documentation and reporting needs"
            ],
            order: 4
          }
        ]);
        
        setSkills(s.length ? s : [
          { category: "Languages", items: ["Java", "PHP", "Python", "JavaScript", "HTML", "CSS"], order: 1 },
          { category: "Frameworks & Libraries", items: ["Laravel", "Node.js", "jQuery", "React", "MySQL"], order: 2 },
          { category: "Tools & Platforms", items: ["Google Cloud", "Git", "VS Code", "Excel", "Google Sheets (Macros)"], order: 3 }
        ]);

        setEducation([
          {
            degree: "Bachelor of Science in Information Systems",
            school: "Advance Central College",
            period: "June 2018 – May 2022"
          }
        ]);
        
        setProjects(pr.length ? pr : [
          {
            title: "CloudNotes",
            description: "A secure, cloud-based note-taking application designed for seamless synchronization and efficient information management.",
            techStack: ["React", "Node.js", "Firebase", "GCP Cloud Run"],
            featured: true,
            link: "https://cloudnotes-492733998894.asia-southeast1.run.app/",
            github: "https://github.com/jayveee07/CloudNotes.git"
          },
          {
            title: "Nexus Portfolio",
            description: "A high-performance personal portfolio built with React and Firebase, featuring professional corporate aesthetics.",
            techStack: ["React", "Firebase", "Tailwind", "Motion"],
            featured: true,
            link: "https://github.com/jayveee07"
          }
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => unsubscribe();
  }, []);

  if (isAdminView) {
    if (loading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-white text-primary font-sans">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    
    if (!user || user.email !== "jvpaisan@gmail.com") {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md border border-slate-100">
            <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-8">
              <User size={40} />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-4">Admin Access Required</h1>
            <p className="text-slate-500 mb-10 font-medium leading-relaxed">Please sign in with your administrative account to access the messaging dashboard.</p>
            
            <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <input 
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-medium text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <input 
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-medium text-primary"
                />
              </div>
              {authError && <p className="text-red-500 text-xs font-bold px-1">{authError}</p>}
              <button 
                type="submit"
                disabled={isSigningIn}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 mt-4"
              >
                {isSigningIn ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <button 
              onClick={() => {
                window.history.pushState({}, '', '/');
                setIsAdminView(false);
              }}
              className="mt-8 text-sm font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
            >
              Back to Portfolio
            </button>
          </div>
        </div>
      );
    }

    return <AdminInbox user={user} />;
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white text-primary font-sans font-medium tracking-tight">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm uppercase tracking-widest opacity-60">Initializing...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-accent/20">
      {/* Navigation */}
      <nav className="nav-glass px-6 md:px-12">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-primary text-white p-2 rounded-lg font-bold text-lg select-none">VP</div>
            <div className="hidden lg:flex gap-8 font-medium text-sm text-slate-500">
              <a href="#about" className="hover:text-primary transition-colors">Overview</a>
              <a href="#experience" className="hover:text-primary transition-colors">Experience</a>
              <a href="#skills" className="hover:text-primary transition-colors">Skills</a>
              <a href="#education" className="hover:text-primary transition-colors">Education</a>
              <a href="#projects" className="hover:text-primary transition-colors">Projects</a>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={handleContact}
              className="prof-button-primary text-xs"
            >
              <Mail size={16} /> Hire Me
            </button>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-600"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 w-full bg-white border-b border-slate-200 z-40 p-8 flex flex-col gap-6 font-bold text-2xl lg:hidden shadow-xl shadow-slate-200/50"
          >
            <a href="#about" onClick={() => setIsMenuOpen(false)}>01. OVERVIEW</a>
            <a href="#experience" onClick={() => setIsMenuOpen(false)}>02. EXPERIENCE</a>
            <a href="#skills" onClick={() => setIsMenuOpen(false)}>03. SKILLS</a>
            <a href="#education" onClick={() => setIsMenuOpen(false)}>04. EDUCATION</a>
            <a href="#projects" onClick={() => setIsMenuOpen(false)}>05. PROJECTS</a>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
        {/* Hero Section */}
        <section id="about" className="section-container relative overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-accent font-bold text-sm uppercase tracking-widest mb-4 block">
                  Available for full-stack opportunities
                </span>
                <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-primary mb-8 leading-tight">
                  Crafting Digital<br />
                  <span className="text-slate-400">Excellence.</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-10 max-w-2xl font-medium">
                  {profile?.bio}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="prof-button-primary">
                    View Portfolio
                  </button>
                  <button className="px-6 py-2.5 rounded-lg border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 text-decoration-none">
                    Resume
                  </button>
                </div>
              </motion.div>
            </div>
            
            <div className="lg:col-span-5 relative">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative z-10 prof-card p-4 aspect-square flex flex-col items-center justify-center text-center group"
              >
                <div className="w-full h-full bg-slate-50 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                   <img 
                      src={`https://picsum.photos/seed/profile/600/600`} 
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 contrast-125"
                    />
                   <div className="z-10 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-slate-200 shadow-xl max-w-[80%]">
                      <h2 className="text-2xl font-bold mb-1">{profile?.name}</h2>
                      <p className="text-accent text-sm font-bold mb-4 uppercase tracking-wider">{profile?.titles?.[0]}</p>
                      <div className="flex justify-center gap-3">
                        <a href="#" className="p-2 transition-colors text-slate-400 hover:text-primary"><Github size={20} /></a>
                        <a href="#" className="p-2 transition-colors text-slate-400 hover:text-primary"><Linkedin size={20} /></a>
                      </div>
                   </div>
                </div>
              </motion.div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent/5 blur-3xl rounded-full" />
            </div>
          </div>
        </section>

        {/* Tech Stack Bar */}
        <div className="bg-white border-y border-slate-100 py-12">
           <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-x-20 gap-y-10">
              {['React', 'Node.js', 'Python', 'Firebase', 'GCP', 'PostgreSQL'].map(tech => (
                <div key={tech} className="text-slate-300 font-mono font-bold text-xl uppercase tracking-widest select-none hover:text-slate-400 transition-colors">
                  {tech}
                </div>
              ))}
           </div>
        </div>

        {/* Experience Section */}
        <section id="experience" className="section-container">
          <SectionHeader title="Experience" subtitle="My Journey" />
          <div className="grid gap-6">
            {experience.map((exp: any, index: number) => (
              <motion.div 
                key={exp.id || index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="prof-card group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-1">{exp.role}</h3>
                    <p className="font-semibold text-accent uppercase text-sm tracking-widest">{exp.company}</p>
                  </div>
                  <div className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">
                    {exp.period}
                  </div>
                </div>
                <ul className="space-y-4">
                  {exp.description.map((point: string, i: number) => (
                    <li key={i} className="flex gap-4 items-start text-slate-600">
                      <div className="mt-2.5 w-1.5 h-1.5 bg-accent/40 rounded-full flex-shrink-0" />
                      <p className="text-lg leading-relaxed">{point}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="section-container">
          <SectionHeader title="Technical Proficiency" subtitle="Expertise" />
          <div className="grid md:grid-cols-3 gap-6">
            {skills.map((skillGroup: any, index: number) => (
              <div key={index} className="prof-card overflow-hidden">
                <div className="flex items-center gap-3 mb-6 bg-slate-50 -mx-8 -mt-8 p-6 border-b border-slate-100">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-accent">
                    {index === 0 ? <Terminal size={20} /> : index === 1 ? <Cpu size={20} /> : <Database size={20} />}
                  </div>
                  <h3 className="font-bold text-lg text-primary">{skillGroup.category}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((skill: string) => (
                    <span key={skill} className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-all cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="section-container">
          <SectionHeader title="Education" subtitle="Academic Foundation" />
          <div className="grid gap-6">
            {education.map((edu: any, index: number) => (
              <motion.div 
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="prof-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent/5 rounded-lg text-accent">
                      <GraduationCap size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-primary">{edu.degree}</h3>
                  </div>
                  <p className="font-semibold text-slate-500 uppercase text-xs tracking-widest">{edu.school}</p>
                </div>
                <div className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-bold border border-slate-100 uppercase tracking-tighter">
                  {edu.period}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="section-container">
          <SectionHeader title="Featured Projects" subtitle="Portfolio" />
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project: any, index: number) => (
              <motion.div 
                key={index}
                whileHover={{ y: -5 }}
                className="prof-card group p-0 overflow-hidden flex flex-col shadow-none text-decoration-none"
              >
                <div className="bg-slate-100 aspect-video relative overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${project.title}/800/450`} 
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack?.map((tech: string) => (
                      <span key={tech} className="text-[10px] font-bold text-accent px-2 py-0.5 bg-accent/5 rounded-full uppercase tracking-tighter">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-3">{project.title}</h3>
                  <p className="text-slate-500 mb-8 font-medium leading-relaxed">
                    {project.description}
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-4">
                      {project.link ? (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 text-primary font-bold text-sm hover:text-accent transition-colors"
                        >
                          Visit App <ExternalLink size={16} />
                        </a>
                      ) : (
                        <span className="flex items-center gap-2 text-slate-300 font-bold text-sm cursor-not-allowed">
                          Explore <ExternalLink size={16} />
                        </span>
                      )}
                      {project.github && (
                        <a 
                          href={project.github} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-1 text-slate-400 hover:text-primary transition-colors"
                          title="View Source"
                        >
                          <Github size={18} />
                        </a>
                      )}
                    </div>
                    {project.link && (
                      <span className="hidden sm:block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-tighter">
                        {new URL(project.link).hostname}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-container mb-24">
           <div className="bg-primary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
              <div className="relative z-10 max-w-2xl mx-auto text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Let's build something exceptional together.</h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">Currently considering new opportunities and full-stack partnerships.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={handleContact}
                    className="bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center gap-2"
                  >
                    Start a Conversation <Send size={18} />
                  </button>
                  <button 
                    onClick={handleContact}
                    className="bg-white/5 text-white px-8 py-3 rounded-xl border border-white/20 font-bold hover:bg-white/10 transition-all"
                  >
                    Email Me
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-accent opacity-20 blur-[100px] rounded-full" />
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 pb-16">
            <div className="max-w-sm">
              <div className="bg-primary text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mb-6">VP</div>
              <p className="text-slate-500 font-medium leading-relaxed font-sans">
                Focused on developing high-performance, user-centric web applications and managing robust data operations.
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-10 group text-decoration-none">
              <div className="flex flex-col gap-4 text-sm font-medium font-sans">
                <h4 className="font-bold text-primary mb-2 uppercase tracking-widest text-[10px]">Projects</h4>
                <a href="#" className="text-slate-500 hover:text-accent transition-colors">Nexus Hub</a>
                <a href="#" className="text-slate-500 hover:text-accent transition-colors">Data Engine</a>
                <a href="#" className="text-slate-500 hover:text-accent transition-colors">Open Source</a>
              </div>
              <div className="flex flex-col gap-4 text-sm font-medium font-sans">
                <h4 className="font-bold text-primary mb-2 uppercase tracking-widest text-[10px]">Contact</h4>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-accent transition-colors">LinkedIn</a>
                <a href="https://github.com/jayveee07" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-accent transition-colors">GitHub</a>
                <button onClick={handleEmail} className="text-left text-slate-500 hover:text-accent transition-colors">Email</button>
              </div>
              <div className="flex flex-col gap-4 text-sm font-medium font-sans col-span-2 lg:col-span-1">
                <h4 className="font-bold text-primary mb-2 uppercase tracking-widest text-[10px]">Location</h4>
                <p className="text-slate-500 font-sans">Quezon City, Philippines<br />PH_GMT+8</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">
              © {new Date().getFullYear()} John Vince Paisan. Built with React & Firebase.
            </p>
            <div className="flex gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget 
        isOpen={isChatOpen} 
        onOpen={() => setIsChatOpen(true)}
        onClose={() => setIsChatOpen(false)} 
        adminName={profile?.name || "John Vince Paisan"} 
      />
    </div>
  );
}

