import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Inbox, Search, MessageSquare, Send, User, Clock, ArrowLeft, Settings, MoreVertical, LogOut, Eye, Mail, Sparkles, Sparkle } from 'lucide-react';
import { 
  subscribeToConversations, 
  subscribeToMessages, 
  sendMessage, 
  markAsRead,
  setAdminTypingStatus,
  editMessage,
  Conversation, 
  Message 
} from '../lib/messaging';
import { auth, logOut, db } from '../lib/firebase';
import { Pencil, Save, X as CloseX } from 'lucide-react';
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
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'visits'>('messages');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [inspectingVisitor, setInspectingVisitor] = useState<{email: string, history: Visit[]} | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    if (auth.currentUser?.email === "jvpaisan@gmail.com") {
      const unsub = subscribeToConversations(setConversations);
      
      // Subscribe to visits
      const vQuery = query(collection(db, "visits"), orderBy("timestamp", "desc"), limit(100));
      const vUnsub = onSnapshot(vQuery, (snap) => {
        setVisits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Visit[]);
      });

      return () => {
        unsub();
        vUnsub();
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
    await sendMessage(selectedConvo.id, text, { id: 'admin', name: 'John Vince' }, true);
  };

  const handleStartEdit = (msg: Message) => {
    const created = msg.createdAt?.toMillis ? msg.createdAt.toMillis() : Date.now();
    const now = Date.now();
    
    if (now - created > 5 * 60 * 1000) {
      alert("You can only edit messages sent in the last 5 minutes.");
      return;
    }
    
    setEditingMessageId(msg.id || null);
    setEditInput(msg.text);
  };

  const handleSaveEdit = async () => {
    if (!selectedConvo || !editingMessageId || !editInput.trim()) return;
    try {
      await editMessage(selectedConvo.id, editingMessageId, editInput.trim());
      setEditingMessageId(null);
      setEditInput('');
    } catch (err: any) {
      alert(err.message);
    }
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

  const filteredConversations = conversations.filter(c => 
    c.visitorName?.toLowerCase().includes(search.toLowerCase()) || 
    c.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Conversation List */}
      <aside className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${selectedConvo ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-bottom border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Inbox size={20} className="text-accent" /> Administration
            </h1>
            <button 
              onClick={() => logOut()}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
          
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setActiveTab('messages')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'messages' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <MessageSquare size={14} /> Messages ({conversations.length})
            </button>
            <button 
              onClick={() => setActiveTab('visits')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'visits' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Eye size={14} /> Visits ({visits.length})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={activeTab === 'messages' ? "Search conversations..." : "Search visits..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:outline-none font-medium"
            />
          </div>
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
                  onClick={() => setSelectedConvo(convo)}
                  className={`w-full p-6 flex flex-col items-start border-l-4 transition-all hover:bg-slate-50 text-left relative ${
                    selectedConvo?.id === convo.id ? 'border-accent bg-accent/5' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${convo.unreadCount ? 'text-primary' : 'text-slate-600'}`}>
                        {convo.visitorName || 'Guest Visitor'}
                      </span>
                      {convo.unreadCount ? (
                        <span className="bg-accent text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                          {convo.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {convo.updatedAt?.toDate ? convo.updatedAt.toDate().toLocaleDateString() : '...'}
                    </span>
                  </div>
                  <p className={`text-xs font-medium line-clamp-2 leading-relaxed ${convo.unreadCount ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                    {convo.lastMessage || 'No messages yet'}
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
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Visitor ID</p>
                        <p className="text-sm font-bold text-primary leading-none truncate max-w-[120px]">{visit.visitorId}</p>
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
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedConvo(null)}
                  className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center font-bold">
                  {selectedConvo.visitorName?.[0] || 'G'}
                </div>
                <div>
                  <h2 className="font-bold text-primary leading-none mb-1">{selectedConvo.visitorName || 'Guest Visitor'}</h2>
                  <button 
                    onClick={() => selectedConvo.visitorEmail && handleInspectVisitor(selectedConvo.visitorEmail)}
                    className="text-[10px] text-accent hover:underline font-bold uppercase tracking-widest text-left"
                  >
                    {selectedConvo.visitorEmail || 'Unknown Email'}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {selectedConvo.visitorTyping && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-accent/5 rounded-full border border-accent/10">
                    <div className="flex gap-1">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-accent rounded-full" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-accent rounded-full" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-accent rounded-full" />
                    </div>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Typing...</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Settings size={18} /></button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><MoreVertical size={18} /></button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30"
            >
              <div className="flex justify-center mb-8">
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-widest shadow-sm">
                  Conversation started
                </span>
              </div>

              {messages.map((msg, i) => (
                <div 
                  key={msg.id || i} 
                  className={`flex ${msg.senderId === 'admin' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`flex flex-col ${msg.senderId === 'admin' ? 'items-end' : 'items-start'} max-w-[70%]`}>
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
                      <div className={`relative px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm transition-all ${
                        msg.senderId === 'admin' 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                      }`}>
                        <p>{msg.text}</p>
                        {msg.senderId === 'admin' && (
                          <button 
                            onClick={() => handleStartEdit(msg)}
                            className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 bg-white text-slate-400 rounded-full border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent z-20"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      {msg.isEdited && (
                        <span className="text-[8px] text-slate-300 font-bold uppercase italic tracking-widest">Edited</span>
                      )}
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Copilot & Chat Input */}
            <div className="p-6 bg-white border-t border-slate-100 space-y-4">
              <AnimatePresence>
                {aiSuggestion && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="p-4 bg-accent/5 border border-accent/20 rounded-2xl relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-accent">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Copilot Suggestion</span>
                      </div>
                      <button 
                        onClick={() => setAiSuggestion(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <CloseX size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic mb-3">
                      "{aiSuggestion}"
                    </p>
                    <button 
                      onClick={() => {
                        setInput(aiSuggestion);
                        setAiSuggestion(null);
                      }}
                      className="px-4 py-1.5 bg-accent text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors"
                    >
                      Use Suggestion
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSend} className="flex gap-4 max-w-4xl mx-auto items-center">
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 pr-12 text-sm focus:ring-2 focus:ring-accent/20 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleGetAiSuggestion}
                    disabled={isAiLoading || messages.length === 0}
                    className={`absolute right-3 p-2 rounded-xl transition-all ${
                      isAiLoading ? 'text-accent animate-spin' : 'text-slate-400 hover:text-accent hover:bg-white'
                    }`}
                    title="Get AI Suggestion"
                  >
                    {isAiLoading ? <Sparkle size={18} /> : <Sparkles size={18} />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="h-[52px] px-8 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  Send <Send size={18} />
                </button>
              </form>
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
    </div>
  );
};
