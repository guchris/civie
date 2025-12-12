"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { auth, db, doc, getDoc, setDoc } from "@/lib/firebase";
import {
  QuestionData,
  AnswerType,
  generateAnswerOptions,
} from "@/lib/question-presets";
import { AnswerOptionsEditor } from "@/components/answer-options-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface AdminQuestionFormProps {
  date: string;
  initialData?: QuestionData;
  onSave?: () => void;
  onSavingChange?: (saving: boolean) => void;
}

export interface AdminQuestionFormRef {
  handleSave: () => Promise<void>;
  saving: boolean;
}

export const AdminQuestionForm = forwardRef<AdminQuestionFormRef, AdminQuestionFormProps>(
  ({ date, initialData, onSave, onSavingChange }, ref) => {
  const [question, setQuestion] = useState<QuestionData>(
    initialData || {
      date,
      question: "",
      summary: "",
      answerType: "binary",
      answerOptions: generateAnswerOptions("binary"),
    }
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    onSavingChange?.(saving);
  }, [saving, onSavingChange]);

  // Load question if not provided
  useEffect(() => {
    if (!initialData) {
      const loadQuestion = async () => {
        try {
          const docRef = doc(db, "questions", date);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as QuestionData;
            setQuestion(data);
          } else {
            // Use default empty question - this is expected for new questions
            setQuestion({
              date,
              question: "",
              summary: "",
              answerType: "binary",
              answerOptions: generateAnswerOptions("binary"),
            });
          }
        } catch (error: any) {
          // Only show error for actual failures (network, permissions, etc.)
          // Missing documents are expected and handled above
          console.error("Error loading question:", error);
          // Check if it's a permission error or other actual error
          if (error?.code === "permission-denied") {
            toast.error("Permission denied. Please check Firestore security rules.");
          } else if (error?.code !== "not-found") {
            // Only show error for unexpected errors, not for missing docs
            toast.error("Failed to load question.");
          }
        } finally {
          setLoading(false);
        }
      };

      loadQuestion();
    } else {
      setLoading(false);
    }
  }, [date, initialData]);

  const updateQuestion = (updates: Partial<QuestionData>) => {
    setQuestion((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleAnswerTypeChange = (newType: AnswerType) => {
    const newOptions = generateAnswerOptions(newType);
    updateQuestion({
      answerType: newType,
      answerOptions: newOptions,
    });
  };

  const handleSave = async () => {
    // Validation
    if (!question.question.trim()) {
      toast.error("Question text is required.");
      return;
    }

    if (!question.answerOptions || question.answerOptions.length < 2) {
      toast.error("At least 2 answer options are required.");
      return;
    }

    // Check all options have labels
    const hasEmptyLabels = question.answerOptions.some((opt) => !opt.label.trim());
    if (hasEmptyLabels) {
      toast.error("All answer options must have labels.");
      return;
    }

    setSaving(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const questionData: QuestionData = {
        ...question,
        date,
        updatedAt: new Date().toISOString(),
        createdBy: user.uid,
        ...(question.createdAt ? {} : { createdAt: new Date().toISOString() }),
      };

      await setDoc(doc(db, "questions", date), questionData, { merge: true });

      toast.success("Question saved successfully.");
      onSave?.();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Failed to save question. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSave,
    saving,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner />
      </div>
    );
  }

  const hasQuestion = !!initialData || question.question.trim() !== "";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={question.question}
          onChange={(e) => updateQuestion({ question: e.target.value })}
          placeholder="Enter the question text..."
          className="shadow-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          value={question.summary}
          onChange={(e) => updateQuestion({ summary: e.target.value })}
          placeholder="Enter a summary of the question..."
          className="min-h-[80px] shadow-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer-type">Answer Type</Label>
        <Select
          value={question.answerType}
          onValueChange={(value: AnswerType) => handleAnswerTypeChange(value)}
        >
          <SelectTrigger id="answer-type" className="shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="binary">Binary (Yes/No)</SelectItem>
            <SelectItem value="likert5">Likert 5-Point</SelectItem>
            <SelectItem value="likert7">Likert 7-Point</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnswerOptionsEditor
        options={question.answerOptions || []}
        onChange={(options) => updateQuestion({ answerOptions: options })}
      />

      <div className="space-y-4">
        <Label>Arguments (Optional)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pro" className="text-sm">
              Pro Argument
            </Label>
            <Textarea
              id="pro"
              value={question.arguments?.pro || ""}
              onChange={(e) =>
                updateQuestion({
                  arguments: {
                    ...question.arguments,
                    pro: e.target.value,
                  },
                })
              }
              placeholder="Pro argument text..."
              className="min-h-[100px] shadow-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="con" className="text-sm">
              Con Argument
            </Label>
            <Textarea
              id="con"
              value={question.arguments?.con || ""}
              onChange={(e) =>
                updateQuestion({
                  arguments: {
                    ...question.arguments,
                    con: e.target.value,
                  },
                })
              }
              placeholder="Con argument text..."
              className="min-h-[100px] shadow-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
});

AdminQuestionForm.displayName = "AdminQuestionForm";

