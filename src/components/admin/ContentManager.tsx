import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, Trash2, X, FileText } from 'lucide-react';
import { getExperience, getSkills, getEducation, getProjects, createExperience, updateExperience, deleteExperience, createSkill, updateSkill, deleteSkill, createEducation, updateEducation, deleteEducation, createProject, updateProject, deleteProject } from '../../lib/supabase-data';
import { subscribeToAdminSettings, updateAdminSettings, type AdminSettings } from '../../lib/supabase-messaging';
import type { Experience, SkillGroup, Education, Project } from '../../types/portfolio';

type Tab = 'experiences' | 'skills' | 'education' | 'projects';

interface ModalState {
  open: boolean;
  type: 'create' | 'edit';
  tab: Tab;
  item: Record<string, unknown>;
}

const emptyForm = (tab: Tab): Record<string, unknown> => {
  switch (tab) {
    case 'experiences': return { company: '', role: '', period: '', description: [''], order: 0 };
    case 'skills': return { category: '', items: [''], order: 0 };
    case 'education': return { school: '', degree: '', period: '', description: [''], order: 0 };
    case 'projects': return { title: '', description: '', tech_stack: [''], featured: false, link: '', github: '' };
  }
};

export const ContentManager = () => {
  const [tab, setTab] = useState<Tab>('experiences');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ open: false, type: 'create', tab: 'experiences', item: {} });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [builtWith, setBuiltWith] = useState('');

  const load = async () => {
    setLoading(true);
    const [e, s, ed, p] = await Promise.all([
      getExperience(), getSkills(), getEducation(), getProjects()
    ]);
    setExperiences(e);
    setSkills(s);
    setEducation(ed);
    setProjects(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsub = subscribeToAdminSettings((settings) => {
      if (settings.builtWith !== undefined) setBuiltWith(settings.builtWith);
    });
    return () => unsub();
  }, []);

  const dataMap: Record<Tab, unknown[]> = { experiences, skills, education, projects };
  const currentData = dataMap[tab] as Record<string, unknown>[];

  const openCreate = (t: Tab) => setModal({ open: true, type: 'create', tab: t, item: emptyForm(t) });
  const openEdit = (t: Tab, item: Record<string, unknown>) => setModal({ open: true, type: 'edit', tab: t, item: { ...item } });

  const handleSave = async () => {
    const { tab: t, type, item } = modal;
    try {
      if (t === 'experiences') {
        const exp = item as unknown as Experience;
        if (type === 'create') await createExperience(exp as Omit<Experience, 'id'>);
        else await updateExperience(exp.id!, exp);
      } else if (t === 'skills') {
        const sk = item as unknown as SkillGroup;
        if (type === 'create') await createSkill(sk as Omit<SkillGroup, 'id'>);
        else await updateSkill(sk.id!, sk);
      } else if (t === 'education') {
        const ed = item as unknown as Education;
        if (type === 'create') await createEducation(ed as Omit<Education, 'id'>);
        else await updateEducation(ed.id!, ed);
      } else if (t === 'projects') {
        const pr = item as unknown as Project;
        if (type === 'create') await createProject(pr as Omit<Project, 'id'>);
        else await updateProject(pr.id!, pr);
      }
      setModal({ ...modal, open: false });
      await load();
    } catch (err) {
      alert('Failed to save: ' + (err as Error).message);
    }
  };

  const handleDelete = async (t: Tab, id: string) => {
    try {
      if (t === 'experiences') await deleteExperience(id);
      else if (t === 'skills') await deleteSkill(id);
      else if (t === 'education') await deleteEducation(id);
      else if (t === 'projects') await deleteProject(id);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      alert('Failed to delete: ' + (err as Error).message);
    }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'experiences', label: 'Experiences' },
    { key: 'skills', label: 'Skills' },
    { key: 'education', label: 'Education' },
    { key: 'projects', label: 'Projects' },
  ];

  const renderTable = () => {
    switch (tab) {
      case 'experiences':
        return (
          <table className="w-full">
            <thead><tr className="text-left text-[10px] font-black text-secondary uppercase tracking-widest border-b border-border"><th className="pb-3 pl-4">Company</th><th className="pb-3">Role</th><th className="pb-3">Period</th><th className="pb-3 pr-4 w-24">Actions</th></tr></thead>
            <tbody>
              {(experiences as Experience[]).map(exp => (
                <tr key={exp.id} className="border-b border-border hover:bg-surface-alt/50 transition-colors">
                  <td className="py-4 pl-4 font-bold text-primary">{exp.company}</td>
                  <td className="py-4 text-sm text-secondary">{exp.role}</td>
                  <td className="py-4 text-sm text-secondary">{exp.period}</td>
                  <td className="py-4 pr-4">
                    <ActionButtons onEdit={() => openEdit(tab, exp as unknown as Record<string, unknown>)} onDelete={() => setConfirmDelete(exp.id!)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'skills':
        return (
          <table className="w-full">
            <thead><tr className="text-left text-[10px] font-black text-secondary uppercase tracking-widest border-b border-border"><th className="pb-3 pl-4">Category</th><th className="pb-3">Items</th><th className="pb-3 pr-4 w-24">Actions</th></tr></thead>
            <tbody>
              {(skills as SkillGroup[]).map(sk => (
                <tr key={sk.id} className="border-b border-border hover:bg-surface-alt/50 transition-colors">
                  <td className="py-4 pl-4 font-bold text-primary">{sk.category}</td>
                  <td className="py-4 text-sm text-secondary">{(sk.items || []).join(', ')}</td>
                  <td className="py-4 pr-4">
                    <ActionButtons onEdit={() => openEdit(tab, sk as unknown as Record<string, unknown>)} onDelete={() => setConfirmDelete(sk.id!)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'education':
        return (
          <table className="w-full">
            <thead><tr className="text-left text-[10px] font-black text-secondary uppercase tracking-widest border-b border-border"><th className="pb-3 pl-4">School</th><th className="pb-3">Degree</th><th className="pb-3">Period</th><th className="pb-3 pr-4 w-24">Actions</th></tr></thead>
            <tbody>
              {(education as Education[]).map(ed => (
                <tr key={ed.id} className="border-b border-border hover:bg-surface-alt/50 transition-colors">
                  <td className="py-4 pl-4 font-bold text-primary">{ed.school}</td>
                  <td className="py-4 text-sm text-secondary">{ed.degree}</td>
                  <td className="py-4 text-sm text-secondary">{ed.period}</td>
                  <td className="py-4 pr-4">
                    <ActionButtons onEdit={() => openEdit(tab, ed as unknown as Record<string, unknown>)} onDelete={() => setConfirmDelete(ed.id!)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'projects':
        return (
          <table className="w-full">
            <thead><tr className="text-left text-[10px] font-black text-secondary uppercase tracking-widest border-b border-border"><th className="pb-3 pl-4">Title</th><th className="pb-3">Featured</th><th className="pb-3">Tech Stack</th><th className="pb-3 pr-4 w-24">Actions</th></tr></thead>
            <tbody>
              {(projects as Project[]).map(pr => (
                <tr key={pr.id} className="border-b border-border hover:bg-surface-alt/50 transition-colors">
                  <td className="py-4 pl-4 font-bold text-primary">{pr.title}</td>
                  <td className="py-4">{pr.featured ? <span className="px-2 py-1 bg-accent/10 text-accent text-[10px] font-black rounded-lg">Featured</span> : <span className="text-muted text-sm">—</span>}</td>
                  <td className="py-4 text-sm text-secondary">{(pr.techStack || []).join(', ')}</td>
                  <td className="py-4 pr-4">
                    <ActionButtons onEdit={() => openEdit(tab, pr as unknown as Record<string, unknown>)} onDelete={() => setConfirmDelete(pr.id!)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  const renderForm = () => {
    const { tab: t, item } = modal;
    const set = (key: string, val: unknown) => setModal({ ...modal, item: { ...item, [key]: val } });

    switch (t) {
      case 'experiences':
        return (
          <div className="space-y-4">
            <Input label="Company" value={(item as any).company || ''} onChange={v => set('company', v)} />
            <Input label="Role" value={(item as any).role || ''} onChange={v => set('role', v)} />
            <Input label="Period" value={(item as any).period || ''} onChange={v => set('period', v)} />
            <ArrayInput label="Description" values={(item as any).description || ['']} onChange={v => set('description', v)} />
            <Input label="Order" type="number" value={String((item as any).order ?? 0)} onChange={v => set('order', Number(v))} />
          </div>
        );
      case 'skills':
        return (
          <div className="space-y-4">
            <Input label="Category" value={(item as any).category || ''} onChange={v => set('category', v)} />
            <ArrayInput label="Items" values={(item as any).items || ['']} onChange={v => set('items', v)} />
            <Input label="Order" type="number" value={String((item as any).order ?? 0)} onChange={v => set('order', Number(v))} />
          </div>
        );
      case 'education':
        return (
          <div className="space-y-4">
            <Input label="School" value={(item as any).school || ''} onChange={v => set('school', v)} />
            <Input label="Degree" value={(item as any).degree || ''} onChange={v => set('degree', v)} />
            <Input label="Period" value={(item as any).period || ''} onChange={v => set('period', v)} />
            <ArrayInput label="Description" values={(item as any).description || ['']} onChange={v => set('description', v)} />
            <Input label="Order" type="number" value={String((item as any).order ?? 0)} onChange={v => set('order', Number(v))} />
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-4">
            <Input label="Title" value={(item as any).title || ''} onChange={v => set('title', v)} />
            <Textarea label="Description" value={(item as any).description || ''} onChange={v => set('description', v)} />
            <ArrayInput label="Tech Stack" values={(item as any).tech_stack || ['']} onChange={v => set('tech_stack', v)} />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={(item as any).featured || false} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 rounded border-border text-accent focus:ring-accent" />
              <span className="text-sm font-bold text-primary">Featured Project</span>
            </label>
            <Input label="Link URL" value={(item as any).link || ''} onChange={v => set('link', v)} />
            <Input label="GitHub URL" value={(item as any).github || ''} onChange={v => set('github', v)} />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-primary mb-2">Content Manager</h1>
          <p className="text-secondary font-bold">Manage your portfolio content</p>
        </div>
        <button onClick={() => openCreate(tab)} className="flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-accent/90 transition-all shadow-lg shadow-accent/20">
          <Plus size={16} /> Add {tab.slice(0, -1)}
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-500">
            <FileText size={22} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-primary">Footer — Built With</p>
            <p className="text-[10px] text-secondary font-bold">Text shown at the bottom of your site footer.</p>
          </div>
          <input
            value={builtWith}
            onChange={e => { setBuiltWith(e.target.value); updateAdminSettings({ builtWith: e.target.value }); }}
            placeholder="React, Tailwind CSS & Supabase"
            className="w-80 bg-surface-alt border-2 border-border rounded-xl px-4 py-3 text-sm focus:border-accent/30 focus:outline-none font-bold transition-all"
          />
        </div>
      </div>

      <div className="flex gap-1 bg-surface-alt/80 p-1.5 rounded-2xl mb-6 border border-border/50 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl transition-all ${
              tab === key ? 'bg-surface text-primary shadow-md shadow-border/50' : 'text-secondary hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">{renderTable()}</div>
        {(currentData as any[]).length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-secondary">No {tab} yet. Click "Add" to create one.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal({ ...modal, open: false })} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-black text-primary capitalize">{modal.type === 'create' ? 'Create' : 'Edit'} {modal.tab.slice(0, -1)}</h3>
                <button onClick={() => setModal({ ...modal, open: false })} className="p-2 hover:bg-surface-alt rounded-xl text-secondary transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {renderForm()}
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-border bg-surface-alt/50">
                <button onClick={() => setModal({ ...modal, open: false })} className="px-5 py-2.5 text-sm font-bold text-secondary hover:text-primary transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-accent/90 transition-all shadow-lg shadow-accent/20">
                  {modal.type === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDelete(null)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl border border-border p-6 text-center">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
              <h3 className="text-lg font-black text-primary mb-2">Delete this item?</h3>
              <p className="text-sm text-secondary font-bold mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 text-sm font-bold text-secondary hover:text-primary transition-colors">Cancel</button>
                <button onClick={() => handleDelete(tab, confirmDelete)} className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Input = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div>
    <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-2">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-surface-alt border-2 border-transparent rounded-xl px-4 py-3 text-sm focus:bg-surface focus:border-accent/10 focus:outline-none font-bold transition-all" />
  </div>
);

const Textarea = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-2">{label}</label>
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="w-full bg-surface-alt border-2 border-transparent rounded-xl px-4 py-3 text-sm focus:bg-surface focus:border-accent/10 focus:outline-none font-bold transition-all resize-none" />
  </div>
);

const ArrayInput = ({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) => (
  <div>
    <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-2">{label}</label>
    <div className="space-y-2">
      {values.map((val, i) => (
        <div key={i} className="flex gap-2">
          <input value={val} onChange={e => { const next = [...values]; next[i] = e.target.value; onChange(next); }} className="flex-1 bg-surface-alt border-2 border-transparent rounded-xl px-4 py-3 text-sm focus:bg-surface focus:border-accent/10 focus:outline-none font-bold transition-all" />
          {values.length > 1 && <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="p-3 text-muted hover:text-red-500 transition-colors"><X size={16} /></button>}
        </div>
      ))}
      <button onClick={() => onChange([...values, ''])} className="text-xs font-bold text-accent hover:text-accent/80 transition-colors">+ Add item</button>
    </div>
  </div>
);

const ActionButtons = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => (
  <div className="flex gap-1">
    <button onClick={onEdit} className="p-2 hover:bg-surface-alt rounded-lg text-secondary hover:text-accent transition-all"><Pencil size={14} /></button>
    <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-lg text-secondary hover:text-red-500 transition-all"><Trash2 size={14} /></button>
  </div>
);
