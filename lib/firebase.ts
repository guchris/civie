import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore, doc, getDoc, setDoc, Timestamp, collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;

if (getApps().length === 0) {
  // Validate required config values
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    const missing = [];
    if (!firebaseConfig.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
    if (!firebaseConfig.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    if (!firebaseConfig.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    
    // During build time, use placeholder to allow build to complete
    // At runtime, this will fail if env vars aren't set (which is expected)
    if (typeof window === "undefined") {
      app = initializeApp({
        apiKey: "build-placeholder",
        authDomain: "build-placeholder",
        projectId: "build-placeholder",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
      });
    } else {
      throw new Error(
        `Firebase configuration is missing. Missing environment variables: ${missing.join(", ")}. ` +
        "Please set up your environment variables with Firebase credentials."
      );
    }
  } else {
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApps()[0];
}

// Initialize Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Initialize Google Auth Provider
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

// Export Firestore utilities
export { doc, getDoc, setDoc, Timestamp, onAuthStateChanged, collection, addDoc, getDocs, query, where, orderBy };

// Helper function to get the base URL for action links
// Uses environment variable if set, otherwise uses civie.org
export function getActionCodeUrl(path: string = "/auth/callback"): string {
  // Use environment variable if set, otherwise default to civie.org
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://civie.org";
  
  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}

export default app;

