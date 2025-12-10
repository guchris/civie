import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Clock, BarChart3, Shield } from "lucide-react";

const steps = [
  {
    step: "1",
    title: "Sign Up & Verify",
    description:
      "Create an account and verify your identity with a government-issued ID. This ensures data integrity while keeping your responses anonymous.",
    icon: Shield,
  },
  {
    step: "2",
    title: "Answer Daily",
    description:
      "Each day at 9 AM, receive a notification with today's question. Answer in one tap within 24 hours.",
    icon: CheckCircle2,
  },
  {
    step: "3",
    title: "Unlock Results",
    description:
      "The next day, view anonymized results with demographic breakdowns. Build your streak and earn badges.",
    icon: Clock,
  },
  {
    step: "4",
    title: "Explore Data",
    description:
      "Browse all past questions and results in History. Download open datasets for research and analysis.",
    icon: BarChart3,
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="container mx-auto max-w-7xl space-y-12 px-4 py-20 sm:px-6 lg:px-8 md:py-32">
      <div className="mx-auto max-w-[980px] text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          How It Works
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          A simple, low-effort way to participate in democracy
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.step} className="relative">
              <CardHeader>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {step.step}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{step.title}</CardTitle>
                <CardDescription className="text-base">
                  {step.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

