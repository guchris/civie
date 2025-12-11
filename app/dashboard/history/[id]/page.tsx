"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, BarChart3, Lock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
      skip: 10,
    },
    totalResponses: 12473,
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
      skip: 5,
    },
    totalResponses: 15234,
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
      skip: 10,
    },
    totalResponses: 9876,
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
      skip: 7,
    },
    totalResponses: 11234,
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
      skip: 10,
    },
    totalResponses: 8765,
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
      skip: 7,
    },
    totalResponses: 6543,
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
      skip: 6,
    },
    totalResponses: 14321,
  },
];

const chartConfig = {
  percentage: {
    label: "Percentage",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function ResultsChart({ results }: { results: { yes: number; no: number; skip: number } }) {
  const chartData = [
    {
      response: "Yes",
      percentage: results.yes,
    },
    {
      response: "No",
      percentage: results.no,
    },
    {
      response: "Skip",
      percentage: results.skip,
    },
  ];

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="response"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="percentage" fill="var(--color-percentage)" radius={8}>
          <LabelList
            dataKey="percentage"
            position="top"
            formatter={(value: number) => `${value}%`}
            className="fill-foreground text-xs"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

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
          <CardDescription className="text-xs font-medium uppercase tracking-wide sm:text-sm mb-2">
            {question.date}
          </CardDescription>
          <CardTitle className="text-base font-semibold leading-tight sm:text-xl lg:text-2xl text-left mb-4">
            {question.question}
          </CardTitle>
          <div className="flex gap-2">
            {question.answered ? (
              <Badge variant="default" className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="h-3 w-3" />
                Answered
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Skipped
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Question content - empty for now, just the question title is shown */}
        </CardContent>
      </Card>

      {/* Results Card */}
      {question.resultsUnlocked && question.results ? (
        <>
          {/* Insights Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Total Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {question.totalResponses?.toLocaleString() || "N/A"}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Majority Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const { yes, no } = question.results;
                    const margin = Math.abs(yes - no);
                    const winner = yes > no ? "Yes" : "No";
                    return `${winner} leads by ${margin}%`;
                  })()}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Participation Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const total = question.totalResponses || 0;
                    if (total >= 10000) return "High";
                    if (total >= 5000) return "Medium";
                    return "Low";
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Chart Card */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-sm font-semibold sm:text-base">Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsChart results={question.results} />
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="text-muted-foreground leading-none">
                Results are anonymized and aggregated. Your individual response is never stored.
              </div>
            </CardFooter>
          </Card>
        </>
      ) : (
        <Card className="shadow-none">
          <CardContent className="p-6 text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="font-medium mb-2">Results unlock only when you participate</p>
            <p className="text-sm text-muted-foreground mb-4">
              Answer the question on the day it's asked to unlock anonymized results the next day.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/data">View Open Datasets</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Additional Information Cards */}
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

      {question.yesMeaning && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold sm:text-base">What Your Vote Means</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">YES</p>
              <p className="text-sm leading-relaxed">
                {question.yesMeaning}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">NO</p>
              <p className="text-sm leading-relaxed">
                {question.noMeaning}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {question.proArgument && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold sm:text-base">Arguments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">PRO</p>
              <p className="text-sm leading-relaxed">
                {question.proArgument}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">CON</p>
              <p className="text-sm leading-relaxed">
                {question.conArgument}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

