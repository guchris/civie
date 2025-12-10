"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

// Mock data - replace with real data from your backend
const participantCount = {
  lastQuestion: 12473,
};

export function ParticipantCountCard() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60; // Number of animation steps
    const increment = participantCount.lastQuestion / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const nextValue = Math.min(
        Math.floor(increment * currentStep),
        participantCount.lastQuestion
      );
      setCount(nextValue);

      if (currentStep >= steps) {
        setCount(participantCount.lastQuestion);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="h-full flex flex-col justify-center p-6 shadow-none dark:bg-black sm:p-8 md:p-10 lg:p-4 min-h-[80px] sm:min-h-[100px] lg:min-h-0">
      <CardContent className="p-0 flex flex-col items-start justify-center gap-2">
        <p className="text-2xl font-bold sm:text-3xl lg:text-4xl">
          {count.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground sm:text-xs">
          answered yesterday's question
        </p>
      </CardContent>
    </Card>
  );
}

