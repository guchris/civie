import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Lock, BarChart3, Shield } from "lucide-react";

const features = [
  {
    title: "Daily Questions",
    description:
      "One timely question each day on local, state, or national issues. Answer within 24 hours to unlock results.",
    icon: CheckCircle2,
  },
  {
    title: "Verified & Anonymous",
    description:
      "Verified identity ensures data integrity, while your responses remain completely anonymous. We never store what you chose.",
    icon: Shield,
  },
  {
    title: "Open Data",
    description:
      "All aggregate datasets are published openly at civie.org/data. Transparent, accessible, and free for everyone.",
    icon: BarChart3,
  },
  {
    title: "Private & Secure",
    description:
      "Your participation is logged, but your answers are only stored as aggregate counters. No response-level PII.",
    icon: Lock,
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="container mx-auto max-w-7xl space-y-12 px-4 py-20 sm:px-6 lg:px-8 md:py-32">
      <div className="mx-auto max-w-[980px] text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Simple. Trusted. Transparent.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Everything you need for daily civic engagement
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

