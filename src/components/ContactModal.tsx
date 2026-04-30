import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Mail, MapPin, CheckCircle, Shield } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export const ContactModal = ({ isOpen, onClose, profile }: ContactModalProps) => {
  if (isOpen) console.log('ContactModal: System Render Active');
  
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('sending');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      // Replace 'your-form-id' with your actual Formspree ID
      const response = await fetch('https://formspree.io/f/your-form-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setFormStatus('success');
        (e.target as HTMLFormElement).reset();
        setTimeout(() => {
          setFormStatus('idle');
          onClose();
        }, 3000);
      } else {
        setFormStatus('error');
      }
    } catch (err) {
      setFormStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/40 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-line flex flex-col md:flex-row"
          >
            {/* Sidebar info */}
            <div className="w-full md:w-72 bg-slate-50 p-10 border-b md:border-b-0 md:border-r border-line flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-primary/20">
                  <Mail size={20} />
                </div>
                <h3 className="text-2xl font-black text-primary uppercase tracking-tighter mb-4">Secure<br />Dispatch</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Encrypted message transmission protocol.</p>
              </div>
              
              <div className="space-y-6 mt-12 md:mt-0">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">System Online</span>
                </div>
                <p className="text-[10px] font-mono font-bold text-slate-300 leading-tight uppercase tracking-widest">
                  Response Latency:<br /><span className="text-primary">&lt; 24 Hours</span>
                </p>
              </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 p-10">
              <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-primary transition-colors">
                <X size={24} />
              </button>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Identity</label>
                  <input type="text" name="name" required placeholder="Your Full Name" className="w-full px-5 py-4 rounded-xl border border-line bg-white focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Return Path</label>
                  <input type="email" name="email" required placeholder="email@domain.com" className="w-full px-5 py-4 rounded-xl border border-line bg-white focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Message Payload</label>
                  <textarea name="message" required rows={4} placeholder="Describe your inquiry..." className="w-full px-5 py-4 rounded-xl border border-line bg-white focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm font-bold resize-none" />
                </div>

                <button type="submit" disabled={formStatus === 'sending'} className="ink-button !w-full h-14 mt-4">
                  {formStatus === 'sending' ? 'TRANSMITTING...' : formStatus === 'success' ? 'DISPATCHED' : 'EXECUTE DISPATCH'}
                </button>
                
                <p className="text-center text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest mt-4">
                  <Shield size={10} className="inline mr-1" /> Verified Secure Connection
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};