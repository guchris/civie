"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/data", label: "Data", icon: Database },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">civie</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // For Home, only match exact path. For others, match exact or sub-paths
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/dashboard/profile"
            className={cn(
              "ml-2 rounded-full transition-colors",
              pathname === "/dashboard/profile" || pathname?.startsWith("/dashboard/profile/")
                ? "ring-2 ring-primary"
                : "hover:ring-2 hover:ring-accent"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">C</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </nav>
  );
}

