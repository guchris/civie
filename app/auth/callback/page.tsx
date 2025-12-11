"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailLink, isSignInWithEmailLink } from "firebase/auth";
import { auth, db, doc, getDoc } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleEmailLink = async () => {
      try {
        // Check if this is an email link
        if (isSignInWithEmailLink(auth, window.location.href)) {
          // Get the email from localStorage (stored when sending the link)
          let email = window.localStorage.getItem("emailForSignIn");
          
          // If email is not in localStorage, try to get it from URL params
          if (!email) {
            email = searchParams.get("email") || "";
          }

          if (!email) {
            throw new Error("Email not found. Please request a new sign-in link.");
          }

          // Sign in with the email link
          const result = await signInWithEmailLink(auth, email, window.location.href);
          
          // Clear the email from localStorage
          window.localStorage.removeItem("emailForSignIn");
          
          // Check if user is already verified
          if (result.user) {
            const userDocRef = doc(db, "users", result.user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists() && userDocSnap.data().verified) {
              // User is already verified, redirect to dashboard
              setStatus("success");
              setTimeout(() => {
                router.push("/dashboard");
              }, 1500);
            } else {
              // User is not verified yet, redirect to verification page
              setStatus("success");
              setTimeout(() => {
                router.push("/verify");
              }, 2000);
            }
          } else {
            // Fallback to verify page
            setStatus("success");
            setTimeout(() => {
              router.push("/verify");
            }, 2000);
          }
        } else {
          throw new Error("Invalid or expired sign-in link.");
        }
      } catch (error: any) {
        console.error("Error signing in with email link:", error);
        setErrorMessage(error.message || "Failed to sign in. Please try again.");
        setStatus("error");
      }
    };

    handleEmailLink();
  }, [router, searchParams]);

  if (status === "loading") {
    return (
      <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="shadow-none">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl mb-2">Verifying your email</CardTitle>
              <CardDescription>
                Please wait while we complete your sign-in...
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="shadow-none">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-2xl mb-2">Email Verified!</CardTitle>
              <CardDescription className="mb-6">
                Your email has been verified successfully. Redirecting...
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="shadow-none">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">Verification Failed</CardTitle>
            <CardDescription className="mb-6">
              {errorMessage || "The verification link is invalid or has expired."}
            </CardDescription>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/signup">Request New Link</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="shadow-none">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl mb-2">Loading...</CardTitle>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

