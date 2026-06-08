export interface Profile {
  name: string;
  titles: string[];
  bio: string;
  email: string;
  phone: string;
  location: string;
  languages: string[];
  resumeUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  photoUrl?: string;
  professionalImages?: string[];
  sectionsVisible?: string[];
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  techStack: string[];
  featured?: boolean;
  link?: string;
  github?: string;
}

export interface SkillGroup {
  id?: string;
  category: string;
  items: string[];
  order?: number;
}

export interface Experience {
  id?: string;
  role: string;
  company: string;
  period: string;
  description: string[];
  order?: number;
}

export interface Education {
  id?: string;
  degree: string;
  school: string;
  period: string;
  description?: string[];
  order?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  text: string;
  avatar?: string;
  approved?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  link: string;
  imageUrl?: string;
}

export interface Stat {
  label: string;
  value: string;
}
