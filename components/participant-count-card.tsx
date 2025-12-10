import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

// Mock data - replace with real data from your backend
const participantCount = {
  lastQuestion: 12473,
};

export function ParticipantCountCard() {
  return (
    <Card className="h-full flex flex-col justify-center p-6 shadow-none dark:bg-black sm:p-8 md:p-10 lg:p-4 min-h-[80px] sm:min-h-[100px] lg:min-h-0">
      <CardContent className="p-0 flex flex-col items-start justify-center gap-2">
        <p className="text-2xl font-bold sm:text-3xl lg:text-4xl">
          {participantCount.lastQuestion.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground sm:text-xs">
          answered yesterday's question
        </p>
      </CardContent>
    </Card>
  );
}

