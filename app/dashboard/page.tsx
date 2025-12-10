import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Flame } from "lucide-react";

// Mock data - replace with real data from your backend
const todayQuestion = {
  id: "q-2025-12-15",
  date: "December 15, 2025",
  question: "Should your state increase funding for public transportation infrastructure?",
  options: [
    { id: "yes", label: "Yes, increase funding" },
    { id: "no", label: "No, maintain current levels" },
    { id: "unsure", label: "Unsure" },
  ],
  answered: false,
  timeRemaining: "18 hours left",
};

const userStats = {
  streak: 7,
  totalAnswered: 42,
  badges: ["7-day streak", "First week"],
};

export default function DashboardHome() {
  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Stats Header */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.streak} days</div>
            <p className="text-xs text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Answered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalAnswered}</div>
            <p className="text-xs text-muted-foreground">Questions answered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges</CardTitle>
            <Badge variant="secondary">{userStats.badges.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userStats.badges.map((badge) => (
                <Badge key={badge} variant="outline">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Question of the Day</CardTitle>
              <CardDescription className="mt-2">
                {todayQuestion.date} • {todayQuestion.timeRemaining}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {todayQuestion.timeRemaining}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium">{todayQuestion.question}</p>
          
          {!todayQuestion.answered ? (
            <div className="space-y-3">
              {todayQuestion.options.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                  size="lg"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-muted p-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="font-medium">You've answered today's question!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Come back tomorrow to see results and answer the next question.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Answer today's question to unlock results tomorrow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Answer within 24 hours</p>
              <p className="text-sm text-muted-foreground">
                You have until tomorrow at 9 AM to answer today's question.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Unlock results tomorrow</p>
              <p className="text-sm text-muted-foreground">
                View anonymized results with demographic breakdowns in History.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Build your streak</p>
              <p className="text-sm text-muted-foreground">
                Answer daily to maintain your streak and earn badges.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

