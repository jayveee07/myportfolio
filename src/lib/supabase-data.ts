import { supabase } from './supabase';
import type { Database } from './supabase-types';
import type { Experience, SkillGroup, Education, Project, Testimonial, BlogPost, Profile } from '../types/portfolio';

export const getExperience = async (): Promise<Experience[]> => {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('order', { ascending: true });
  if (error) throw error;
  return (data || []).map(item => ({
    id: item.id,
    role: item.role,
    company: item.company,
    period: item.period,
    description: item.description || [],
    order: item.order,
  }));
};

export const getSkills = async (): Promise<SkillGroup[]> => {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('order', { ascending: true });
  if (error) throw error;
  return (data || []).map(item => ({
    id: item.id,
    category: item.category,
    items: item.items || [],
    order: item.order,
  }));
};

export const getEducation = async (): Promise<Education[]> => {
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .order('order', { ascending: true });
  if (error) throw error;
  return (data || []).map(item => ({
    id: item.id,
    school: item.school,
    degree: item.degree,
    period: item.period,
    description: item.description || [],
    order: item.order,
  }));
};

export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    techStack: item.tech_stack || [],
    featured: item.featured || false,
    link: item.link || undefined,
    github: item.github || undefined,
  }));
};

export const getProfile = async (): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', 'main')
    .single<Database['public']['Tables']['user_profiles']['Row']>();
  if (error) return null;
  if (!data) return null;
  return {
    name: data.name || '',
    titles: data.titles || [],
    bio: data.bio || '',
    email: data.email || '',
    phone: data.phone || '',
    location: data.location || '',
    languages: data.languages || [],
    resumeUrl: data.resume_url || '',
    githubUrl: data.github_url || '',
    linkedinUrl: data.linkedin_url || '',
    photoUrl: data.photo_url || undefined,
    professionalImages: data.professional_images || [],
    sectionsVisible: data.sections_visible || undefined,
  };
};

export const updateProfile = async (profile: Partial<Profile>) => {
  const updates: Partial<Database['public']['Tables']['user_profiles']['Row']> = {};
  if (profile.name !== undefined) updates.name = profile.name;
  if (profile.bio !== undefined) updates.bio = profile.bio;
  if (profile.email !== undefined) updates.email = profile.email;
  if (profile.location !== undefined) updates.location = profile.location;
  if (profile.languages !== undefined) updates.languages = profile.languages;
  if (profile.githubUrl !== undefined) updates.github_url = profile.githubUrl;
  if (profile.linkedinUrl !== undefined) updates.linkedin_url = profile.linkedinUrl;
  if (profile.resumeUrl !== undefined) updates.resume_url = profile.resumeUrl;
  if (profile.photoUrl !== undefined) updates.photo_url = profile.photoUrl;
  if (profile.phone !== undefined) updates.phone = profile.phone;
  if (profile.titles !== undefined) updates.titles = profile.titles;
  if (profile.professionalImages !== undefined) updates.professional_images = profile.professionalImages;
  if (profile.sectionsVisible !== undefined) updates.sections_visible = profile.sectionsVisible;

  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', 'main');
  if (error) throw error;
};

export const getStats = async () => {
  const [convCount, visitCount, msgCount, projCount] = await Promise.all([
    supabase.from('conversations').select('*', { count: 'exact', head: true }),
    supabase.from('visits').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
  ]);
  return {
    conversations: convCount.count || 0,
    visits: visitCount.count || 0,
    messages: msgCount.count || 0,
    projects: projCount.count || 0,
  };
};

export const createExperience = async (exp: Omit<Experience, 'id'>) => {
  const { error } = await supabase.from('experiences').insert({
    company: exp.company,
    role: exp.role,
    period: exp.period,
    description: exp.description,
    order: exp.order,
  });
  if (error) throw error;
};

