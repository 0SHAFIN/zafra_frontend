"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { useAuthRedirect, clearAuthData } from "@/lib/auth";
import { dashboardAPI, DashboardStats } from "@/lib/api";
import ClientOnly from "@/app/component/ClientOnly";
import ProductManagement from "@/app/component/dashboard/ProductManagement";
import UserManagement from "@/app/component/dashboard/UserManagement";
import OrderManagement from "@/app/component/dashboard/OrderManagement";
import ReviewManagement from "@/app/component/dashboard/ReviewManagement";

export default function AdminDashboard() {
  const router = useRouter();
  const {
    user: adminData,
    isLoading,
    isAuthenticated,
  } = useAuthRedirect("admin");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0,
    monthlyGrowth: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch real dashboard stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await dashboardAPI.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Keep using placeholder data on error
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && adminData) {
      fetchStats();
    }
  }, [isAuthenticated, adminData]);

  const handleLogout = () => {
    clearAuthData();
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris"></div>
      </div>
    );
  }

  if (!adminData) {
    return null;
  }

  const adminName =
    adminData.fullName ||
    `${adminData.firstName || ""} ${adminData.lastName || ""}`.trim() ||
    adminData.email ||
    "Admin";

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris"></div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-iris">Zafra Admin</h1>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {adminName}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-iris to-purple-600 rounded-lg p-6 text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {adminName ? adminName.split(" ")[0] : "Admin"}!
            </h2>
            <p className="text-purple-100">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <div className="text-3xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats.totalUsers.toLocaleString()
                    )}
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +8.2% from last month
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <div className="text-3xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats.totalOrders.toLocaleString()
                    )}
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ShoppingBag className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +15.3% from last month
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Products
                  </p>
                  <div className="text-3xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats.totalProducts.toLocaleString()
                    )}
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +3.1% from last month
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <div className="text-3xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      `$${stats.totalRevenue.toLocaleString()}`
                    )}
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +{stats.monthlyGrowth}% from last month
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "users", label: "Users", icon: Users },
                { id: "products", label: "Products", icon: Package },
                { id: "orders", label: "Orders", icon: ShoppingBag },
                { id: "reviews", label: "Reviews", icon: MessageSquare },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
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
          <div className="space-y-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Stats */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Orders</span>
                      <span className="font-medium text-yellow-600">
                        {stats.pendingOrders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Orders</span>
                      <span className="font-medium text-green-600">
                        {stats.completedOrders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Today&apos;s Revenue
                      </span>
                      <span className="font-medium text-iris">
                        ${stats.todayRevenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    System Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">API Status</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">
                          Connected
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Payment Gateway</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && <UserManagement />}
            {activeTab === "products" && <ProductManagement userRole="admin" />}
            {activeTab === "orders" && <OrderManagement userRole="admin" />}
            {activeTab === "reviews" && <ReviewManagement />}

            {activeTab === "settings" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Admin Settings
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        Profile Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={adminName}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={adminData.email}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        System Settings
                      </h4>
                      <p className="text-gray-600">
                        System configuration options would be available here.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
