import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Share2, Shield, ArrowUp } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.shiftKey) {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("jvpaisan@gmail.com");
    setCopyFeedback(true);
    setTimeout(() => {
      setCopyFeedback(false);
      setShowMenu(false);
    }, 2000);
  };

  const sharePortfolio = () => {
    if (navigator.share) {
      navigator.share({
        title: "John Vince Paisan - Portfolio",
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert("Link copied to clipboard!");
    }
    setShowMenu(false);
  };

  return (
    <div className={`relative ${className}`} onMouseLeave={() => setShowMenu(false)}>
      <motion.button
        onClick={handleScrollToTop}
        onContextMenu={handleContextMenu}
        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
        whileTap={{ scale: 0.95 }}
        className={`relative z-10 flex items-center justify-center rounded-xl overflow-hidden bg-primary shadow-lg shadow-primary/20 group ${sizes[size]}`}
      >
        {/*
          User: Please replace '/logo.png' with the actual path to your logo file in the public folder.
        */}
        <img 
          src="/logo.png" 
          alt="John Vince Paisan Logo" 
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          onError={(e) => {
            // Fallback to stylized text logo if image fails
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'text-white', 'font-black');
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.innerHTML = 'VP';
            }
          }}
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 top-full mt-4 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2"
          >
            <button 
              onClick={copyEmail}
              className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <Copy size={14} className="text-accent" /> {copyFeedback ? 'Copied!' : 'Copy Email'}
              </div>
            </button>
            <button 
              onClick={sharePortfolio}
              className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <Share2 size={14} className="text-accent" /> Share Site
              </div>
            </button>
            <div className="h-px bg-slate-50 my-1" />
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors md:hidden"
            >
              <div className="flex items-center gap-2">
                <ArrowUp size={14} className="text-accent" /> Scroll Top
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
