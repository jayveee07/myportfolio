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
  getDocs,
  updateDoc,
  Timestamp 
} from "firebase/firestore";
import { db, auth } from "./firebase";

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  createdAt: any;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
  visitorName?: string;
  visitorEmail?: string;
  visitorAvatar?: string;
  isAutoReplied?: boolean;
  unreadCount?: number;
  adminTyping?: boolean;
}

const ADMIN_EMAIL = "jvpaisan@gmail.com";
const ADMIN_UID = "admin_placeholder"; // ideally we should get the real admin UID if possible

const ADMIN_NAME = "John Vince Paisan";
const ADMIN_AVATAR = "https://ui-avatars.com/api/?name=JV&background=0f172a&color=fff";

const getChatId = (email: string) => {
  return `vst_${email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
};

export const sendMessage = async (conversationId: string, text: string, visitorInfo: { name: string, id: string, avatar?: string }, isAdminReply: boolean = false) => {
  const messageData = {
    conversationId,
    text,
    senderId: isAdminReply ? "admin" : visitorInfo.id,
    senderName: isAdminReply ? ADMIN_NAME : visitorInfo.name,
    senderAvatar: isAdminReply ? ADMIN_AVATAR : visitorInfo.avatar,
    createdAt: serverTimestamp(),
  };

  const convoRef = doc(db, "conversations", conversationId);
  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  
  await addDoc(messagesRef, messageData);
  
  const updateData: any = {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  };

  // Handle Auto-reply logic for visitors
  if (!isAdminReply) {
    const convoSnap = await getDoc(convoRef);
    const convoData = convoSnap.data() as Conversation;

    // Increment unread count for admin
    updateData.unreadCount = (convoData?.unreadCount || 0) + 1;

    // Only auto-reply if not already replied AND if admin hasn't sent any messages yet
    if (!convoData?.isAutoReplied) {
      const adminMsgQuery = query(messagesRef, where("senderId", "==", "admin"));
      const adminMsgSnap = await getDocs(adminMsgQuery);

      if (adminMsgSnap.empty) {
        // Create auto-reply message
        const autoReplyData = {
          conversationId,
          text: "Thanks for reaching out! I've received your message and will get back to you shortly.",
          senderId: "admin",
          senderName: ADMIN_NAME,
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
  } else {
    updateData.unreadCount = 0;
    updateData.isAutoReplied = true;
  }

  await updateDoc(convoRef, updateData);
};

export const startConversation = async (visitorInfo: { name: string, email: string, avatar?: string }) => {
  const conversationId = getChatId(visitorInfo.email);
  const convoRef = doc(db, "conversations", conversationId);
  const convoSnap = await getDoc(convoRef);

  if (!convoSnap.exists()) {
    await setDoc(convoRef, {
      participants: [auth.currentUser?.uid || "anonymous", "admin"],
      visitorName: visitorInfo.name,
      visitorEmail: visitorInfo.email,
      visitorAvatar: visitorInfo.avatar || null,
      updatedAt: serverTimestamp(),
      unreadCount: 0,
      isAutoReplied: false,
    });
  } else {
    // If it exists, update participants to include current UID to ensure rules pass
    const currentUid = auth.currentUser?.uid;
    const updatePayload: any = {};
    if (visitorInfo.avatar) updatePayload.visitorAvatar = visitorInfo.avatar;
    
    if (currentUid) {
      const data = convoSnap.data() as Conversation;
      if (!data.participants.includes(currentUid)) {
        updatePayload.participants = [...data.participants, currentUid];
      }
    }
    
    if (Object.keys(updatePayload).length > 0) {
      await updateDoc(convoRef, updatePayload);
    }
  }
  
  return conversationId;
};

export const setAdminTypingStatus = async (conversationId: string, isTyping: boolean) => {
  const convoRef = doc(db, "conversations", conversationId);
  await updateDoc(convoRef, {
    adminTyping: isTyping
  });
};

export const subscribeToConversation = (conversationId: string, callback: (convo: Conversation) => void) => {
  if (!conversationId) return () => {};
  return onSnapshot(doc(db, "conversations", conversationId), (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Conversation);
    }
  });
};

export const markAsRead = async (conversationId: string) => {
  await updateDoc(doc(db, "conversations", conversationId), {
    unreadCount: 0,
  });
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
  // Guard: Only Admin can subscribe to all conversations
  const isAdmin = () => {
    const u = auth.currentUser;
    return u && u.email === "jvpaisan@gmail.com";
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
