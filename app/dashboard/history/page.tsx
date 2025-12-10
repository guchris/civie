"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { format, parse } from "date-fns";
import Link from "next/link";

// Mock data - replace with real data from your backend
const pastQuestions = [
  {
    id: "q-2025-12-14",
    date: "December 14, 2025",
    dateObj: new Date(2025, 11, 14),
    question: "Do you support increasing the minimum wage in your state?",
    answered: true,
    resultsUnlocked: true,
    results: {
      yes: 62,
      no: 28,
      unsure: 10,
    },
  },
  {
    id: "q-2025-12-13",
    date: "December 13, 2025",
    dateObj: new Date(2025, 11, 13),
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
    dateObj: new Date(2025, 11, 12),
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
    dateObj: new Date(2025, 11, 11),
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
    dateObj: new Date(2025, 10, 15),
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
    dateObj: new Date(2025, 10, 14),
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
    dateObj: new Date(2025, 9, 20),
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

type StatusFilter = "all" | "answered" | "skipped";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Group questions by month
  const groupedQuestions = useMemo(() => {
    let filtered = pastQuestions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter === "answered") {
      filtered = filtered.filter((q) => q.answered);
    } else if (statusFilter === "skipped") {
      filtered = filtered.filter((q) => !q.answered);
    }

    // Group by month
    const grouped: Record<string, typeof pastQuestions> = {};
    filtered.forEach((q) => {
      const monthKey = format(q.dateObj, "yyyy-MM");
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(q);
    });

    // Sort months descending and questions within each month descending
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
    });

    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [searchQuery, statusFilter]);

  // Reset to first month when filters change
  useEffect(() => {
    setCurrentMonthIndex(0);
  }, [searchQuery, statusFilter]);

  const currentMonth = groupedQuestions[currentMonthIndex];
  // Left = go back (older month, higher index), Right = go forward (newer month, lower index)
  const canGoBack = currentMonthIndex < groupedQuestions.length - 1;
  const canGoForward = currentMonthIndex > 0;

  const goToPreviousMonth = () => {
    if (canGoBack) {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  const goToNextMonth = () => {
    if (canGoForward) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-2">
          Browse all past questions and view results you've unlocked
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="answered">Answered</TabsTrigger>
          <TabsTrigger value="skipped">Skipped</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Questions grouped by month */}
      {groupedQuestions.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No questions found matching your filters.</p>
          </CardContent>
        </Card>
      ) : currentMonth ? (
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              disabled={!canGoBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(parse(currentMonth[0], "yyyy-MM", new Date()), "MMMM yyyy")}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              disabled={!canGoForward}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Questions for current month */}
          <div className="space-y-2">
            {currentMonth[1].map((question) => {
              // Determine status indicator - all questions in history have results available
              let statusIcon = null;
              let statusColor = "";
              if (question.answered) {
                statusIcon = <CheckCircle2 className="h-4 w-4" />;
                statusColor = "text-green-600";
              } else {
                statusIcon = <XCircle className="h-4 w-4" />;
                statusColor = "text-muted-foreground";
              }

              // Get day number
              const dayNumber = format(question.dateObj, "d");

              return (
                <Link key={question.id} href={`/dashboard/history/${question.id}`} className="block">
                  <Card className="shadow-none hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-medium text-muted-foreground w-6">
                            {dayNumber}
                          </span>
                          <div className={statusColor}>
                            {statusIcon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium line-clamp-2">
                            {question.question}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
