import { supabase, ADMIN_EMAIL, ADMIN_NAME, ADMIN_AVATAR } from './supabase';
import { syncVisitorIdentity } from './supabase-data';
import { generateChatResponse } from './gemini';

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  senderIp?: string;
  createdAt?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  deletedBy?: string[];
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt?: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorAvatar?: string;
  visitorId?: string;
  visitorIp?: string;
  isAutoReplied?: boolean;
  unreadCount?: number;
  adminTyping?: boolean;
  visitorTyping?: boolean;
  isPinned?: boolean;
  isBlocked?: boolean;
  isDeleted?: boolean;
}

export interface AdminSettings {
  autoReplyEnabled: boolean;
  notificationSounds: boolean;
  onlineStatus: 'online' | 'busy' | 'offline';
  resumeUrl?: string;
  onlineHours?: string;
  builtWith?: string;
  footerHeadingTop?: string;
  footerHeadingAccent?: string;
  footerHeadingBottom?: string;
  footerSubtitle?: string;
  footerCta?: string;
}

const mapMsg = (db: Record<string, unknown> | undefined | null): Message | null => {
  if (!db) return null;
  return {
    id: db.id as string,
    text: (db.text as string) || '',
    senderId: db.sender_id as string,
    senderName: db.sender_name as string | undefined,
    senderAvatar: db.sender_avatar as string | undefined,
    senderIp: db.sender_ip as string | undefined,
    createdAt: db.created_at as string | undefined,
    isEdited: !!db.is_edited,
    isDeleted: !!db.is_deleted,
    deletedBy: (db.deleted_by as string[]) || [],
    isRead: !!db.is_read,
  };
};

const mapMsgs = (db: Record<string, unknown>[]): Message[] =>
  db.map(m => mapMsg(m)).filter(Boolean) as Message[];

const mapConvo = (db: Record<string, unknown> | undefined | null): Conversation | null => {
  if (!db) return null;
  return {
    id: db.id as string,
    participants: (db.participants as string[]) || [],
    lastMessage: db.last_message as string | undefined,
    updatedAt: db.updated_at as string | undefined,
    visitorName: db.visitor_name as string | undefined,
    visitorEmail: db.visitor_email as string | undefined,
    visitorAvatar: db.visitor_avatar as string | undefined,
    visitorId: db.visitor_id as string | undefined,
    visitorIp: db.visitor_ip as string | undefined,
    isAutoReplied: !!db.is_auto_replied,
    unreadCount: (db.unread_count as number) || 0,
    adminTyping: !!db.admin_typing,
    visitorTyping: !!db.visitor_typing,
    isPinned: !!db.is_pinned,
    isBlocked: !!db.is_blocked,
    isDeleted: !!db.is_deleted,
  };
};

const mapConvos = (db: Record<string, unknown>[]): Conversation[] =>
  db.map(c => mapConvo(c)).filter(Boolean) as Conversation[];

const mapSettings = (db: Record<string, unknown> | undefined | null): AdminSettings | null => {
  if (!db) return null;
  return {
    autoReplyEnabled: !!db.auto_reply_enabled,
    notificationSounds: !!db.notification_sounds,
    onlineStatus: (db.online_status as 'online' | 'busy' | 'offline') || 'online',
    resumeUrl: db.resume_url as string | undefined,
    onlineHours: db.online_hours as string | undefined,
    builtWith: db.built_with as string | undefined,
    footerHeadingTop: db.footer_heading_top as string | undefined,
    footerHeadingAccent: db.footer_heading_accent as string | undefined,
    footerHeadingBottom: db.footer_heading_bottom as string | undefined,
    footerSubtitle: db.footer_subtitle as string | undefined,
    footerCta: db.footer_cta as string | undefined,
  };
};

