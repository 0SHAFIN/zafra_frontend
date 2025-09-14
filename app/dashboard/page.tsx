"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthData, redirectToDashboard } from "@/lib/auth";
import ClientOnly from "@/app/component/ClientOnly";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const authData = getAuthData();

    if (authData.isAuthenticated && authData.role) {
      const dashboardPath = redirectToDashboard(authData.role);
      router.push(dashboardPath);
    } else {
      // Not authenticated, redirect to regular login
      router.push("/login");
    }
  }, [router]);

  return (
    <ClientOnly>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    </ClientOnly>
  );
}
