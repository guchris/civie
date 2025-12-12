"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, doc, getDoc, onAuthStateChanged } from "@/lib/firebase";
import { User } from "firebase/auth";

export interface UserAnswer {
  status: "answered" | "skipped";
  answerOptionId?: string;
  timestamp: string;
}

export interface UserData {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  zipCode?: string;
  raceEthnicity?: string;
  verified?: boolean;
  verifiedAt?: string;
  email?: string;
  answers?: Record<string, UserAnswer>; // date -> answer mapping
}

export function useUserData() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Fetch user data from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData({
              ...data,
              email: firebaseUser.email || undefined,
            } as UserData);
          } else {
            // User document doesn't exist yet
            setUserData({
              email: firebaseUser.email || undefined,
            });
          }
          setError(null);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user data");
        } finally {
          setLoading(false);
        }
      } else {
        // Not authenticated
        setUser(null);
        setUserData(null);
        setLoading(false);
        // Optionally redirect to login
        // router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return { user, userData, loading, error };
}

