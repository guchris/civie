import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="container mx-auto max-w-7xl space-y-6 px-4 py-20 sm:px-6 lg:px-8 md:py-32">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-6 rounded-lg border bg-card p-8 sm:p-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Ready to make your voice heard?
        </h2>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Join thousands of people participating in daily civic dialogue. Your responses
          are anonymous, but your impact is real.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="text-base">
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <Link href="/data">Explore Open Data</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

