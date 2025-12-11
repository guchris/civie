"use client";

import { LoginForm } from "@/components/login-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, onAuthStateChanged } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is verified before redirecting
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists() && userDocSnap.data().verified) {
            // User is already verified, redirect to dashboard
            router.push("/dashboard");
          } else {
            // User is not verified yet, redirect to verification page
            router.push("/verify");
          }
        } catch (error) {
          console.error("Error checking verification status:", error);
          // On error, redirect to verify to be safe
          router.push("/verify");
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
