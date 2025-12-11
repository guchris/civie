"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";

type VerificationState = "form" | "loading" | "success";

export default function VerifyPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [state, setState] = useState<VerificationState>("form");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is authenticated and already verified
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        
        // Check if user is already verified
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists() && userDocSnap.data().verified) {
            // User is already verified, redirect to dashboard
            router.push("/dashboard");
            return;
          }
        } catch (error) {
          console.error("Error checking verification status:", error);
        }
      } else {
        // Redirect to signup if not authenticated
        router.push("/signup");
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save user identity data to Firestore
      const userData = {
        fullName,
        birthDate,
        gender,
        zipCode,
        verified: true,
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), userData, { merge: true });

      setState("success");

      // Redirect to dashboard after showing success
      setTimeout(() => {
        router.push("/dashboard?welcome=true");
      }, 2000);
    } catch (error: any) {
      console.error("Error saving verification data:", error);
      setState("form");
      // You might want to show an error message to the user here
      alert(`Error: ${error.message || "Failed to save verification data. Please try again."}`);
    }
  };


  // Check if all required fields are filled
  const isFormValid = fullName.trim() && birthDate && gender && zipCode.length === 5;

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
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
    );
  }

  if (state === "loading") {
    return (
      <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="shadow-none">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl mb-2">Verifying your identity</CardTitle>
              <CardDescription>
                Please wait while we verify your information...
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (state === "success") {
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
              <CardTitle className="text-2xl mb-2">Identity Verified!</CardTitle>
              <CardDescription className="mb-6">
                Your identity has been successfully verified. You're all set to start participating in civic dialogue.
              </CardDescription>
              <CardDescription>
                Redirecting to your dashboard...
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
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Identity Verification</CardTitle>
            <CardDescription>
              Verify your identity to ensure data integrity. This information is used to maintain
              the quality and legitimacy of civic responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your full legal name as it appears on your ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This field cannot be changed after verification
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This field cannot be changed after verification
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="10001"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  pattern="[0-9]{5}"
                  maxLength={5}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Used for demographic analysis. Can be updated later.
                </p>
              </div>

              <div className="rounded-lg border bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Privacy Note:</strong> Civie logs that you
                  answered, not what you chose. Your responses are only stored as aggregate
                  counters. No response-level PII is ever stored.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={!isFormValid}>
                Verify Identity
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

