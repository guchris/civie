"use client";

import { LandingHero } from "@/components/landing-hero";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, onAuthStateChanged } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
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
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <LandingHero />
      </main>
    </div>
  );
}
