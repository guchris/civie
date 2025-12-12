"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";
import { auth, onAuthStateChanged } from "@/lib/firebase";
import { getAdminStatus } from "@/lib/admin";
import { AdminQuestionForm, AdminQuestionFormRef } from "@/components/admin-question-form";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { db, doc, getDoc } from "@/lib/firebase";
import { QuestionData } from "@/lib/question-presets";

export default function AdminQuestionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const date = params.date as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionData | undefined>();
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<AdminQuestionFormRef>(null);

  // Validate date format
  const isValidDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) && isValid(parseISO(date));

  // Check authentication and admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        const { isAdmin: adminStatus } = await getAdminStatus();
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          router.push("/dashboard");
        }
      } else {
        setIsAuthenticated(false);
        router.push("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Load question data
  useEffect(() => {
    if (!isValidDate || !isAuthenticated || !isAdmin) return;

    const loadQuestion = async () => {
      try {
        const docRef = doc(db, "questions", date);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as QuestionData;
          setQuestionData(data);
        }
      } catch (error) {
        console.error("Error loading question:", error);
      } finally {
        setLoadingQuestion(false);
      }
    };

    loadQuestion();
  }, [date, isValidDate, isAuthenticated, isAdmin]);

  const handleSave = () => {
    // Optionally navigate back after save
    // router.push("/admin");
  };

  if (isLoading || loadingQuestion) {
    return (
      <>
        <DashboardNav />
        <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <Spinner />
        </div>
      </>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <>
        <DashboardNav />
        <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <Card className="shadow-none">
            <CardContent className="p-12 text-center">
              <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!isValidDate) {
    return (
      <>
        <DashboardNav />
        <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <Card className="shadow-none">
            <CardContent className="p-12 text-center">
              <CardTitle className="text-2xl mb-2">Invalid Date</CardTitle>
              <p className="text-muted-foreground mb-4">
                The date format is invalid.
              </p>
              <Button onClick={() => router.push("/admin")} className="shadow-none">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const formattedDate = format(parseISO(date), "MMMM d, yyyy");
  const hasQuestion = !!questionData?.question;

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin")}
            className="shadow-none"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="shadow-none hover:bg-transparent hover:text-foreground cursor-default"
          >
            {formattedDate}
          </Button>
        </div>
        <Button
          onClick={() => formRef.current?.handleSave()}
          disabled={saving}
          size="icon"
          className="shadow-none"
        >
          {saving ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            {hasQuestion ? "Edit Question" : "Add New Question"}
          </CardTitle>
          <CardDescription>
            {hasQuestion
              ? "Update the question details below."
              : "Fill in the details to create a new question for this date."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminQuestionForm
            ref={formRef}
            date={date}
            initialData={questionData}
            onSave={handleSave}
            onSavingChange={setSaving}
          />
        </CardContent>
      </Card>
      </div>
    </>
  );
}

