"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BarChart3, Users, ShoppingBag, Settings, LogOut } from "lucide-react";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isManagerRoute, setIsManagerRoute] = useState(false);

  useEffect(() => {
    // Client-side only
    setIsClient(true);
    if (pathname?.startsWith("/manager")) {
      setIsManagerRoute(true);
    } else {
      setIsManagerRoute(false);
    }
  }, [pathname]);

  const menuItems = [
    { path: "/manager/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/manager/customer", label: "customer", icon: Users },
    { path: "/manager/orders", label: "Orders", icon: ShoppingBag },
    { path: "/manager/products/perfumes", label: "Perfume", icon: ShoppingBag },
    { path: "/manager/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    console.log("Logging out...");
    // Implement logout logic here
  };

  // While server-rendered HTML does not know the pathname yet, render a placeholder
  if (!isClient) {
    return <div className="flex min-h-screen bg-gray-50">Loading...</div>;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {isManagerRoute && (
        <div className="bg-white border-r w-64 min-h-screen p-6 flex flex-col">
          {/* Sidebar Header */}
          <div className="mb-8">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Zafra Manager
            </h2>
          </div>

          {/* Sidebar Menu */}
          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg ${
                    isActive
                      ? "text-gray-900 bg-purple-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg w-full"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find((item) => item.path === pathname)?.label || "Dashboard"}
              </h1>
              <p className="text-gray-600">Welcome to Zafra Manager Panel</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
