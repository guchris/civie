"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, Share2, Clock } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { db, doc, getDoc, collection, getDocs } from "@/lib/firebase";
import { useUserData } from "@/hooks/use-user-data";
import { QuestionData, AnswerOption } from "@/lib/question-presets";
import { Spinner } from "@/components/ui/spinner";
import { getTodayQuestionDate } from "@/lib/question-utils";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;
  const { userData, loading: userLoading } = useUserData();
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [answered, setAnswered] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answerPercentages, setAnswerPercentages] = useState<Record<string, number>>({});
  const [skipPercentage, setSkipPercentage] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);

  // The questionId is now directly the date (YYYY-MM-DD format)
  const date = questionId;

  // Fetch question and answer data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (userLoading) return;

      try {
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          console.error("Invalid date format:", date);
          setLoading(false);
          return;
        }

        // Fetch question
        const questionRef = doc(db, "questions", date);
        const questionSnap = await getDoc(questionRef);

        if (questionSnap.exists()) {
          const data = questionSnap.data() as QuestionData;
          setQuestion(data);

          // Check user's answer status
          const userAnswer = userData?.answers?.[date];
          if (userAnswer) {
            setAnswered(userAnswer.status === "answered");
            setSkipped(userAnswer.status === "skipped");
          }

          // Fetch responses for aggregation
          // Only fetch if this is a past question (before today's question date)
          const todayDate = getTodayQuestionDate();
          if (date < todayDate) {
            try {
              const responsesRef = collection(db, "answers", date, "responses");
              const responsesSnap = await getDocs(responsesRef);

              // Count responses by answerOptionId
              const counts: Record<string, number> = {};
              let totalAnswered = 0;
              let totalSkipped = 0;

              responsesSnap.forEach((doc) => {
                const responseData = doc.data();
                const optionId = responseData.answerOptionId;
                if (optionId === "skip") {
                  totalSkipped++;
                } else if (optionId) {
                  counts[optionId] = (counts[optionId] || 0) + 1;
                  totalAnswered++;
                }
              });

              const total = totalAnswered + totalSkipped;

              // Calculate percentages
              const percentages: Record<string, number> = {};
              if (total > 0) {
                Object.keys(counts).forEach((optionId) => {
                  percentages[optionId] = Math.round((counts[optionId] / total) * 100);
                });
                setSkipPercentage(Math.round((totalSkipped / total) * 100));
              } else {
                setSkipPercentage(0);
              }

              setAnswerPercentages(percentages);
              setTotalResponses(total);
            } catch (error) {
              console.error("Error fetching responses:", error);
              // If we can't fetch responses (e.g., permission denied), set defaults
              setAnswerPercentages({});
              setSkipPercentage(0);
              setTotalResponses(0);
            }
          }
        } else {
          setQuestion(null);
        }
      } catch (error) {
        console.error("Error fetching question:", error);
        setQuestion(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, userData, userLoading]);

  if (loading || userLoading) {
    return (
      <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Spinner />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="shadow-none">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Question not found.</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/history">Back to History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedDate = format(parseISO(date), "MMMM d, yyyy");
  const todayDate = getTodayQuestionDate();
  const isPending = date === todayDate;

  // If this is today's question, show pending state
  if (isPending) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="shadow-none"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="shadow-none">
          <CardHeader>
            <CardDescription className="text-xs font-medium uppercase tracking-wide sm:text-sm">
              {formattedDate}
            </CardDescription>
            <CardTitle className="text-base font-semibold leading-tight sm:text-xl lg:text-2xl text-left">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-muted-foreground">Results will be available soon</p>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/dashboard/history">Back to History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button and Share Button */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="shadow-none"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="shadow-none"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Question Card */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wide sm:text-sm">
              {formattedDate}
          </CardDescription>
            {(answered || skipped) && (
              <Badge 
                variant={answered ? "default" : "secondary"} 
                className={`flex items-center gap-1 text-xs ${answered ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
              >
                {answered ? (
                  <>
                <CheckCircle2 className="h-3 w-3" />
                Answered
                  </>
            ) : (
                  <>
                <XCircle className="h-3 w-3" />
                Skipped
                  </>
                )}
              </Badge>
            )}
          </div>
          <CardTitle className="text-base font-semibold leading-tight sm:text-xl lg:text-2xl text-left">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options with Percentages */}
          {question.answerOptions && question.answerOptions.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                {question.answerOptions
                  .sort((a, b) => a.order - b.order)
                  .map((option) => {
                    const percentage = answerPercentages[option.id] || 0;
                    return (
                      <div
                        key={option.id}
                        className="relative w-full rounded-md border overflow-hidden px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm border-input bg-background"
                      >
                        {/* Animated fill bar */}
                        <div
                          className="absolute inset-0 bg-primary/10 origin-left transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                        {/* Content */}
                        <div className="relative flex items-center justify-between z-10">
                          <span>{option.label}</span>
                          <span className="text-muted-foreground">{percentage}%</span>
                        </div>
                </div>
                    );
                  })}
                {/* Skip row - always show at bottom */}
                <div className="relative w-full rounded-md border overflow-hidden px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm border-input bg-background">
                  {/* Animated fill bar */}
                  <div
                    className="absolute inset-0 bg-primary/10 origin-left transition-all duration-1000 ease-out"
                    style={{ width: `${skipPercentage}%` }}
                  />
                  {/* Content */}
                  <div className="relative flex items-center justify-between z-10">
                    <span>Skip</span>
                    <span className="text-muted-foreground">{skipPercentage}%</span>
                </div>
                </div>
              </div>
              {totalResponses > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  Based on {totalResponses.toLocaleString()} {totalResponses === 1 ? "response" : "responses"}
              </p>
              )}
            </div>
          )}
          </CardContent>
        </Card>
    </div>
  );
}

