import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { Quote, MessageSquarePlus, X, Check, Loader, MessageCircle, User } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useTestimonials } from '../hooks/usePortfolioData';
import { submitTestimonial } from '../lib/supabase-data';
import type { Testimonial } from '../types/portfolio';

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

export const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { data: testimonials, isLoading } = useTestimonials();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', company: '', text: '' });

  const items = testimonials ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) return;
    setSubmitting(true);
    try {
      const tempId = `temp_${Date.now()}`;
      const newItem: Testimonial = {
        id: tempId,
        name: form.name.trim(),
        role: form.role.trim() || 'Client',
        company: form.company.trim() || 'Anonymous',
        text: form.text.trim(),
      };
      queryClient.setQueryData<Testimonial[]>(['testimonials'], (old) =>
        old ? [newItem, ...old] : [newItem]
      );
      await submitTestimonial({
        name: form.name.trim(),
        role: form.role.trim() || 'Client',
        company: form.company.trim() || 'Anonymous',
        text: form.text.trim(),
      });
      setSubmitted(true);
      setForm({ name: '', role: '', company: '', text: '' });
      setTimeout(() => { setShowForm(false); setSubmitted(false); }, 2500);
    } catch {
      alert('Failed to submit. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section ref={ref} id="testimonials" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-primary mt-3 mb-4">
              What People Say
            </h2>
            <p className="text-secondary max-w-xl mx-auto">
              Feedback from colleagues and clients I've worked with.
            </p>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-surface-alt rounded-3xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle size={36} className="text-muted" />
            </div>
            <h3 className="text-2xl font-display font-bold text-primary mb-2">No Testimonials Yet</h3>
            <p className="text-secondary max-w-md mx-auto mb-6">
              Be the first to share your experience working with me.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-btn text-white rounded-xl font-semibold hover:bg-slate-800 transition-all active:scale-95"
            >
              <MessageSquarePlus size={18} />
              Leave a Testimonial
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((t, index) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className="relative p-8 bg-surface-alt rounded-3xl hover:bg-surface hover:shadow-2xl transition-all duration-500 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-accent/10 ring-2 ring-accent/20 shrink-0">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent to-accent-dark text-white text-sm font-bold">
                          {getInitials(t.name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-display font-bold text-primary">{t.name}</div>
                      <div className="text-xs text-muted">{t.role}, {t.company}</div>
                    </div>
                  </div>
                  <Quote className="w-6 h-6 text-accent/20 mb-2" />
                  <p className="text-secondary leading-relaxed text-sm italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
              className="text-center mt-12"
            >
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-btn text-white rounded-xl font-semibold hover:bg-slate-800 transition-all active:scale-95"
              >
                <MessageSquarePlus size={18} />
                Leave a Testimonial
              </button>
            </motion.div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => { if (!submitting) setShowForm(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-8 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-black text-primary">
                  {submitted ? 'Thank You!' : 'Leave a Testimonial'}
                </h3>
                <button
                  onClick={() => { if (!submitting) setShowForm(false); }}
                  className="p-2 hover:bg-surface-alt rounded-xl text-muted hover:text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {submitted ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-emerald-600" />
                  </div>
                  <p className="text-primary font-bold text-lg mb-2">Testimonial Submitted!</p>
                  <p className="text-secondary text-sm">It will appear here once approved.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-accent/10 ring-2 ring-accent/20 flex items-center justify-center shrink-0">
                      {form.name ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent to-accent-dark text-white font-bold">
                          {getInitials(form.name)}
                        </div>
                      ) : (
                        <User size={22} className="text-muted" />
                      )}
                    </div>
                    <div className="text-xs text-muted">Your photo will be generated from your name</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 block">Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 block">Role</label>
                      <input
                        type="text"
                        value={form.role}
                        onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                        placeholder="Project Manager"
                        className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 block">Company</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        placeholder="Tech Corp"
                        className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 block">Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={form.text}
                      onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                      placeholder="Share your experience working with me..."
                      className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted/50 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !form.name.trim() || !form.text.trim()}
                    className="w-full py-4 bg-btn text-white rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {submitting ? (
                      <><Loader size={18} className="animate-spin" /> Submitting...</>
                    ) : (
                      'Submit Testimonial'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
