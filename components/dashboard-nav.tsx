"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, History, Database, User, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdmin } from "@/lib/admin";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/data", label: "Data", icon: Database },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin();
      setUserIsAdmin(adminStatus);
    };
    checkAdminStatus();
  }, []);

  const handleLogout = async () => {
    try {
      setProfileDropdownOpen(false);
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isProfileActive = pathname === "/dashboard/profile" || pathname?.startsWith("/dashboard/profile/");
  const isAdminActive = pathname === "/admin" || pathname?.startsWith("/admin/");

  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="container mx-auto max-w-7xl flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center space-x-2 bg-white rounded-lg border px-4 h-10 flex-grow">
          <span className="text-sm font-bold">civie</span>
        </Link>
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            // Skip Profile - we'll handle it separately with dropdown
            if (item.href === "/dashboard/profile") return null;
            
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
                  "flex items-center justify-center rounded-lg border px-4 h-10 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-black text-white"
                    : "bg-white text-muted-foreground hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
          
          {/* Profile Dropdown */}
          <Popover open={profileDropdownOpen} onOpenChange={setProfileDropdownOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center justify-center rounded-lg border px-4 h-10 text-sm font-medium transition-colors",
                  isProfileActive
                    ? "bg-black text-white"
                    : "bg-white text-muted-foreground hover:bg-gray-100"
                )}
              >
                <User className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="end">
              <div className="flex flex-col">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <User className="h-4 w-4" />
                  View Profile
                </Link>
                {userIsAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setProfileDropdownOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                      isAdminActive && "bg-accent"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    View Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
}

