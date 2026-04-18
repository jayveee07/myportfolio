import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Inbox, 
  Search, 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  ArrowLeft,
  Settings,
  MoreVertical,
  LogOut
} from 'lucide-react';
import { 
  subscribeToConversations, 
  subscribeToMessages, 
  sendMessage, 
  markAsRead,
  setAdminTypingStatus,
  Conversation, 
  Message 
} from '../lib/messaging';
import { auth, logOut } from '../lib/firebase';

export const AdminInbox = ({ user }: { user: any }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    if (input.trim() && selectedConvo) {
      setAdminTypingStatus(selectedConvo.id, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setAdminTypingStatus(selectedConvo.id, false);
      }, 3000);
    }
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [input, selectedConvo?.id]);

  useEffect(() => {
    // Wait for auth to be initialized and user to be the admin
    if (auth.currentUser?.email === "jvpaisan@gmail.com") {
      const unsub = subscribeToConversations(setConversations);
      return () => unsub();
    }
  }, [user]); // Use the user state from the parent or context (AdminInbox doesn't have it currently)

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
              <Inbox size={20} className="text-accent" /> Inbox
            </h1>
            <button 
              onClick={() => logOut()}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:outline-none font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
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
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedConvo.visitorEmail || 'Unknown Email'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Settings size={18} /></button>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><MoreVertical size={18} /></button>
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
                  key={i} 
                  className={`flex ${msg.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col ${msg.senderId === 'admin' ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className={`px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                      msg.senderId === 'admin' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[9px] mt-2 text-slate-400 font-bold uppercase tracking-tighter">
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex gap-4 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-accent/20 focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-6 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
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
    </div>
  );
};
