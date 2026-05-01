import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Mail, MapPin, CheckCircle, Shield, Loader2, Copy, ExternalLink } from 'lucide-react';
import { submitInquiry } from '../lib/firebase';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

const LESS_THAN_24 = "< 24 Hours";

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const ContactModal = ({ isOpen, onClose, profile }: ContactModalProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const WEB3FORMS_ACCESS_KEY = 'f1122fde-ca48-4c2a-8652-c162845b2a33';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setEmailError('');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const message = formData.get('message') as string;
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    
    setFormStatus('sending');
    
    try {
      // Step 1: Backup to Firestore so you never lose a message
      await submitInquiry({ name, email, message });
      
      // Step 2: Send email using Web3Forms
      if (!WEB3FORMS_ACCESS_KEY) {
        throw new Error("Web3Forms access key is not configured. Please check ContactModal.tsx.");
      }

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: name,
          email: email,
          message: message,
          from_name: "Portfolio Inquiry",
          subject: `New Inquiry from ${name}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFormStatus('success');
        form.reset();
        setTimeout(() => {
          setFormStatus('idle');
          onClose();
        }, 3000);
      } else {
        throw new Error(result.message || "Failed to submit form to Web3Forms.");
      }
    } catch (err) {
      setFormStatus('error');
      setErrorMessage(`Failed to send message: ${err instanceof Error ? err.message : 'Please check Web3Forms configuration or your network connection.'}`);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile?.email || 'jvpaisan@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      window.location.href = `mailto:${profile?.email || 'jvpaisan@gmail.com'}`;
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
                  Response Latency:<br /><span className="text-primary">{LESS_THAN_24}</span>
                </p>
              </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 p-10">
              <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-primary transition-colors">
                <X size={24} />
              </button>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Identity</label>
                  <input type="text" name="name" required placeholder="Your Full Name" className="w-full px-5 py-4 rounded-xl border border-line bg-white focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Return Path</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="email@domain.com" 
                    className={`w-full px-5 py-4 rounded-xl border bg-white focus:outline-none focus:ring-1 transition-all text-sm font-bold ${emailError ? 'border-red-300 focus:ring-red-200' : 'border-line focus:ring-accent'}`}
                    onChange={() => setEmailError('')}
                  />
                  {emailError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {emailError}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Message Payload</label>
                  <textarea name="message" required rows={4} placeholder="Describe your inquiry..." className="w-full px-5 py-4 rounded-xl border border-line bg-white focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm font-bold resize-none" />
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                {/* Fallback Options */}
                {formStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3"
                  >
                    <p className="text-xs text-slate-500 text-center">Or contact directly:</p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={copyEmail}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-all"
                      >
                        <Copy size={16} />
                        {copied ? 'Copied!' : 'Copy Email'}
                      </button>
                      <a
                        href={`mailto:${profile?.email || 'jvpaisan@gmail.com'}?subject=Portfolio Contact`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-all"
                      >
                        <ExternalLink size={16} />
                        Open Email App
                      </a>
                    </div>
                  </motion.div>
                )}

                <button 

                  type="submit" 
                  disabled={formStatus === 'sending'} 
                  className="ink-button !w-full h-14 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formStatus === 'sending' ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      TRANSMITTING...
                    </span>
                  ) : formStatus === 'success' ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle size={18} />
                      DISPATCHED
                    </span>
                  ) : (
                    'EXECUTE DISPATCH'
                  )}
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
