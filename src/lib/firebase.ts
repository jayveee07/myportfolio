import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword,
  signInAnonymously
} from "firebase/auth";
import { 
  initializeFirestore, 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  getDocFromServer 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with settings to force long polling
// This helps in environments where WebSockets might be flaky or filtered
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

export const signInAsVisitor = () => {
  return signInAnonymously(auth);
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
