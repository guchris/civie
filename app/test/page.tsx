"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { db, doc, setDoc, getDoc, collection, getDocs } from "@/lib/firebase";
import { increment } from "firebase/firestore";
import { QuestionData } from "@/lib/question-presets";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const TEST_DATE = "mock-question";

// Helper to get color for an answer option
const getAnswerColor = (index: number) => {
  const colors = ["#3b82f6", "#f97316", "#8b5cf6", "#10b981", "#ec4899", "#f59e0b", "#06b6d4", "#84cc16"];
  return colors[index % colors.length];
};

const SKIP_COLOR = "#6b7280"; // gray

export default function TestPage() {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [questionDocId, setQuestionDocId] = useState<string | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitted" | "skipped" | "submitting">("idle");
  const [counts, setCounts] = useState<{ yes: number; no: number; skip: number }>({ yes: 0, no: 0, skip: 0 });
  const [countsLoading, setCountsLoading] = useState(true);

  // Fetch question from Firebase (first document in mock collection)
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const mockCollection = collection(db, "mock");
        const snapshot = await getDocs(mockCollection);

        if (!snapshot.empty) {
          // Get the first document
          const firstDoc = snapshot.docs[0];
          const data = firstDoc.data();
          const docId = firstDoc.id;
          
          // Provide defaults for required fields that might be missing
          const questionData: QuestionData = {
            date: data.date || "mock-question",
            question: data.question || "",
            summary: data.summary || "",
            answerType: data.answerType || "binary",
            answerOptions: (data.answerOptions || []).map((opt: any) => ({
              id: opt.id,
              label: opt.label,
              meaning: opt.meaning || "",
              order: opt.order || 0,
            })),
          };
          setQuestion(questionData);
          setQuestionDocId(docId);
        } else {
          setQuestion(null);
          setQuestionDocId(null);
          console.error("No documents found in mock collection");
          toast.error("No question found. Please create a document in the \"mock\" collection.");
        }
      } catch (error: any) {
        console.error("Error fetching question:", error);
        if (error?.code === "permission-denied") {
          toast.error("Permission denied. Please check Firestore security rules.");
        } else {
          toast.error("Failed to load question.");
        }
      } finally {
        setQuestionLoading(false);
      }
    };

    fetchQuestion();
  }, []);


  // Fetch counts from Firebase
  useEffect(() => {
    const fetchCounts = async () => {
      if (!questionDocId) {
        setCountsLoading(false);
        return;
      }

      try {
        const countsRef = doc(db, "mock", questionDocId);
        const countsSnap = await getDoc(countsRef);
        
        if (countsSnap.exists()) {
          const data = countsSnap.data();
          setCounts({
            yes: data.yes || 0,
            no: data.no || 0,
            skip: data.skip || 0,
          });
        } else {
          setCounts({ yes: 0, no: 0, skip: 0 });
        }
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setCountsLoading(false);
      }
    };

    fetchCounts();
    // Refresh every 2 seconds to get updated counts
    const interval = setInterval(fetchCounts, 2000);
    return () => clearInterval(interval);
  }, [questionDocId]);

  // Calculate results data
  const resultsData = useMemo(() => {
    if (!question) return null;

    const total = counts.yes + counts.no + counts.skip;
    if (total === 0) return null;

    const answerTotal = counts.yes + counts.no;
    
    const answerDistribution = question.answerOptions
      .sort((a, b) => a.order - b.order)
      .map((option, index) => ({
        answer: option.id,
        label: option.label,
        count: counts[option.id as "yes" | "no"] || 0,
        percentage: answerTotal > 0 ? Math.round((counts[option.id as "yes" | "no"] / answerTotal) * 100) : 0,
        fill: getAnswerColor(index),
      }));

    // Add skip to distribution
    answerDistribution.push({
      answer: "skip",
      label: "Skip",
      count: counts.skip || 0,
      percentage: total > 0 ? Math.round((counts.skip / total) * 100) : 0,
      fill: SKIP_COLOR,
    });

    return {
      answerDistribution,
      total,
    };
  }, [question, counts]);

  // Calculate winner data
  const winnerData = useMemo(() => {
    if (!resultsData || !resultsData.answerDistribution.length) return null;

    const nonSkipAnswers = resultsData.answerDistribution
      .filter((item) => item.answer !== "skip")
      .sort((a, b) => b.count - a.count);

    if (nonSkipAnswers.length === 0) return null;

    const winner = nonSkipAnswers[0];
    const secondPlace = nonSkipAnswers.length > 1 ? nonSkipAnswers[1] : null;

    const marginPercentage = secondPlace
      ? winner.percentage - secondPlace.percentage
      : winner.percentage;
    const marginCount = secondPlace
      ? winner.count - secondPlace.count
      : winner.count;

    const isTie = secondPlace && winner.count === secondPlace.count;

    const winnerCount = winner.count;
    const winnerIds = nonSkipAnswers
      .filter((item) => item.count === winnerCount)
      .map((item) => item.answer);

    return {
      winner,
      secondPlace,
      marginPercentage: Math.round(marginPercentage),
      marginCount,
      isTie,
      winnerIds,
    };
  }, [resultsData]);

  const handleAnswer = (answerId: string) => {
    if (selectedAnswer === answerId) {
      setSelectedAnswer(null);
    } else {
      setSelectedAnswer(answerId);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      return;
    }

    setStatus("submitting");

    try {
      // Increment count for the selected answer in mock collection
      if (questionDocId) {
        const countsRef = doc(db, "mock", questionDocId);
        await setDoc(
          countsRef,
          {
            [selectedAnswer]: increment(1),
          },
          { merge: true }
        );
      }

      setStatus("submitted");
      toast.success("Response submitted successfully!");
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer. Please try again.");
      setStatus("idle");
    }
  };

  const handleSkip = async () => {
    setStatus("submitting");

    try {
      // Increment skip count in mock collection
      if (questionDocId) {
        const countsRef = doc(db, "mock", questionDocId);
        await setDoc(
          countsRef,
          {
            skip: increment(1),
          },
          { merge: true }
        );
      }

      setStatus("skipped");
      toast.success("Question skipped.");
    } catch (error) {
      console.error("Error skipping question:", error);
      toast.error("Failed to skip question. Please try again.");
      setStatus("idle");
    }
  };

  const userAnswerId = status === "submitted" && selectedAnswer 
    ? selectedAnswer 
    : status === "skipped" 
    ? "skip" 
    : null;

  if (questionLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-muted-foreground">No question available.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="flex justify-center px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-4xl w-full">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">civie</span>
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500">Beta</Badge>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        {/* Manifesto Card */}
        <Card className="bg-gray-900 dark:bg-gray-950 border-gray-800 dark:border-gray-900 max-w-4xl w-full py-0">
          <CardContent className="p-8 sm:p-12">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Manifesto</h2>
            <p className="text-2xl sm:text-3xl md:text-4xl font-mono text-white leading-relaxed mb-8">
              Your voice matters. Your opinion counts. Stop waiting for someone else to speak up. This is your platform. Every day, we ask the questions that shape our future. Answer honestly. Share freely. Change starts with you.
            </p>
            <Button className="rounded-full bg-white text-gray-900 hover:bg-gray-100 dark:bg-white dark:text-gray-900" size="lg">
              Join Waitlist
            </Button>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="shadow-none max-w-4xl w-full">
          <CardHeader>
            <CardTitle className="text-xl font-semibold mb-2">Daily Questions</CardTitle>
            <CardDescription>
              Every 24 hours, a new question is released. Answer within the day to unlock anonymized results and see how your opinion compares with others.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-base font-semibold leading-tight sm:text-lg mb-4">
                {question.question}
              </h3>
              {status === "idle" || status === "submitting" ? (
                <>
                  {/* Answer Buttons */}
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
              ) : (
                <>
                  {/* Show question card with answer options (read-only) when already answered/skipped */}
                  <div className="flex flex-col gap-2 py-2">
                    {question.answerOptions
                      .sort((a, b) => a.order - b.order)
                      .map((option) => {
                        const isSelected = userAnswerId === option.id;
                        return (
                          <div
                            key={option.id}
                            className={`relative w-full rounded-md border px-3 py-2 text-xs font-medium text-left overflow-hidden sm:px-4 sm:text-sm ${
                              isSelected
                                ? "border-accent text-accent-foreground"
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
                          ? "border-accent text-accent-foreground"
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
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        {resultsData && resultsData.total > 0 && (
          <Card className="shadow-none max-w-4xl w-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold mb-2">Daily Results</CardTitle>
              <CardDescription>
                See how others responded to today&apos;s question
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {countsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Answer Options with Percentages */}
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      {resultsData.answerDistribution.map((item) => {
                        const isUserAnswer = userAnswerId === item.answer;
                        const isWinner = winnerData && winnerData.winnerIds.includes(item.answer);
                        return (
                          <div
                            key={item.answer}
                            className="relative w-full rounded-md border overflow-hidden px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm border-input bg-background"
                          >
                            {/* Animated fill bar */}
                            <div
                              className={`absolute inset-0 origin-left transition-all duration-1000 ease-out ${
                                isWinner ? "bg-amber-500/50" : "bg-accent"
                              }`}
                              style={{ width: `${item.percentage}%` }}
                            />
                            {/* Content */}
                            <div className="relative flex items-center justify-between z-10">
                              <div className="flex items-center gap-2">
                                {isUserAnswer && (
                                  <Check className="h-4 w-4" />
                                )}
                                <span>{item.label}</span>
                              </div>
                              <span className="text-muted-foreground">{item.percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {resultsData.total > 0 && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Based on {resultsData.total.toLocaleString()} {resultsData.total === 1 ? "response" : "responses"}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
