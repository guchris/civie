"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, X, Check } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth, db, doc, getDoc, setDoc, collection, addDoc } from "@/lib/firebase";
import { QuestionData } from "@/lib/question-presets";
import { useUserData } from "@/hooks/use-user-data";
import { 
  getTodayQuestionDate, 
  getTimeRemaining, 
  formatQuestionDate,
  calculateAge 
} from "@/lib/question-utils";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

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
                  You have until tomorrow at 2 AM to answer today's question.
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
  const { user, userData, loading: userLoading } = useUserData();
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitted" | "skipped" | "submitting">("idle");
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const todayDate = getTodayQuestionDate();

  // Update time remaining every minute
  useEffect(() => {
    setTimeRemaining(getTimeRemaining());
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch today's question
  useEffect(() => {
    const fetchQuestion = async () => {
      if (userLoading) return;

      try {
        const questionRef = doc(db, "questions", todayDate);
        const questionSnap = await getDoc(questionRef);

        if (questionSnap.exists()) {
          const data = questionSnap.data() as QuestionData;
          setQuestion(data);
        } else {
          setQuestion(null);
        }
      } catch (error) {
        console.error("Error fetching question:", error);
        toast.error("Failed to load today's question.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [todayDate, userLoading]);

  // Check user's answer state
  useEffect(() => {
    if (!userData || !userData.answers) {
      setStatus("idle");
      return;
    }

    const userAnswer = userData.answers[todayDate];
    if (userAnswer) {
      if (userAnswer.status === "answered") {
        setStatus("submitted");
      } else if (userAnswer.status === "skipped") {
        setStatus("skipped");
      }
    } else {
      setStatus("idle");
    }
  }, [userData, todayDate]);

  const handleAnswer = (answerId: string) => {
    if (selectedAnswer === answerId) {
      setSelectedAnswer(null);
    } else {
      setSelectedAnswer(answerId);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !question || !user || !userData) return;

    // Validate required demographic data
    if (!userData.birthDate || !userData.gender || !userData.raceEthnicity || !userData.zipCode) {
      toast.error("Missing demographic information. Please complete your profile.");
      return;
    }

    setStatus("submitting");

    try {
      const timestamp = new Date().toISOString();
      const age = calculateAge(userData.birthDate);

      // Save to user document
      const userAnswerData = {
        status: "answered" as const,
        answerOptionId: selectedAnswer,
        timestamp,
      };

      await setDoc(
        doc(db, "users", user.uid),
        {
          answers: {
            ...userData.answers,
            [todayDate]: userAnswerData,
          },
        },
        { merge: true }
      );

      // Save to answers collection for aggregation (anonymous)
      // First ensure the parent document exists
      const answerDateRef = doc(db, "answers", todayDate);
      await setDoc(answerDateRef, { date: todayDate, createdAt: timestamp }, { merge: true });

      // Then add the response to the subcollection
      const responseData = {
        answerOptionId: selectedAnswer,
        age,
        gender: userData.gender,
        raceEthnicity: userData.raceEthnicity,
        zipCode: userData.zipCode,
        timestamp,
      };

      await addDoc(
        collection(db, "answers", todayDate, "responses"),
        responseData
      );

      setStatus("submitted");
      toast.success("Response submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting answer:", error);
      const errorMessage = error?.message || error?.code || "Unknown error";
      console.error("Error details:", {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
      });
      toast.error(`Failed to submit answer: ${errorMessage}. Please try again.`);
      setStatus("idle");
    }
  };

  const handleSkip = async () => {
    if (!user || !userData) return;

    setStatus("submitting");

    try {
      const timestamp = new Date().toISOString();

      const userAnswerData = {
        status: "skipped" as const,
        timestamp,
      };

      await setDoc(
        doc(db, "users", user.uid),
        {
          answers: {
            ...userData.answers,
            [todayDate]: userAnswerData,
          },
        },
        { merge: true }
      );

      setStatus("skipped");
      toast.success("Question skipped.");
    } catch (error) {
      console.error("Error skipping question:", error);
      toast.error("Failed to skip question. Please try again.");
      setStatus("idle");
    }
  };

  if (userLoading || loading) {
    return (
      <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Spinner />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Card className="shadow-none">
          <CardContent className="p-12 text-center">
            <EmptyTitle>No Question Available</EmptyTitle>
            <EmptyDescription>
              There's no question available for today. Please check back later.
            </EmptyDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedDate = formatQuestionDate(todayDate);

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
              Question for {formattedDate}
            </CardDescription>
            <Badge variant="secondary" className="text-xs">
              {timeRemaining}
            </Badge>
          </div>
          <CardTitle className="text-base font-semibold leading-tight sm:text-xl lg:text-2xl">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" || status === "submitting" ? (
            <>
              {/* Answer Buttons - Dynamic based on question type */}
              <div className="flex flex-col gap-2 py-2">
                {question.answerOptions
                  .sort((a, b) => a.order - b.order)
                  .map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      disabled={status === "submitting"}
                      className={`relative w-full rounded-md border px-3 py-2 text-xs font-medium transition-all duration-300 text-left overflow-hidden sm:px-4 sm:text-sm disabled:opacity-50 ${
                        selectedAnswer === option.id
                          ? "border-accent text-accent-foreground scale-[1.02]"
                          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {selectedAnswer === option.id && (
                        <>
                          <div className="absolute inset-0 bg-accent origin-left animate-[fill_0.3s_ease-out_forwards]" />
                          <div className="relative flex items-center gap-2">
                            <Check className="h-4 w-4 animate-[fadeIn_0.3s_ease-out]" />
                            <span>{option.label}</span>
                          </div>
                        </>
                      )}
                      {selectedAnswer !== option.id && <span>{option.label}</span>}
                    </button>
                  ))}
                <div className="flex gap-2 items-center">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer || status === "submitting"}
                    className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                      selectedAnswer && status !== "submitting"
                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-input bg-background text-muted-foreground cursor-not-allowed opacity-50"
                    }`}
                  >
                    {status === "submitting" ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2 inline" />
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                  <button
                    onClick={handleSkip}
                    disabled={status === "submitting"}
                    className="rounded-md border px-3 py-2 text-xs font-medium transition-colors border-input bg-background hover:bg-accent hover:text-accent-foreground sm:px-4 sm:text-sm disabled:opacity-50"
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
          ) : status === "skipped" ? (
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
          ) : null}
        </CardContent>
      </Card>

      {/* Additional Information Cards - Only show if question has this data */}
      {question.summary && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold sm:text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              {question.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* What Your Vote Means - Show if answer options have meanings */}
      {question.answerOptions.some((opt) => opt.meaning) && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold sm:text-base">What Your Answer Means</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {question.answerOptions
              .sort((a, b) => a.order - b.order)
              .filter((opt) => opt.meaning)
              .map((option) => (
                <div key={option.id}>
                  <p className="text-sm font-medium mb-2">{option.label.toUpperCase()}</p>
                  <p className="text-sm leading-relaxed">
                    {option.meaning}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Arguments Card */}
      {question.arguments && (question.arguments.pro || question.arguments.con) && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold sm:text-base">Arguments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {question.arguments.pro && (
              <div>
                <p className="text-sm font-medium mb-2">PRO</p>
                <p className="text-sm leading-relaxed">
                  {question.arguments.pro}
                </p>
              </div>
            )}
            {question.arguments.con && (
              <div>
                <p className="text-sm font-medium mb-2">CON</p>
                <p className="text-sm leading-relaxed">
                  {question.arguments.con}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
