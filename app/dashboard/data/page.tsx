"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2 } from "lucide-react";
import { db, collection, getDocs, query, orderBy } from "@/lib/firebase";
import { QuestionData } from "@/lib/question-presets";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { getTodayQuestionDate } from "@/lib/question-utils";

interface AnswerResponse {
  answerOptionId: string;
  age: number;
  gender: string;
  raceEthnicity: string;
  zipCode: string;
  timestamp: string;
}

interface QuestionWithData extends QuestionData {
  responseCount: number;
}

// Helper function to convert data to CSV
function convertToCSV(data: any[], headers: string[]): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(","));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || "";
      // Escape commas and quotes in CSV
      if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(","));
  }
  
  return csvRows.join("\n");
}

// Download CSV file
function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function DataPage() {
  const [questions, setQuestions] = useState<QuestionWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingQuestion, setDownloadingQuestion] = useState<string | null>(null);

  // Fetch all questions from Firebase (only past questions)
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const todayQuestionDate = getTodayQuestionDate();
        const questionsRef = collection(db, "questions");
        const q = query(questionsRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        
        const questionsData: QuestionWithData[] = [];
        
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data() as QuestionData;
          
          // Only include questions from the past (before today's question date)
          if (data.date < todayQuestionDate) {
            // Count responses for this question
            // Note: Querying a non-existent subcollection returns an empty snapshot, not an error
            try {
              const responsesRef = collection(db, "answers", data.date, "responses");
              const responsesSnapshot = await getDocs(responsesRef);
              questionsData.push({
                ...data,
                responseCount: responsesSnapshot.size,
              });
            } catch (error) {
              // Log unexpected errors (network issues, etc.)
              console.error(`Error fetching responses for ${data.date}:`, error);
              // Still show the question with 0 count if there's an error
              questionsData.push({
                ...data,
                responseCount: 0,
              });
            }
          }
        }
        
        setQuestions(questionsData);
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Download all data as CSV (only past questions)
  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    try {
      const todayQuestionDate = getTodayQuestionDate();
      const allRows: any[] = [];
      
      // Only process past questions (already filtered in questions state)
      for (const question of questions) {
        // Double-check it's a past question
        if (question.date >= todayQuestionDate) continue;
        
        try {
          const responsesRef = collection(db, "answers", question.date, "responses");
          const responsesSnapshot = await getDocs(responsesRef);
          
          responsesSnapshot.forEach((doc) => {
            const response = doc.data() as AnswerResponse;
            
            // Find the answer option label
            const answerOption = question.answerOptions.find(
              opt => opt.id === response.answerOptionId
            );
            
            allRows.push({
              question_date: question.date,
              question_text: question.question,
              answer_option_id: response.answerOptionId,
              answer_option_label: answerOption?.label || "",
              age: response.age,
              gender: response.gender,
              race_ethnicity: response.raceEthnicity,
              zip_code: response.zipCode,
              timestamp: response.timestamp,
            });
          });
        } catch (error) {
          console.error(`Error fetching responses for ${question.date}:`, error);
        }
      }
      
      if (allRows.length === 0) {
        toast.info("No data available to download.");
        return;
      }
      
      const headers = [
        "question_date",
        "question_text",
        "answer_option_id",
        "answer_option_label",
        "age",
        "gender",
        "race_ethnicity",
        "zip_code",
        "timestamp",
      ];
      
      const csv = convertToCSV(allRows, headers);
      const filename = `civie-all-data-${format(new Date(), "yyyy-MM-dd")}.csv`;
      downloadCSV(csv, filename);
      toast.success("All data downloaded successfully!");
    } catch (error) {
      console.error("Error downloading all data:", error);
      toast.error("Failed to download data.");
    } finally {
      setDownloadingAll(false);
    }
  };

  // Download data for a specific question
  const handleDownloadQuestion = async (question: QuestionWithData) => {
    setDownloadingQuestion(question.date);
    try {
      const responsesRef = collection(db, "answers", question.date, "responses");
      const responsesSnapshot = await getDocs(responsesRef);
      
      const rows: any[] = [];
      
      responsesSnapshot.forEach((doc) => {
        const response = doc.data() as AnswerResponse;
        
        // Find the answer option label
        const answerOption = question.answerOptions.find(
          opt => opt.id === response.answerOptionId
        );
        
        rows.push({
          answer_option_id: response.answerOptionId,
          answer_option_label: answerOption?.label || "",
          age: response.age,
          gender: response.gender,
          race_ethnicity: response.raceEthnicity,
          zip_code: response.zipCode,
          timestamp: response.timestamp,
        });
      });
      
      if (rows.length === 0) {
        toast.info("No responses available for this question.");
        return;
      }
      
      const headers = [
        "answer_option_id",
        "answer_option_label",
        "age",
        "gender",
        "race_ethnicity",
        "zip_code",
        "timestamp",
      ];
      
      const csv = convertToCSV(rows, headers);
      const dateFormatted = format(parseISO(question.date), "yyyy-MM-dd");
      const filename = `civie-question-${dateFormatted}.csv`;
      downloadCSV(csv, filename);
      toast.success("Question data downloaded successfully!");
    } catch (error) {
      console.error("Error downloading question data:", error);
      toast.error("Failed to download question data.");
    } finally {
      setDownloadingQuestion(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Open Data</h1>
      </div>

      {/* About This Data */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>About This Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Civie makes all polling data openly available for public use. Every response collected 
            through our daily civic questions is aggregated and published here, enabling researchers, 
            journalists, civic organizations, and the public to analyze and understand public opinion 
            on the issues that matter.
          </p>
            <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Anonymized.</span> Responses are never linked to individual users. Only demographic labels are included.
            </p>
            <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Verified.</span> All respondents are verified with government-issued ID to ensure data integrity and prevent spam.
            </p>
            <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Open Access.</span> This data is released under the{" "}
            <a 
              href="https://creativecommons.org/licenses/by/4.0/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              CC BY 4.0
            </a>{" "}
            license. You are free to use, share, and adapt it for any purpose with appropriate attribution.
            </p>
        </CardContent>
      </Card>

      {/* Data Format */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Data Format</CardTitle>
          <CardDescription>
            Structure and format of the downloadable datasets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all-data" className="w-full">
            <TabsList>
              <TabsTrigger value="all-data">All Data</TabsTrigger>
              <TabsTrigger value="individual">Individual Question</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-data" className="space-y-4 mt-4">
              <div>
                <h3 className="font-semibold mb-4">Schema</h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Field</TableHead>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs">question_date</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">Date of the question in YYYY-MM-DD format</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">question_text</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">The full text of the question</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">answer_option_id</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">Unique identifier for the selected answer option</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">answer_option_label</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">Human-readable label for the answer option</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">age</TableCell>
                        <TableCell className="text-muted-foreground">Integer</TableCell>
                        <TableCell className="text-muted-foreground">Age of the respondent in years</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">gender</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">Gender of the respondent</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">race_ethnicity</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">Race/ethnicity of the respondent</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">zip_code</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">ZIP code of the respondent</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">timestamp</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">ISO 8601 timestamp of when the response was submitted</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Example</h3>
                <div className="rounded-lg border bg-muted p-4 font-mono text-xs overflow-x-auto">
                  <pre className="whitespace-pre">
{`question_date,question_text,answer_option_id,answer_option_label,age,gender,race_ethnicity,zip_code,timestamp
2024-01-15,"Should the city increase funding for public parks?",yes,Yes,32,Male,White,90210,2024-01-15T14:30:00.000Z
2024-01-15,"Should the city increase funding for public parks?",no,No,28,Female,Hispanic,10001,2024-01-15T15:45:00.000Z`}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="individual" className="space-y-4 mt-4">
              <div>
                <h3 className="font-semibold mb-4">Schema</h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Field</TableHead>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs">answer_option_id</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">Unique identifier for the selected answer option</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">answer_option_label</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">Human-readable label for the answer option</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">age</TableCell>
                        <TableCell className="text-muted-foreground">Integer</TableCell>
                        <TableCell className="text-muted-foreground">Age of the respondent in years</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">gender</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">Gender of the respondent</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">race_ethnicity</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">Race/ethnicity of the respondent</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">zip_code</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">ZIP code of the respondent</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">timestamp</TableCell>
                        <TableCell className="text-muted-foreground">String</TableCell>
                        <TableCell className="text-muted-foreground">ISO 8601 timestamp of when the response was submitted</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Example</h3>
                <div className="rounded-lg border bg-muted p-4 font-mono text-xs overflow-x-auto">
                  <pre className="whitespace-pre">
{`answer_option_id,answer_option_label,age,gender,race_ethnicity,zip_code,timestamp
yes,Yes,32,Male,White,90210,2024-01-15T14:30:00.000Z
no,No,28,Female,Hispanic,10001,2024-01-15T15:45:00.000Z
yes,Yes,45,Non-binary,Asian,94102,2024-01-15T16:20:00.000Z`}
                  </pre>
            </div>
          </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Download All Data */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Download All Data</CardTitle>
          <CardDescription>
            Download a complete CSV file containing all questions and responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0">
              <p className="font-medium">Complete Dataset</p>
              <p className="text-sm text-muted-foreground">
                All questions and responses in a single CSV file
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                className="shadow-none"
                onClick={handleDownloadAll}
                disabled={downloadingAll || questions.length === 0}
              >
                {downloadingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Questions */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Download by Question</CardTitle>
          <CardDescription>
            Download CSV files for individual questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No questions available yet.
            </p>
          ) : (
            questions.map((question) => {
              const dateObj = parseISO(question.date);
              const isDownloading = downloadingQuestion === question.date;
              
              return (
                <div
                  key={question.date}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {format(dateObj, "MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {question.question}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {question.responseCount} response{question.responseCount !== 1 ? "s" : ""}
            </p>
          </div>
                  <div className="flex items-center gap-2 flex-shrink-0 sm:ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-none"
                      onClick={() => handleDownloadQuestion(question)}
                      disabled={isDownloading || question.responseCount === 0}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
          </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
