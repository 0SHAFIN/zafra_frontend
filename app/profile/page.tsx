"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, Edit3, Save, X, LogOut, ShoppingBag, Heart, Settings, Package, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import axios from "axios";

interface CustomerData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OrderItem {
  perfumeName: string;
  perfumeBrand: string;
  perfumeImage: string;
  perfumePrice: number;
  perfumeQuantity: number;
}

interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  orderDate: string;
  orderProducts: OrderItem[];
  orderStatus: string;
  orderTotal: string;
  paymentStatus: string;
  deliveryStatus: boolean;
}

export default function CustomerProfilePage() {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<CustomerData>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Get customer data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        console.log("parsedData", parsedData);
        setCustomerData(parsedData);
        setEditData(parsedData);
        fetchOrders(parsedData.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  const fetchOrders = async (customerId: string) => {
    setOrdersLoading(true);
    try {
      console.log("customerId", customerId);
      const token = localStorage.getItem("authToken");
      console.log(token);
      const response = await axios.post(
        `http://localhost:3000/customer/get-all-pending-orders`,
        { customerId },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      const ordersData = await response.data;
      console.log("ordersData", ordersData);
      
      // Ensure ordersData is always an array
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else if (ordersData && typeof ordersData === 'object') {
        // If it's a single order object, wrap it in an array
        setOrders([ordersData]);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Set empty array if API fails
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    console.log("orders", orders);
  }, [orders]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(customerData || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(customerData || {});
  };

  const handleSave = async () => {
    if (!customerData) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:3000/customer/${customerData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setCustomerData(updatedData);
        localStorage.setItem("user", JSON.stringify(updatedData));
        setIsEditing(false);
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-iris/10 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris"></div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-iris/10 to-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Profile Found</h2>
          <Link href="/login" className="text-iris hover:underline">
            Please login to view your profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-iris/10 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{customerData.fullName}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {customerData.email}
              </p>
            </div>
            <div className="flex gap-4">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-iris text-white rounded-xl hover:bg-opacity-90 transition-all duration-300 hover:scale-105"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 hover:scale-105"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-3xl shadow-lg mb-8">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'profile' ? 'text-iris border-b-2 border-iris' : 'text-gray-600 hover:text-iris'
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'orders' ? 'text-iris border-b-2 border-iris' : 'text-gray-600 hover:text-iris'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'settings' ? 'text-iris border-b-2 border-iris' : 'text-gray-600 hover:text-iris'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.fullName || ""}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 text-lg">{customerData.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email || ""}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 text-lg">{customerData.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 text-lg">{customerData.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-2" />
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.address || ""}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent resize-none"
                    />
                  ) : (
                    <p className="text-gray-800 text-lg">{customerData.address}</p>
                  )}
                </div>

               
              </div>

              {/* Account Information Card */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Account Information</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-semibold">Member since:</span> {customerData.createdAt ? new Date(customerData.createdAt).toLocaleDateString() : "N/A"}</p>
                    <p><span className="font-semibold">Last updated:</span> {customerData.updatedAt ? new Date(customerData.updatedAt).toLocaleDateString() : "N/A"}</p>
                    <p><span className="font-semibold">Account ID:</span> {customerData.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Orders content */}
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iris"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
                  <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                  <Link
                    href="/perfumes"
                    className="bg-iris text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all duration-300 hover:scale-105"
                  >
                    Browse Perfumes
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.orderId} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">Order #{order.orderId}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(order.orderDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${parseFloat(order.orderTotal).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                            order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                            order.deliveryStatus ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.deliveryStatus ? 'Delivered' : 'Not Delivered'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.orderProducts.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {item.perfumeImage ? (
                                <img
                                  src={item.perfumeImage}
                                  alt={item.perfumeName}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-lavender to-periwinkle">
                                🌸
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{item.perfumeName}</h4>
                              <p className="text-sm text-gray-600">Brand: {item.perfumeBrand}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.perfumeQuantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800">${(item.perfumePrice * item.perfumeQuantity).toFixed(2)}</p>
                              <p className="text-sm text-gray-600">${item.perfumePrice.toFixed(2)} each</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <div>
                            <p><span className="font-semibold">Customer:</span> {order.customerName}</p>
                            <p><span className="font-semibold">Email:</span> {order.customerEmail}</p>
                            <p><span className="font-semibold">Phone:</span> {order.customerPhone}</p>
                            <p><span className="font-semibold">Address:</span> {order.customerAddress}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">Total: ${parseFloat(order.orderTotal).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <Link
                      href="/perfumes"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                    >
                      <ShoppingBag className="w-5 h-5 text-iris" />
                      <span className="text-gray-700">Browse Perfumes</span>
                    </Link>
                    <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors w-full text-left">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-gray-700">Wishlist</span>
                    </button>
                    <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors w-full text-left">
                      <Settings className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">Preferences</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Account Security</h4>
                  <div className="space-y-3">
                    <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors w-full text-left">
                      <User className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700">Change Password</span>
                    </button>
                    <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors w-full text-left">
                      <Mail className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Email Notifications</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left text-red-600"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
