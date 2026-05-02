import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Mail, CheckCircle, Shield, Loader2, Copy, ExternalLink, User, MessageSquare, ArrowRight } from 'lucide-react';
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
    
    if (!email || !isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    
    setFormStatus('sending');
    
    try {
      await submitInquiry({ name, email, message });
      
      if (!WEB3FORMS_ACCESS_KEY) {
        throw new Error("Web3Forms access key is not configured.");
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
        throw new Error(result.message || "Failed to submit form.");
      }
    } catch (err) {
      setFormStatus('error');
      setErrorMessage(`Failed to send message: ${err instanceof Error ? err.message : 'Please check configuration.'}`);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile?.email || 'jvpaisan@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile?.email || 'jvpaisan@gmail.com'}`;
    }
  };

  // Form field configuration
  const formFields = [
    { name: 'name', label: 'Your Name', icon: User, type: 'text', placeholder: 'John Doe' },
    { name: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'john@example.com' },
    { name: 'message', label: 'Your Message', icon: MessageSquare, type: 'textarea', placeholder: 'Tell me about your project or inquiry...', rows: 4 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-accent/10 via-violet-5 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-rose-5 to-transparent rounded-full blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(14,165,233,0.05)_1px,_transparent_0)] bg-[size:40px_40px]" />
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 p-3 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all z-10"
            >
              <X size={20} />
            </button>

            <div className="relative flex flex-col lg:flex-row">
              {/* Left Sidebar */}
              <div className="w-full lg:w-80 p-10 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-slate-900" />
                <div className="absolute top-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
                <div className="absolute bottom-20 left-10 w-24 h-24 bg-violet-500/20 rounded-full blur-xl" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-violet-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-accent/30">
                    <Send size={28} />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">
                    Get In<br />
                    <span className="text-accent">Touch</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-8">
                    Have a project in mind? Let's create something amazing together.
                  </p>

                  <div className="w-16 h-1 bg-gradient-to-r from-accent to-violet-500 rounded-full mb-8" />
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Online & Ready</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Shield size={16} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Response Time</p>
                      <p className="text-sm font-bold text-white">{LESS_THAN_24}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Direct Email</p>
                    <a href={`mailto:${profile?.email || 'jvpaisan@gmail.com'}`} className="text-sm font-semibold text-white hover:text-accent transition-colors">
                      {profile?.email || 'jvpaisan@gmail.com'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Form */}
              <div className="flex-1 p-10 lg:p-12">
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                  <div className="mb-6">
                    <h4 className="text-2xl font-black text-primary mb-2">Send a Message</h4>
                    <p className="text-sm text-slate-500">Fill out the form below and I'll get back to you soon.</p>
                  </div>

                  {/* Fixed Form Fields - No overlap */}
                  <div className="space-y-5">
                    {formFields.map((field) => {
                      const Icon = field.icon;
                      const isTextarea = field.type === 'textarea';
                      
                      return (
                        <div key={field.name} className="space-y-2">
                          {/* Label above input - no overlap */}
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <Icon size={14} className="text-slate-400" />
                            {field.label}
                          </label>
                          
                          {isTextarea ? (
                            <textarea
                              name={field.name}
                              required
                              rows={field.rows}
                              placeholder={field.placeholder}
                              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:outline-none focus:border-accent focus:ring-0 transition-all text-sm font-medium resize-none"
                            />
                          ) : (
                            <input
                              type={field.type}
                              name={field.name}
                              required
                              placeholder={field.placeholder}
                              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:outline-none focus:border-accent focus:ring-0 transition-all text-sm font-medium"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Email Error */}
                  {emailError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      {emailError}
                    </motion.div>
                  )}

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
                      className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl"
                    >
                      <p className="text-xs text-slate-500 text-center font-semibold">Or contact directly:</p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={copyEmail}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 rounded-xl text-sm font-semibold transition-all border border-slate-200"
                        >
                          <Copy size={16} />
                          {copied ? 'Copied!' : 'Copy Email'}
                        </button>
                        <a
                          href={`mailto:${profile?.email || 'jvpaisan@gmail.com'}?subject=Portfolio Contact`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 rounded-xl text-sm font-semibold transition-all border border-slate-200"
                        >
                          <ExternalLink size={16} />
                          Email App
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button 
                    type="submit" 
                    disabled={formStatus === 'sending'}
                    className="group relative w-full py-5 bg-primary text-white rounded-2xl font-bold text-base overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: formStatus !== 'sending' ? 1.02 : 1 }}
                    whileTap={{ scale: formStatus !== 'sending' ? 0.98 : 1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute -inset-full top-0 left-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine transition-all duration-500" />
                    </div>

                    <span className="relative flex items-center justify-center gap-3">
                      {formStatus === 'sending' ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          SENDING...
                        </>
                      ) : formStatus === 'success' ? (
                        <>
                          <CheckCircle size={20} />
                          MESSAGE SENT!
                        </>
                      ) : (
                        <>
                          SEND MESSAGE
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </motion.button>

                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Shield size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">Your data is secure & encrypted</span>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
