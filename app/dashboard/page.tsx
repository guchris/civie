"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, X, Sparkles, Check } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Mock data - replace with real data from your backend
const todayQuestion = {
  propNumber: "28",
  title: "Establishes a state minimum wage of $18 per hour by 2026, with annual adjustments thereafter. Initiative statute.",
  date: "Dec 15",
  timeRemaining: "18 hours left",
  summary: "Increases the state minimum wage from the current $16 per hour to $18 per hour by January 1, 2026. Requires annual cost-of-living adjustments starting in 2027 based on the Consumer Price Index. Applies to all workers regardless of employer size. Fiscal Impact: Increased state and local government costs potentially in the tens of millions of dollars annually, offset by increased tax revenues.",
  yesMeaning: "The state minimum wage would increase to $18 per hour by 2026, with automatic annual increases tied to inflation starting in 2027. All workers would be covered regardless of business size.",
  noMeaning: "The current minimum wage of $16 per hour would remain in effect. Future increases would continue to be determined by the state legislature rather than automatic adjustments.",
  proArgument: "Proposition 28 ensures workers can keep up with rising costs of living. A higher minimum wage reduces poverty, stimulates local economies as workers spend more, and provides dignity to hardworking families. Vote YES for economic justice.",
  conArgument: "Prop. 28 will force small businesses to cut jobs, raise prices, or close entirely. The automatic increases remove flexibility during economic downturns. Vote NO to protect small businesses and preserve jobs.",
};

function WelcomeBanner() {
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  const dismissBanner = () => {
    setShowWelcomeBanner(false);
  };

  if (!showWelcomeBanner) return null;

  return (
    <div className="rounded-lg border border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-1 text-green-900 dark:text-green-100">
              Welcome to civie!
            </h3>
            <p className="text-xs text-green-800 dark:text-green-200 mb-3">
              Answer today's question to unlock results tomorrow
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 dark:bg-green-500 text-white text-xs font-bold">
                1
              </div>
              <div>
                <p className="text-xs font-medium text-green-900 dark:text-green-100">Answer within 24 hours</p>
                <p className="text-xs text-green-800 dark:text-green-200 mt-0.5">
                  You have until tomorrow at 9 AM to answer today's question.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 dark:bg-green-500 text-white text-xs font-bold">
                2
              </div>
              <div>
                <p className="text-xs font-medium text-green-900 dark:text-green-100">Unlock results tomorrow</p>
                <p className="text-xs text-green-800 dark:text-green-200 mt-0.5">
                  View anonymized results with demographic breakdowns in History.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 dark:bg-green-500 text-white text-xs font-bold">
                3
              </div>
              <div>
                <p className="text-xs font-medium text-green-900 dark:text-green-100">Build your streak</p>
                <p className="text-xs text-green-800 dark:text-green-200 mt-0.5">
                  Answer daily to maintain your streak and earn badges.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={dismissBanner}
          className="h-6 w-6 shrink-0 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitted" | "skipped">("idle");

  const handleAnswer = (answer: string) => {
    if (selectedAnswer === answer) {
      setSelectedAnswer(null);
    } else {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer && selectedAnswer !== "skip") {
      setStatus("submitted");
    }
  };

  const handleSkip = () => {
    setStatus("skipped");
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <Suspense fallback={null}>
        <WelcomeBanner />
      </Suspense>

      {/* Today's Question */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wide sm:text-sm">
              Question for {todayQuestion.date}
            </CardDescription>
            <Badge variant="secondary" className="text-xs">
              {todayQuestion.timeRemaining}
            </Badge>
          </div>
          <CardTitle className="text-base font-semibold leading-tight sm:text-xl lg:text-2xl">
            {todayQuestion.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" ? (
            <>
              {/* Answer Buttons */}
              <div className="flex flex-col gap-2 py-2">
                <button
                  onClick={() => handleAnswer("yes")}
                  className={`relative w-full rounded-md border px-3 py-2 text-xs font-medium transition-all duration-300 text-left overflow-hidden sm:px-4 sm:text-sm ${
                    selectedAnswer === "yes"
                      ? "border-accent text-accent-foreground scale-[1.02]"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {selectedAnswer === "yes" && (
                    <>
                      <div className="absolute inset-0 bg-accent origin-left animate-[fill_0.3s_ease-out_forwards]" />
                      <div className="relative flex items-center gap-2">
                        <Check className="h-4 w-4 animate-[fadeIn_0.3s_ease-out]" />
                        <span>Yes</span>
                      </div>
                    </>
                  )}
                  {selectedAnswer !== "yes" && <span>Yes</span>}
                </button>
                <button
                  onClick={() => handleAnswer("no")}
                  className={`relative w-full rounded-md border px-3 py-2 text-xs font-medium transition-all duration-300 text-left overflow-hidden sm:px-4 sm:text-sm ${
                    selectedAnswer === "no"
                      ? "border-accent text-accent-foreground scale-[1.02]"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {selectedAnswer === "no" && (
                    <>
                      <div className="absolute inset-0 bg-accent origin-left animate-[fill_0.3s_ease-out_forwards]" />
                      <div className="relative flex items-center gap-2">
                        <Check className="h-4 w-4 animate-[fadeIn_0.3s_ease-out]" />
                        <span>No</span>
                      </div>
                    </>
                  )}
                  {selectedAnswer !== "no" && <span>No</span>}
                </button>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer || selectedAnswer === "skip"}
                    className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                      selectedAnswer && selectedAnswer !== "skip"
                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-input bg-background text-muted-foreground cursor-not-allowed opacity-50"
                    }`}
                  >
                    Submit
                  </button>
                  <button
                    onClick={handleSkip}
                    className="rounded-md border px-3 py-2 text-xs font-medium transition-colors border-input bg-background hover:bg-accent hover:text-accent-foreground sm:px-4 sm:text-sm"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </>
          ) : status === "submitted" ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </EmptyMedia>
                <EmptyTitle>Response Submitted</EmptyTitle>
                <EmptyDescription>
                  You've answered today's question! Come back tomorrow to see results and answer the next question.
                </EmptyDescription>
              </EmptyHeader>
              <div className="mt-6">
                <Button asChild variant="secondary">
                  <Link href="/dashboard/history">View History</Link>
                </Button>
              </div>
            </Empty>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <XCircle className="h-6 w-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Question Skipped</EmptyTitle>
                <EmptyDescription>
                  You've skipped today's question. Come back tomorrow for a new question.
                </EmptyDescription>
              </EmptyHeader>
              <div className="mt-6">
                <Button asChild variant="secondary">
                  <Link href="/dashboard/history">View History</Link>
                </Button>
              </div>
            </Empty>
          )}
        </CardContent>
      </Card>

      {/* Additional Information Cards - Always visible */}
      <>
        {/* Summary Card */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold sm:text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              {todayQuestion.summary}
            </p>
          </CardContent>
        </Card>

        {/* What Your Vote Means Card */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold sm:text-base">What Your Vote Means</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">YES</p>
              <p className="text-sm leading-relaxed">
                {todayQuestion.yesMeaning}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">NO</p>
              <p className="text-sm leading-relaxed">
                {todayQuestion.noMeaning}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Arguments Card */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold sm:text-base">Arguments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">PRO</p>
              <p className="text-sm leading-relaxed">
                {todayQuestion.proArgument}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">CON</p>
              <p className="text-sm leading-relaxed">
                {todayQuestion.conArgument}
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    </div>
  );
}

