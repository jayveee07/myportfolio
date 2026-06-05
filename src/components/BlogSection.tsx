import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useBlogPosts } from '../hooks/usePortfolioData';

export const BlogSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { data: items, isLoading } = useBlogPosts();

  return (
    <section ref={ref} id="blog" className="py-24 bg-surface-alt">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Blog</span>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-primary mt-3 mb-4">
              Latest Insights
            </h2>
            <p className="text-secondary max-w-xl mx-auto">
              Thoughts on development, data, and technology.
            </p>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {items?.map((post, index) => (
              <motion.a
                key={post.id}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="group bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                <div className="h-48 bg-gradient-to-br from-accent/20 to-violet-500/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-card/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-sm text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-primary mb-3 group-hover:text-accent transition-colors flex-1">
                    {post.title}
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-tag text-secondary text-xs font-semibold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-accent font-semibold text-sm group-hover:gap-2 transition-all">
                    Read More <ArrowUpRight size={16} />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
