import { useState } from 'react';
import { Check, X, Trash2, Loader, MessageCircle, Clock, CheckCheck } from 'lucide-react';
import { useAllTestimonials, useApproveTestimonial, useDeleteTestimonial } from '../../hooks/usePortfolioData';

type Tab = 'pending' | 'approved';

export const AdminTestimonials = () => {
  const [tab, setTab] = useState<Tab>('pending');
  const { data: testimonials, isLoading } = useAllTestimonials();
  const approveMutation = useApproveTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const pending = testimonials?.filter(t => !t.approved) ?? [];
  const approved = testimonials?.filter(t => t.approved) ?? [];

  const items = tab === 'pending' ? pending : approved;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary mb-2">Testimonials</h1>
        <p className="text-secondary font-bold">Review and manage testimonials from visitors</p>
      </div>

      <div className="flex gap-2 mb-8">
        <TabButton active={tab === 'pending'} onClick={() => setTab('pending')}>
          <Clock size={16} />
          Pending
          {pending.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-700 rounded-full">{pending.length}</span>
          )}
        </TabButton>
        <TabButton active={tab === 'approved'} onClick={() => setTab('approved')}>
          <CheckCheck size={16} />
          Approved
          <span className="ml-1.5 px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-700 rounded-full">{approved.length}</span>
        </TabButton>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={24} className="animate-spin text-muted" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <div className="w-16 h-16 bg-surface-alt rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-muted" />
          </div>
          <h3 className="text-lg font-black text-primary mb-1">
            {tab === 'pending' ? 'All Reviewed' : 'No Approved Testimonials'}
          </h3>
          <p className="text-sm font-bold text-secondary">
            {tab === 'pending' ? 'All testimonials have been reviewed.' : 'Approve pending testimonials to show them.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map(t => (
            <div key={t.id} className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-full shrink-0 bg-gradient-to-br from-accent to-accent-dark text-white flex items-center justify-center text-sm font-bold">
                    {t.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-primary truncate">{t.name}</div>
                    <div className="text-xs font-bold text-secondary truncate">{t.role} &middot; {t.company}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {tab === 'pending' && (
                    <button
                      onClick={() => approveMutation.mutate(t.id)}
                      disabled={approveMutation.isPending}
                      className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 disabled:opacity-40 transition-all active:scale-95"
                      title="Approve"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  {tab === 'approved' && (
                    <button
                      onClick={() => deleteMutation.mutate(t.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 disabled:opacity-40 transition-all active:scale-95"
                      title="Reject (delete)"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm('Delete this testimonial permanently?')) deleteMutation.mutate(t.id); }}
                    disabled={deleteMutation.isPending}
                    className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 disabled:opacity-40 transition-all active:scale-95"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm text-secondary leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-2 text-[10px] font-bold text-muted">{t.id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
      active
        ? 'bg-accent text-white shadow-lg shadow-accent/20'
        : 'bg-surface text-secondary hover:text-primary border border-border'
    }`}
  >
    {children}
  </button>
);
