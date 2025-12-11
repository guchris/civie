"use client";

import { LoginForm } from "@/components/login-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already logged in, redirect to dashboard
        router.push("/dashboard");
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
