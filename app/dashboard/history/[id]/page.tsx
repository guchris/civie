"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, Share2, Clock } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { db, doc, getDoc, collection, getDocs } from "@/lib/firebase";
import { useUserData } from "@/hooks/use-user-data";
import { QuestionData } from "@/lib/question-presets";
import { Spinner } from "@/components/ui/spinner";
import { getTodayQuestionDate } from "@/lib/question-utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Label, LabelList } from "recharts";

interface ResponseData {
  answerOptionId: string;
  age: number;
  gender: string;
  raceEthnicity: string;
  zipCode: string;
  timestamp: string;
}

const AGE_GROUPS = [
  { min: 18, max: 24, label: "18-24" },
  { min: 25, max: 34, label: "25-34" },
  { min: 35, max: 44, label: "35-44" },
  { min: 45, max: 54, label: "45-54" },
  { min: 55, max: 64, label: "55-64" },
  { min: 65, max: 150, label: "65+" },
];

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  "non-binary": "Non-binary",
  "prefer-not-to-say": "Prefer not to say",
};

const RACE_LABELS: Record<string, string> = {
  "american-indian-alaska-native": "American Indian",
  "asian": "Asian",
  "black-african-american": "Black",
  "hispanic-latino": "Hispanic/Latino",
  "middle-eastern-north-african": "Middle Eastern",
  "native-hawaiian-pacific-islander": "Pacific Islander",
  "white": "White",
  "multiracial": "Multiracial",
  "other": "Other",
  "prefer-not-to-say": "Not disclosed",
};

// Color palette for answer options (cycles if more than 8 options)
const ANSWER_COLORS = [
  "#3b82f6", // blue
  "#f97316", // orange
  "#8b5cf6", // purple
  "#10b981", // emerald
  "#ec4899", // pink
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#84cc16", // lime
];

const SKIP_COLOR = "#6b7280"; // gray

