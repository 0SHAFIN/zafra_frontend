"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  ShoppingBag, 
  BarChart3, 
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType 
}: { 
  title: string; 
  value: string; 
  icon: any; 
  change?: string; 
  changeType?: "positive" | "negative"; 
}) => (
  <div className="bg-white rounded-lg border shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {change && (
          <p className={`text-sm mt-2 ${
            changeType === "positive" ? "text-green-600" : "text-red-600"
          }`}>
            {change} from last month
          </p>
        )}
      </div>
      <div className="bg-purple-50 p-3 rounded-full">
        <Icon className="h-6 w-6 text-purple-600" />
      </div>
    </div>
  </div>
);

const TabContent = ({ activeTab }: { activeTab: string }) => {
  switch (activeTab) {
    case "users":
      return <div>Manage Users Section</div>;
    case "orders":
      return <div>Manage Orders Section</div>;
    case "products":
      return <div>Manage Products Section</div>;
    default:
      return <div>Select a tab to manage related work</div>;
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setStats({
        totalUsers: 2543,
        totalProducts: 24,
        totalOrders: 1423,
        totalRevenue: 52340,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const statsConfig = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: "Products",
      value: stats.totalProducts.toLocaleString(),
      icon: BarChart3,
      change: "+5%",
      changeType: "positive" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "overview" ? "bg-purple-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "users" ? "bg-purple-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "orders" ? "bg-purple-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "products" ? "bg-purple-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <TabContent activeTab={activeTab} />
      </div>
    </div>
  );
}