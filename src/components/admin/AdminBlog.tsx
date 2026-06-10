import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ExternalLink, X, Loader, FileText, ImageUp } from 'lucide-react';
import { useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from '../../hooks/usePortfolioData';
import { getBlogPosts, uploadBlogImage, deleteStorageFileFromUrl, getBlogPostById } from '../../lib/supabase-data';
import type { BlogPost } from '../../types/portfolio';

const emptyForm = { title: '', excerpt: '', date: '', readTime: '', link: '', tags: '', imageUrl: '', content: '' };

export const AdminBlog = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: getBlogPosts,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
  });
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const deleteMutation = useDeleteBlogPost();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      readTime: post.readTime,
      link: post.link,
      tags: post.tags.join(', '),
      imageUrl: post.imageUrl || '',
      content: post.content || '',
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const oldUrl = form.imageUrl;
      const url = await uploadBlogImage(file);
      setForm(f => ({ ...f, imageUrl: url }));
      if (oldUrl) deleteStorageFileFromUrl(oldUrl).catch(() => {});
    } catch {
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    const oldUrl = form.imageUrl;
    setForm(f => ({ ...f, imageUrl: '' }));
    if (oldUrl) deleteStorageFileFromUrl(oldUrl).catch(() => {});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        date: form.date || new Date().toISOString().split('T')[0],
        readTime: form.readTime.trim() || '5 min read',
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        link: form.link.trim(),
        imageUrl: form.imageUrl || undefined,
        content: form.content.trim() || undefined,
      };

      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, post: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setShowModal(false);
    } catch {
      alert('Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-primary mb-2">Blog</h1>
          <p className="text-secondary font-bold">Manage your blog posts</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-all active:scale-95"
        >
          <Plus size={18} />
          New Post
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={24} className="animate-spin text-muted" />
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <div className="w-16 h-16 bg-surface-alt rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-muted" />
          </div>
          <h3 className="text-lg font-black text-primary mb-1">No Blog Posts</h3>
          <p className="text-sm font-bold text-secondary mb-6">Create your first blog post to share insights.</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-all"
          >
            <Plus size={18} />
            New Post
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-primary truncate">{post.title}</h3>
                  <div className="text-xs font-bold text-secondary mt-1">
                    {post.date} &middot; {post.readTime}
                  </div>
                  <p className="text-sm text-secondary mt-2 line-clamp-2">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-0.5 bg-surface-alt text-secondary text-[11px] font-bold rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-surface-alt text-secondary rounded-xl hover:bg-surface-alt/80 transition-all"
                    title="Open link"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => openEdit(post)}
                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all active:scale-95"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this blog post?')) return;
                      try {
                        const fullPost = await getBlogPostById(post.id);
                        if (fullPost?.imageUrl) {
                          await deleteStorageFileFromUrl(fullPost.imageUrl).catch(() => {});
                        }
                        deleteMutation.mutate(post.id, {
                          onError: () => alert('Failed to delete blog post. Check RLS policies or console for details.'),
                        });
                      } catch {
                        deleteMutation.mutate(post.id, {
                          onError: () => alert('Failed to delete blog post.'),
                        });
                      }
                    }}
                    className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={() => { if (!saving) setShowModal(false); }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[90vh] bg-surface rounded-3xl shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 z-10 p-8 border-b border-border bg-surface flex items-center justify-between">
              <h3 className="text-lg font-black text-primary">
                {editing ? 'Edit Post' : 'New Blog Post'}
              </h3>
              <button
                onClick={() => { if (!saving) setShowModal(false); }}
                className="p-2 hover:bg-surface-alt rounded-xl text-secondary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Blog post title"
                  className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">Excerpt *</label>
                <textarea
                  required
                  rows={3}
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Brief description of the post"
                  className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">Read Time</label>
                  <input
                    type="text"
                    value={form.readTime}
                    onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                    placeholder="5 min read"
                    className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">Content</label>
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write your full blog post content here..."
                  className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted resize-y"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">Link</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                  placeholder="https://example.com/my-post (optional)"
                  className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="React, Firebase, Full-Stack"
                  className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">Image</label>
                {form.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img src={form.imageUrl} alt="Preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={saving}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-3 w-full h-24 bg-surface-alt border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-all">
                    {uploading ? (
                      <Loader size={18} className="animate-spin text-muted" />
                    ) : (
                      <div className="flex items-center gap-3 text-muted">
                        <ImageUp size={20} />
                        <span className="text-sm font-bold">Upload Image</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>
              <button
                type="submit"
                disabled={saving || !form.title.trim() || !form.excerpt.trim()}
                className="w-full py-4 bg-accent text-white rounded-2xl font-bold hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {saving ? (
                  <><Loader size={18} className="animate-spin" /> Saving...</>
                ) : (
                  editing ? 'Update Post' : 'Create Post'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