const getChatId = (email: string) => {
  return `vst_${email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
};

export const sendMessage = async (
  conversationId: string,
  text: string,
  visitorInfo: { name: string; email: string; avatar?: string; ip?: string },
  isAdminReply = false
) => {
  const senderId = isAdminReply ? ADMIN_EMAIL : visitorInfo.email.toLowerCase();

  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      text,
      sender_id: senderId,
      sender_name: isAdminReply ? ADMIN_NAME : visitorInfo.name,
      sender_avatar: isAdminReply ? ADMIN_AVATAR : (visitorInfo.avatar?.startsWith('data:') ? null : visitorInfo.avatar),
      sender_ip: isAdminReply ? 'admin' : (visitorInfo.ip || 'unknown'),
    });

  if (msgError) throw msgError;

  const updateData: Record<string, unknown> = {
    last_message: text,
    updated_at: new Date().toISOString(),
  };

  if (!isAdminReply) {
    updateData.is_deleted = false;

    const { data: convo } = await supabase
      .from('conversations')
      .select('unread_count, is_auto_replied')
      .eq('id', conversationId)
      .maybeSingle();

    updateData.unread_count = (convo?.unread_count || 0) + 1;

    const lowerText = text.toLowerCase().trim();
    const switchToAgent = /^(agent|human|talk to human|talk to agent)\b/.test(lowerText);
    const switchToAI = /^(ai|bot|talk to ai|talk to bot)\b/.test(lowerText);

    if (switchToAgent) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        text: "🔄 You're now chatting with a human agent. An admin will respond shortly.",
        sender_id: ADMIN_EMAIL,
        sender_name: `${ADMIN_NAME} (AI)`,
        sender_avatar: ADMIN_AVATAR,
      });
      updateData.is_auto_replied = false;
      updateData.last_message = "🔄 Switched to human agent";
    } else if (switchToAI) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        text: "🔄 Switching back to AI assistant. How can I help you?",
        sender_id: ADMIN_EMAIL,
        sender_name: `${ADMIN_NAME} (AI)`,
        sender_avatar: ADMIN_AVATAR,
      });
      updateData.is_auto_replied = true;
      updateData.last_message = "🔄 Switched to AI assistant";
    } else if (convo?.is_auto_replied !== false) {
      const aiResponse = await generateChatResponse(text, visitorInfo.name);
      const autoReplyText = aiResponse || "Thanks for reaching out! I've received your message and will get back to you shortly.";

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        text: autoReplyText,
        sender_id: ADMIN_EMAIL,
        sender_name: `${ADMIN_NAME} (AI)`,
        sender_avatar: ADMIN_AVATAR,
      });

      updateData.is_auto_replied = true;
      updateData.last_message = autoReplyText;
    }
  } else {
    updateData.unread_count = 0;
    updateData.is_auto_replied = false;
  }

  await supabase
    .from('conversations')
    .update(updateData)
    .eq('id', conversationId);
};

export const startConversation = async (visitorInfo: { name: string; email: string; avatar?: string; ip?: string }) => {
  await syncVisitorIdentity(visitorInfo.email);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication failed. Please try refreshing.');

  const conversationId = getChatId(visitorInfo.email);

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .maybeSingle();

  const payload: Record<string, unknown> = {
    visitor_uid: user.id,
    visitor_name: visitorInfo.name,
    visitor_email: visitorInfo.email.toLowerCase(),
    updated_at: new Date().toISOString(),
  };

  if (visitorInfo.avatar && visitorInfo.avatar.length < 100000) payload.visitor_avatar = visitorInfo.avatar;
  if (visitorInfo.ip) payload.visitor_ip = visitorInfo.ip;

  const participants = [visitorInfo.email.toLowerCase(), ADMIN_EMAIL, user.id];

  if (!existing) {
    await supabase.from('conversations').insert({
      id: conversationId,
      participants,
      ...payload,
      unread_count: 0,
      is_auto_replied: true,
    });

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      text: "Hi there! I'm John Vince's AI assistant. How can I help you today?",
      sender_id: ADMIN_EMAIL,
      sender_name: `${ADMIN_NAME} (AI)`,
      sender_avatar: ADMIN_AVATAR,
    });
  } else {
    await supabase.from('conversations').update(payload).eq('id', conversationId);
  }

  return conversationId;
};

export const setAdminTypingStatus = async (conversationId: string, isTyping: boolean) => {
  await supabase.from('conversations').update({ admin_typing: isTyping }).eq('id', conversationId);
};

export const setVisitorTypingStatus = async (conversationId: string, isTyping: boolean) => {
  await supabase.from('conversations').update({ visitor_typing: isTyping }).eq('id', conversationId);
};

export const editMessage = async (conversationId: string, messageId: string, newText: string) => {
  const { data: msg } = await supabase
    .from('messages')
    .select('text, created_at')
    .eq('id', messageId)
    .maybeSingle();

  if (!msg) return;

  const now = Date.now();
  const created = msg.created_at ? new Date(msg.created_at).getTime() : now;

  if (now - created > 10 * 60 * 1000) {
    throw new Error('Editing window expired (10 minutes).');
  }

  await supabase.from('messages').update({ text: newText, is_edited: true }).eq('id', messageId);

  const { data: convo } = await supabase
    .from('conversations')
    .select('last_message')
    .eq('id', conversationId)
    .maybeSingle();

  if (convo?.last_message === msg.text) {
    await supabase.from('conversations').update({ last_message: newText }).eq('id', conversationId);
  }
};

export const deleteMessage = async (conversationId: string, messageId: string, mode: 'everyone' | 'me') => {
  const { data: msg } = await supabase
    .from('messages')
    .select('text, sender_id, deleted_by')
    .eq('id', messageId)
    .maybeSingle();

  if (!msg) return;

  const { data: { user } } = await supabase.auth.getUser();
  const currentEmail = user?.email || localStorage.getItem('visitor_email')?.toLowerCase();
  if (!currentEmail) return;

  if (mode === 'everyone' && msg.sender_id !== currentEmail && user?.email !== ADMIN_EMAIL) {
    throw new Error("You don't have permission to delete this message for everyone.");
  }

  const newDeletedBy = [...(msg.deleted_by || [])];
  if (!newDeletedBy.includes(currentEmail)) newDeletedBy.push(currentEmail);

  await supabase.from('messages').update({
    is_deleted: true,
    deleted_by: newDeletedBy,
  }).eq('id', messageId);

  const { data: convo } = await supabase
    .from('conversations')
    .select('last_message')
    .eq('id', conversationId)
    .maybeSingle();

  if (convo?.last_message === msg.text) {
    const { data: prev } = await supabase
      .from('messages')
      .select('text')
      .eq('conversation_id', conversationId)
      .neq('id', messageId)
      .not('is_deleted', 'is', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    await supabase.from('conversations').update({ last_message: prev?.text || 'No recent activity' }).eq('id', conversationId);
  }
};

export const markAsRead = async (conversationId: string) => {
  await supabase.from('conversations').update({ unread_count: 0 }).eq('id', conversationId);
};

export const markAllAsRead = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== ADMIN_EMAIL) return;

  await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .gt('unread_count', 0);
};

export const deleteConversation = async (conversationId: string) => {
  await supabase.from('messages').update({ is_deleted: true }).eq('conversation_id', conversationId);
  await supabase.from('conversations').update({ is_deleted: true }).eq('id', conversationId);
};

export const hardDeleteConversation = async (conversationId: string) => {
  await supabase.from('messages').delete().eq('conversation_id', conversationId);
  await supabase.from('conversations').delete().eq('id', conversationId);
};

export const togglePin = async (conversationId: string, isPinned: boolean) => {
  await supabase.from('conversations').update({ is_pinned: !isPinned }).eq('id', conversationId);
};

export const toggleBlock = async (conversationId: string, isBlocked: boolean) => {
  await supabase.from('conversations').update({ is_blocked: !isBlocked }).eq('id', conversationId);
};

export const exportConversation = async (conversation: Conversation, messages: Message[]) => {
  const content = {
    conversationInfo: {
      id: conversation.id,
      visitor: conversation.visitorName,
      email: conversation.visitorEmail,
      startedAt: messages[0]?.createdAt || 'Unknown',
    },
    messages: messages.map(m => ({
      sender: m.senderName,
      text: m.text,
      time: m.createdAt || '',
    })),
  };

  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat_export_${conversation.visitorName || conversation.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const fetchArchivedConversations = async (): Promise<Conversation[]> => {
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('is_deleted', true)
    .order('updated_at', { ascending: false, nullsFirst: false });
  return data ? mapConvos(data) : [];
};

export const subscribeToConversations = (callback: (conversations: Conversation[]) => void) => {
  const channel = supabase.channel('conversations');
  try {
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'conversations' },
      async () => {
        const { data } = await supabase
          .from('conversations')
          .select('*')
          .not('is_deleted', 'is', true)
          .order('updated_at', { ascending: false, nullsFirst: false });
        if (data) callback(mapConvos(data));
      }
    );
  } catch {
    // Channel already subscribed (Strict Mode double-mount), callback already registered
  }
  channel.subscribe();

  supabase
    .from('conversations')
    .select('*')
    .not('is_deleted', 'is', true)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .then(({ data }) => {
      if (data) callback(mapConvos(data));
    });

  return () => { supabase.removeChannel(channel); };
};

export const subscribeToConversation = (conversationId: string, callback: (convo: Conversation) => void) => {
  if (!conversationId) return () => {};

  const channel = supabase.channel(`conversation:${conversationId}`);
  try {
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'conversations', filter: `id=eq.${conversationId}` },
      (payload) => {
        const mapped = mapConvo(payload.new as Record<string, unknown>);
        if (mapped) callback(mapped);
      }
    );
  } catch {
    // Channel already subscribed (Strict Mode double-mount), callback already registered
  }
  channel.subscribe();

  supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .maybeSingle()
    .then(({ data }) => {
      const mapped = mapConvo(data as Record<string, unknown>);
      if (mapped) callback(mapped);
    });

  return () => { supabase.removeChannel(channel); };
};

export const subscribeToMessages = (conversationId: string, callback: (messages: Message[]) => void) => {
  if (!conversationId) return () => {};

  const channel = supabase.channel(`messages:${conversationId}`);
  try {
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      async () => {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (data) callback(mapMsgs(data));
      }
    );
  } catch {
    // Channel already subscribed (Strict Mode double-mount), callback already registered
  }
  channel.subscribe();

  supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .then(({ data }) => {
      if (data) callback(mapMsgs(data));
    });

  return () => { supabase.removeChannel(channel); };
};

export const subscribeToAdminSettings = (callback: (settings: AdminSettings) => void) => {
  const channel = supabase.channel('settings');
  try {
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.chat' },
      (payload) => {
        const mapped = mapSettings(payload.new as Record<string, unknown>);
        if (mapped) callback(mapped);
      }
    );
  } catch {
    // Channel already subscribed (Strict Mode double-mount), callback already registered
  }
  channel.subscribe();

  supabase
    .from('settings')
    .select('*')
    .eq('id', 'chat')
    .maybeSingle()
    .then(({ data }) => {
      const mapped = mapSettings(data as Record<string, unknown>);
      if (mapped) {
        callback(mapped);
      } else {
        callback({ autoReplyEnabled: true, notificationSounds: true, onlineStatus: 'online' });
      }
    });

  return () => { supabase.removeChannel(channel); };
};

export const updateAdminSettings = async (settings: Partial<AdminSettings>) => {
  const db: Record<string, unknown> = {};
  if (settings.autoReplyEnabled !== undefined) db.auto_reply_enabled = settings.autoReplyEnabled;
  if (settings.notificationSounds !== undefined) db.notification_sounds = settings.notificationSounds;
  if (settings.onlineStatus !== undefined) db.online_status = settings.onlineStatus;
  if (settings.resumeUrl !== undefined) db.resume_url = settings.resumeUrl;
  if (settings.onlineHours !== undefined) db.online_hours = settings.onlineHours;
  if (settings.builtWith !== undefined) db.built_with = settings.builtWith;
  if (settings.footerHeadingTop !== undefined) db.footer_heading_top = settings.footerHeadingTop;
  if (settings.footerHeadingAccent !== undefined) db.footer_heading_accent = settings.footerHeadingAccent;
  if (settings.footerHeadingBottom !== undefined) db.footer_heading_bottom = settings.footerHeadingBottom;
  if (settings.footerSubtitle !== undefined) db.footer_subtitle = settings.footerSubtitle;
  if (settings.footerCta !== undefined) db.footer_cta = settings.footerCta;

  await supabase.from('settings').upsert({ id: 'chat', ...db }, { onConflict: 'id' });
};
