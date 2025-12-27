"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ConfirmationResult } from "firebase/auth";
import { auth, db, doc, getDoc } from "@/lib/firebase";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Logo } from "@/components/logo";

interface OTPFormProps extends React.ComponentProps<"div"> {
  phoneNumber?: string;
}

// Store confirmation result temporarily in window object
declare global {
  interface Window {
    __firebaseConfirmationResult?: ConfirmationResult;
  }
}

export function OTPForm({ className, phoneNumber: propPhoneNumber, ...props }: OTPFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(propPhoneNumber || "");

  useEffect(() => {
    // Get phone number from URL params or localStorage
    const phoneFromUrl = searchParams.get("phone");
    const phoneFromStorage = typeof window !== "undefined" 
      ? window.localStorage.getItem("phoneForSignIn") 
      : null;
    
    if (phoneFromUrl) {
      setPhoneNumber(phoneFromUrl);
    } else if (phoneFromStorage) {
      setPhoneNumber(phoneFromStorage);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setError(null);
    setIsVerifying(true);

    try {
      const confirmationResult = window.__firebaseConfirmationResult;
      
      if (!confirmationResult) {
        throw new Error("Verification session expired. Please request a new code.");
      }

      // Verify the code
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Clear stored data
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("phoneForSignIn");
        delete window.__firebaseConfirmationResult;
      }

      // Check if user is already verified
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().verified) {
        // User is already verified, redirect to dashboard
        router.push("/dashboard");
      } else {
        // User is not verified yet, redirect to verification page
        router.push("/verify");
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      setError(error.message || "Invalid verification code. Please try again.");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    // This would require re-initializing the phone auth flow
    // Redirect back to login
    router.push("/login");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-4 text-center mb-6">
            <Link href="/" className="flex flex-col items-center">
              <Logo className="w-16 h-8" />
            </Link>
            <h1 className="text-lg font-bold leading-none">Enter verification code</h1>
            <FieldDescription>
              We sent a 6-digit code to {phoneNumber || "your phone number"}
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="otp" className="sr-only">
              Verification code
            </FieldLabel>
            <InputOTP
              maxLength={6}
              id="otp"
              value={otp}
              onChange={(value) => setOtp(value)}
              required
              containerClassName="gap-4"
            >
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription className="text-center">
              Didn&apos;t receive the code? <button type="button" onClick={handleResend} className="underline">Resend</button>
            </FieldDescription>
          </Field>
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Field>
            <Button type="submit" disabled={otp.length !== 6 || isVerifying}>
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