export const updateExperience = async (id: string, exp: Partial<Experience>) => {
  const { error } = await supabase.from('experiences').update({
    company: exp.company,
    role: exp.role,
    period: exp.period,
    description: exp.description,
    order: exp.order,
  }).eq('id', id);
  if (error) throw error;
};

export const deleteExperience = async (id: string) => {
  const { error } = await supabase.from('experiences').delete().eq('id', id);
  if (error) throw error;
};

export const createSkill = async (skill: Omit<SkillGroup, 'id'>) => {
  const { error } = await supabase.from('skills').insert({
    category: skill.category,
    items: skill.items,
    order: skill.order,
  });
  if (error) throw error;
};

export const updateSkill = async (id: string, skill: Partial<SkillGroup>) => {
  const { error } = await supabase.from('skills').update({
    category: skill.category,
    items: skill.items,
    order: skill.order,
  }).eq('id', id);
  if (error) throw error;
};

export const deleteSkill = async (id: string) => {
  const { error } = await supabase.from('skills').delete().eq('id', id);
  if (error) throw error;
};

export const createEducation = async (edu: Omit<Education, 'id'>) => {
  const { error } = await supabase.from('education').insert({
    school: edu.school,
    degree: edu.degree,
    period: edu.period,
    description: edu.description,
    order: edu.order,
  });
  if (error) throw error;
};

export const updateEducation = async (id: string, edu: Partial<Education>) => {
  const { error } = await supabase.from('education').update({
    school: edu.school,
    degree: edu.degree,
    period: edu.period,
    description: edu.description,
    order: edu.order,
  }).eq('id', id);
  if (error) throw error;
};

export const deleteEducation = async (id: string) => {
  const { error } = await supabase.from('education').delete().eq('id', id);
  if (error) throw error;
};

export const createProject = async (proj: Omit<Project, 'id'>) => {
  const { error } = await supabase.from('projects').insert({
    title: proj.title,
    description: proj.description,
    tech_stack: proj.techStack,
    featured: proj.featured,
    link: proj.link,
    github: proj.github,
  });
  if (error) throw error;
};

export const updateProject = async (id: string, proj: Partial<Project>) => {
  const { error } = await supabase.from('projects').update({
    title: proj.title,
    description: proj.description,
    tech_stack: proj.techStack,
    featured: proj.featured,
    link: proj.link,
    github: proj.github,
  }).eq('id', id);
  if (error) throw error;
};

export const deleteProject = async (id: string) => {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
};

