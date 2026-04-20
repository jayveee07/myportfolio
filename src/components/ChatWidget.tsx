import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, MessageSquare, User, Check, CheckCheck, Mail, Trash2 } from 'lucide-react';
import { 
  sendMessage, 
  subscribeToMessages, 
  startConversation, 
  subscribeToConversation,
  editMessage,
  deleteMessage,
  setVisitorTypingStatus,
  Message as MessageType,
  Conversation
} from '../lib/messaging';
import { getVisitorIp } from '../lib/ipService';
import { auth, signInAsVisitor } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Pencil } from 'lucide-react';

interface ChatWidgetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  adminName: string;
}

// Variable to track if the login happened in the current page session (doesn't survive refresh)
let isFreshLogin = false;

export const ChatWidget = ({ isOpen, onOpen, onClose, adminName }: ChatWidgetProps) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorAvatar, setVisitorAvatar] = useState<string | null>(null);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
  const [step, setStep] = useState<'info' | 'chat'>('info');
  const [isChatReady, setIsChatReady] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deleteOptionsId, setDeleteOptionsId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [visitorIp, setVisitorIp] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    if (input.trim() && currentConvoId) {
      setVisitorTypingStatus(currentConvoId, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setVisitorTypingStatus(currentConvoId, false);
      }, 3000);
    }
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [input, currentConvoId]);

  useEffect(() => {
    // Fetch IP on mount
    getVisitorIp().then(setVisitorIp);

    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log("Auth State Changed:", u ? `User: ${u.uid}` : "Logged out");
      setUser(u);
      
      const savedName = localStorage.getItem('visitor_name');
      const savedEmail = localStorage.getItem('visitor_email');
      const savedAvatar = localStorage.getItem('visitor_avatar');
      const savedConvoId = localStorage.getItem('visitor_convo_id');

      // Only auto-resume in-widget if this specific tab session 
      // just authorized (isFreshLogin)
      if (u && isFreshLogin && savedName && savedEmail) {
        setVisitorName(savedName);
        setVisitorEmail(savedEmail);
        if (savedAvatar) setVisitorAvatar(savedAvatar);
        if (savedConvoId) setCurrentConvoId(savedConvoId);
        setStep('chat');
        // Removed redundant startConversation call here as handleStart manages the sequence
      } else if (!isFreshLogin) {
        // Ensure we always default to info step on fresh load
        setStep('info');
        setIsChatReady(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (step === 'chat' && isChatReady && (currentConvoId || visitorEmail)) {
      const id = currentConvoId || `vst_${visitorEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
      const unsub = subscribeToMessages(id, (msgs) => {
        setMessages(msgs);
      });
      return () => unsub();
    }
  }, [step, isChatReady, currentConvoId, visitorEmail]);

  useEffect(() => {
    if (step === 'chat' && isChatReady && (currentConvoId || visitorEmail)) {
      const id = currentConvoId || `vst_${visitorEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
      const unsub = subscribeToConversation(id, (convo) => {
        setAdminTyping(!!convo.adminTyping);
      });
      return () => unsub();
    }
  }, [step, isChatReady, currentConvoId, visitorEmail]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = visitorEmail.trim();
    if (!email) return;
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setError(null);

    try {
      console.log("Starting chat auth flow for:", email);
      // Mark session as active in this page load
      isFreshLogin = true;
      
      const effectiveName = visitorName.trim() || email.split('@')[0];
      // Use generated initial avatar if none uploaded
      const avatar = visitorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(effectiveName)}&background=3b82f6&color=fff&bold=true`;
      
      localStorage.setItem('visitor_name', effectiveName);
      localStorage.setItem('visitor_email', visitorEmail);
      localStorage.setItem('visitor_avatar', avatar);
      
      if (!auth.currentUser) {
        console.log("Signing in as visitor anonymously...");
        await signInAsVisitor();
        console.log("Sign-in successful, UID:", auth.currentUser?.uid);
      } else {
        console.log("Already signed in, UID:", auth.currentUser.uid);
      }

      console.log("Establishing conversation record...");
      // Ensure conversation exists and get its stable ID
      const convoId = await startConversation({ 
        name: effectiveName, 
        email: visitorEmail,
        ip: visitorIp
      });
      console.log("Conversation established with ID:", convoId);
      
      localStorage.setItem('visitor_convo_id', convoId);
      setCurrentConvoId(convoId);
      setVisitorAvatar(avatar);
      setVisitorName(effectiveName);
      // Robust delay for firestore rules propagation
      console.log("Waiting for rules propagation...");
      await new Promise(r => setTimeout(r, 1500));
      setIsChatReady(true);
      setStep('chat');
      console.log("Chat setup complete.");
    } catch (err: any) {
      console.error("Chat Auth Error Detail:", {
        code: err.code,
        message: err.message,
        stack: err.stack,
        user: auth.currentUser?.uid
      });
      if (err.code === 'auth/admin-restricted-operation') {
        setError("auth-disabled");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection.");
      } else {
        // Fallback to specific error message if available
        setError(err.message || "Something went wrong. Please check your Firebase console or try again.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024) {
        setError("Image too large. Please use a very small avatar (under 100KB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVisitorAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const text = input.trim();
    setInput('');
    
    // conversation is checked in handleStart, but guard here too
    const convoId = currentConvoId || `vst_${visitorEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
    
    await sendMessage(convoId, text, { 
      name: visitorName || 'Guest',
      email: visitorEmail,
      ip: visitorIp,
      avatar: visitorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(visitorName || 'G')}&background=3b82f6&color=fff`
    });
  };

  const handleStartEdit = (msg: MessageType) => {
    // Only allow editing own messages (by email)
    if (msg.senderId !== visitorEmail) return;
    
    const created = msg.createdAt?.toMillis ? msg.createdAt.toMillis() : Date.now();
    const now = Date.now();
    
    if (now - created > 10 * 60 * 1000) {
      alert("You can only edit messages sent in the last 10 minutes.");
      return;
    }
    
    setEditingMessageId(msg.id || null);
    setEditInput(msg.text);
  };

  const handleSaveEdit = async () => {
    const convoId = currentConvoId || `vst_${visitorEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
    if (!convoId || !editingMessageId || !editInput.trim()) return;
    try {
      await editMessage(convoId, editingMessageId, editInput.trim());
      setEditingMessageId(null);
      setEditInput('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (msgId: string, mode: 'everyone' | 'me') => {
    const convoId = currentConvoId || `vst_${visitorEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
    if (!convoId) return;
    
    try {
      await deleteMessage(convoId, msgId, mode);
      setDeleteOptionsId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={onOpen}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 flex items-center justify-center hover:bg-slate-800 transition-all group"
          >
            <MessageSquare size={24} className="group-hover:rotate-6 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-white flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isOpen) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 border border-slate-200/60 flex flex-col overflow-hidden backdrop-blur-xl"
          >
          {/* Header */}
          <div className="bg-primary px-5 py-6 text-white flex items-center justify-between relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 blur-3xl rounded-full" />
            
            <div className="flex items-center gap-4 relative z-10 w-full pr-10">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-sm border border-white/20 overflow-hidden shrink-0">
                {step === 'chat' && visitorAvatar ? (
                  <img src={visitorAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  adminName.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                {/* Name header removed as requested */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${adminTyping ? 'bg-accent animate-pulse' : 'bg-green-400'} rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]`} />
                  <span className="text-[10px] text-white/70 font-mono font-medium uppercase tracking-[0.1em]">
                    {adminTyping ? `${adminName.split(' ')[0]} is typing...` : 'Online & Ready'}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all active:scale-95 group absolute right-5 top-1/2 -translate-y-1/2 z-20"
            >
              <X size={18} className="text-white/70 group-hover:text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden relative bg-slate-50/80">
            {step === 'info' ? (
              <div className="p-8 h-full flex flex-col justify-center text-center">
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <MessageSquare size={32} />
                </div>
                <h4 className="text-2xl font-extrabold text-primary mb-3 tracking-tight">Need a Hand?</h4>
                <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">I'm usually around to chat about projects, data operations, or roles.</p>
                <form onSubmit={handleStart} className="space-y-3">
                  <div className="flex justify-center mb-2">
                    <label className="relative group cursor-pointer inline-block">
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-white/50 hover:border-accent transition-colors">
                        {visitorAvatar ? (
                          <img src={visitorAvatar} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <User className="w-8 h-8 text-slate-300 mx-auto" />
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Upload</span>
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden"
                      />
                    </label>
                  </div>
                  {/* Name field removed as requested */}
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="Your Email Address"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-sm font-medium"
                    />
                  </div>
                  {error === "auth-disabled" ? (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-left">
                      <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2">⚠️ Action Required</p>
                      <p className="text-xs text-amber-800 leading-relaxed mb-3">
                        Anonymous Auth is disabled in your Firebase console. Please enable it to allow guest chat.
                      </p>
                      <a 
                        href="https://console.firebase.google.com/project/myportfolio-493713/authentication/providers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-white bg-amber-600 px-3 py-1.5 rounded-lg inline-block hover:bg-amber-700 transition-colors"
                      >
                        Enable in Console →
                      </a>
                    </div>
                  ) : error && (
                    <div className="bg-red-50 text-red-500 text-[10px] font-bold p-2.5 rounded-lg border border-red-100 leading-tight">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all text-sm"
                  >
                    Start Chat
                  </button>
                </form>
              </div>
            ) : (
              <div 
                ref={scrollRef}
                className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth"
              >
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Say hello to start the conversation</p>
                  </div>
                )}
                {messages
                  .filter(m => !m.deletedBy?.includes(visitorEmail))
                  .map((msg, i) => (
                  <div 
                    key={msg.id || i} 
                    className={`flex items-end gap-2 ${msg.senderId === visitorEmail ? 'justify-end' : 'justify-start'} group`}
                  >
                    {msg.senderId !== visitorEmail && (
                      <div className="w-8 h-8 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-white shadow-sm self-start mt-2">
                        <img 
                          src={msg.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || 'A')}&background=0f172a&color=fff`} 
                          alt="Sender" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div className={msg.senderId === user?.uid 
                      ? 'flex flex-col items-end max-w-[80%]' 
                      : 'flex flex-col items-start max-w-[80%]'
                    }>
                      {editingMessageId === msg.id ? (
                        <div className="bg-white border border-accent p-2 rounded-2xl flex flex-col gap-2 w-full shadow-lg min-w-[200px]">
                          <textarea
                            autoFocus
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-0 font-medium resize-none min-h-[60px]"
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingMessageId(null)}
                              className="p-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleSaveEdit}
                              className="p-1 px-3 bg-accent text-white rounded-lg text-[10px] font-bold uppercase tracking-widest"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={`relative px-4 py-2.5 text-sm font-medium shadow-sm transition-all group-hover:shadow-md ${
                          msg.isDeleted ? 'bg-slate-100 text-slate-400 italic' :
                          msg.senderId === visitorEmail 
                            ? 'bg-primary text-white rounded-2xl rounded-tr-none' 
                            : 'bg-white border border-slate-200/60 text-slate-700 rounded-2xl rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed">{msg.isDeleted ? "This message was deleted" : msg.text}</p>
                          {!msg.isDeleted && (
                            <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 ${
                              msg.senderId === visitorEmail ? '-left-20' : '-right-10'
                            }`}>
                              {msg.senderId === visitorEmail && (
                                <button 
                                  onClick={() => handleStartEdit(msg)}
                                  className="p-1.5 bg-white text-slate-400 rounded-full border border-slate-100 shadow-sm hover:text-accent"
                                  title="Edit"
                                >
                                  <Pencil size={12} />
                                </button>
                              )}
                              <button 
                                onClick={() => setDeleteOptionsId(deleteOptionsId === msg.id ? null : msg.id!)}
                                className="p-1.5 bg-white text-slate-400 rounded-full border border-slate-100 shadow-sm hover:text-red-500"
                                title="Remove"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}

                          {/* Delete Options Popover */}
                          <AnimatePresence>
                            {deleteOptionsId === msg.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className={`absolute z-30 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 flex flex-col gap-1 min-w-[160px] ${
                                  msg.senderId === visitorEmail ? 'right-0 top-full mt-2' : 'left-0 top-full mt-2'
                                }`}
                              >
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">Message Options</p>
                                {msg.senderId === visitorEmail && (
                                  <button
                                    onClick={() => handleDelete(msg.id!, 'everyone')}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-between"
                                  >
                                    Unsend for everyone
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(msg.id!, 'me')}
                                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between"
                                >
                                  Remove for you
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  onClick={() => setDeleteOptionsId(null)}
                                  className="w-full text-left px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      
                      <div className={`text-[9px] mt-1.5 flex items-center gap-1.5 font-mono ${
                        msg.senderId === visitorEmail ? 'text-white/60' : 'text-slate-400'
                      }`}>
                        {msg.isEdited && (
                          <span className="font-bold uppercase italic tracking-widest">Edited</span>
                        )}
                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                        {msg.senderId === visitorEmail && <CheckCheck size={10} className="text-accent" />}
                      </div>
                    </div>
                    {msg.senderId === visitorEmail && (
                      <div className="w-8 h-8 rounded-lg bg-accent/10 overflow-hidden shrink-0 border border-white shadow-sm self-end mb-2">
                        <img 
                          src={msg.senderAvatar || (visitorAvatar ? visitorAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(visitorName || 'G')}&background=3b82f6&color=fff`)} 
                          alt="Me" 
                          referrerPolicy="no-referrer" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {adminTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-slate-400"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-white shadow-sm flex items-center justify-center">
                       <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=0f172a&color=fff`} 
                          alt="Typing" 
                          className="w-full h-full object-cover" 
                        />
                    </div>
                    <div className="bg-white border border-slate-200/60 rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-1.5 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest ml-1">{adminName.split(' ')[0]} is typing...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {step === 'chat' && (
            <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-100/80 border-none rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-accent/10 focus:outline-none font-medium transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-3 bg-primary text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-primary/10"
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="flex justify-center">
                <p className="text-[9px] text-slate-400 font-mono tracking-tight uppercase">Always secure & encrypted</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </>
);
};
