"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggleCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-full flex items-center justify-center p-6 shadow-none dark:bg-black sm:p-8 md:p-10 lg:p-4 min-h-[80px] sm:min-h-[100px] lg:min-h-0">
        <CardContent className="p-0">
          <div className="h-5 w-5" />
        </CardContent>
      </Card>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Card
      onClick={toggleTheme}
      className="h-full flex items-center justify-center p-6 shadow-none transition-all hover:bg-accent dark:bg-black cursor-pointer sm:p-8 md:p-10 lg:p-4 min-h-[80px] sm:min-h-[100px] lg:min-h-0"
    >
      <CardContent className="p-0">
        {theme === "dark" ? (
          <Sun className="h-6 w-6 sm:h-8 sm:w-8 lg:h-6 lg:w-6" />
        ) : (
          <Moon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-6 lg:w-6" />
        )}
      </CardContent>
    </Card>
  );
}

