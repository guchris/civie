"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

// Mock data - replace with real data from your backend
const todayQuestion = {
  propNumber: "28",
  title: "Establishes a state minimum wage of $18 per hour by 2026, with annual adjustments thereafter. Initiative statute.",
  date: "December 15, 2025",
  timeRemaining: "18 hours left",
  summary: "Increases the state minimum wage from the current $16 per hour to $18 per hour by January 1, 2026. Requires annual cost-of-living adjustments starting in 2027 based on the Consumer Price Index. Applies to all workers regardless of employer size. Fiscal Impact: Increased state and local government costs potentially in the tens of millions of dollars annually, offset by increased tax revenues.",
  yesMeaning: "The state minimum wage would increase to $18 per hour by 2026, with automatic annual increases tied to inflation starting in 2027. All workers would be covered regardless of business size.",
  noMeaning: "The current minimum wage of $16 per hour would remain in effect. Future increases would continue to be determined by the state legislature rather than automatic adjustments.",
  proArgument: "Proposition 28 ensures workers can keep up with rising costs of living. A higher minimum wage reduces poverty, stimulates local economies as workers spend more, and provides dignity to hardworking families. Vote YES for economic justice.",
  conArgument: "Prop. 28 will force small businesses to cut jobs, raise prices, or close entirely. The automatic increases remove flexibility during economic downturns. Vote NO to protect small businesses and preserve jobs.",
};

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
              {/* Accordion for additional information */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="summary" className="border-none">
                  <AccordionTrigger className="text-xs font-semibold py-2 sm:text-sm">
                    Summary
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                      {todayQuestion.summary}
                    </p>
                  </AccordionContent>
                </AccordionItem>
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
                        {todayQuestion.yesMeaning}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">NO</Badge>
                      </div>
                      <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                        {todayQuestion.noMeaning}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

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
                        {todayQuestion.proArgument}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">CON</Badge>
                      </div>
                      <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                        {todayQuestion.conArgument}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Answer Buttons */}
              <div className="flex flex-col gap-2 py-2">
                <button
                  onClick={() => handleAnswer("yes")}
                  className={`w-full rounded-md border px-3 py-2 text-xs font-medium transition-colors text-left sm:px-4 sm:text-sm ${
                    selectedAnswer === "yes"
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer("no")}
                  className={`w-full rounded-md border px-3 py-2 text-xs font-medium transition-colors text-left sm:px-4 sm:text-sm ${
                    selectedAnswer === "no"
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  No
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
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

