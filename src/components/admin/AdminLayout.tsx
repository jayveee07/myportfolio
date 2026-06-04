import { type ReactNode } from 'react';
import { LayoutDashboard, MessageSquare, Layers, BarChart3, Settings, LogOut, ArrowLeftFromLine, MessageCircle, BookOpen, User } from 'lucide-react';
import { useAuth } from '../../context/SupabaseAuthContext';
import { SiteLogo } from '../Logo';

export type AdminPage = 'dashboard' | 'inbox' | 'content' | 'analytics' | 'settings' | 'testimonials' | 'blog' | 'about';

interface AdminLayoutProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  children: ReactNode;
}

const NAV_ITEMS: { page: AdminPage; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'inbox', label: 'Inbox', icon: MessageSquare },
  { page: 'about', label: 'About', icon: User },
  { page: 'blog', label: 'Blog', icon: BookOpen },
  { page: 'testimonials', label: 'Testimonials', icon: MessageCircle },
  { page: 'content', label: 'Content', icon: Layers },
  { page: 'analytics', label: 'Analytics', icon: BarChart3 },
  { page: 'settings', label: 'Settings', icon: Settings },
];

export const AdminLayout = ({ currentPage, onNavigate, children }: AdminLayoutProps) => {
  const { signOut } = useAuth();

  return (
    <div className="flex h-screen bg-surface-alt overflow-hidden font-sans">
      <aside className="w-56 bg-surface border-r border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <SiteLogo size="sm" />
            <span className="text-lg font-black text-primary tracking-tight">Console</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                currentPage === page
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-muted hover:text-primary hover:bg-surface-alt'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <button
            onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-secondary hover:text-primary hover:bg-surface-alt transition-all"
          >
            <ArrowLeftFromLine size={18} />
            Return to Site
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-secondary hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};
