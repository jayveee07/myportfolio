import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { AdminLayout, type AdminPage } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminInbox } from '../AdminInbox';
import { ContentManager } from './ContentManager';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminTestimonials } from './AdminTestimonials';
import { AdminBlog } from './AdminBlog';
import { AdminAbout } from './AdminAbout';
import { Sun, Moon, Bot, Volume2, VolumeX, FileText, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { subscribeToAdminSettings, updateAdminSettings, type AdminSettings } from '../../lib/supabase-messaging';
import { uploadResume } from '../../lib/supabase-data';

export const AdminPanel = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  const handleNavigate = useCallback((page: AdminPage) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (['dashboard', 'inbox', 'content', 'analytics', 'settings', 'testimonials', 'blog', 'about'].includes(detail)) {
        setCurrentPage(detail as AdminPage);
      }
    };
    window.addEventListener('admin-navigate', handler);
    return () => window.removeEventListener('admin-navigate', handler);
  }, []);

  return (
    <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === 'inbox' ? (
        <AdminInbox user={user!} />
      ) : (
        <div className="h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            {currentPage === 'dashboard' && <AdminDashboard />}
            {currentPage === 'about' && <AdminAbout />}
            {currentPage === 'blog' && <AdminBlog />}
            {currentPage === 'testimonials' && <AdminTestimonials />}
            {currentPage === 'content' && <ContentManager />}
            {currentPage === 'analytics' && <AdminAnalytics />}
            {currentPage === 'settings' && <SettingsPage />}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const SettingsPage = () => {
  const { theme, toggle } = useTheme();
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    autoReplyEnabled: true, notificationSounds: true, onlineStatus: 'online'
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeToAdminSettings(setAdminSettings);
    return () => unsub();
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadResume(file);
      await updateAdminSettings({ resumeUrl: url });
      alert('Resume updated successfully!');
    } catch {
      alert('Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary mb-2">Settings</h1>
        <p className="text-secondary font-bold">Configure your portfolio and chat settings</p>
      </div>
      <div className="grid gap-6 max-w-2xl">
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-primary mb-1">Theme</h2>
              <p className="text-sm text-secondary font-bold">Toggle between light and dark mode</p>
            </div>
            <button
              onClick={toggle}
              className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all bg-surface-alt hover:bg-surface-alt/80 text-secondary hover:text-primary border border-border"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-lg font-black text-primary mb-4">Availability</h2>
          <div className="grid grid-cols-3 gap-3">
            {(['online', 'busy', 'offline'] as const).map(status => (
              <button
                key={status}
                onClick={() => updateAdminSettings({ onlineStatus: status })}
                className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  adminSettings.onlineStatus === status
                    ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                    : 'bg-surface border-border text-secondary hover:border-border'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${
                  status === 'online' ? 'bg-green-400' : status === 'busy' ? 'bg-amber-400' : 'bg-muted'
                } ${adminSettings.onlineStatus === status ? 'ring-4 ring-white/20' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-black text-primary mb-4">Engagement</h2>

          <div className="bg-surface-alt rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${adminSettings.autoReplyEnabled ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-surface text-muted'}`}>
                <Bot size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-primary">Auto-Reply</p>
                <p className="text-[10px] text-secondary font-bold">Copilot handles initial visitor engagement.</p>
              </div>
            </div>
            <button
              onClick={() => updateAdminSettings({ autoReplyEnabled: !adminSettings.autoReplyEnabled })}
              className={`w-14 h-8 rounded-full transition-all relative ${adminSettings.autoReplyEnabled ? 'bg-accent' : 'bg-muted'}`}
            >
              <motion.div
                animate={{ x: adminSettings.autoReplyEnabled ? 28 : 4 }}
                className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-md"
              />
            </button>
          </div>

          <div className="bg-surface-alt rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${adminSettings.notificationSounds ? 'bg-btn text-white shadow-lg shadow-primary/20' : 'bg-surface text-muted'}`}>
                {adminSettings.notificationSounds ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </div>
              <div>
                <p className="text-sm font-black text-primary">Sound Notifications</p>
                <p className="text-[10px] text-secondary font-bold">Play sounds for new messages.</p>
              </div>
            </div>
            <button
              onClick={() => updateAdminSettings({ notificationSounds: !adminSettings.notificationSounds })}
              className={`w-14 h-8 rounded-full transition-all relative ${adminSettings.notificationSounds ? 'bg-accent' : 'bg-muted'}`}
            >
              <motion.div
                animate={{ x: adminSettings.notificationSounds ? 28 : 4 }}
                className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-md"
              />
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-lg font-black text-primary mb-4">Resume</h2>
          <div className="bg-surface-alt rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${adminSettings.resumeUrl ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-surface text-muted'}`}>
                {uploading ? <Loader2 size={24} className="animate-spin" /> : <FileText size={24} />}
              </div>
              <div>
                <p className="text-sm font-black text-primary">Resume PDF</p>
                <p className="text-[10px] text-secondary font-bold">
                  {adminSettings.resumeUrl ? 'Resume is live on your site.' : 'No resume uploaded yet.'}
                </p>
              </div>
            </div>
            <label className="cursor-pointer">
              <div className="px-4 py-2 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all">
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </div>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
