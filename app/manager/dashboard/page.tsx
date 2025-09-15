"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ShoppingBag, LogOut, Bell } from "lucide-react";
import { useAuthRedirect, clearAuthData } from "@/lib/auth";
import ClientOnly from "@/app/component/ClientOnly";
import ProductManagement from "@/app/component/dashboard/ProductManagement";
import OrderManagement from "@/app/component/dashboard/OrderManagement";

export default function ManagerDashboard() {
  const router = useRouter();
  const {
    user: managerData,
    isLoading,
    isAuthenticated,
  } = useAuthRedirect("manager");
  const [activeTab, setActiveTab] = useState("orders");

  const handleLogout = () => {
    clearAuthData();
    router.push("/manager/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !managerData) {
    return null;
  }

  const managerName =
    managerData.fullName ||
    `${managerData.firstName || ""} ${managerData.lastName || ""}`.trim() ||
    managerData.email ||
    "Manager";

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-green-600">
                  Zafra Manager
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                  <Bell className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {managerName}
                    </p>
                    <p className="text-xs text-gray-500">Manager</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back,{" "}
              {managerName ? managerName.split(" ")[0] : "Manager"}!
            </h2>
            <p className="text-green-100">
              Manage perfumes and process orders efficiently.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "products", label: "Perfumes", icon: Package },
                { id: "orders", label: "Orders", icon: ShoppingBag },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === "products" && (
              <ProductManagement userRole="manager" />
            )}
            {activeTab === "orders" && <OrderManagement userRole="manager" />}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
