"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ThemeToggleCard } from "@/components/theme-toggle-card";
import { AnimatedLogo } from "@/components/animated-logo";
import { useState } from "react";

const exampleQuestion = {
  question: "Should your state increase funding for public transportation infrastructure?",
  date: "Today's Question",
};

export function LandingHero() {
  const [isLogoActive, setIsLogoActive] = useState(false);

  return (
    <section className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-5 lg:gap-6">
        {/* Brand Card - Large square */}
        <Card
          className="flex items-center justify-center p-4 shadow-none dark:bg-black col-span-2 sm:col-span-2 sm:p-6 lg:col-span-2 lg:row-span-2 cursor-pointer"
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
        <Card className="flex flex-col justify-center p-4 shadow-none dark:bg-black col-span-2 sm:col-span-2 sm:p-6 lg:col-span-2 lg:row-span-1">
          <CardContent className="p-0">
            <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Your say, every day.
            </h2>
          </CardContent>
        </Card>

        {/* Anonymous Dialogue Card - Medium */}
        <Card className="flex flex-col justify-center p-4 shadow-none dark:bg-black col-span-1 sm:col-span-1 sm:p-6 lg:col-span-1 lg:row-span-1">
          <CardContent className="p-0">
            <p className="text-lg font-medium text-muted-foreground sm:text-2xl">
              Anonymous civic dialogue.
            </p>
          </CardContent>
        </Card>

        {/* Theme Toggle Card - Next to Anonymous Dialogue */}
        <div className="h-full col-span-1 sm:col-span-1 lg:col-span-1 lg:row-span-1">
          <ThemeToggleCard />
        </div>

        {/* Example Question Card - Large wide */}
        <Card className="flex flex-col justify-between p-4 shadow-none dark:bg-black col-span-2 sm:col-span-2 sm:p-6 lg:col-span-3 lg:row-span-2">
          <CardHeader className="p-0 pb-4">
            <CardDescription className="text-xs font-medium uppercase tracking-wide sm:text-sm">
              {exampleQuestion.date}
            </CardDescription>
            <CardTitle className="text-lg font-semibold leading-tight sm:text-2xl lg:text-3xl">
              {exampleQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-wrap gap-2">
              <button className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:px-4 sm:text-sm sm:flex-none">
                Yes
              </button>
              <button className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:px-4 sm:text-sm sm:flex-none">
                No
              </button>
              <button className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:px-4 sm:text-sm sm:flex-none">
                Unsure
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Get Started - Clickable Card - Full Height */}
        <Link href="/signup" className="block h-full col-span-1 sm:col-span-1 lg:col-span-1 lg:row-span-2">
          <Card className="h-full flex flex-col justify-center p-4 shadow-none transition-all hover:bg-accent dark:bg-black cursor-pointer sm:p-6">
            <CardContent className="p-0 flex items-center justify-between">
              <span className="text-base font-semibold sm:text-xl">Get Started</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            </CardContent>
          </Card>
        </Link>

        {/* Open-Source Data - Clickable Card - Same row as Get Started on mobile */}
        <Link href="/dashboard/data" className="block h-full col-span-1 sm:col-span-1 lg:col-span-1 lg:row-span-1">
          <Card className="h-full flex flex-col justify-center p-4 shadow-none transition-all hover:bg-accent dark:bg-black cursor-pointer sm:p-6">
            <CardContent className="p-0 flex items-center justify-between">
              <span className="text-base font-semibold sm:text-xl">Open-Source Data</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            </CardContent>
          </Card>
        </Link>

        {/* Description Card - Medium */}
        <Card className="flex flex-col justify-center p-4 shadow-none dark:bg-black col-span-2 sm:col-span-2 sm:p-6 lg:col-span-2 lg:row-span-1">
          <CardContent className="p-0">
            <p className="text-xs text-muted-foreground leading-relaxed sm:text-base">
              A daily civic engagement platform that gives you a simple, low-effort way to
              participate in democratic dialogue. Answer one question each day and unlock
              anonymized results the next day.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
