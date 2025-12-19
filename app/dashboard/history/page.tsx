"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, CircleMinus, CircleDashed, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { format, parse, parseISO } from "date-fns";
import Link from "next/link";
import { db, collection, getDocs, query, where, orderBy } from "@/lib/firebase";
import { useUserData } from "@/hooks/use-user-data";
import { getTodayQuestionDate } from "@/lib/question-utils";
import { QuestionData } from "@/lib/question-presets";
import { Spinner } from "@/components/ui/spinner";

type StatusFilter = "all" | "answered" | "skipped" | "missed";

interface HistoryQuestion {
  id: string;
  date: string;
  rawDate: string; // YYYY-MM-DD format
  dateObj: Date;
  question: string;
  answered: boolean;
  skipped: boolean;
}

export default function HistoryPage() {
  const { user, userData, loading: userLoading } = useUserData();
  const [questions, setQuestions] = useState<HistoryQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Fetch past questions from Firebase
  useEffect(() => {
    const fetchPastQuestions = async () => {
      if (userLoading) return;

      try {
        const todayDate = getTodayQuestionDate();
        const questionsRef = collection(db, "questions");
        
        // Fetch all questions up to and including today's question date
        const q = query(
          questionsRef,
          where("date", "<=", todayDate),
          orderBy("date", "desc")
        );
        
        const snapshot = await getDocs(q);
        const questionsData: HistoryQuestion[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data() as QuestionData;
          const dateObj = parseISO(data.date);
          
          // Check if user answered or skipped this question
          const userAnswer = userData?.answers?.[data.date];
          const answered = userAnswer?.status === "answered";
          const skipped = userAnswer?.status === "skipped";
          
          questionsData.push({
            id: data.date,
            date: format(dateObj, "MMMM d, yyyy"),
            rawDate: data.date,
            dateObj,
            question: data.question,
            answered,
            skipped,
          });
        });
        
        setQuestions(questionsData);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastQuestions();
  }, [userData, userLoading]);

  // Group questions by month
  const groupedQuestions = useMemo(() => {
    let filtered = questions;

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
      filtered = filtered.filter((q) => q.skipped);
    } else if (statusFilter === "missed") {
      const todayDate = getTodayQuestionDate();
      filtered = filtered.filter((q) => {
        const isPending = q.rawDate === todayDate;
        return !q.answered && !q.skipped && !isPending;
      });
    }

    // Group by month
    const grouped: Record<string, HistoryQuestion[]> = {};
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

    return Object.entries(grouped).sort(([a]: [string, HistoryQuestion[]], [b]: [string, HistoryQuestion[]]) => b.localeCompare(a));
  }, [questions, searchQuery, statusFilter]);

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

  if (loading || userLoading) {
    return (
      <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight">History</h1>
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
          <TabsTrigger value="missed">Missed</TabsTrigger>
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
              const todayDate = getTodayQuestionDate();
              const isPending = question.rawDate === todayDate;
              
              // Determine status indicator based on answered/skipped/missed status
              const isMissed = !question.answered && !question.skipped && !isPending;
              let statusIcon = null;
              let statusColor = "";
              if (question.answered) {
                statusIcon = <CheckCircle2 className="h-4 w-4" />;
                statusColor = "text-green-600";
              } else if (question.skipped) {
                statusIcon = <CircleMinus className="h-4 w-4" />;
                statusColor = "text-green-600";
              } else {
                // Missed or pending
                statusIcon = <CircleDashed className="h-4 w-4" />;
                statusColor = "text-muted-foreground";
              }

              // Get day number
              const dayNumber = format(question.dateObj, "d");

              // Render as non-clickable card if pending or missed
              if (isPending || isMissed) {
                return (
                  <Card key={question.id} className="shadow-none opacity-60 cursor-not-allowed">
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
                          {isPending && (
                            <p className="text-xs text-muted-foreground mt-1">Results pending</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

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
