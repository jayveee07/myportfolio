import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  setDoc, 
  doc, 
  getDoc,
  getDocFromServer,
  getDocs,
  updateDoc,
  Timestamp,
  arrayUnion
} from "firebase/firestore";
import { db, auth, FirestoreErrorInfo, handleFirestoreError, syncVisitorIdentity } from "./firebase";
import { generateChatResponse } from "./gemini";

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  senderIp?: string;
  createdAt: any;
  isEdited?: boolean;
  isDeleted?: boolean;
  deletedBy?: string[];
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
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
}

export const ADMIN_EMAIL = "jvpaisan@gmail.com";
const ADMIN_UID = "admin_placeholder";

export const ADMIN_NAME = "John Vince Paisan";
const ADMIN_AVATAR = "https://ui-avatars.com/api/?name=JV&background=0f172a&color=fff";

const getChatId = (email: string) => {
  return `vst_${email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
};

export const sendMessage = async (conversationId: string, text: string, visitorInfo: { name: string, email: string, avatar?: string, ip?: string }, isAdminReply: boolean = false) => {
  const messageData = {
    conversationId,
    text,
    senderId: isAdminReply ? ADMIN_EMAIL : visitorInfo.email.toLowerCase(),
    senderName: isAdminReply ? ADMIN_NAME : visitorInfo.name,
    senderAvatar: isAdminReply ? ADMIN_AVATAR : (visitorInfo.avatar?.startsWith('data:') ? null : visitorInfo.avatar),
    senderIp: isAdminReply ? 'admin' : (visitorInfo.ip || 'unknown'),
    createdAt: serverTimestamp(),
  };

  const convoRef = doc(db, "conversations", conversationId);
  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  
  try {
    await addDoc(messagesRef, messageData);
  } catch (err: any) {
    handleFirestoreError(err, 'create', messagesRef.path);
  }
  
  const updateData: any = {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  };

  if (!isAdminReply) {
    try {
      const convoSnap = await getDoc(convoRef);
      const convoData = convoSnap.data() as Conversation;

      updateData.unreadCount = (convoData?.unreadCount || 0) + 1;

      if (!convoData?.isAutoReplied) {
        const adminMsgQuery = query(messagesRef, where("senderId", "==", ADMIN_EMAIL));
        const adminMsgSnap = await getDocs(adminMsgQuery);

        if (adminMsgSnap.empty) {
          const aiResponse = await generateChatResponse(text, visitorInfo.name);
          
          const autoReplyData = {
            conversationId,
            text: aiResponse || "Thanks for reaching out! I've received your message and will get back to you shortly.",
            senderId: ADMIN_EMAIL,
            senderName: `${ADMIN_NAME} (AI)`,
            senderAvatar: ADMIN_AVATAR,
            createdAt: serverTimestamp(),
          };
          await addDoc(messagesRef, autoReplyData);
          updateData.isAutoReplied = true;
          updateData.lastMessage = autoReplyData.text;
        } else {
          updateData.isAutoReplied = true;
        }
      }
    } catch (err: any) {
      console.warn("Auto-reply logic failed (likely permission):", err.message);
    }
  } else {
    updateData.unreadCount = 0;
    updateData.isAutoReplied = true;
  }

  try {
    await updateDoc(convoRef, updateData);
  } catch (err: any) {
    handleFirestoreError(err, 'update', convoRef.path);
  }
};

export const startConversation = async (visitorInfo: { name: string, email: string, avatar?: string, ip?: string }) => {
  await syncVisitorIdentity(visitorInfo.email);

  if (!auth.currentUser) {
    throw new Error("Authentication failed or timed out. Please try refreshing.");
  }
  
  const conversationId = getChatId(visitorInfo.email);
  console.log("StartConversation: resolved ID as", conversationId);
  const convoRef = doc(db, "conversations", conversationId);

  const payload = {
    participants: arrayUnion(auth.currentUser.uid, visitorInfo.email.toLowerCase(), ADMIN_EMAIL),
    visitorUid: auth.currentUser.uid,
    visitorId: visitorInfo.email.toLowerCase(),
    visitorName: visitorInfo.name,
    visitorEmail: visitorInfo.email.toLowerCase(),
    updatedAt: serverTimestamp(),
  } as any;
  
  if (visitorInfo.avatar && visitorInfo.avatar.length < 100000) {
    payload.visitorAvatar = visitorInfo.avatar;
  }
  if (visitorInfo.ip) {
    payload.visitorIp = visitorInfo.ip;
  }

  try {
    const convoSnap = await getDoc(convoRef);
    if (!convoSnap.exists()) {
      await setDoc(convoRef, {
        ...payload,
        participants: [visitorInfo.email.toLowerCase(), ADMIN_EMAIL, auth.currentUser.uid],
        unreadCount: 0,
        isAutoReplied: false,
      });
      
      const messagesRef = collection(db, `conversations/${conversationId}/messages`);
      await addDoc(messagesRef, {
        conversationId,
        text: "Hi there! I'm John Vince's AI assistant. How can I help you today?",
        senderId: ADMIN_EMAIL,
        senderName: `${ADMIN_NAME} (AI)`,
        senderAvatar: ADMIN_AVATAR,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(convoRef, payload);
    }
  } catch (err: any) {
    console.error("Error setting/updating conversation:", err);
    handleFirestoreError(err, 'create', convoRef.path);
  }
  
  return conversationId;
};

export const setAdminTypingStatus = async (conversationId: string, isTyping: boolean) => {
  const convoRef = doc(db, "conversations", conversationId);
  await updateDoc(convoRef, {
    adminTyping: isTyping
  });
};

export const setVisitorTypingStatus = async (conversationId: string, isTyping: boolean) => {
  const convoRef = doc(db, "conversations", conversationId);
  await updateDoc(convoRef, {
    visitorTyping: isTyping
  });
};

export const editMessage = async (conversationId: string, messageId: string, newText: string) => {
  const msgRef = doc(db, `conversations/${conversationId}/messages`, messageId);
  const msgSnap = await getDoc(msgRef);
  
  if (!msgSnap.exists()) return;
  
  const msgData = msgSnap.data() as Message;
  const now = Timestamp.now().toMillis();
  const created = msgData.createdAt?.toMillis() || now;
  
  if (now - created > 10 * 60 * 1000) {
    throw new Error("Editing window expired (10 minutes).");
  }
  
  await updateDoc(msgRef, {
    text: newText,
    isEdited: true
  });
  
  const convoRef = doc(db, "conversations", conversationId);
  const convoSnap = await getDoc(convoRef);
  if (convoSnap.exists()) {
    const convoData = convoSnap.data() as Conversation;
    if (convoData.lastMessage === msgData.text) {
      await updateDoc(convoRef, {
        lastMessage: newText
      });
    }
  }
};

export const deleteMessage = async (conversationId: string, messageId: string, mode: 'everyone' | 'me') => {
  const msgRef = doc(db, `conversations/${conversationId}/messages`, messageId);
  const msgSnap = await getDoc(msgRef);
  
  if (!msgSnap.exists()) return;
  const msgData = msgSnap.data() as Message;
  const currentEmail = auth.currentUser?.email || localStorage.getItem('visitor_email')?.toLowerCase();
  if (!currentEmail) return;

  if (mode === 'everyone') {
    if (msgData.senderId !== currentEmail && auth.currentUser?.email !== ADMIN_EMAIL) {
      throw new Error("You don't have permission to delete this message for everyone.");
    }

    await updateDoc(msgRef, {
      text: "This message was deleted",
      isDeleted: true
    });

    const convoRef = doc(db, "conversations", conversationId);
    const convoSnap = await getDoc(convoRef);
    if (convoSnap.exists()) {
      const convoData = convoSnap.data() as Conversation;
      if (convoData.lastMessage === msgData.text) {
        await updateDoc(convoRef, {
          lastMessage: "Message deleted"
        });
      }
    }
  } else {
    const deletedBy = msgData.deletedBy || [];
    if (!deletedBy.includes(currentEmail)) {
      await updateDoc(msgRef, {
        deletedBy: [...deletedBy, currentEmail]
      });
    }
  }
};

export const subscribeToConversation = (conversationId: string, callback: (convo: Conversation) => void) => {
  if (!conversationId) return () => {};
  return onSnapshot(doc(db, "conversations", conversationId), 
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Conversation);
      }
    },
    (error) => {
      console.error(`Conversation subscription error (${conversationId}):`, error);
    }
  );
};

export const markAsRead = async (conversationId: string) => {
  await updateDoc(doc(db, "conversations", conversationId), {
    unreadCount: 0,
  });
};

export const markAllAsRead = async () => {
  if (auth.currentUser?.email !== ADMIN_EMAIL) return;
  
  const q = query(collection(db, "conversations"), where("unreadCount", ">", 0));
  const snap = await getDocs(q);
  
  const promises = snap.docs.map(d => updateDoc(d.ref, { unreadCount: 0 }));
  await Promise.all(promises);
};

export const subscribeToMessages = (conversationId: string, callback: (messages: Message[]) => void) => {
  if (!conversationId) {
    console.warn("Attempted to subscribe to messages without a valid conversationId");
    return () => {};
  }

  const q = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, 
    (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      callback(messages);
    },
    (error) => {
      console.error(`Snapshot Listener Error (Messages ${conversationId}):`, error.message);
    }
  );
};

export const subscribeToConversations = (callback: (conversations: Conversation[]) => void) => {
  const isAdmin = () => {
    const u = auth.currentUser;
    return u && (u.email === "jvpaisan@gmail.com" || u.uid === "IrWAuYlvLkOSBOIljYrxXP7dVye2");
  };

  if (!isAdmin()) {
    console.warn("Unauthorized subscription attempt to ALL conversations");
    return () => {};
  }

  const q = query(
    collection(db, "conversations"),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, 
    (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      callback(conversations);
    },
    (error) => {
      console.error("Snapshot Listener Error (Conversations):", error.message);
    }
  );
};

export const togglePin = async (conversationId: string, isPinned: boolean) => {
  await updateDoc(doc(db, "conversations", conversationId), {
    isPinned: !isPinned
  });
};

export const toggleBlock = async (conversationId: string, isBlocked: boolean) => {
  await updateDoc(doc(db, "conversations", conversationId), {
    isBlocked: !isBlocked
  });
};

export interface AdminSettings {
  autoReplyEnabled: boolean;
  notificationSounds: boolean;
  onlineStatus: 'online' | 'busy' | 'offline';
  resumeUrl?: string;
  onlineHours?: string;
}

export const subscribeToAdminSettings = (callback: (settings: AdminSettings) => void) => {
  return onSnapshot(doc(db, "settings", "chat"), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as AdminSettings);
    } else {
      callback({
        autoReplyEnabled: true,
        notificationSounds: true,
        onlineStatus: 'online'
      });
    }
  });
};

export const updateAdminSettings = async (settings: Partial<AdminSettings>) => {
  await setDoc(doc(db, "settings", "chat"), settings, { merge: true });
};


export const exportConversation = async (conversation: Conversation, messages: Message[]) => {
  const content = {
    conversationInfo: {
      id: conversation.id,
      visitor: conversation.visitorName,
      email: conversation.visitorEmail,
      startedAt: messages[0]?.createdAt?.toDate?.()?.toISOString?.() || 'Unknown'
    },
    messages: messages.map(m => ({
      sender: m.senderName,
      text: m.text,
      time: m.createdAt?.toDate?.()?.toISOString?.() || 'Wait...'
    }))
  };

  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat_export_${conversation.visitorName || conversation.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
