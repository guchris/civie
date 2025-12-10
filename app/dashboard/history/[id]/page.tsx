"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, BarChart3, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// Mock data - replace with real data from your backend
// In production, this would be fetched based on the ID
const pastQuestions = [
  {
    id: "q-2025-12-14",
    date: "December 14, 2025",
    question: "Do you support increasing the minimum wage in your state?",
    answered: true,
    resultsUnlocked: true,
    results: {
      yes: 62,
      no: 28,
      unsure: 10,
    },
    summary: "Increases the state minimum wage from the current $16 per hour to $18 per hour by January 1, 2026. Requires annual cost-of-living adjustments starting in 2027 based on the Consumer Price Index.",
    yesMeaning: "The state minimum wage would increase to $18 per hour by 2026, with automatic annual increases tied to inflation starting in 2027.",
    noMeaning: "The current minimum wage of $16 per hour would remain in effect. Future increases would continue to be determined by the state legislature.",
    proArgument: "Proposition 28 ensures workers can keep up with rising costs of living. A higher minimum wage reduces poverty, stimulates local economies as workers spend more, and provides dignity to hardworking families.",
    conArgument: "Prop. 28 will force small businesses to cut jobs, raise prices, or close entirely. The automatic increases remove flexibility during economic downturns.",
  },
  {
    id: "q-2025-12-13",
    date: "December 13, 2025",
    question: "Should your city invest more in renewable energy infrastructure?",
    answered: true,
    resultsUnlocked: true,
    results: {
      yes: 75,
      no: 20,
      unsure: 5,
    },
  },
  {
    id: "q-2025-12-12",
    date: "December 12, 2025",
    question: "Do you believe your state should expand access to early childhood education?",
    answered: false,
    resultsUnlocked: true,
    results: {
      yes: 58,
      no: 32,
      unsure: 10,
    },
  },
  {
    id: "q-2025-12-11",
    date: "December 11, 2025",
    question: "Should your state implement stricter emissions standards for vehicles?",
    answered: true,
    resultsUnlocked: true,
    results: {
      yes: 68,
      no: 25,
      unsure: 7,
    },
  },
  {
    id: "q-2025-11-15",
    date: "November 15, 2025",
    question: "Do you support expanding public healthcare coverage?",
    answered: true,
    resultsUnlocked: true,
    results: {
      yes: 55,
      no: 35,
      unsure: 10,
    },
  },
  {
    id: "q-2025-11-14",
    date: "November 14, 2025",
    question: "Should your state increase funding for public libraries?",
    answered: false,
    resultsUnlocked: true,
    results: {
      yes: 71,
      no: 22,
      unsure: 7,
    },
  },
  {
    id: "q-2025-10-20",
    date: "October 20, 2025",
    question: "Do you support implementing a state-wide recycling program?",
    answered: true,
    resultsUnlocked: true,
    results: {
      yes: 82,
      no: 12,
      unsure: 6,
    },
  },
];

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  const question = pastQuestions.find((q) => q.id === questionId);

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

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Question Card */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wide sm:text-sm">
              {question.date}
            </CardDescription>
            <div className="flex gap-2">
              {question.answered ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Answered
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Skipped
                </Badge>
              )}
              {question.resultsUnlocked ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Results Available
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-base font-semibold leading-tight sm:text-xl lg:text-2xl text-left">
            {question.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Additional question details if available */}
          {(question.summary || question.yesMeaning || question.proArgument) && (
            <Accordion type="single" collapsible className="w-full">
              {question.summary && (
                <AccordionItem value="summary" className="border-none">
                  <AccordionTrigger className="text-xs font-semibold py-2 sm:text-sm">
                    Summary
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                      {question.summary}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}

              {question.yesMeaning && (
                <AccordionItem value="vote-meaning" className="border-none">
                  <AccordionTrigger className="text-xs font-semibold py-2 sm:text-sm">
                    What Your Vote Means
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="text-xs">YES</Badge>
                      </div>
                      <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                        {question.yesMeaning}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">NO</Badge>
                      </div>
                      <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                        {question.noMeaning}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {question.proArgument && (
                <AccordionItem value="arguments" className="border-none">
                  <AccordionTrigger className="text-xs font-semibold py-2 sm:text-sm">
                    Arguments
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="text-xs">PRO</Badge>
                      </div>
                      <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                        {question.proArgument}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">CON</Badge>
                      </div>
                      <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                        {question.conArgument}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          )}

          {/* Results */}
          {question.resultsUnlocked && question.results ? (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold">Results</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Yes</span>
                    <span className="font-medium">{question.results.yes}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${question.results.yes}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>No</span>
                    <span className="font-medium">{question.results.no}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${question.results.no}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Unsure</span>
                    <span className="font-medium">{question.results.unsure}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${question.results.unsure}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Results are anonymized and aggregated. Your individual response is never stored.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted p-6 text-center">
              <Lock className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="font-medium mb-2">Results unlock only when you participate</p>
              <p className="text-sm text-muted-foreground mb-4">
                Answer the question on the day it's asked to unlock anonymized results the next day.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/data">View Open Datasets</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

