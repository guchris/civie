import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import Link from "next/link";

// Mock data - replace with real data from your backend
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
    resultsUnlocked: false,
  },
];

export default function HistoryPage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-2">
          Browse all past questions and view results you've unlocked
        </p>
      </div>

      <div className="space-y-4">
        {pastQuestions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{question.question}</CardTitle>
                  </div>
                  <CardDescription>{question.date}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
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
            </CardHeader>
            <CardContent>
              {question.resultsUnlocked && question.results ? (
                <div className="space-y-4">
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
        ))}
      </div>
    </div>
  );
}

