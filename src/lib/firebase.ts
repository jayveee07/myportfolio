import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword,
  signInAnonymously,
  deleteUser
} from "firebase/auth";
import { 
  getFirestore,
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  getDocFromServer,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  where,
  Timestamp,
  initializeFirestore
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

import { getVisitorIp } from "./ipService";

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with long polling to avoid connection issues in some environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId || "(default)");

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      console.warn("Sign-in popup was blocked or cancelled. Please allow popups for this site.");
    } else {
      console.error("Auth Error:", error);
    }
    throw error;
  }
};

export const logOut = () => signOut(auth);

export const signInAdmin = (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

/**
 * Explicitly sign in as a fresh visitor, decommissioning any current anonymous session.
 */
export const signInAsVisitor = async () => {
  return ensureAuthInited(true);
};

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'set' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export const handleFirestoreError = (err: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) => {
  if (err.code === 'permission-denied' || err.message?.toLowerCase().includes('permission-denied')) {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: err.message,
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || 'none',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous ?? true,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw err;
};

// Singleton promise to prevent multiple parallel sign-ins
let authInitPromise: Promise<void> | null = null;

/**
 * Ensures that Firebase Auth is initialized with a user.
 * This is a bottleneck to prevent duplicate anonymous user creation.
 */
export const ensureAuthInited = async (forceRefresh = false) => {
  // If we're already initializing and not forcing a refresh, wait for the existing promise
  if (authInitPromise && !forceRefresh) return authInitPromise;

  // If forceRefresh, we don't care about the old promise, we start a new one
  const newPromise = (async () => {
    try {
      // 1. If not forcing refresh, give the SDK time to recover existing session
      if (!forceRefresh) {
        let attempts = 0;
        // Wait up to 2 seconds for persistence
        while (auth.currentUser === null && attempts < 20) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
      }

      // 2. Decide if we need to sign in
      if (forceRefresh || !auth.currentUser) {
        if (forceRefresh && auth.currentUser?.isAnonymous) {
          console.log("ensureAuthInited: Clearing existing session for fresh identity...");
          const userToClear = auth.currentUser;
          try {
            await deleteUser(userToClear);
          } catch (e) {
            console.warn("ensureAuthInited: Delete failed, signing out.");
            await signOut(auth);
          }
        }
        
        console.log("ensureAuthInited: Establishing anonymous identity...");
        await signInAnonymously(auth);
      }

      // 3. Final wait for token resolution
      let finalAttempts = 0;
      while (!auth.currentUser && finalAttempts < 10) {
        await new Promise(r => setTimeout(r, 200));
        finalAttempts++;
      }
    } catch (err) {
      console.error("ensureAuthInited: Critical failure:", err);
      // Reset if it crashed so next call can retry
      authInitPromise = null;
    }
  })();

  authInitPromise = newPromise;
  return newPromise;
};

// Tracking visits
export const recordVisit = async (path: string) => {
  try {
    // Ensure auth is ready
    await ensureAuthInited();
    
    if (!auth.currentUser) {
      console.warn("recordVisit: Proceeding without auth context");
    }

    // Rules engine propagation buffer - slightly longer to ensure token availability
    await new Promise(r => setTimeout(r, 1200));

    const currentUser = auth.currentUser;
    console.log("recordVisit: Handshaking with session", {
      uid: currentUser?.uid,
      isAnonymous: currentUser?.isAnonymous,
      email: currentUser?.email
    });

    const email = localStorage.getItem('visitor_email');
    const ip = await getVisitorIp();
    
    // Stable ID for the visit record
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = email || ip || `anon_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('visitor_id', visitorId);
    }
    
    const visitId = visitorId.toLowerCase().trim().replace(/[^a-zA-Z0-9.@]/g, '_');
    const visitRef = doc(db, "visits", visitId);
  
  try {
    // Attempt to update first (most common for active sessions)
    await updateDoc(visitRef, {
      lastActive: serverTimestamp(),
      path,
      visitorId, // keep synced
      ip: ip || 'unknown',
      userAgent: navigator.userAgent
    });
  } catch (err: any) {
    const isPermissionDenied = err.code === 'permission-denied' || 
                              err.message?.toLowerCase().includes('permission') || 
                              err.message?.toLowerCase().includes('insufficient');
    
    if (err.code === 'not-found' || isPermissionDenied) {
      // Actually permission-denied might happen if doc doesn't exist AND we don't have update rights but DO have set rights
      // Create if doesn't exist
      try {
        await setDoc(visitRef, {
          visitorId,
          email: email || null,
          ip: ip || 'unknown',
          path,
          userAgent: navigator.userAgent,
          timestamp: serverTimestamp(),
          lastActive: serverTimestamp(),
        });
      } catch (innerErr: any) {
        console.error("Failed to create visit record:", innerErr.message);
      }
    } else {
      console.error("Failed to record visit update:", err.message);
    }
  }
} catch (err: any) {
  console.error("recordVisit completion failure:", err.message);
}
};

export const updateHeartbeat = async () => {
  const visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) return;

  const visitRef = doc(db, "visits", visitorId.replace(/[^a-zA-Z0-9.@]/g, '_'));
  try {
    await updateDoc(visitRef, {
      lastActive: serverTimestamp()
    });
  } catch (err: any) {
    // If doc doesn't exist (deleted or expired), re-record
    if (err.code === 'not-found') {
      recordVisit(window.location.pathname);
    }
  }
};

export const subscribeToActiveVisitors = (callback: (count: number) => void) => {
  // Active if seen in last 2 minutes
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const q = query(
    collection(db, "visits"),
    where("lastActive", ">=", Timestamp.fromDate(twoMinutesAgo))
  );

  return onSnapshot(q, (snap) => {
    callback(snap.size);
  });
};

/**
 * Synchronizes the visitor's email with their current anonymous UID.
 * This implements the requested logic:
 * 1. Check if user exists in 'users' collection by email (primary key).
 * 2. If exists, update with current UID.
 * 3. If not, create associated with current anonymous UID.
 */
export const syncVisitorIdentity = async (email: string) => {
  if (!email || !auth.currentUser) return;
  
  const userRef = doc(db, "users", email.toLowerCase().trim());
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    console.log(`syncVisitorIdentity: Existing visitor found. Migrating identity from ${data.uid} to ${auth.currentUser.uid}`);
    
    await updateDoc(userRef, {
      uid: auth.currentUser.uid,
      lastActive: serverTimestamp()
    });
  } else {
    console.log(`syncVisitorIdentity: New visitor. Creating record for ${email} with UID ${auth.currentUser.uid}`);
    await setDoc(userRef, {
      email: email.toLowerCase().trim(),
      uid: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });
  }
};

/**
 * Validates connection to Firestore. 
 * Recommended by system instructions to avoid "client is offline" issues at startup.
 */
export async function testConnection() {
  try {
    // Only test if not already in an error state
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Firestore permissions test denied. This is expected if Anonymous Auth is processing or rules are pending.");
    } else if (error.message?.includes('the client is offline')) {
      console.error("Firestore connection failed: Client appears to be offline. Verify your Firebase configuration.");
    } else {
      console.warn("Connection test status:", error.code || error.message);
    }
  }
}

// Helper for fetching user profile
export const getUserProfile = async () => {
  const docRef = doc(db, "userProfile", "main");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Helper for fetching experience
export const getExperience = async () => {
  const q = query(collection(db, "experience"), orderBy("order", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Helper for fetching skills
export const getSkills = async () => {
  const q = query(collection(db, "skills"), orderBy("order", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Helper for fetching projects
export const getProjects = async () => {
  const querySnapshot = await getDocs(collection(db, "projects"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
