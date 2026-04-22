import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Inbox, Search, MessageSquare, Send, User, Clock, ArrowLeft, Settings, MoreVertical, LogOut, Eye, Mail, Sparkles, Sparkle, CheckCheck } from 'lucide-react';
import { 
  subscribeToConversations, 
  subscribeToMessages, 
  sendMessage, 
  markAsRead, 
  markAllAsRead,
  setAdminTypingStatus, 
  editMessage, 
  deleteMessage, 
  togglePin,
  toggleBlock,
  exportConversation,
  subscribeToAdminSettings,
  updateAdminSettings,
  AdminSettings,
  Conversation, 
  Message,
  ADMIN_EMAIL,
  ADMIN_NAME
} from '../lib/messaging';
import { auth, logOut, db, subscribeToActiveVisitors } from '../lib/firebase';
import { Pencil, Save, X as CloseX, Trash2, Pin, Ban, Download, Volume2, VolumeX, Bot, ShieldAlert } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit, where, getDocs } from 'firebase/firestore';
import { suggestAdminResponse } from '../lib/gemini';

export interface Visit {
  id: string;
  visitorId: string;
  email?: string;
  userAgent: string;
  path: string;
  timestamp: any;
}

export const AdminInbox = ({ user }: { user: any }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'visits'>('messages');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deleteOptionsId, setDeleteOptionsId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [inspectingVisitor, setInspectingVisitor] = useState<{email: string, history: Visit[]} | null>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    autoReplyEnabled: true,
    notificationSounds: true,
    onlineStatus: 'online'
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [conversationMenuId, setConversationMenuId] = useState<string | null>(null);

  const selectedConvo = conversations.find(c => c.id === selectedConvoId) || null;

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
    if (input.trim() && selectedConvo) {
      if (!isTypingLocal) {
        setIsTypingLocal(true);
        setAdminTypingStatus(selectedConvo.id, true);
      }
      
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setIsTypingLocal(false);
        setAdminTypingStatus(selectedConvo.id, false);
      }, 5000);
    }
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [input, selectedConvo?.id]);

  useEffect(() => {
    if (auth.currentUser?.email === "jvpaisan@gmail.com") {
      const unsub = subscribeToConversations(setConversations);
      
      // Subscribe to visits
      const vQuery = query(collection(db, "visits"), orderBy("timestamp", "desc"), limit(100));
      const vUnsub = onSnapshot(vQuery, (snap) => {
        setVisits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Visit[]);
      });

      const activeUnsub = subscribeToActiveVisitors(setActiveCount);
      const settingsUnsub = subscribeToAdminSettings(setAdminSettings);

      return () => {
        unsub();
        vUnsub();
        activeUnsub();
        settingsUnsub();
      };
    }
  }, [user]);

  useEffect(() => {
    if (selectedConvo) {
      const unsub = subscribeToMessages(selectedConvo.id, setMessages);
      
      // Mark as read when selected
      if (selectedConvo.unreadCount && selectedConvo.unreadCount > 0) {
        markAsRead(selectedConvo.id);
      }

      return () => unsub();
    } else {
      setMessages([]);
    }
  }, [selectedConvo?.id]); // Only trigger on ID change

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedConvo) return;

    const text = input.trim();
    setInput('');
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setAdminTypingStatus(selectedConvo.id, false);
    await sendMessage(selectedConvo.id, text, { email: ADMIN_EMAIL, name: ADMIN_NAME }, true);
  };

  const handleStartEdit = (msg: Message) => {
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
    if (!selectedConvo || !editingMessageId || !editInput.trim()) return;
    try {
      await editMessage(selectedConvo.id, editingMessageId, editInput.trim());
      setEditingMessageId(null);
      setEditInput('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (msgId: string, mode: 'everyone' | 'me') => {
    if (!selectedConvo) return;
    
    setConfirmModal({
      type: 'delete',
      title: mode === 'everyone' ? 'Delete for Everyone?' : 'Archive for Me?',
      message: mode === 'everyone' 
        ? 'This will permanently remove the message for all participants. This action cannot be undone.' 
        : 'This will hide the message from your view. Other participants will still see it.',
      onConfirm: async () => {
        try {
          await deleteMessage(selectedConvo.id, msgId, mode);
          setDeleteOptionsId(null);
          setConfirmModal(null);
        } catch (err: any) {
          setError(err.message);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleGetAiSuggestion = async () => {
    if (!selectedConvo || messages.length === 0) return;
    setIsAiLoading(true);
    setAiSuggestion(null);
    try {
      const suggestion = await suggestAdminResponse(messages, selectedConvo.visitorName || 'Visitor');
      if (suggestion) {
        setAiSuggestion(suggestion);
        // Do NOT auto-set input, let the admin review first
      }
    } catch (err) {
      console.error("AI Suggestion failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleInspectVisitor = async (email: string) => {
    const q = query(collection(db, "visits"), where("email", "==", email), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const history = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Visit[];
    setInspectingVisitor({ email, history });
  };

  const filteredConversations = conversations
    .filter(c => 
      c.visitorName?.toLowerCase().includes(search.toLowerCase()) || 
      c.lastMessage?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const handleTogglePin = async (e: React.MouseEvent, convo: Conversation) => {
    e.stopPropagation();
    try {
      await togglePin(convo.id, !!convo.isPinned);
      setConversationMenuId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleBlock = async (e: React.MouseEvent, convo: Conversation) => {
    e.stopPropagation();
    try {
      await toggleBlock(convo.id, !!convo.isBlocked);
      setConversationMenuId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleExport = async (e: React.MouseEvent, convo: Conversation) => {
    e.stopPropagation();
    await exportConversation(convo, messages);
    setConversationMenuId(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Conversation List */}
      <aside className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${selectedConvo ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-8 border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black text-primary flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Inbox size={20} />
              </div> 
              Console
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100/50">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">{activeCount} Active</span>
              </div>
              <button 
                onClick={() => logOut()}
                className="p-2.5 bg-slate-50 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all active:scale-95 border border-slate-100"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex gap-1 bg-slate-100/80 p-1.5 rounded-2xl mb-8 border border-slate-200/50">
            <button 
              onClick={() => setActiveTab('messages')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl transition-all ${
                activeTab === 'messages' ? 'bg-white text-primary shadow-md shadow-slate-200/50 ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare size={14} /> Messages
            </button>
            <button 
              onClick={() => setActiveTab('visits')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl transition-all ${
                activeTab === 'visits' ? 'bg-white text-primary shadow-md shadow-slate-200/50 ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Eye size={14} /> Visits
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={activeTab === 'messages' ? "Find conversation..." : "Lookup visit..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm focus:bg-white focus:border-accent/10 focus:ring-0 focus:outline-none font-bold placeholder:text-slate-300 transition-all shadow-inner"
            />
          </div>

          {activeTab === 'messages' && conversations.some(c => (c.unreadCount || 0) > 0) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex justify-end"
            >
              <button 
                onClick={() => markAllAsRead()}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-accent hover:text-blue-700 transition-colors flex items-center gap-1.5 px-3 py-1 bg-accent/5 rounded-lg border border-accent/10"
              >
                <CheckCheck size={12} /> Mark all as read
              </button>
            </motion.div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'messages' ? (
            filteredConversations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={24} />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No messages yet</p>
              </div>
            ) : (
              filteredConversations.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConvoId(convo.id)}
                  className={`w-full p-8 flex flex-col items-start border-l-[6px] transition-all relative group/item border-b border-slate-50/50 ${
                    selectedConvoId === convo.id 
                      ? 'border-accent bg-accent/5' 
                      : (convo.unreadCount || 0) > 0 
                        ? 'border-blue-400/30 bg-blue-50/20' 
                        : 'border-transparent hover:bg-slate-50/80 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all group-hover/item:scale-110 ${
                        selectedConvoId === convo.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {convo.isPinned ? <Pin size={16} className="fill-current" /> : (convo.visitorName?.[0] || 'G')}
                      </div>
                      {(convo.unreadCount || 0) > 0 && selectedConvoId !== convo.id && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent rounded-full border-[2.5px] border-white shadow-sm ring-1 ring-accent/10" />
                      )}
                        {convo.isBlocked && (
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-[2.5px] border-white shadow-sm flex items-center justify-center">
                            <ShieldAlert size={8} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-black text-sm block leading-none ${convo.unreadCount ? 'text-primary' : 'text-slate-700'}`}>
                            {convo.visitorName || 'Guest Visitor'}
                          </span>
                          {convo.isPinned && <Pin size={10} className="text-accent fill-accent shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1.5 leading-none">
                          <Clock size={10} />
                          {convo.updatedAt?.toDate ? convo.updatedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                        </span>
                      </div>
                    </div>
                    {convo.unreadCount ? (
                      <div className="relative">
                         <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-20 scale-150" />
                         <span className="relative z-10 bg-accent text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-accent/30">
                          {convo.unreadCount}
                        </span>
                      </div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed line-clamp-1 ml-[52px] ${convo.unreadCount ? 'text-slate-900 font-extrabold' : 'text-slate-400 font-medium'}`}>
                    {convo.lastMessage || 'No recent activity'}
                  </p>
                </button>
              ))
            )
          ) : (
            <div className="divide-y divide-slate-100">
              {visits.filter(v => 
                v.email?.toLowerCase().includes(search.toLowerCase()) || 
                v.path.includes(search) || 
                v.visitorId.includes(search)
              ).map(visit => (
                <div key={visit.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Session ID</p>
                        <p className="text-sm font-bold text-primary leading-none truncate max-w-[120px]">{visit.visitorId.includes('.') || visit.visitorId.includes(':') ? `VST_${visit.visitorId.slice(-4)}` : visit.visitorId}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      {visit.timestamp?.toDate ? visit.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </span>
                  </div>
                  {visit.email && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Mail size={12} className="text-accent" />
                      <span className="text-[11px] font-medium text-slate-600">{visit.email}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
                      Path: {visit.path}
                    </span>
                    <span className="text-[9px] text-slate-300 font-medium truncate max-w-[100px]">
                      {visit.userAgent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content - Chat Window */}
      <main className={`flex-1 flex flex-col bg-white overflow-hidden transition-all duration-300 ${!selectedConvo ? 'hidden md:flex' : 'flex'}`}>
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-20 shadow-sm shadow-slate-100/50">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setSelectedConvoId(null)}
                  className="md:hidden p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all active:scale-90"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative group/avatar">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-slate-700 text-white rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-xl shadow-primary/20 transition-transform group-hover/avatar:scale-105">
                    {selectedConvo.visitorName?.[0] || 'G'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-[3px] border-white rounded-full shadow-sm" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary leading-none mb-2 tracking-tight">{selectedConvo.visitorName || 'Guest Visitor'}</h2>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => selectedConvo.visitorEmail && handleInspectVisitor(selectedConvo.visitorEmail)}
                      className="flex items-center gap-2 text-[11px] text-accent hover:text-blue-600 font-black uppercase tracking-[0.05em] transition-colors group/mail"
                    >
                      <Mail size={12} className="text-slate-300 group-hover/mail:text-accent" />
                      <span className="border-b-2 border-transparent group-hover/mail:border-accent/40">{selectedConvo.visitorEmail || 'Unknown Email'}</span>
                    </button>
                    <div className="h-3 w-px bg-slate-200" />
                    <span className="flex items-center gap-2 text-[9px] px-2 py-1 bg-slate-100/80 text-emerald-600 font-black rounded-lg uppercase tracking-widest border border-emerald-100">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Encrypted Session
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <AnimatePresence>
                  {selectedConvo.visitorTyping && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: 20 }}
                      className="flex items-center gap-3 px-5 py-2.5 bg-accent/5 rounded-2xl border border-accent/10 shadow-sm"
                    >
                      <div className="flex gap-1.5">
                        <motion.span animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                        <motion.span animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                        <motion.span animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                      </div>
                      <span className="text-[11px] font-black text-accent uppercase tracking-[0.1em]">Visitor Typing...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex gap-2 relative">
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-600 transition-all active:scale-95 border border-transparent hover:border-slate-100"
                    title="Global Chat Settings"
                  >
                    <Settings size={20} />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setConversationMenuId(conversationMenuId === selectedConvo.id ? null : selectedConvo.id)}
                      className={`p-3 rounded-2xl transition-all active:scale-95 border ${
                        conversationMenuId === selectedConvo.id 
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                          : 'hover:bg-slate-50 text-slate-300 hover:text-slate-600 border-transparent hover:border-slate-100'
                      }`}
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    <AnimatePresence>
                      {conversationMenuId === selectedConvo.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 top-full mt-3 w-56 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[60] p-2"
                        >
                          <div className="px-4 py-3 border-b border-slate-50 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Context Actions</span>
                          </div>
                          
                          <button 
                            onClick={(e) => handleTogglePin(e, selectedConvo)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 group"
                          >
                            <Pin size={16} className={selectedConvo.isPinned ? 'text-accent fill-accent' : 'text-slate-300 group-hover:text-slate-500'} />
                            <span className="text-xs font-bold">{selectedConvo.isPinned ? 'Unpin Client' : 'Pin Conversation'}</span>
                          </button>
                          
                          <button 
                            onClick={(e) => handleExport(e, selectedConvo)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 group"
                          >
                            <Download size={16} className="text-slate-300 group-hover:text-slate-500" />
                            <span className="text-xs font-bold">Export Transcript</span>
                          </button>
                          
                          <div className="h-px bg-slate-50 my-1" />
                          
                          <button 
                            onClick={(e) => handleToggleBlock(e, selectedConvo)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors group ${
                              selectedConvo.isBlocked ? 'bg-red-50 text-red-600' : 'hover:bg-red-50 text-slate-700 hover:text-red-600'
                            }`}
                          >
                            <Ban size={16} className={selectedConvo.isBlocked ? 'text-red-500' : 'text-slate-300 group-hover:text-red-500'} />
                            <span className="text-xs font-bold">{selectedConvo.isBlocked ? 'Unblock Visitor' : 'Block & Report'}</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-12 space-y-10 bg-[#fafafa]"
            >
              <div className="flex justify-center mb-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-px w-24 bg-slate-200" />
                  <span className="px-5 py-2 bg-white border border-slate-100 rounded-2xl text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] shadow-sm">
                    Secure Channel Established
                  </span>
                </div>
              </div>

              {messages
                .filter(m => !m.deletedBy?.includes(ADMIN_EMAIL))
                .map((msg, i) => (
                <motion.div 
                  key={msg.id || i} 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${msg.senderId === ADMIN_EMAIL ? 'justify-end' : 'justify-start'} group/msg relative`}
                >
                  <div className={`flex flex-col ${msg.senderId === ADMIN_EMAIL ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    {editingMessageId === msg.id ? (
                      <div className="bg-white border-2 border-accent p-4 rounded-3xl flex flex-col gap-4 w-full shadow-2xl min-w-[280px]">
                        <textarea
                          autoFocus
                          value={editInput}
                          onChange={(e) => setEditInput(e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-accent/10 font-bold resize-none min-h-[100px] shadow-inner"
                        />
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={handleDiscardEdit}
                            className="p-1 px-5 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                          >
                            Discard
                          </button>
                          <button 
                            onClick={handleSaveEdit}
                            className="p-2 px-8 bg-accent text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
                          >
                            Sync Update
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`relative px-6 py-4 rounded-[1.75rem] text-[13px] font-bold leading-[1.6] shadow-sm transition-all group-hover/msg:shadow-md hover:scale-[1.005] ${
                        msg.isDeleted ? 'bg-slate-100 text-slate-400 italic font-medium' :
                        msg.senderId === ADMIN_EMAIL 
                          ? 'bg-primary text-white rounded-tr-[0.25rem] shadow-xl shadow-primary/5' 
                          : 'bg-white text-slate-700 rounded-tl-[0.25rem] border border-slate-200'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.isDeleted ? "System: This record was expunged" : msg.text}</p>
                        {!msg.isDeleted && (
                          <div className={`absolute top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover/msg:opacity-100 transition-all duration-300 z-20 ${
                            msg.senderId === ADMIN_EMAIL ? '-left-28' : '-right-28'
                          }`}>
                            {msg.senderId === ADMIN_EMAIL && (
                              <button 
                                onClick={() => handleStartEdit(msg)}
                                className="w-10 h-10 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-xl flex items-center justify-center hover:text-accent hover:scale-110 active:scale-90 transition-all"
                                title="Edit Record"
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                            <button 
                              onClick={() => setDeleteOptionsId(deleteOptionsId === msg.id ? null : msg.id!)}
                              className="w-10 h-10 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-xl flex items-center justify-center hover:text-red-500 hover:scale-110 active:scale-90 transition-all"
                              title="Delete Record"
                            >
                              <Trash2 size={16} />
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
                              className={`absolute z-30 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-2.5 flex flex-col gap-1 min-w-[200px] ${
                                msg.senderId === ADMIN_EMAIL ? 'right-0 top-full mt-4' : 'left-0 top-full mt-4'
                              }`}
                            >
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 py-2 border-b border-slate-50 mb-1">Administrative Action</p>
                              {msg.senderId === ADMIN_EMAIL && (
                                <button
                                  onClick={() => handleDelete(msg.id!, 'everyone')}
                                  className="w-full text-left px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-3 group/opt"
                                >
                                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full group-hover/opt:scale-150 transition-transform" />
                                  Remove (Global)
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(msg.id!, 'me')}
                                className="w-full text-left px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-3 group/opt"
                                title="Remove from your view only"
                              >
                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full group-hover/opt:scale-150 transition-transform" />
                                Archive (Private)
                              </button>
                              <button
                                onClick={() => setDeleteOptionsId(null)}
                                className="w-full text-center py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 hover:text-primary transition-colors"
                              >
                                Abort
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    <div className={`mt-3 flex items-center gap-3 ${msg.senderId === ADMIN_EMAIL ? 'justify-end' : 'justify-start'}`}>
                      {msg.isEdited && (
                        <span className="text-[9px] text-slate-300 font-extrabold uppercase italic tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">MODIFIED</span>
                      )}
                      <span className="text-[10px] text-slate-400 font-black font-mono tracking-tighter">
                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                      </span>
                      {msg.senderId === ADMIN_EMAIL && (
                        <div className="flex items-center gap-0.5">
                           <CheckCheck size={14} className={msg.isRead ? "text-accent" : "text-slate-200"} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Copilot & Chat Input */}
            <div className="p-10 bg-white border-t border-slate-100 flex flex-col gap-6 sticky bottom-0 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
              <AnimatePresence>
                {aiSuggestion && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="p-6 bg-accent/[0.03] border-2 border-accent/10 rounded-3xl relative overflow-hidden group/ai shadow-lg shadow-accent/5"
                  >
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 blur-3xl rounded-full" />
                    
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-3 text-accent">
                        <div className="p-2 bg-accent/10 rounded-xl">
                          <Sparkles size={16} />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Neural Suggestion</span>
                      </div>
                      <button 
                        onClick={() => setAiSuggestion(null)}
                        className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <CloseX size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 font-bold leading-[1.7] mb-6 relative z-10 pl-4 border-l-4 border-accent/20">
                      {aiSuggestion}
                    </p>
                    <div className="flex items-center gap-4 relative z-10">
                      <button 
                        onClick={() => {
                          setInput(aiSuggestion);
                          setAiSuggestion(null);
                        }}
                        className="px-6 py-2.5 bg-accent text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        Adopt Response <CheckCheck size={14} />
                      </button>
                      <button 
                        onClick={handleGetAiSuggestion}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-accent transition-colors"
                      >
                        Regenerate
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-red-50 text-red-500 text-[10px] font-black p-4 rounded-2xl border border-red-100 flex items-center gap-4 mb-2 shadow-sm"
                  >
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shrink-0" />
                    <span className="flex-1 uppercase tracking-tight leading-tight">{error}</span>
                    <button onClick={() => setError(null)} className="opacity-40 hover:opacity-100 transition-opacity p-1">
                      <CloseX size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSend} className="flex gap-4 max-w-5xl mx-auto items-center w-full px-2">
                <div className="flex-1 relative flex items-center group">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter dispatch..."
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-8 py-5 pr-14 text-sm focus:bg-white focus:border-accent/10 focus:ring-0 focus:outline-none font-bold placeholder:text-slate-300 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleGetAiSuggestion}
                    disabled={isAiLoading || messages.length === 0}
                    className={`absolute right-4 p-2.5 rounded-xl transition-all ${
                      isAiLoading ? 'text-accent animate-spin' : 'text-slate-300 hover:text-accent hover:bg-accent/5'
                    }`}
                    title="Engage Copilot"
                  >
                    {isAiLoading ? <Sparkle size={20} /> : <Sparkles size={20} />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="h-[64px] px-10 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-2xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] active:shadow-inner shrink-0"
                >
                  Send <Send size={20} />
                </button>
              </form>
              <div className="flex justify-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                Secure Administrative Session
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 rotate-3">
              <Inbox size={48} className="text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-3">Select a conversation</h2>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
              Choose a message from the list on the left to start responding to your visitors.
            </p>
          </div>
        )}
      </main>

      {/* Global Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-primary mb-1 tracking-tight">Chat Command Center</h3>
                  <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Global Management</p>
                </div>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"
                >
                  <CloseX size={24} />
                </button>
              </div>

              <div className="p-10 space-y-10">
                {/* Online Status */}
                <section>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-6 px-1">Availability Protocol</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['online', 'busy', 'offline'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateAdminSettings({ onlineStatus: status as any })}
                        className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                          adminSettings.onlineStatus === status 
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          status === 'online' ? 'bg-green-400' : status === 'busy' ? 'bg-amber-400' : 'bg-slate-400'
                        } ${adminSettings.onlineStatus === status ? 'ring-4 ring-white/20' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* AI & Sound Toggles */}
                <section className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">Engagement Automation</label>
                  
                  <div className="bg-slate-50 rounded-3xl p-6 flex items-center justify-between group transition-all hover:bg-slate-100/50">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${adminSettings.autoReplyEnabled ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-white text-slate-300'}`}>
                        <Bot size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-primary">Neural Auto-Reply</p>
                        <p className="text-[10px] text-slate-400 font-bold">Copilot handles initial visitor engagement.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => updateAdminSettings({ autoReplyEnabled: !adminSettings.autoReplyEnabled })}
                      className={`w-14 h-8 rounded-full transition-all relative ${adminSettings.autoReplyEnabled ? 'bg-accent' : 'bg-slate-300'}`}
                    >
                      <motion.div 
                        animate={{ x: adminSettings.autoReplyEnabled ? 28 : 4 }}
                        className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-md"
                      />
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-6 flex items-center justify-between group transition-all hover:bg-slate-100/50">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${adminSettings.notificationSounds ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-300'}`}>
                        {adminSettings.notificationSounds ? <Volume2 size={24} /> : <VolumeX size={24} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-primary">Audio Cues</p>
                        <p className="text-[10px] text-slate-400 font-bold">Enable sonic feedback for active incoming messages.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => updateAdminSettings({ notificationSounds: !adminSettings.notificationSounds })}
                      className={`w-14 h-8 rounded-full transition-all relative ${adminSettings.notificationSounds ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <motion.div 
                        animate={{ x: adminSettings.notificationSounds ? 28 : 4 }}
                        className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-md"
                      />
                    </button>
                  </div>
                </section>
              </div>

              <div className="bg-slate-50 p-10 flex justify-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Global Administrative Core v2.0</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspecting Visitor Modal */}
      <AnimatePresence>
        {inspectingVisitor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingVisitor(null)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-1">Visitor History</h3>
                  <p className="text-xs font-bold text-accent uppercase tracking-widest">{inspectingVisitor.email}</p>
                </div>
                <button 
                  onClick={() => setInspectingVisitor(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"
                >
                  <CloseX size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-4">
                  {inspectingVisitor.history.map((visit) => (
                    <div key={visit.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-accent/10 text-accent rounded text-[10px] font-bold uppercase tracking-widest">
                          {visit.path}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {visit.timestamp?.toDate ? visit.timestamp.toDate().toLocaleString() : '...'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                         <span className="font-bold text-slate-700 uppercase text-[9px] tracking-tight block mb-1">User Agent:</span>
                         {visit.userAgent}
                      </p>
                    </div>
                  ))}
                  {inspectingVisitor.history.length === 0 && (
                    <div className="text-center py-12">
                      <Clock size={48} className="text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">No history found for this email.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Confirmation Modal */}
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
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center border border-slate-100"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${confirmModal.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                {confirmModal.type === 'delete' ? <Trash2 size={32} /> : <CloseX size={32} />}
              </div>
              <h3 className="text-xl font-black text-primary mb-2 tracking-tight">{confirmModal.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                {confirmModal.message}
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-200/50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmModal.onConfirm}
                  className={`flex-1 py-4 px-6 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
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
    </div>
  );
};
