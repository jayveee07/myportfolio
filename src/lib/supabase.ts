import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const ADMIN_EMAIL = 'jvpaisan@gmail.com';
export const ADMIN_NAME = 'John Vince Paisan';
export const ADMIN_AVATAR = 'https://ui-avatars.com/api/?name=JV&background=0f172a&color=fff';

export const isAdmin = (email: string | undefined | null) => email === ADMIN_EMAIL;
