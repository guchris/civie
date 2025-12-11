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
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  // Initialize reCAPTCHA verifier
  useEffect(() => {
    const initializeRecaptcha = async () => {
      if (typeof window === "undefined" || !recaptchaContainerRef.current) {
        return;
      }

      // Don't re-initialize if already exists
      if (recaptchaVerifierRef.current) {
        return;
      }

      try {
        // Create new verifier
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
            setRecaptchaReady(true);
          },
          "expired-callback": () => {
            setRecaptchaReady(false);
            setError("reCAPTCHA expired. Please try again.");
          },
        });
        
        // Render the reCAPTCHA
        await recaptchaVerifierRef.current.render();
        setRecaptchaReady(true);
      } catch (error: any) {
        console.error("Error initializing reCAPTCHA:", error);
        setError("Failed to initialize security verification. Please refresh the page.");
        setRecaptchaReady(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeRecaptcha();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (error) {
          console.error("Error clearing reCAPTCHA:", error);
        }
        recaptchaVerifierRef.current = null;
      }
      setRecaptchaReady(false);
    };
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if reCAPTCHA is ready
    if (!recaptchaReady || !recaptchaVerifierRef.current) {
      setError("Security verification is not ready. Please wait a moment and try again.");
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number (ensure it starts with +)
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber.replace(/\D/g, "")}`;
      
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
        setError("App verification failed. Please refresh the page and try again.");
      } else if (error.code === "auth/captcha-check-failed") {
        setError("Security verification failed. Please refresh the page and try again.");
      } else {
        setError(error.message || "Failed to send verification code. Please try again.");
      }
      
      // Reset reCAPTCHA on error
      setRecaptchaReady(false);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch (err) {
          console.error("Error clearing reCAPTCHA:", err);
        }
      }
      
      // Re-initialize after a short delay
      if (recaptchaContainerRef.current) {
        setTimeout(async () => {
          try {
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
              size: "invisible",
              callback: () => setRecaptchaReady(true),
              "expired-callback": () => {
                setRecaptchaReady(false);
                setError("reCAPTCHA expired. Please try again.");
              },
            });
            await recaptchaVerifierRef.current.render();
            setRecaptchaReady(true);
          } catch (err) {
            console.error("Error re-initializing reCAPTCHA:", err);
          }
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // reCAPTCHA container - must exist in DOM but can be visually hidden
  const recaptchaContainer = (
    <div 
      ref={recaptchaContainerRef} 
      id="recaptcha-container" 
      style={{ position: "absolute", left: "-9999px", visibility: "hidden" }}
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
