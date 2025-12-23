"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function ThemeToggleCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-full flex items-center justify-center p-6 shadow-none dark:bg-black sm:p-8 md:p-10 min-h-[80px] sm:min-h-[100px]">
        <CardContent className="p-0">
          <div className="h-6 w-12" />
        </CardContent>
      </Card>
    );
  }

  const isDark = theme === "dark";

  return (
    <Card className="h-full flex items-center justify-center p-6 shadow-none transition-all hover:bg-accent active:bg-accent dark:bg-black dark:hover:bg-accent dark:active:bg-accent sm:p-8 md:p-10 min-h-[80px] sm:min-h-[100px]">
      <CardContent className="p-0">
        <SwitchPrimitive.Root
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          className={cn(
            "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer relative"
          )}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-5 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5 flex items-center justify-center"
            )}
          >
            {isDark ? (
              <Sun className="h-3 w-3 text-foreground fill-current" />
            ) : (
              <Moon className="h-3 w-3 text-foreground fill-current" />
            )}
          </SwitchPrimitive.Thumb>
        </SwitchPrimitive.Root>
      </CardContent>
    </Card>
  );
}

