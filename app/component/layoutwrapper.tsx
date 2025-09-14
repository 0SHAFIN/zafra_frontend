"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import { setupAxiosInterceptors } from "@/lib/auth";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setupAxiosInterceptors();
  }, []);

  // Hide layout for login/signup pages and admin/manager dashboards
  const hideLayout =
    pathname === "/signup" ||
    pathname === "/login" ||
    pathname === "/admin/login" ||
    pathname === "/manager/login" ||
    pathname?.startsWith("/admin/dashboard") ||
    pathname?.startsWith("/manager/dashboard");

  // Don't render navbar/footer until hydrated to prevent hydration mismatch
  if (!hydrated) {
    return <>{children}</>;
  }

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
