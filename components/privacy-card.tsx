"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield } from "lucide-react";
import { useState } from "react";

export function PrivacyCard() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="h-full flex items-center justify-center p-6 shadow-none transition-all hover:bg-accent dark:bg-black dark:hover:bg-accent cursor-pointer sm:p-8 md:p-10 lg:p-4 min-h-[80px] sm:min-h-[100px] lg:min-h-0 group">
          <CardContent className="p-0">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 lg:h-6 lg:w-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 fill-current" />
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Privacy & Anonymity</DialogTitle>
          <DialogDescription>
            How we protect your privacy and ensure anonymity
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">What We Store</h3>
            <p className="text-sm text-muted-foreground">
              Civie logs that you answered, not what you chose. Your responses are only stored as
              aggregate counters. No response-level PII is ever stored.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Identity Verification</h3>
            <p className="text-sm text-muted-foreground">
              Your identity is verified to ensure data integrity, but your individual responses
              remain completely anonymous. We extract immutable fields (birth date, gender) during
              verification but never link them to your answers.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Data Aggregation</h3>
            <p className="text-sm text-muted-foreground">
              All results are published as anonymized aggregates. Demographic buckets are suppressed
              if sample sizes are too small to protect privacy.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

