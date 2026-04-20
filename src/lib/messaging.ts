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
  Timestamp 
} from "firebase/firestore";
import { db, auth } from "./firebase";
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
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
  visitorName?: string;
  visitorEmail?: string;
  visitorAvatar?: string;
  visitorUid?: string;
  visitorIp?: string;
  isAutoReplied?: boolean;
  unreadCount?: number;
  adminTyping?: boolean;
  visitorTyping?: boolean;
}

export const ADMIN_EMAIL = "jvpaisan@gmail.com";
const ADMIN_UID = "admin_placeholder"; // ideally we should get the real admin UID if possible

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
        // Get AI generated response
        const aiResponse = await generateChatResponse(text, visitorInfo.name);
        
        // Create auto-reply message
        const autoReplyData = {
          conversationId,
          text: aiResponse || "Thanks for reaching out! I've received your message and will get back to you shortly.",
          senderId: "admin",
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
  } else {
    updateData.unreadCount = 0;
    updateData.isAutoReplied = true;
  }

  await updateDoc(convoRef, updateData);
};

export const startConversation = async (visitorInfo: { name: string, email: string, avatar?: string, ip?: string }) => {
  // Wait for auth to be fully established in the Firestore SDK
  let attempts = 0;
  while (!auth.currentUser && attempts < 10) {
    await new Promise(r => setTimeout(r, 200));
    attempts++;
  }

  if (!auth.currentUser) {
    throw new Error("Authentication failed or timed out. Please try refreshing.");
  }

  // Final small buffer for rules propagation
  await new Promise(r => setTimeout(r, 500));
  
  const conversationId = getChatId(visitorInfo.email);
  console.log("StartConversation: resolved ID as", conversationId);
  const convoRef = doc(db, "conversations", conversationId);
  
  let convoSnap;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      // Use standard getDoc for better compatibility in iframe environments
      convoSnap = await getDoc(convoRef);
      break; 
    } catch (err: any) {
      if ((err.code === 'permission-denied' || err.code === 'unauthenticated') && retryCount < maxRetries - 1) {
        console.warn(`Retry ${retryCount + 1}/${maxRetries} on convo fetch [${convoRef.path}]: ${err.message}`);
        await new Promise(r => setTimeout(r, 800)); 
        retryCount++;
      } else {
        if (err.code === 'permission-denied') {
          console.error("Critical Permission Denied on conversation:", {
            path: convoRef.path,
            uid: auth.currentUser?.uid,
            authReady: !!auth.currentUser
          });
        }
        throw err;
      }
    }
  }

  if (!convoSnap) {
    throw new Error("Unable to establish connection to chat server. Please try again in a moment.");
  }

  const currentUid = auth.currentUser.uid;

  if (!convoSnap.exists()) {
    const avatarToSave = visitorInfo.avatar && visitorInfo.avatar.length > 100000 ? null : visitorInfo.avatar;

    let writeSuccess = false;
    let writeRetry = 0;
    while (!writeSuccess && writeRetry < 3) {
      try {
        await setDoc(convoRef, {
          participants: [visitorInfo.email.toLowerCase(), ADMIN_EMAIL],
          visitorUid: currentUid || "anonymous",
          visitorIp: visitorInfo.ip || 'unknown',
          visitorName: visitorInfo.name,
          visitorEmail: visitorInfo.email.toLowerCase(),
          visitorAvatar: avatarToSave || null,
          updatedAt: serverTimestamp(),
          unreadCount: 0,
          isAutoReplied: false,
        });
        writeSuccess = true;
      } catch (err: any) {
        if (err.code === 'permission-denied' && writeRetry < 2) {
          console.warn(`Retry ${writeRetry + 1}/3 on convo creation: ${err.message}`);
          await new Promise(r => setTimeout(r, 1000));
          writeRetry++;
        } else {
          throw err;
        }
      }
    }
  } else {
    const updatePayload: any = {};
    if (visitorInfo.avatar) {
      updatePayload.visitorAvatar = visitorInfo.avatar.length > 100000 ? null : visitorInfo.avatar;
    }
    if (visitorInfo.ip) updatePayload.visitorIp = visitorInfo.ip;
    
    // Update visitorUid to current one if they are resuming session 
    if (currentUid) {
      updatePayload.visitorUid = currentUid;
    }
    
    if (Object.keys(updatePayload).length > 0) {
      let updateSuccess = false;
      let updateRetry = 0;
      while (!updateSuccess && updateRetry < 3) {
        try {
          await updateDoc(convoRef, updatePayload);
          updateSuccess = true;
        } catch (err: any) {
          if (err.code === 'permission-denied' && updateRetry < 2) {
            console.warn(`Retry ${updateRetry + 1}/3 on convo update: ${err.message}`);
            await new Promise(r => setTimeout(r, 1000));
            updateRetry++;
          } else {
            throw err;
          }
        }
      }
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
  
  // 10 minute window
  if (now - created > 10 * 60 * 1000) {
    throw new Error("Editing window expired (10 minutes).");
  }
  
  await updateDoc(msgRef, {
    text: newText,
    isEdited: true
  });
  
  // Also update last message in conversation if this was the latest message
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
    // Only sender or admin can delete for everyone
    if (msgData.senderId !== currentEmail && auth.currentUser?.email !== ADMIN_EMAIL) {
      throw new Error("You don't have permission to delete this message for everyone.");
    }

    await updateDoc(msgRef, {
      text: "This message was deleted",
      isDeleted: true
    });

    // Also update last message in conversation if this was the latest message
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
    // Delete for myself
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
