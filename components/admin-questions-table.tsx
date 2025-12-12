"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, parseISO } from "date-fns";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { db, collection, getDocs, query, where } from "@/lib/firebase";
import { QuestionData, generateAnswerOptions } from "@/lib/question-presets";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Generate 30 days starting from tomorrow
function generateDateRange(): string[] {
  const dates: string[] = [];
  const tomorrow = addDays(new Date(), 1);
  for (let i = 0; i < 30; i++) {
    const date = addDays(tomorrow, i);
    dates.push(format(date, "yyyy-MM-dd"));
  }
  return dates;
}

type TableQuestion = QuestionData & {
  date: string;
};

export function AdminQuestionsTable() {
  const router = useRouter();
  const [dates] = useState<string[]>(generateDateRange());
  const [questions, setQuestions] = useState<Record<string, QuestionData>>({});
  const [loading, setLoading] = useState(true);

  // Fetch existing questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = collection(db, "questions");
        const dateQuery = query(
          questionsRef,
          where("date", ">=", dates[0]),
          where("date", "<=", dates[dates.length - 1])
        );
        const snapshot = await getDocs(dateQuery);
        
        const questionsData: Record<string, QuestionData> = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          questionsData[data.date] = data as QuestionData;
        });

        setQuestions(questionsData);
      } catch (error: any) {
        console.error("Error fetching questions:", error);
        // Empty results are expected if no questions exist yet
        // Only show error for actual failures
        if (error?.code === "permission-denied") {
          toast.error("Permission denied. Please check Firestore security rules.");
        } else if (error?.code === "failed-precondition") {
          toast.error("Firestore index required. Please create a composite index for the 'questions' collection on 'date' field.");
        } else if (error?.code !== "not-found") {
          toast.error("Failed to load questions. Please refresh the page.");
        }
        // If it's just "not-found" or empty collection, that's fine - no error needed
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [dates]);

  const getQuestionForDate = (date: string): QuestionData => {
    if (questions[date]) {
      return questions[date];
    }
    // Return empty question structure
    return {
      date,
      question: "",
      summary: "",
      answerType: "binary",
      answerOptions: generateAnswerOptions("binary"),
    };
  };

  // Prepare table data
  const tableData = useMemo(() => {
    return dates.map((date) => {
      const question = getQuestionForDate(date);
      return {
        ...question,
        date,
      } as TableQuestion;
    });
  }, [dates, questions]);

  // Define columns
  const columns = useMemo<ColumnDef<TableQuestion>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          return (
            <span className="font-medium">
              {format(parseISO(row.original.date), "MMM d, yyyy")}
            </span>
          );
        },
      },
      {
        accessorKey: "question",
        header: "Question",
        cell: ({ row }) => {
          const question = row.original.question;
          return (
            <div className="max-w-md">
              {question && <span className="line-clamp-2">{question}</span>}
            </div>
          );
        },
      },
      {
        accessorKey: "answerType",
        header: "Type",
        cell: ({ row }) => {
          return (
            <span className="text-sm capitalize">{row.original.answerType}</span>
          );
        },
      },
      {
        id: "options",
        header: "Options",
        cell: ({ row }) => {
          return (
            <span className="text-sm">
              {row.original.answerOptions?.length || 0}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const hasQuestion = !!questions[row.original.date];
          return (
            <Badge variant={hasQuestion ? "default" : "secondary"}>
              {hasQuestion ? "Has Question" : "Empty"}
            </Badge>
          );
        },
      },
    ],
    [questions]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    getRowId: (row) => row.date,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 rounded-md border">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const date = row.original.date;
            return (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/admin/${date}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} questions
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
