import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, MessageSquare, User, Check, CheckCheck, Mail, Trash2, Sparkles, Ban } from 'lucide-react';
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
import { auth, signInAsVisitor, recordVisit } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Pencil } from 'lucide-react';

interface ChatWidgetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  adminName: string;
  isShifted?: boolean;
}

// Variable to track if the login happened in the current page session (doesn't survive refresh)
let isFreshLogin = false;

export const ChatWidget = ({ isOpen, onOpen, onClose, adminName, isShifted }: ChatWidgetProps) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorAvatar, setVisitorAvatar] = useState<string | null>(null);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
  const [step, setStep] = useState<'info' | 'chat'>('info');
  const [isChatReady, setIsChatReady] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deleteOptionsId, setDeleteOptionsId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [visitorIp, setVisitorIp] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ 
    type: 'delete' | 'discard-edit', 
    onConfirm: () => void, 
    title: string, 
    message: string 
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  const [isTypingLocal, setIsTypingLocal] = useState(false);

  useEffect(() => {
    if (input.trim() && currentConvoId) {
      if (!isTypingLocal) {
        setIsTypingLocal(true);
        setVisitorTypingStatus(currentConvoId, true);
      }
      
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setIsTypingLocal(false);
        setVisitorTypingStatus(currentConvoId, false);
      }, 5000);
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
        setIsBlocked(!!convo.isBlocked);
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
      
      // Re-trigger visit recording with the newly entered email
      recordVisit(window.location.pathname);
      
      // Implementation follows user request: Refresh anonymous session on start
      if (!auth.currentUser || auth.currentUser.isAnonymous) {
        console.log("Initializing/Refreshing visitor identity...");
        await signInAsVisitor();
        console.log("Identity established, UID:", auth.currentUser?.uid);
      } else {
        console.log("Admin session detected, bypassing visitor identity refresh. UID:", auth.currentUser.uid);
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
    if (!input.trim() || !user || isBlocked) return;

    const text = input.trim();
    setInput('');
    
    // conversation is checked in handleStart, but guard here too
    const convoId = currentConvoId || `vst_${visitorEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
    console.log("ChatWidget: handleSend using ID", convoId, "Auth status:", !!auth.currentUser);
    
    try {
      await sendMessage(convoId, text, { 
        name: visitorName || 'Guest',
        email: visitorEmail,
        ip: visitorIp,
        avatar: visitorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(visitorName || 'G')}&background=3b82f6&color=fff`
      });
    } catch (err: any) {
      console.error("Failed to send message:", err);
      let errorMsg = "Something went wrong. Please try again.";
      
      try {
        const detail = JSON.parse(err.message);
        console.error("Detailed Chat Error:", detail);
        errorMsg = `Permission Denied: ${detail.operationType} on ${detail.path}`;
      } catch {
        errorMsg = err.message || errorMsg;
      }
      
      setError(errorMsg);
      // Automatically clear message-related error after 5s
      setTimeout(() => setError(null), 5000);
    }
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

  const handleDiscardEdit = () => {
    if (editInput.trim() !== messages.find(m => m.id === editingMessageId)?.text) {
      setConfirmModal({
        type: 'discard-edit',
        title: 'Discard Changes?',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        onConfirm: () => {
          setEditingMessageId(null);
          setEditInput('');
          setConfirmModal(null);
        }
      });
    } else {
      setEditingMessageId(null);
      setEditInput('');
    }
  };

  const handleSaveEdit = async () => {
    const convoId = currentConvoId || `vst_${visitorEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
    if (!convoId || !editingMessageId || !editInput.trim()) return;
    try {
      await editMessage(convoId, editingMessageId, editInput.trim());
      setEditingMessageId(null);
      setEditInput('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (msgId: string, mode: 'everyone' | 'me') => {
    const convoId = currentConvoId || `vst_${visitorEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
    if (!convoId) return;
    
    setConfirmModal({
      type: 'delete',
      title: mode === 'everyone' ? 'Unsend Message?' : 'Remove for Me?',
      message: mode === 'everyone' 
        ? 'This will remove the message for both yourself and the admin. This action cannot be undone.' 
        : 'This will hide the message from your chat history. The admin will still be able to see it.',
      onConfirm: async () => {
        try {
          await deleteMessage(convoId, msgId, mode);
          setDeleteOptionsId(null);
          setConfirmModal(null);
        } catch (err: any) {
          setError(err.message);
          setConfirmModal(null);
        }
      }
    });
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
            className={`fixed ${isShifted ? 'bottom-24' : 'bottom-6'} right-6 w-14 h-14 bg-primary text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[300] flex items-center justify-center hover:bg-slate-800 transition-all duration-300 group`}
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
            className={`fixed ${isShifted ? 'bottom-24' : 'bottom-6'} right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[620px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-[300] border border-slate-200/50 flex flex-col overflow-hidden transition-all duration-300`}
          >
          {/* Header */}
          <div className="bg-primary px-6 py-8 text-white flex items-center justify-between relative overflow-hidden shrink-0">
            {/* Subtle background glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/25 blur-3xl rounded-full" />
            
            <div className="flex items-center gap-4 relative z-10 w-full pr-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center font-bold text-base border border-white/20 overflow-hidden shrink-0 shadow-inner">
                {step === 'chat' && visitorAvatar ? (
                  <img src={visitorAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-accent to-blue-600">
                    <MessageSquare size={20} className="text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-lg leading-tight tracking-tight truncate">
                  {step === 'chat' ? (visitorName || 'Guest') : "Chat Support"}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`w-2 h-2 ${adminTyping ? 'bg-accent animate-pulse' : 'bg-green-400'} rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]`} />
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-[0.15em] font-mono">
                    {adminTyping ? 'Admin is typing...' : 'Active Now'}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all active:scale-95 group absolute right-5 top-1/2 -translate-y-1/2 z-20"
            >
              <X size={20} className="text-white/60 group-hover:text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden relative bg-slate-50/50">
            {step === 'info' ? (
              <div className="p-8 h-full flex flex-col justify-center">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-sm border border-accent/20">
                    <MessageSquare size={36} />
                  </div>
                  <h4 className="text-3xl font-extrabold text-primary mb-3 tracking-tight">Let's Talk.</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[240px] mx-auto">
                    I'm usually online and ready to chat about projects or data.
                  </p>
                </div>

                <form onSubmit={handleStart} className="space-y-5">
                  <div className="flex flex-col items-center gap-4">
                    <label className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-white hover:border-accent hover:bg-accent/5 transition-all duration-300">
                        {visitorAvatar ? (
                          <img src={visitorAvatar} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <User className="w-10 h-10 text-slate-300 mx-auto transition-transform group-hover:scale-110" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Your Photo</span>
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil size={12} className="text-accent" />
                      </div>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" />
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={visitorEmail}
                        onChange={(e) => setVisitorEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-sm font-bold placeholder:text-slate-300 shadow-sm"
                      />
                    </div>

                    {error === "auth-disabled" ? (
                      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-left">
                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.1em] mb-2 px-1">⚠️ Action Required</p>
                        <p className="text-xs text-amber-800 leading-relaxed mb-4 px-1">
                          Guest access is currently restricted. Please check back later or use a verified account.
                        </p>
                      </div>
                    ) : error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 text-red-600 text-[11px] font-bold p-3.5 rounded-xl border border-red-100 flex items-center gap-3"
                      >
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] mt-2 active:shadow-inner"
                    >
                      Start messaging
                    </button>
                    
                    <p className="text-[10px] text-slate-400 text-center font-mono uppercase tracking-tight">🔒 AES-256 Encrypted Session</p>
                  </div>
                </form>
              </div>
            ) : (
                <div 
                  ref={scrollRef}
                  className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth"
                >
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Say hello to start the conversation
                      </p>
                    </div>
                  )}
                  {messages
                    .filter(m => !m.deletedBy?.includes(visitorEmail))
                    .map((msg, i) => (
                      <div 
                        key={msg.id || i} 
                        className={`flex items-end gap-3 ${msg.senderId === visitorEmail ? 'justify-end' : 'justify-start'} group`}
                      >
                        {msg.senderId !== visitorEmail && (
                        <div className="w-9 h-9 rounded-2xl bg-white overflow-hidden shrink-0 border border-slate-200 shadow-sm self-start mt-1 flex items-center justify-center">
                          <img 
                            src={msg.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || 'A')}&background=0f172a&color=fff`} 
                            alt="Sender" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                      <div className={msg.senderId === visitorEmail 
                        ? 'flex flex-col items-end max-w-[85%]' 
                        : 'flex flex-col items-start max-w-[85%]'
                      }>
                        {editingMessageId === msg.id ? (
                          <div className="bg-white border border-accent p-3 rounded-3xl flex flex-col gap-3 w-full shadow-2xl min-w-[240px]">
                            <textarea
                              autoFocus
                              value={editInput}
                              onChange={(e) => setEditInput(e.target.value)}
                              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/10 font-bold resize-none min-h-[80px] shadow-inner"
                            />
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={handleDiscardEdit}
                                className="p-1 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                              >
                                Discard
                              </button>
                              <button 
                                onClick={handleSaveEdit}
                                className="p-1 px-5 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
                              >
                                Update
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`relative px-5 py-3.5 text-[13px] font-bold shadow-sm transition-all group-hover:shadow-md hover:scale-[1.01] overflow-hidden ${
                            msg.isDeleted ? 'bg-slate-100 text-slate-400 italic font-medium' :
                            msg.senderId === visitorEmail 
                              ? 'bg-primary text-white rounded-[1.5rem] rounded-tr-[0.25rem]' 
                              : 'bg-white border border-slate-200 text-slate-700 rounded-[1.5rem] rounded-tl-[0.25rem]'
                          }`}>
                            <p className="leading-[1.6] whitespace-pre-wrap">{msg.isDeleted ? "This message was deleted" : msg.text}</p>
                            
                            {/* Options indicators */}
                            {!msg.isDeleted && (
                              <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 ${
                                msg.senderId === visitorEmail ? '-left-24 sm:-left-24' : '-right-24 sm:-right-24'
                              }`}>
                                {msg.senderId === visitorEmail && (
                                  <button 
                                    onClick={() => handleStartEdit(msg)}
                                    className="w-8 h-8 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-xl flex items-center justify-center hover:text-accent hover:scale-110 active:scale-95 transition-all"
                                    title="Edit"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => setDeleteOptionsId(deleteOptionsId === msg.id ? null : msg.id!)}
                                  className="w-8 h-8 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-xl flex items-center justify-center hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
                                  title="Remove"
                                >
                                  <Trash2 size={14} />
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
                                  className={`absolute z-30 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 flex flex-col gap-1 min-w-[180px] ${
                                    msg.senderId === visitorEmail ? 'right-0 top-full mt-3' : 'left-0 top-full mt-3'
                                  }`}
                                >
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] px-3 py-2 border-b border-slate-50 mb-1">Moderation</p>
                                  {msg.senderId === visitorEmail && (
                                    <button
                                      onClick={() => handleDelete(msg.id!, 'everyone')}
                                      className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                                    >
                                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                      Unsend (Global)
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDelete(msg.id!, 'me')}
                                    className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                                  >
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                    Remove for me
                                  </button>
                                  <button
                                    onClick={() => setDeleteOptionsId(null)}
                                    className="w-full text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 hover:text-primary transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                        
                        <div className={`text-[10px] mt-2 flex items-center gap-2 font-black tracking-tighter ${
                          msg.senderId === visitorEmail ? 'justify-end text-primary/30' : 'text-slate-400'
                        }`}>
                          {msg.isEdited && (
                            <span className="uppercase text-[9px] italic bg-slate-100 px-1.5 rounded-md text-slate-500">Edited</span>
                          )}
                          <span className="font-mono">
                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                          </span>
                          {msg.senderId === visitorEmail && (
                            <div className="flex">
                              <CheckCheck size={12} className={msg.isRead ? 'text-accent' : 'text-slate-300'} />
                            </div>
                          )}
                        </div>
                      </div>
                      {msg.senderId === visitorEmail && (
                        <div className="w-9 h-9 rounded-2xl bg-accent/5 overflow-hidden shrink-0 border border-white shadow-md self-end mb-4 ring-2 ring-white">
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
            <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-3 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
              {isBlocked ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                  <Ban size={18} className="shrink-0" />
                  <span className="text-xs font-bold leading-tight">Your access to this chat has been restricted by the administrator.</span>
                </div>
              ) : (
                <>
                  {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-500 text-[10px] font-black p-3 rounded-xl border border-red-100 flex items-center gap-3 mb-1 shadow-sm"
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shrink-0" />
                  <span className="flex-1 uppercase tracking-tight leading-tight">{error}</span>
                  <button onClick={() => setError(null)} className="opacity-40 hover:opacity-100 transition-opacity p-1">
                    <X size={12} />
                  </button>
                </motion.div>
              )}
              <form onSubmit={handleSend} className="flex gap-3 items-center">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message..."
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.25rem] px-5 py-4 text-sm focus:ring-0 focus:bg-white focus:border-accent/10 focus:outline-none font-bold transition-all placeholder:text-slate-300 placeholder:font-medium"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <Sparkles size={14} className="text-accent/40" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90 shadow-xl shadow-primary/10 hover:shadow-primary/20 shrink-0"
                >
                  <Send size={20} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                </button>
              </form>
                </>
              )}
              <div className="flex justify-center pt-1 border-t border-slate-50">
                <p className="text-[9px] text-slate-300 font-black tracking-[0.2em] uppercase">Private & Secured Session</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Confirmation Modal Overlay */}
    <AnimatePresence>
      {confirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmModal(null)}
            className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-[320px] bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center border border-slate-100"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${confirmModal.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
              {confirmModal.type === 'delete' ? <Trash2 size={24} /> : <X size={24} />}
            </div>
            <h3 className="text-lg font-black text-primary mb-2 tracking-tight">{confirmModal.title}</h3>
            <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-8 uppercase tracking-tight">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-200/50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className={`flex-1 py-3 px-4 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                  confirmModal.type === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-primary hover:bg-slate-800 shadow-primary/20'
                }`}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </>
);
};
