import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, ExternalLink, Sparkles, Loader } from 'lucide-react';
import { useBlogPost } from '../hooks/usePortfolioData';
import { supabase } from '../lib/supabase';

interface ArticleResult {
  url: string;
  title: string;
  snippet: string;
}

interface BlogDetailProps {
  postId: string;
  onBack: () => void;
}

export const BlogDetail = ({ postId, onBack }: BlogDetailProps) => {
  const { data: post, isLoading } = useBlogPost(postId);
  const [aiArticle, setAiArticle] = useState<ArticleResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!post?.content || aiArticle || aiLoading || aiError) return;
    setAiLoading(true);
    supabase.functions.invoke('find-related-article', {
      body: { title: post.title, content: post.content },
    })
      .then(({ data, error }) => {
        if (error || !data?.article) {
          setAiError(true);
        } else {
          setAiArticle(data.article);
        }
      })
      .catch(() => setAiError(true))
      .finally(() => setAiLoading(false));
  }, [post?.content]);

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

        <div className="text-secondary leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        <div className="mt-12 pt-8 border-t border-border space-y-4">
          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:underline text-sm font-semibold"
            >
              <ExternalLink size={16} />
              View original article
            </a>
          )}

          {aiLoading && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader size={14} className="animate-spin" />
              Finding related article...
            </div>
          )}

          {aiArticle && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                AI Recommended
              </div>
              <a
                href={aiArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <h4 className="font-bold text-primary group-hover:text-accent transition-colors mb-1">
                  {aiArticle.title}
                </h4>
                <p className="text-sm text-muted">{aiArticle.snippet}</p>
              </a>
            </div>
          )}

          {aiError && !aiArticle && !post.link && (
            <p className="text-sm text-muted">No related article found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