export const submitInquiry = async (inquiry: { name: string; email: string; message: string }) => {
  const conversationId = `vst_${inquiry.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;

  const { error: convoError } = await supabase
    .from('conversations')
    .upsert({
      id: conversationId,
      participants: [inquiry.email.toLowerCase(), ADMIN_EMAIL],
      visitor_name: inquiry.name,
      visitor_email: inquiry.email.toLowerCase(),
      last_message: inquiry.message,
      unread_count: 1,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (convoError) throw convoError;

  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      text: inquiry.message,
      sender_id: inquiry.email.toLowerCase(),
      sender_name: inquiry.name,
    });

  if (msgError) throw msgError;

  return conversationId;
};

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    role: item.role,
    company: item.company,
    text: item.text,
    avatar: item.avatar || undefined,
  }));
};

export const submitTestimonial = async (testimonial: Omit<Testimonial, 'id'>) => {
  const { error } = await supabase
    .from('testimonials')
    .insert({
      name: testimonial.name,
      role: testimonial.role,
      company: testimonial.company,
      text: testimonial.text,
      avatar: testimonial.avatar,
    });
  if (error) throw error;
};

export const getAllTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    role: item.role,
    company: item.company,
    text: item.text,
    avatar: item.avatar || undefined,
    approved: item.approved ?? false,
  }));
};

export const approveTestimonial = async (id: string) => {
  const { error } = await supabase
    .from('testimonials')
    .update({ approved: true })
    .eq('id', id);
  if (error) throw error;
};

export const deleteTestimonial = async (id: string) => {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    date: item.date,
    readTime: item.read_time,
    tags: item.tags || [],
    link: item.link,
    imageUrl: item.image_url || undefined,
    content: item.content || undefined,
  }));
};

export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    excerpt: data.excerpt,
    date: data.date,
    readTime: data.read_time,
    tags: data.tags || [],
    link: data.link,
    imageUrl: data.image_url || undefined,
    content: data.content || undefined,
  };
};

export const createBlogPost = async (post: Omit<BlogPost, 'id'>) => {
  const { error } = await supabase
    .from('blog_posts')
    .insert({
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      read_time: post.readTime,
      tags: post.tags,
      link: post.link,
      image_url: post.imageUrl || null,
      content: post.content || null,
    });
  if (error) throw error;
};

export const updateBlogPost = async (id: string, post: Partial<BlogPost>) => {
  const { error } = await supabase
    .from('blog_posts')
    .update({
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      read_time: post.readTime,
      tags: post.tags,
      link: post.link,
      image_url: post.imageUrl || null,
      content: post.content || null,
    })
    .eq('id', id);
  if (error) throw error;
};

export const deleteBlogPost = async (id: string) => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const recordVisit = async (path: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const ip = await getVisitorIp();

  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = user.id || `anon_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('visitor_id', visitorId);
  }

  const visitId = visitorId.toLowerCase().trim().replace(/[^a-zA-Z0-9.@]/g, '_');

  const { error } = await supabase
    .from('visits')
    .upsert({
      id: visitId,
      visitor_id: visitorId,
      email: localStorage.getItem('visitor_email'),
      ip: ip || 'unknown',
      path,
      user_agent: navigator.userAgent,
      last_active: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) {
    const { error: insertError } = await supabase
      .from('visits')
      .insert({
        id: visitId,
        visitor_id: visitorId,
        email: localStorage.getItem('visitor_email'),
        ip: ip || 'unknown',
        path,
        user_agent: navigator.userAgent,
      });
    if (insertError) throw insertError;
  }
};

export const updateHeartbeat = async () => {
  const visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) return;

  const visitId = visitorId.toLowerCase().trim().replace(/[^a-zA-Z0-9.@]/g, '_');
  await supabase
    .from('visits')
    .update({ last_active: new Date().toISOString() })
    .eq('id', visitId);
};

export const subscribeToActiveVisitors = (callback: (count: number) => void) => {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const channel = supabase.channel('active-visitors');
  try {
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'visits' },
      async () => {
        const { count } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .gte('last_active', twoMinutesAgo);
        callback(count || 0);
      }
    );
  } catch {
    // Channel already subscribed (Strict Mode double-mount), callback already registered
  }
  channel.subscribe();

  return () => { supabase.removeChannel(channel); };
};

export const syncVisitorIdentity = async (email: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!email || !user) return;

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (existing) {
    await supabase
      .from('users')
      .update({ uid: user.id, last_active: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim());
  } else {
    await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        uid: user.id,
      });
  }
};

export const getVisitorIp = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};

export const seedPortfolioData = async () => {
  const { count } = await supabase
    .from('experiences')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    alert('Database already contains experience data. Skipping seed.');
    return;
  }

  const { error: expError } = await supabase.from('experiences').insert(DEFAULT_EXPERIENCE);
  if (expError) throw expError;

  const { error: skillError } = await supabase.from('skills').insert(DEFAULT_SKILLS);
  if (skillError) throw skillError;

  const { error: eduError } = await supabase.from('education').insert(DEFAULT_EDUCATION);
  if (eduError) throw eduError;

  const { error: projError } = await supabase.from('projects').insert(DEFAULT_PROJECTS);
  if (projError) throw projError;

  alert('Database seeded successfully! Refresh the page.');
};