// Helper to get color for an answer option
const getAnswerColor = (index: number) => ANSWER_COLORS[index % ANSWER_COLORS.length];

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;
  const { userData, loading: userLoading } = useUserData();
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [answered, setAnswered] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [skipCount, setSkipCount] = useState(0);

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

              const responsesData: ResponseData[] = [];
              let skips = 0;

              responsesSnap.forEach((doc) => {
                const data = doc.data() as ResponseData;
                if (data.answerOptionId === "skip") {
                  skips++;
                } else {
                  responsesData.push(data);
                }
              });

              setResponses(responsesData);
              setSkipCount(skips);
            } catch (error) {
              console.error("Error fetching responses:", error);
              setResponses([]);
              setSkipCount(0);
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

  // Calculate chart data
  const chartData = useMemo(() => {
    if (!question || responses.length === 0) return null;

    const totalWithSkips = responses.length + skipCount;

    // Answer distribution for donut chart
    const answerCounts: Record<string, number> = {};
    responses.forEach((r) => {
      answerCounts[r.answerOptionId] = (answerCounts[r.answerOptionId] || 0) + 1;
    });

    const answerDistribution = question.answerOptions
      ?.sort((a, b) => a.order - b.order)
      .map((option, index) => ({
        answer: option.id,
        label: option.label,
        count: answerCounts[option.id] || 0,
        percentage: Math.round(((answerCounts[option.id] || 0) / totalWithSkips) * 100),
        fill: getAnswerColor(index),
      })) || [];

    // Add skip to distribution
    answerDistribution.push({
      answer: "skip",
      label: "Skip",
      count: skipCount,
      percentage: Math.round((skipCount / totalWithSkips) * 100),
      fill: SKIP_COLOR,
    });

    // Gender breakdown - show all categories
    const genderData: Record<string, Record<string, number>> = {};
    // Initialize all gender categories
    Object.keys(GENDER_LABELS).forEach((gender) => {
      genderData[gender] = {};
    });
    responses.forEach((r) => {
      const gender = r.gender || "unknown";
      if (!genderData[gender]) genderData[gender] = {};
      genderData[gender][r.answerOptionId] = (genderData[gender][r.answerOptionId] || 0) + 1;
    });

    const genderBreakdown = Object.keys(GENDER_LABELS).map((gender) => {
      const answers = genderData[gender] || {};
      const row: Record<string, string | number> = { gender: GENDER_LABELS[gender] };
      let total = 0;
      question.answerOptions?.forEach((opt) => {
        const count = answers[opt.id] || 0;
        row[opt.id] = count;
        total += count;
      });
      row.total = total;
      return row;
    });

    // Age group breakdown
    const ageGroupData: Record<string, Record<string, number>> = {};
    AGE_GROUPS.forEach((g) => {
      ageGroupData[g.label] = {};
    });
    responses.forEach((r) => {
      const ageGroup = AGE_GROUPS.find((g) => r.age >= g.min && r.age <= g.max);
      if (ageGroup) {
        ageGroupData[ageGroup.label][r.answerOptionId] = (ageGroupData[ageGroup.label][r.answerOptionId] || 0) + 1;
      }
    });

    const ageBreakdown = AGE_GROUPS.map((group) => {
      const row: Record<string, string | number> = { ageGroup: group.label };
      let total = 0;
      question.answerOptions?.forEach((opt) => {
        const count = ageGroupData[group.label][opt.id] || 0;
        row[opt.id] = count;
        total += count;
      });
      row.total = total;
      return row;
    });

    // Race/Ethnicity breakdown - show all categories
    const raceData: Record<string, Record<string, number>> = {};
    // Initialize all race categories
    Object.keys(RACE_LABELS).forEach((race) => {
      raceData[race] = {};
    });
    responses.forEach((r) => {
      const race = r.raceEthnicity || "unknown";
      if (!raceData[race]) raceData[race] = {};
      raceData[race][r.answerOptionId] = (raceData[race][r.answerOptionId] || 0) + 1;
    });

    const raceBreakdown = Object.keys(RACE_LABELS).map((race) => {
      const answers = raceData[race] || {};
      const row: Record<string, string | number> = { race: RACE_LABELS[race] };
      let total = 0;
      question.answerOptions?.forEach((opt) => {
        const count = answers[opt.id] || 0;
        row[opt.id] = count;
        total += count;
      });
      row.total = total;
      return row;
    });

    // Response timeline (by hour)
    const timelineData: Record<string, number> = {};
    responses.forEach((r) => {
      const hour = new Date(r.timestamp).getHours();
      const hourLabel = hour.toString().padStart(2, "0") + ":00";
      timelineData[hourLabel] = (timelineData[hourLabel] || 0) + 1;
    });

    const timeline = Array.from({ length: 24 }, (_, i) => {
      const hourLabel = i.toString().padStart(2, "0") + ":00";
      return { hour: hourLabel, responses: timelineData[hourLabel] || 0 };
    });

    return {
      answerDistribution,
      genderBreakdown,
      ageBreakdown,
      raceBreakdown,
      timeline,
      totalResponses: totalWithSkips,
    };
  }, [question, responses, skipCount]);

  // Chart configs
  const donutConfig = useMemo(() => {
    if (!question) return {} as ChartConfig;
    const config: ChartConfig = {
      count: { label: "Responses" },
    };
    question.answerOptions?.forEach((opt, index) => {
      config[opt.id] = {
        label: opt.label,
        color: getAnswerColor(index),
      };
    });
    config.skip = {
      label: "Skip",
      color: SKIP_COLOR,
    };
    return config;
  }, [question]);

  const barConfig = useMemo(() => {
    if (!question) return {} as ChartConfig;
    const config: ChartConfig = {};
    question.answerOptions?.forEach((opt, index) => {
      config[opt.id] = {
        label: opt.label,
        color: getAnswerColor(index),
      };
    });
    return config;
  }, [question]);

  const timelineConfig: ChartConfig = {
    responses: {
      label: "Responses",
      color: "var(--foreground)",
    },
  };

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
  const isMissed = !answered && !skipped && !isPending;

  // If user missed this question, don't show results
  if (isMissed) {
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
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <XCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">You missed this question</p>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/dashboard/history">Back to History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          disabled
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
          {chartData && chartData.answerDistribution.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                {chartData.answerDistribution.map((item) => (
                      <div
                    key={item.answer}
                        className="relative w-full rounded-md border overflow-hidden px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm border-input bg-background"
                      >
                        {/* Animated fill bar */}
                        <div
                          className="absolute inset-0 bg-primary/10 origin-left transition-all duration-1000 ease-out"
                      style={{ width: `${item.percentage}%` }}
                        />
                        {/* Content */}
                        <div className="relative flex items-center justify-between z-10">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                        </div>
                </div>
                ))}
              </div>
              {chartData.totalResponses > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  Based on {chartData.totalResponses.toLocaleString()} {chartData.totalResponses === 1 ? "response" : "responses"}
              </p>
              )}
            </div>
          )}
          </CardContent>
        </Card>

      {/* Charts Section */}
      {chartData && chartData.totalResponses > 0 && (
        <>
          {/* Overall Distribution - Donut Chart */}
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Response Distribution</CardTitle>
              <CardDescription>Overall breakdown of responses</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ChartContainer config={donutConfig} className="mx-auto w-full max-w-[280px] aspect-square">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartData.answerDistribution}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={50}
                    outerRadius={90}
                    strokeWidth={2}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {chartData.totalResponses.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                Responses
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              {/* Legend below chart */}
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {chartData.answerDistribution.map((item, index) => (
                  <div key={item.answer} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Demographics Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Gender Breakdown */}
            {chartData.genderBreakdown.length > 0 && (
              <Card className="shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">By Gender</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">How each gender group responded</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={barConfig} className="aspect-[4/3] w-full">
                    <BarChart 
                      accessibilityLayer
                      data={chartData.genderBreakdown}
                      margin={{ top: 20 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="gender"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 9 }}
                        tickMargin={4}
                        interval={0}
                        tickFormatter={(value) => value.length > 8 ? value.slice(0, 7) + '…' : value}
                      />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {question.answerOptions?.map((opt, index) => (
                        <Bar
                          key={opt.id}
                          dataKey={opt.id}
                          stackId="a"
                          fill={getAnswerColor(index)}
                          radius={index === (question.answerOptions?.length || 1) - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        >
                          {index === (question.answerOptions?.length || 1) - 1 && (
                            <LabelList
                              dataKey="total"
                              position="top"
                              offset={12}
                              className="fill-foreground"
                              fontSize={12}
                            />
                          )}
                        </Bar>
                      ))}
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Age Group Breakdown */}
            {chartData.ageBreakdown.length > 0 && (
              <Card className="shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">By Age Group</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">How each age group responded</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={barConfig} className="aspect-[4/3] w-full">
                    <BarChart 
                      accessibilityLayer
                      data={chartData.ageBreakdown}
                      margin={{ top: 20 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="ageGroup"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10 }}
                        tickMargin={4}
                      />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {question.answerOptions?.map((opt, index) => (
                        <Bar
                          key={opt.id}
                          dataKey={opt.id}
                          stackId="a"
                          fill={getAnswerColor(index)}
                          radius={index === (question.answerOptions?.length || 1) - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        >
                          {index === (question.answerOptions?.length || 1) - 1 && (
                            <LabelList
                              dataKey="total"
                              position="top"
                              offset={12}
                              className="fill-foreground"
                              fontSize={12}
                            />
                          )}
                        </Bar>
                      ))}
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Race/Ethnicity Breakdown */}
            {chartData.raceBreakdown.length > 0 && (
              <Card className="shadow-none sm:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">By Race/Ethnicity</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">How each group responded</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={barConfig} className="aspect-[2/1] w-full">
                    <BarChart 
                      accessibilityLayer
                      data={chartData.raceBreakdown}
                      margin={{ top: 20 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="race"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 8 }}
                        tickMargin={4}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {question.answerOptions?.map((opt, index) => (
                        <Bar
                          key={opt.id}
                          dataKey={opt.id}
                          stackId="a"
                          fill={getAnswerColor(index)}
                          radius={index === (question.answerOptions?.length || 1) - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        >
                          {index === (question.answerOptions?.length || 1) - 1 && (
                            <LabelList
                              dataKey="total"
                              position="top"
                              offset={12}
                              className="fill-foreground"
                              fontSize={11}
                            />
                          )}
                        </Bar>
                      ))}
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Response Timeline */}
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Response Timeline</CardTitle>
                <CardDescription className="text-xs sm:text-sm">When responses were submitted</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={timelineConfig} className="aspect-[4/3] w-full">
                  <LineChart 
                    data={chartData.timeline} 
                    margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={4}
                      tick={{ fontSize: 9 }}
                      interval="preserveStartEnd"
                      tickFormatter={(value) => value.replace(':00', '')}
                    />
                    <YAxis hide />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                      dataKey="responses"
                      type="monotone"
                      stroke="var(--foreground)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

        </>
      )}
    </div>
  );
}
