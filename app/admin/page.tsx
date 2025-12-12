"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged } from "@/lib/firebase";
import { getAdminStatus } from "@/lib/admin";
import { AdminQuestionsTable } from "@/components/admin-questions-table";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        const { isAdmin: adminStatus } = await getAdminStatus();
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          // Redirect non-admins
          router.push("/dashboard");
        }
      } else {
        setIsAuthenticated(false);
        router.push("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <>
        <DashboardNav />
        <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <Spinner />
        </div>
      </>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <>
        <DashboardNav />
        <div className="container mx-auto max-w-7xl flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <Card className="shadow-none">
            <CardContent className="p-12 text-center">
              <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Admin</h1>
        </div>
        <AdminQuestionsTable />
      </div>
    </>
  );
}

