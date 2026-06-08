import { useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, ExternalLink } from 'lucide-react';
import { useBlogPost } from '../hooks/usePortfolioData';

interface BlogDetailProps {
  postId: string;
  onBack: () => void;
}

export const BlogDetail = ({ postId, onBack }: BlogDetailProps) => {
  const { data: post, isLoading } = useBlogPost(postId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-alt flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-surface-alt flex flex-col items-center justify-center gap-4">
        <p className="text-secondary text-lg">Post not found</p>
        <button onClick={onBack} className="text-accent hover:underline text-sm">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-secondary hover:text-accent transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Back to Blog</span>
        </button>

        {post.imageUrl && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img src={post.imageUrl} alt={post.title} className="w-full h-72 object-cover" />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted mb-4">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {post.readTime}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-tag text-secondary text-xs font-semibold rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="prose prose-lg max-w-none text-secondary leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {post.link && (
          <div className="mt-12 pt-8 border-t border-border">
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:underline text-sm font-semibold"
            >
              <ExternalLink size={16} />
              View original article
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
