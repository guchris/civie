"use client";

import { Suspense } from "react";
import { OTPForm } from "@/components/otp-form";

function OTPPageContent() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <OTPForm />
      </div>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">Loading...</div>
      </div>
    }>
      <OTPPageContent />
    </Suspense>
  );
}
