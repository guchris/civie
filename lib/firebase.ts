import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

// Your Firebase config - you'll need to add your actual config values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase lazily to avoid build-time errors
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

function getApp(): FirebaseApp {
  // If we already have an app instance, return it
  if (app) {
    return app;
  }

  // Check if Firebase is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    return app;
  }

  // Validate required config values
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    const missing = [];
    if (!firebaseConfig.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
    if (!firebaseConfig.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    if (!firebaseConfig.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    
    // During build/SSR (when env vars might not be available), use placeholder config
    // This allows the build to complete. At runtime, env vars should be set.
    const isBrowser = typeof window !== "undefined";
    
    if (!isBrowser) {
      // Use placeholder config during build/SSR to allow build to complete
      // Firebase will be re-initialized at runtime when env vars are available
      try {
        app = initializeApp({
          apiKey: "build-placeholder",
          authDomain: "build-placeholder",
          projectId: "build-placeholder",
          storageBucket: "",
          messagingSenderId: "",
          appId: "",
        }, "[DEFAULT]");
      } catch (e) {
        // If initialization fails, try to get existing app
        const apps = getApps();
        if (apps.length > 0) {
          app = apps[0];
        } else {
          throw e;
        }
      }
      return app;
    }
    
    // At runtime in browser, throw error if config is missing
    throw new Error(
      `Firebase configuration is missing. Missing environment variables: ${missing.join(", ")}. ` +
      "Please set up your environment variables with Firebase credentials."
    );
  }
  
  // Check for placeholder values (only at runtime)
  if (
    firebaseConfig.apiKey?.includes("your_") ||
    firebaseConfig.authDomain?.includes("your_") ||
    firebaseConfig.projectId?.includes("your_")
  ) {
    // Only validate at runtime in browser
    if (typeof window !== "undefined") {
      throw new Error(
        "Firebase configuration contains placeholder values. Please replace them with your actual Firebase config values."
      );
    }
  }
  
  // Initialize with real config
  app = initializeApp(firebaseConfig);
  return app;
}

// Initialize Auth lazily
export const auth: Auth = (() => {
  if (!authInstance) {
    authInstance = getAuth(getApp());
  }
  return authInstance;
})();

// Initialize Firestore lazily
export const db: Firestore = (() => {
  if (!dbInstance) {
    dbInstance = getFirestore(getApp());
  }
  return dbInstance;
})();

// Initialize Google Auth Provider
export const googleProvider: GoogleAuthProvider = (() => {
  if (!googleProviderInstance) {
    googleProviderInstance = new GoogleAuthProvider();
  }
  return googleProviderInstance;
})();

// Export Firestore utilities
export { doc, getDoc, setDoc, Timestamp, onAuthStateChanged };

export default getApp();

