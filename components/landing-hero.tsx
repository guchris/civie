"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import { ThemeToggleCard } from "@/components/theme-toggle-card";
import { PrivacyCard } from "@/components/privacy-card";
import { ParticipantCountCard } from "@/components/participant-count-card";
import { AnimatedLogo } from "@/components/animated-logo";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useState } from "react";

const exampleQuestion = {
  propNumber: "50",
  title: "Authorizes temporary changes to congressional district maps in response to Texas' partisan redistricting. Legislative constitutional amendment.",
  date: "December 15, 2025",
  timeRemaining: "18 hours left",
  summary: "Requires temporary use of new congressional district maps through 2030. Directs independent Citizens Redistricting Commission to resume enacting congressional district maps in 2031. Establishes policy supporting nonpartisan redistricting commissions nationwide. Fiscal Impact: One-time costs to counties of up to a few million dollars statewide to update election materials to reflect new congressional district maps.",
  yesMeaning: "The state would use new, legislatively drawn congressional district maps starting in 2026. California's new maps would be used until the California Citizens Redistricting Commission draws new maps following the 2030 U.S. Census.",
  noMeaning: "Current congressional district maps drawn by the California Citizens Redistricting Commission (Commission) would continue to be used in California until the Commission draws new maps following the 2030 U.S. Census.",
  proArgument: "Proposition 50—The Election Rigging Response Act—approves temporary, emergency congressional district maps to counter Donald Trump's scheme to rig next year's congressional election and reaffirms California's commitment to independent, nonpartisan redistricting after the next census. Vote Yes on 50 for democracy in all 50 states.",
  conArgument: "Prop. 50 was written by politicians, for politicians—dismantling safeguards that keep elections fair, removes requirements to keep local communities together, and eliminates voter protections that ban maps designed to favor political parties. Vote NO to protect fair elections and keep citizens—not politicians—in charge of redistricting.",
};