export const uploadResume = async (file: File): Promise<string> => {
  const filePath = `resume_${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const uploadProfessionalImage = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `portfolio/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('professional-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('professional-images')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const uploadBlogImage = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `blog/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    const { error: upsertError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file, { upsert: true });
    if (upsertError) throw upsertError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath);

  return publicUrl;
};

const ADMIN_EMAIL = 'jvpaisan@gmail.com';

const DEFAULT_PROJECTS = [
  {
    title: 'CloudNotes',
    description: 'A secure, cloud-based note management system with real-time data sync, secure Auth, and intuitive UI.',
    tech_stack: ['React', 'Supabase', 'Auth'],
    featured: true,
    link: 'https://cloudnotes-492733998894.asia-southeast1.run.app/',
    github: 'https://github.com/jayveee07/CloudNotes.git',
  },
  {
    title: 'Financial Reconciliation System',
    description: 'High-accuracy transaction processing engine for high-volume settlement scenarios.',
    tech_stack: ['Python', 'Macros', 'Data Validation'],
    featured: true,
    link: '#',
  },
];

const DEFAULT_EXPERIENCE = [
  {
    company: 'Guild Securities, Inc.',
    role: 'Settlement Associate',
    period: '08/2025 – 01/2026',
    description: [
      'Processed and reconciled high-volume financial transactions with 99%+ accuracy',
      'Investigated discrepancies and coordinated with banks/counterparties for resolution',
      'Ensured compliance with financial regulations and internal audit standards',
    ],
    order: 1,
  },
  {
    company: 'IQVIA',
    role: 'Senior Data Input Associate',
    period: '05/2023 – 05/2025',
    description: [
      'Processed large-scale datasets while maintaining strict quality standards',
      'Consistently achieved high productivity and quality KPIs in a fast-paced environment',
      'Identified data inconsistencies and improved data integrity processes',
    ],
    order: 2,
  },
  {
    company: 'Acaciasoft Corporation',
    role: 'Junior Software Engineer',
    period: '04/2022 – 04/2023',
    description: [
      'Developed and maintained web applications using Laravel, PHP, and MySQL',
      'Debugged and resolved system issues, improving stability and performance',
      'Collaborated with cross-functional teams to deliver system enhancements',
    ],
    order: 3,
  },
  {
    company: 'Virtual Experts PH',
    role: 'Virtual Assistant / Data Support',
    period: '04/2021 – 04/2022',
    description: [
      'Automated repetitive workflows using Python scripts, reducing manual workload',
      'Managed and organized client data systems for accuracy and accessibility',
      'Provided technical and operational support to diverse client accounts',
    ],
    order: 4,
  },
];

const DEFAULT_SKILLS = [
  { category: 'Web Development', items: ['Node.js', 'React', 'Laravel', 'PHP', 'JavaScript', 'HTML', 'CSS', 'jQuery'], order: 1 },
  { category: 'Data & Systems', items: ['Python Automation', 'Data Analysis', 'MySQL', 'System Monitoring', 'Excel Macros', 'Financial Systems'], order: 2 },
  { category: 'Tools & Cloud', items: ['Google Cloud', 'Firebase', 'Git', 'VS Code', 'Google Sheets', 'Financial Reconciliation'], order: 3 },
];

const DEFAULT_EDUCATION = [
  {
    school: 'Advance Central College',
    degree: 'Bachelor of Science: Information Systems',
    period: '2018 – 2022',
    description: [
      'Graduated with honors',
      'Programmer of the Year: Recognized for top-tier coding proficiency and technical performance',
      'Best Capstone Project: Led development of a system solution recognized for innovation and applicability',
    ],
    order: 1,
  },
  {
    school: 'TESDA',
    degree: 'Java Programming NCIII',
    period: 'Certified',
    description: ['Finisher of TESDA Java Programming NCIII'],
    order: 2,
  },
  {
    school: 'TESDA',
    degree: 'Visual Graphic Design NCIII',
    period: 'Certified',
    description: ['National Certificate in Visual Graphic Design (NCIII)'],
    order: 3,
  },
];
