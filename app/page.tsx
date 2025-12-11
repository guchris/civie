"use client";

import { LandingHero } from "@/components/landing-hero";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, redirect to dashboard
        router.push("/dashboard");
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
