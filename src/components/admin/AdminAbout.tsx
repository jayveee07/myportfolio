import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Eye, EyeOff, X, Plus, Loader2, Trash2, GripVertical, ImageIcon, Upload } from 'lucide-react';
import { getProfile, updateProfile, uploadProfessionalImage, deleteStorageFileFromUrl } from '../../lib/supabase-data';
import { subscribeToAdminSettings, updateAdminSettings } from '../../lib/supabase-messaging';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Profile } from '../../types/portfolio';

const ALL_SECTIONS = [
  { key: 'hero', label: 'Hero' },
  { key: 'about', label: 'About' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'blog', label: 'Blog' },
  { key: 'footer', label: 'Footer' },
];

const ALL_KEYS = ALL_SECTIONS.map(s => s.key);

export const AdminAbout = () => {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 10 * 1000,
  });

  const [form, setForm] = useState<Profile>({
    name: '', titles: [], bio: '', email: '', phone: '',
    location: '', languages: [], resumeUrl: '', githubUrl: '',
    linkedinUrl: '', photoUrl: '', professionalImages: [],
  });
  const [tab, setTab] = useState<'profile' | 'photos' | 'sections' | 'footer'>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [titleInput, setTitleInput] = useState('');
  const [langInput, setLangInput] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef(form);
  formRef.current = form;

  const [footer, setFooter] = useState({
    builtWith: '',
    footerHeadingTop: '',
    footerHeadingAccent: '',
    footerHeadingBottom: '',
    footerSubtitle: '',
    footerCta: '',
  });

  useEffect(() => {
    const unsub = subscribeToAdminSettings((settings) => {
      setFooter({
        builtWith: settings.builtWith || '',
        footerHeadingTop: settings.footerHeadingTop || '',
        footerHeadingAccent: settings.footerHeadingAccent || '',
        footerHeadingBottom: settings.footerHeadingBottom || '',
        footerSubtitle: settings.footerSubtitle || '',
        footerCta: settings.footerCta || '',
      });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const set = useCallback((key: keyof Profile, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value })), []);

  const addTag = useCallback((key: 'titles' | 'languages' | 'professionalImages', input: string, setInput: (v: string) => void) => {
    const val = input.trim();
    if (!val) return;
    setForm(prev => {
      if (prev[key].includes(val)) return prev;
      return { ...prev, [key]: [...prev[key], val] };
    });
    setInput('');
  }, []);

  const saveForm = useCallback(async (data: Profile) => {
    const payload = { ...data };
    if (!payload.sectionsVisible?.length) payload.sectionsVisible = undefined;
    await updateProfile(payload);
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  }, [queryClient]);

  const removeTag = useCallback((key: 'titles' | 'languages' | 'professionalImages', index: number) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  }, []);

  const handleDeleteImage = useCallback(async (index: number) => {
    const current = formRef.current;
    const removedUrl = current.professionalImages[index];
    const next = {
      ...current,
      professionalImages: current.professionalImages.filter((_, i) => i !== index),
    };
    setForm(next);
    await Promise.all([
      saveForm(next),
      ...(removedUrl ? [deleteStorageFileFromUrl(removedUrl).catch(() => {})] : []),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [saveForm]);

  const handleRemovePhoto = useCallback(async () => {
    const current = formRef.current;
    const oldUrl = current.photoUrl;
    const next = { ...current, photoUrl: '' };
    setForm(next);
    await Promise.all([
      saveForm(next),
      ...(oldUrl ? [deleteStorageFileFromUrl(oldUrl).catch(() => {})] : []),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [saveForm]);

  const handleMoveImage = useCallback(async (from: number, to: number) => {
    const current = formRef.current;
    const arr = [...current.professionalImages];
    if (to < 0 || to >= arr.length) return;
    [arr[from], arr[to]] = [arr[to], arr[from]];
    const next = { ...current, professionalImages: arr };
    setForm(next);
    await saveForm(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [saveForm]);

  const handlePhotoUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadProfessionalImage(file);
      const current = formRef.current;
      const next = { ...current, photoUrl: url };
      setForm(next);
      await saveForm(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }, [saveForm]);

  const handleImagesUpload = useCallback(async (files: FileList) => {
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map(f => uploadProfessionalImage(f))
      );
      const current = formRef.current;
      const next = { ...current, professionalImages: [...current.professionalImages, ...urls] };
      setForm(next);
      await saveForm(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }, [saveForm]);

  const toggleSection = useCallback((key: string) => {
    setForm(prev => {
      const current = prev.sectionsVisible ?? ALL_KEYS;
      const next = current.includes(key)
        ? current.filter(k => k !== key)
        : [...current, key];
      return { ...prev, sectionsVisible: next };
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.sectionsVisible?.length) payload.sectionsVisible = undefined;
      await updateProfile(payload);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-primary">About Page</h1>
          <p className="text-secondary font-bold">Edit your profile and section visibility</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-surface-alt p-1 rounded-xl w-fit">
        {(['profile', 'photos', 'sections', 'footer'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all capitalize ${
              tab === t ? 'bg-surface text-primary shadow-sm' : 'text-secondary hover:text-primary'
            }`}
          >
            {t === 'profile' ? 'Profile' : t === 'photos' ? 'Photos' : t === 'sections' ? 'Sections' : 'Footer'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="grid gap-8">
          <SectionCard title="Basic Information">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name">
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
              <Field label="Email">
                <input value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
              <Field label="Location">
                <input value={form.location} onChange={e => set('location', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
            </div>
            <Field label="Bio" className="mt-4">
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent resize-none" />
            </Field>
          </SectionCard>

          <SectionCard title="Titles">
            <p className="text-sm text-secondary mb-3">Professional titles shown on your portfolio</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.titles.map((t, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm font-medium">
                  {t}
                  <button onClick={() => removeTag('titles', i)} className="hover:text-accent/60"><X size={14} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={titleInput} onChange={e => setTitleInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('titles', titleInput, setTitleInput); } }}
                placeholder="e.g. Full-Stack Developer"
                className="flex-1 px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              <button onClick={() => addTag('titles', titleInput, setTitleInput)}
                className="px-4 py-3 bg-surface-alt rounded-xl hover:bg-surface-alt/80 transition-colors">
                <Plus size={18} />
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Languages">
            <p className="text-sm text-secondary mb-3">Languages you speak</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.languages.map((l, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm font-medium">
                  {l}
                  <button onClick={() => removeTag('languages', i)} className="hover:text-accent/60"><X size={14} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={langInput} onChange={e => setLangInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('languages', langInput, setLangInput); } }}
                placeholder="e.g. English"
                className="flex-1 px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              <button onClick={() => addTag('languages', langInput, setLangInput)}
                className="px-4 py-3 bg-surface-alt rounded-xl hover:bg-surface-alt/80 transition-colors">
                <Plus size={18} />
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Social & Resume">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Resume URL">
                <input value={form.resumeUrl} onChange={e => set('resumeUrl', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
              <Field label="GitHub URL">
                <input value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
              <Field label="LinkedIn URL">
                <input value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === 'photos' && (
        <div className="grid gap-8">
          <SectionCard title="Hero Profile Photo">
            <p className="text-xs text-secondary mb-3">Shown in the hero badge. Upload a square photo for best results.</p>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-alt shrink-0 ring-2 ring-accent/20 flex items-center justify-center">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted">
                    <ImageIcon size={24} />
                    <span className="text-[10px] font-medium">No photo</span>
                  </div>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); e.target.value = ''; }}
                />
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-surface-alt text-primary rounded-xl font-semibold text-sm hover:bg-surface-alt/80 transition-all disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Upload
                </button>
                {form.photoUrl && (
                  <button
                    onClick={handleRemovePhoto}
                    className="px-4 py-2.5 text-red-400 hover:text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="About Section Images">
            <p className="text-xs text-secondary mb-3">
              These images rotate in the about section visual area. Upload multiple at once.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {(form.professionalImages || []).map((img, i) => (
                <div key={i} className="group relative aspect-square rounded-xl overflow-hidden bg-surface-alt border border-border">
                  <img src={img} alt="" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = ''; }} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleMoveImage(i, i - 1)}
                      disabled={i === 0}
                      className="w-8 h-8 bg-surface/90 rounded-lg flex items-center justify-center text-primary hover:bg-surface disabled:opacity-30 transition-all"
                    >
                      <GripVertical size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(i)}
                      className="w-8 h-8 bg-red-500/90 rounded-lg flex items-center justify-center text-white hover:bg-red-600 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-surface/80 rounded-md flex items-center justify-center text-secondary text-[10px] font-bold">
                    {i + 1}
                  </div>
                </div>
              ))}

              <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-secondary hover:text-accent">
                <input
                  ref={imagesInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={e => { const f = e.target.files; if (f?.length) handleImagesUpload(f); e.target.value = ''; }}
                />
                {uploading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <Upload size={24} />
                    <span className="text-xs font-semibold">Click to upload</span>
                  </>
                )}
              </label>
            </div>

            {(!form.professionalImages || form.professionalImages.length === 0) && (
              <p className="text-xs text-secondary text-center -mt-2 mb-4">
                No images yet. Click the dashed area above to upload.
              </p>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'sections' && (
        <SectionCard title="Section Visibility">
          <p className="text-sm text-secondary mb-4">Toggle which sections are visible on your public portfolio</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {ALL_SECTIONS.map(section => {
              const visible = (form.sectionsVisible ?? ALL_KEYS).includes(section.key);
              return (
                <button
                  key={section.key}
                  onClick={() => toggleSection(section.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold ${
                    visible
                      ? 'border-accent bg-accent/5 text-accent'
                      : 'border-border text-secondary hover:border-border'
                  }`}
                >
                  {visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  {section.label}
                </button>
              );
            })}
          </div>
        </SectionCard>
      )}

      {tab === 'footer' && (
        <div className="grid gap-8">
          <SectionCard title="Left Side — CTA">
            <p className="text-sm text-secondary mb-4">All fields update the site footer in real time.</p>
            <div className="grid gap-5">
              <Field label="Heading (first part)">
                <input value={footer.footerHeadingTop} onChange={e => { const v = e.target.value; setFooter(f => ({ ...f, footerHeadingTop: v })); updateAdminSettings({ footerHeadingTop: v }); }}
                  placeholder="Let's Build"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
              <Field label="Heading (accent word)">
                <input value={footer.footerHeadingAccent} onChange={e => { const v = e.target.value; setFooter(f => ({ ...f, footerHeadingAccent: v })); updateAdminSettings({ footerHeadingAccent: v }); }}
                  placeholder="Something"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
              <Field label="Heading (last part)">
                <input value={footer.footerHeadingBottom} onChange={e => { const v = e.target.value; setFooter(f => ({ ...f, footerHeadingBottom: v })); updateAdminSettings({ footerHeadingBottom: v }); }}
                  placeholder="Great"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
              <Field label="Subtitle">
                <textarea value={footer.footerSubtitle} onChange={e => { const v = e.target.value; setFooter(f => ({ ...f, footerSubtitle: v })); updateAdminSettings({ footerSubtitle: v }); }}
                  placeholder="I'm always open to discussing new projects..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent resize-none" />
              </Field>
              <Field label="Button Text">
                <input value={footer.footerCta} onChange={e => { const v = e.target.value; setFooter(f => ({ ...f, footerCta: v })); updateAdminSettings({ footerCta: v }); }}
                  placeholder="Start a Conversation"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Right Side — Contact Info">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email">
                <input value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
              <Field label="Location">
                <input value={form.location} onChange={e => set('location', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
              <Field label="GitHub URL">
                <input value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
              <Field label="LinkedIn URL">
                <input value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Bottom Bar">
            <Field label="Built With">
              <input value={footer.builtWith} onChange={e => { const v = e.target.value; setFooter(f => ({ ...f, builtWith: v })); updateAdminSettings({ builtWith: v }); }}
                placeholder="React, Tailwind CSS & Supabase"
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
            </Field>
          </SectionCard>
        </div>
      )}
    </div>
  );
};

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-surface rounded-2xl border border-border p-6">
    <h2 className="text-lg font-bold text-primary mb-4">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <label className="block text-sm font-bold text-secondary mb-1.5">{label}</label>
    {children}
  </div>
);
