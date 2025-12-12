"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Declare window type for confirmation result
declare global {
  interface Window {
    __firebaseConfirmationResult?: ConfirmationResult;
  }
}

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize reCAPTCHA verifier - following Firebase documentation pattern
  useEffect(() => {
    if (typeof window === "undefined" || !recaptchaContainerRef.current) {
      return;
    }

    // Create reCAPTCHA verifier - for invisible, no need to call render()
    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved - allow signInWithPhoneNumber
      },
      "expired-callback": () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        setError("reCAPTCHA expired. Please try again.");
      },
    });

    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (error) {
          console.error("Error clearing reCAPTCHA:", error);
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA verifier not initialized. Please refresh the page.");
      }

      // Format phone number (ensure it starts with +)
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber.replace(/\D/g, "")}`;
      
      // signInWithPhoneNumber will automatically trigger reCAPTCHA verification
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );
      
      // Store confirmation result in window object for OTP page
      if (typeof window !== "undefined") {
        window.__firebaseConfirmationResult = confirmationResult;
        window.localStorage.setItem("phoneForSignIn", formattedPhone);
      }
      router.push(`/otp?phone=${encodeURIComponent(formattedPhone)}`);
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      
      // Provide more specific error messages
      if (error.code === "auth/invalid-app-credential") {
        setError("App verification failed. Please check your Firebase configuration.");
      } else if (error.code === "auth/captcha-check-failed") {
        setError("Security verification failed. Please try again.");
      } else if (error.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Please enter a valid phone number with country code.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else {
        setError(error.message || "Failed to send verification code. Please try again.");
      }
      
      // Clear and re-initialize reCAPTCHA on error
      if (recaptchaVerifierRef.current && recaptchaContainerRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            size: "invisible",
            callback: () => {
              // reCAPTCHA solved
            },
            "expired-callback": () => {
              setError("reCAPTCHA expired. Please try again.");
            },
          });
        } catch (err) {
          console.error("Error re-initializing reCAPTCHA:", err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // reCAPTCHA container - following Firebase documentation pattern
  const recaptchaContainer = (
    <div 
      ref={recaptchaContainerRef} 
      id="recaptcha-container"
    />
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {recaptchaContainer}
      <form onSubmit={handlePhoneSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <span className="text-2xl font-bold">civie</span>
            </Link>
            <h1 className="text-xl font-bold">Welcome to civie</h1>
          </div>
          <Field>
            <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <FieldDescription>
              Enter your phone number with country code (e.g., +1 5551234567)
            </FieldDescription>
          </Field>
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending code..." : "Send verification code"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our <Link href="/terms">Terms of Service</Link>{" "}
        and <Link href="/privacy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}
