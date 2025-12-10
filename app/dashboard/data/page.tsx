import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Shield, BarChart3, Database } from "lucide-react";
import Link from "next/link";

export default function DataPage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Open Data</h1>
        <p className="text-muted-foreground mt-2">
          Transparent, accessible civic datasets for everyone
        </p>
      </div>

      {/* Transparency Principles */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Neutrality</CardTitle>
            </div>
            <CardDescription>
              All questions are reviewed by a board of civic experts to ensure neutral phrasing
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Anonymization</CardTitle>
            </div>
            <CardDescription>
              Responses are aggregated and anonymized. No individual responses are ever stored
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Open Access</CardTitle>
            </div>
            <CardDescription>
              All datasets are freely available for research, journalism, and public use
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Methodology */}
      <Card>
        <CardHeader>
          <CardTitle>Data Methodology</CardTitle>
          <CardDescription>
            How we collect, process, and publish civic data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Collection</h3>
            <p className="text-sm text-muted-foreground">
              Each day, Civie publishes one question on a timely local, state, or national issue.
              Users who answer within 24 hours unlock anonymized results the next day.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Privacy Model</h3>
            <p className="text-sm text-muted-foreground">
              Civie logs that a user answered, not what they chose. Answers are stored only as
              aggregate counters. No response-level PII is ever stored. Demographic buckets are
              suppressed if sample sizes are too small.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Verification</h3>
            <p className="text-sm text-muted-foreground">
              All users are verified with government-issued ID to ensure data integrity and
              legitimacy. Immutable fields (birth date, gender) are extracted during verification.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Datasets */}
      <Card>
        <CardHeader>
          <CardTitle>Available Datasets</CardTitle>
          <CardDescription>
            Download CSV files of all published results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Daily Results (All Questions)</p>
                <p className="text-sm text-muted-foreground">
                  Complete dataset of all questions and aggregate responses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">CSV</Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Demographic Breakdowns</p>
                <p className="text-sm text-muted-foreground">
                  Results segmented by age range, gender, and region
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">CSV</Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Historical Archive</p>
                <p className="text-sm text-muted-foreground">
                  Complete historical dataset from launch to present
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">CSV</Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Schema */}
      <Card>
        <CardHeader>
          <CardTitle>Data Schema</CardTitle>
          <CardDescription>
            Structure of our open datasets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`question_id
timestamp
zip
age_range
gender
response
sample_size
methodology
margin_of_error`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Governance */}
      <Card>
        <CardHeader>
          <CardTitle>Governance & Oversight</CardTitle>
          <CardDescription>
            How we ensure neutrality and data quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Review Board</h3>
            <p className="text-sm text-muted-foreground">
              A diverse board of civic experts, academics, and journalists reviews all questions
              to ensure neutral phrasing and relevance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Transparency Guidelines</h3>
            <p className="text-sm text-muted-foreground">
              All methodology, anonymization processes, and data collection practices are
              published openly. We welcome public scrutiny and feedback.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Compliance</h3>
            <p className="text-sm text-muted-foreground">
              Civie adheres to U.S. privacy standards and is GDPR/CCPA-ready. Our data handling
              architecture prioritizes user privacy and data security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

