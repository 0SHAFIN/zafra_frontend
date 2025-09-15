"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Package, ShoppingBag, LogOut, Bell } from "lucide-react";
import {
  useAuthRedirect,
  clearAuthData,
  setupAxiosInterceptors,
} from "@/lib/auth";
import ClientOnly from "@/app/component/ClientOnly";
import ProductManagement from "@/app/component/dashboard/ProductManagement";
import UserManagement from "@/app/component/dashboard/UserManagement";
import OrderManagement from "@/app/component/dashboard/OrderManagement";

export default function AdminDashboard() {
  const router = useRouter();
  const {
    user: adminData,
    isLoading,
    isAuthenticated,
  } = useAuthRedirect("admin");
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    // Setup axios interceptors to ensure proper token handling
    setupAxiosInterceptors();
  }, []);

  const handleLogout = () => {
    clearAuthData();
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris"></div>
      </div>
    );
  }

  if (!isAuthenticated || !adminData) {
    return null; // Or a redirect component
  }

  const adminName =
    adminData.fullName ||
    `${adminData.firstName || ""} ${adminData.lastName || ""}`.trim() ||
    adminData.email ||
    "Admin";

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris"></div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-iris">Zafra Admin</h1>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                  <Bell className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {adminName}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
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
          <div className="bg-iris rounded-lg p-6 text-white mb-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {adminName ? adminName.split(" ")[0] : "Admin"}!
            </h2>
            <p className="text-purple-100">
              Manage your users, perfumes, and orders from here.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "users", label: "Users", icon: Users },
                { id: "products", label: "Perfumes", icon: Package },
                { id: "orders", label: "Orders", icon: ShoppingBag },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "border-iris text-iris"
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
            {activeTab === "users" && <UserManagement />}
            {activeTab === "products" && <ProductManagement userRole="admin" />}
            {activeTab === "orders" && <OrderManagement userRole="admin" />}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
