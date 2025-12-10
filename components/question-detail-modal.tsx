"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lock, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface QuestionDetailModalProps {
  question: {
    id: string;
    date: string;
    question: string;
    answered: boolean;
    resultsUnlocked: boolean;
    results?: {
      yes: number;
      no: number;
      unsure: number;
    };
    // Full question details (if available)
    summary?: string;
    yesMeaning?: string;
    noMeaning?: string;
    proArgument?: string;
    conArgument?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionDetailModal({ question, open, onOpenChange }: QuestionDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogDescription className="text-xs font-medium uppercase tracking-wide sm:text-sm">
              {question.date}
            </DialogDescription>
            <div className="flex gap-2">
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
          <DialogTitle className="text-base font-semibold leading-tight sm:text-xl lg:text-2xl text-left">
            {question.question}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Additional question details if available */}
          {(question.summary || question.yesMeaning || question.proArgument) && (
            <Accordion type="single" collapsible className="w-full">
              {question.summary && (
                <AccordionItem value="summary" className="border-none">
                  <AccordionTrigger className="text-xs font-semibold py-2 sm:text-sm">
                    Summary
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                      {question.summary}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}

              {question.yesMeaning && (
                <AccordionItem value="vote-meaning" className="border-none">
                  <AccordionTrigger className="text-xs font-semibold py-2 sm:text-sm">
                    What Your Vote Means
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="text-xs">YES</Badge>
                      </div>
                      <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                        {question.yesMeaning}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">NO</Badge>
                      </div>
                      <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                        {question.noMeaning}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {question.proArgument && (
                <AccordionItem value="arguments" className="border-none">
                  <AccordionTrigger className="text-xs font-semibold py-2 sm:text-sm">
                    Arguments
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="text-xs">PRO</Badge>
                      </div>
                      <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                        {question.proArgument}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">CON</Badge>
                      </div>
                      <p className="text-xs leading-relaxed sm:text-sm text-muted-foreground">
                        {question.conArgument}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          )}

          {/* Results */}
          {question.resultsUnlocked && question.results ? (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold">Results</h3>
              <div className="space-y-3">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

