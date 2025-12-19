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
import { Check, Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [betaCode, setBetaCode] = useState("");
  const [betaCodeValid, setBetaCodeValid] = useState<boolean | null>(null);
  const [isValidatingBetaCode, setIsValidatingBetaCode] = useState(false);
  const [betaCodeError, setBetaCodeError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  // Validate beta code
  const validateBetaCode = async (code: string) => {
    if (!code.trim()) {
      setBetaCodeValid(null);
      setBetaCodeError(null);
      return;
    }

    setIsValidatingBetaCode(true);
    setBetaCodeError(null);

    try {
      // Trim code for exact match (case-sensitive)
      const trimmedCode = code.trim();
      const response = await fetch("/api/validate-beta-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: trimmedCode }),
      });

      const data = await response.json();

      if (data.valid) {
        setBetaCodeValid(true);
        setBetaCodeError(null);
      } else {
        setBetaCodeValid(false);
        setBetaCodeError("Invalid beta code. Please check and try again.");
      }
    } catch (error) {
      console.error("Error validating beta code:", error);
      setBetaCodeValid(false);
      setBetaCodeError("Failed to validate beta code. Please try again.");
    } finally {
      setIsValidatingBetaCode(false);
    }
  };

  const handleBetaCodeBlur = () => {
    if (betaCode.trim()) {
      validateBetaCode(betaCode);
    }
  };

  const handleBetaCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (betaCode.trim()) {
        validateBetaCode(betaCode);
      }
    }
  };

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
            <FieldLabel htmlFor="betaCode">Beta Code</FieldLabel>
            <div className="relative">
              <Input
                id="betaCode"
                type="text"
                placeholder="Enter your beta code"
                value={betaCode}
                onChange={(e) => {
                  setBetaCode(e.target.value);
                  setBetaCodeValid(null);
                  setBetaCodeError(null);
                }}
                onBlur={handleBetaCodeBlur}
                onKeyDown={handleBetaCodeKeyDown}
                className={cn(
                  "pr-10",
                  betaCodeValid === true && "border-green-500",
                  betaCodeValid === false && "border-destructive"
                )}
                required
              />
              {isValidatingBetaCode && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
              {!isValidatingBetaCode && betaCodeValid === true && (
                <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
              )}
            </div>
            {betaCodeError && (
              <p className="text-sm text-destructive mt-1">{betaCodeError}</p>
            )}
            <FieldDescription>
              Don't have a beta code?{" "}
              <Link
                href="https://docs.google.com/forms/d/e/1FAIpQLSeYSquOqcAmSwOrgbqj5w4WXyjNXVbElp0HXJc_VyuK3iTU5Q/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                Join the waitlist
              </Link>
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={betaCodeValid !== true}
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
            <Button type="submit" disabled={isLoading || betaCodeValid !== true}>
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