export function LandingHero() {
  const [isLogoActive, setIsLogoActive] = useState(false);
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
    <section className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="grid grid-cols-2 gap-6 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-6 lg:gap-6">
        {/* Brand Card - Large square */}
        <Card
          className="flex items-center justify-center p-8 shadow-none dark:bg-black col-span-2 sm:col-span-2 sm:p-12 md:p-16 lg:p-6 lg:col-span-2 lg:row-span-2 cursor-pointer min-h-[200px] sm:min-h-[250px] lg:min-h-0"
          onMouseEnter={() => setIsLogoActive(true)}
          onMouseLeave={() => setIsLogoActive(false)}
          onTouchStart={() => setIsLogoActive(true)}
          onTouchEnd={() => setIsLogoActive(false)}
        >
          <CardContent className="p-0">
            <AnimatedLogo isActive={isLogoActive} />
          </CardContent>
        </Card>

        {/* Main Headline Card - Wide */}
        <Card className="flex flex-col justify-center p-8 shadow-none dark:bg-black col-span-2 sm:col-span-2 sm:p-10 md:p-12 lg:p-6 lg:col-span-2 lg:row-span-1 min-h-[120px] sm:min-h-[140px] lg:min-h-0">
          <CardContent className="p-0">
            <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Your say, every day.
            </h2>
          </CardContent>
        </Card>

        {/* Anonymous Dialogue Card - Medium */}
        <Card className="flex flex-col justify-center p-8 shadow-none dark:bg-black col-span-1 sm:col-span-1 sm:p-10 md:p-12 lg:p-6 lg:col-span-1 lg:row-span-1 min-h-[120px] sm:min-h-[140px] lg:min-h-0">
          <CardContent className="p-0">
            <p className="text-lg font-bold sm:text-2xl">
              Anonymous civic dialogue.
            </p>
          </CardContent>
        </Card>

        {/* Privacy, Theme, and Count Cards - 2x2 grid */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-1 lg:row-span-1 grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 lg:gap-2">
          {/* Privacy Card - Top Left */}
          <div className="h-full">
            <PrivacyCard />
          </div>
          {/* Theme Toggle Card - Top Right */}
          <div className="h-full">
            <ThemeToggleCard />
          </div>
          {/* Participant Count Card - Bottom, spans both columns */}
          <div className="h-full col-span-2">
            <ParticipantCountCard />
          </div>
        </div>

        {/* Example Question Card - Large wide */}
        <Card className="flex flex-col shadow-none dark:bg-black col-span-2 sm:col-span-2 lg:col-span-3 lg:row-span-2 min-h-[250px] sm:min-h-[300px] lg:min-h-0">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wide sm:text-sm">
                Example Question
              </CardDescription>
              <Badge variant="secondary" className="text-xs">
                {exampleQuestion.timeRemaining}
              </Badge>
            </div>
            <CardTitle className="text-base font-semibold leading-tight sm:text-xl lg:text-2xl">
              {exampleQuestion.title}
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
                        {exampleQuestion.summary}
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
                          {exampleQuestion.yesMeaning}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">NO</Badge>
                        </div>
                        <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                          {exampleQuestion.noMeaning}
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
                          {exampleQuestion.proArgument}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive" className="text-xs">CON</Badge>
                        </div>
                        <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                          {exampleQuestion.conArgument}
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

        {/* Get Started - Clickable Card - Half Height on Desktop */}
        <Link href="/signup" className="block h-full col-span-1 sm:col-span-1 lg:col-span-1 lg:row-span-1 lg:row-start-3">
          <Card className="h-full flex flex-col justify-center p-8 shadow-none transition-all hover:bg-accent dark:bg-black cursor-pointer sm:p-10 md:p-12 lg:p-6 min-h-[120px] sm:min-h-[140px] lg:min-h-0 relative">
            <CardContent className="p-0">
              <span className="text-xl font-semibold sm:text-2xl lg:text-3xl">Get Started</span>
              <ArrowUpRight className="absolute top-4 right-4 h-6 w-6 sm:h-8 sm:w-8 lg:h-7 lg:w-7" />
            </CardContent>
          </Card>
        </Link>

        {/* Log In - Clickable Card - Next to Get Started on mobile, underneath on desktop */}
        <Link href="/login" className="block h-full col-span-1 sm:col-span-1 lg:col-span-1 lg:row-span-1 lg:row-start-4">
          <Card className="h-full flex flex-col justify-center p-8 shadow-none transition-all hover:bg-accent dark:bg-black cursor-pointer sm:p-10 md:p-12 lg:p-6 min-h-[120px] sm:min-h-[140px] lg:min-h-0 relative">
            <CardContent className="p-0">
              <span className="text-xl font-semibold sm:text-2xl lg:text-3xl">Log In</span>
              <ArrowUpRight className="absolute top-4 right-4 h-6 w-6 sm:h-8 sm:w-8 lg:h-7 lg:w-7" />
            </CardContent>
          </Card>
        </Link>

        {/* Description Card - Medium */}
        <Card className="flex flex-col justify-center p-8 shadow-none dark:bg-black col-span-2 sm:col-span-2 sm:p-10 md:p-12 lg:p-6 lg:col-span-2 lg:row-span-1 lg:row-start-5 min-h-[120px] sm:min-h-[140px] lg:min-h-0">
          <CardContent className="p-0">
            <p className="text-sm leading-relaxed sm:text-base">
              A daily civic engagement platform that gives you a simple, low-effort way to
              participate in democratic dialogue. Answer one question each day and unlock
              anonymized results the next day.
            </p>
          </CardContent>
        </Card>

        {/* Open-Source Data - Clickable Card - Same row as Description on desktop */}
        <Link href="/dashboard/data" className="block h-full col-span-1 sm:col-span-1 lg:col-span-1 lg:row-span-1 lg:row-start-5">
          <Card className="h-full flex flex-col justify-center p-8 shadow-none transition-all hover:bg-accent dark:bg-black cursor-pointer sm:p-10 md:p-12 lg:p-6 min-h-[120px] sm:min-h-[140px] lg:min-h-0 relative">
            <CardContent className="p-0">
              <span className="text-xl font-semibold sm:text-2xl lg:text-3xl">Open-Source Data</span>
              <ArrowUpRight className="absolute top-4 right-4 h-6 w-6 sm:h-8 sm:w-8 lg:h-7 lg:w-7" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}
