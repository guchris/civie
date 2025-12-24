"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { X, Check } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth, db, doc, getDoc, setDoc, collection, addDoc } from "@/lib/firebase";
import { QuestionData } from "@/lib/question-presets";
import { useUserData } from "@/hooks/use-user-data";
import { 
  getTodayQuestionDate, 
  getTimeRemaining, 
  getTimeRemainingHours,
  getTimeRemainingVariant,
  formatQuestionDate,
  calculateAge,
  calculateUserStats
} from "@/lib/question-utils";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

function WelcomeBanner({ 
  hasSeenWelcome, 
  onDismiss 
}: { 
  hasSeenWelcome: boolean; 
  onDismiss: () => void;
}) {
  if (hasSeenWelcome) return null;

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
          onClick={onDismiss}
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
  const [timeRemainingHours, setTimeRemainingHours] = useState<number>(0);
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(true); // Default to true to prevent flash
  const todayDate = getTodayQuestionDate();

  // Update time remaining every minute
  useEffect(() => {
    setTimeRemaining(getTimeRemaining());
    setTimeRemainingHours(getTimeRemainingHours());
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
      setTimeRemainingHours(getTimeRemainingHours());
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

  // Check if user has seen welcome banner
  useEffect(() => {
    if (userData) {
      setHasSeenWelcome(userData.hasSeenWelcomeBanner === true);
    }
  }, [userData]);

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

  const handleDismissWelcomeBanner = async () => {
    if (!user) return;
    
    setHasSeenWelcome(true);
    
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          hasSeenWelcomeBanner: true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving welcome banner dismissal:", error);
      // Revert on error
      setHasSeenWelcome(false);
    }
  };

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
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer. Please try again.");
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

  // Get the user's selected answer if they've already answered
  const userAnswer = userData?.answers?.[todayDate];
  const submittedAnswerId = userAnswer?.status === "answered" ? userAnswer.answerOptionId : null;

  // Calculate user stats
  const userStats = calculateUserStats(userData?.answers);

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <Suspense fallback={null}>
        <WelcomeBanner 
          hasSeenWelcome={hasSeenWelcome} 
          onDismiss={handleDismissWelcomeBanner}
        />
      </Suspense>

      {/* Stats Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="bg-card border shadow-none cursor-default hover:bg-card justify-start"
          onClick={(e) => e.preventDefault()}
        >
          <span className="text-sm font-medium">Streak</span>
          <Badge variant="secondary" className="ml-2">
            {userStats.streak}
          </Badge>
        </Button>
        <Button
          variant="outline"
          className="bg-card border shadow-none cursor-default hover:bg-card justify-start"
          onClick={(e) => e.preventDefault()}
        >
          <span className="text-sm font-medium">Total</span>
          <Badge variant="secondary" className="ml-2">
            {userStats.totalAnswered}
          </Badge>
        </Button>
      </div>

      {/* Today's Question */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wide sm:text-sm">
              Today's Question
            </CardDescription>
            {(() => {
              const variant = getTimeRemainingVariant(timeRemainingHours);
              const colorClasses = {
                gray: "bg-gray-500 text-white border-transparent",
                yellow: "bg-yellow-500 text-white border-transparent",
                orange: "bg-orange-500 text-white border-transparent",
                red: "bg-red-500 text-white border-transparent",
              };
              return (
                <Badge 
                  variant="outline"
                  className={`text-xs border-transparent ${colorClasses[variant]}`}
                >
                  {timeRemaining}
                </Badge>
              );
            })()}
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
                <button
                  onClick={handleSkip}
                  disabled={status === "submitting"}
                  className="relative w-full rounded-md border px-3 py-2 text-xs font-medium transition-all duration-300 text-left overflow-hidden sm:px-4 sm:text-sm disabled:opacity-50 border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Skip</span>
                </button>
                <div className="flex gap-2 items-center mt-2">
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
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Show question card with answer options (read-only) when already answered/skipped */}
              <div className="flex flex-col gap-2 py-2">
                {question.answerOptions
                  .sort((a, b) => a.order - b.order)
                  .map((option) => {
                    const isSelected = submittedAnswerId === option.id;
                    return (
                      <div
                        key={option.id}
                        className={`relative w-full rounded-md border px-3 py-2 text-xs font-medium transition-all duration-300 text-left overflow-hidden sm:px-4 sm:text-sm ${
                          isSelected
                            ? "border-accent text-accent-foreground scale-[1.02]"
                            : "border-input bg-muted/30 opacity-60"
                        }`}
                      >
                        {isSelected && (
                          <>
                            <div className="absolute inset-0 bg-accent origin-left" />
                            <div className="relative flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              <span>{option.label}</span>
                            </div>
                          </>
                        )}
                        {!isSelected && <span>{option.label}</span>}
                      </div>
                    );
                  })}
                <div
                  className={`relative w-full rounded-md border px-3 py-2 text-xs font-medium transition-all duration-300 text-left overflow-hidden sm:px-4 sm:text-sm ${
                    status === "skipped"
                      ? "border-accent text-accent-foreground scale-[1.02]"
                      : "border-input bg-muted/30 opacity-60"
                  }`}
                >
                  {status === "skipped" ? (
                    <>
                      <div className="absolute inset-0 bg-accent origin-left" />
                      <div className="relative flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>Skip</span>
                      </div>
                    </>
                  ) : (
                    <span>Skip</span>
                  )}
                </div>
              </div>
              {status === "submitted" && (
                <p className="text-xs text-muted-foreground mt-4">
                  Results unlock when voting closes.
                </p>
              )}
            </>
          )}
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
