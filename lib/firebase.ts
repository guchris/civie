import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, onAuthStateChanged } from "firebase/auth";
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

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  // Validate required config values
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    const missing = [];
    if (!firebaseConfig.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
    if (!firebaseConfig.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    if (!firebaseConfig.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    
    throw new Error(
      `Firebase configuration is missing. Missing environment variables: ${missing.join(", ")}. ` +
      "Please set up your .env.local file with Firebase credentials. See FIREBASE_SETUP.md for instructions."
    );
  }
  
  // Check for placeholder values
  if (
    firebaseConfig.apiKey.includes("your_") ||
    firebaseConfig.authDomain.includes("your_") ||
    firebaseConfig.projectId.includes("your_")
  ) {
    throw new Error(
      "Firebase configuration contains placeholder values. Please replace them with your actual Firebase config values in .env.local. See FIREBASE_SETUP.md for instructions."
    );
  }
  
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Export Firestore utilities
export { doc, getDoc, setDoc, Timestamp, onAuthStateChanged };

export default app;

