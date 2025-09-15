"use client";
import { useState, useEffect, useCallback } from "react";
import { Order } from "@/lib/api";
import {
  orderService,
  OrderStatus as ServiceStatus,
  OrderRecord,
} from "@/lib/orderService";
import { useToast } from "@/app/component/ui/ToastProvider";
import {
  ShoppingBag,
  Search,
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
  Eye,
  Trash2,
  Plus,
  X,
  Package,
  MapPin,
} from "lucide-react";

interface OrderManagementProps {
  userRole: "admin" | "manager";
}

type OrderStatus = ServiceStatus;

export default function OrderManagement({ userRole }: OrderManagementProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Create order form state
  const [createOrderData, setCreateOrderData] = useState({
    customerId: "",
    customerName: "",
    customerEmail: "",
    status: "Pending",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    items: [] as {
      perfumeId: string;
      perfumeName: string;
      quantity: number;
      price: number;
    }[],
    totalAmount: 0,
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      // orderService.list will attempt role-specific endpoints then fallback to /customer/get-all-orders (spec customer module)
      const data = await orderService.list(userRole);
      const mapped: Order[] = (Array.isArray(data) ? data : []).map(
        (o: OrderRecord) => ({
          id: o.id,
          customerId: o.customerId,
          customerName: o.customerName,
          items: o.items.map((it) => ({
            id: it.id || "temp",
            perfumeId: it.perfumeId,
            perfumeName: it.perfumeName,
            quantity: it.quantity,
            price: it.price,
          })),
          totalAmount: o.totalAmount || 0,
          status: o.status,
          shippingAddress: o.shippingAddress || "",
          createdAt: o.createdAt || new Date().toISOString(),
          updatedAt: o.updatedAt || new Date().toISOString(),
        })
      );
      if (mapped.length === 0) {
        if (typeof window !== "undefined") {
          // Surface quick diagnostics in dev
          const diag = {
            userRole,
            hasAuthToken: !!localStorage.getItem("authToken"),
            hasAdminToken: !!localStorage.getItem("adminAuthToken"),
            hasManagerToken: !!localStorage.getItem("managerAuthToken"),
            customerId: localStorage.getItem("customerId"),
          };
          console.warn("OrderManagement: no orders returned", diag);
        }
      }
      setOrders(mapped);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]); // Set empty array on error
      showError(
        "Failed to Load",
        "Unable to load orders. Please refresh the page."
      );
    } finally {
      setLoading(false);
    }
  }, [userRole, showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle status update
  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await orderService.updateStatus(orderId, newStatus, userRole);
      await fetchOrders();
      showSuccess("Status Updated", `Order status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      showError(
        "Update Failed",
        "Unable to update order status. Please try again."
      );
    }
  };

  // Handle delete (admin only)
  const handleDelete = async (orderId: string) => {
    if (userRole !== "admin") {
      showWarning("Access Denied", "Only admins can delete orders");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    )
      return;

    try {
      await orderService.delete(orderId);
      await fetchOrders();
      showSuccess("Order Deleted", "Order has been successfully removed");
    } catch (error) {
      console.error("Error deleting order:", error);
      showError("Delete Failed", "Unable to delete order. Please try again.");
    }
  };

  // Handle create order (admin only)
  const handleCreateOrder = async () => {
    if (userRole !== "admin") {
      showWarning("Access Denied", "Only admins can create orders");
      return;
    }

    if (
      !createOrderData.customerId ||
      !createOrderData.shippingAddress.street ||
      !createOrderData.shippingAddress.city ||
      !createOrderData.shippingAddress.state ||
      !createOrderData.shippingAddress.zipCode ||
      !createOrderData.shippingAddress.country ||
      createOrderData.items.length === 0
    ) {
      showWarning(
        "Missing Information",
        "Please fill in all required fields and add at least one item"
      );
      return;
    }

    try {
      setIsCreating(true);
      // Convert items to include temporary IDs
      const itemsWithIds = createOrderData.items.map((item, index) => ({
        id: `temp_${Date.now()}_${index}`, // Temporary ID for creation
        ...item,
      }));

      await orderService.create({
        customerId: createOrderData.customerId,
        customerName: createOrderData.customerName,
        items: itemsWithIds,
        totalAmount: createOrderData.totalAmount,
        status: "pending",
        shippingAddress: `${createOrderData.shippingAddress.street}, ${createOrderData.shippingAddress.city}, ${createOrderData.shippingAddress.state} ${createOrderData.shippingAddress.zipCode}, ${createOrderData.shippingAddress.country}`,
      });

      // Reset form
      setCreateOrderData({
        customerId: "",
        customerName: "",
        customerEmail: "",
        status: "Pending",
        shippingAddress: {
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        },
        items: [],
        totalAmount: 0,
      });

      setShowCreateOrder(false);
      await fetchOrders();
      showSuccess("Order Created", "New order has been successfully created");
    } catch (error: unknown) {
      console.error("Error creating order:", error);
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage =
          axiosError.response?.data?.message || "API error occurred";
      }
      showError("Creation Failed", errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle create order from cart
  // Filter orders
  const filteredOrders = (orders || []).filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName &&
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <RefreshCw className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getNextStatuses = (currentStatus: string): OrderStatus[] => {
    switch (currentStatus) {
      case "pending":
        return ["processing", "cancelled"];
      case "processing":
        return ["shipped", "cancelled"];
      case "shipped":
        return ["delivered"];
      case "delivered":
        return [];
      case "cancelled":
        return [];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">
            {userRole === "admin"
              ? "Manage all customer orders and track fulfillment"
              : "Process orders and update fulfillment status"}
          </p>
        </div>

        {/* Create Order Button (Admin only) */}
        {userRole === "admin" && (
          <button
            onClick={() => setShowCreateOrder(true)}
            className="flex items-center space-x-2 bg-iris text-white px-4 py-2 rounded-lg hover:bg-iris-dark transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Order</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | OrderStatus)
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Order Details</h3>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Order ID
                  </label>
                  <p className="text-sm text-gray-900">{selectedOrder.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedOrder.customerName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Amount
                  </label>
                  <p className="text-sm text-gray-900">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Address
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedOrder.shippingAddress}
                </p>
              </div>

              {/* Order Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Items
                </label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.perfumeName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <div className="flex space-x-2">
                  {getNextStatuses(selectedOrder.status).map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        handleStatusUpdate(selectedOrder.id, status)
                      }
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        status === "cancelled"
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      Mark as {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal (Admin only) */}
      {showCreateOrder && userRole === "admin" && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-0 w-full max-w-4xl max-h-[95vh] overflow-hidden animate-slideUp transform">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 to-purple-600 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-10 transform rotate-12 scale-150"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Create New Order</h3>
                  <p className="text-white/80 text-sm mt-1">
                    Add a new order to the system with customer details and
                    items
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateOrder(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)] space-y-8">
              {/* Customer Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                  <User className="w-5 h-5 text-iris" />
                  <span>Customer Information</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="w-4 h-4 text-iris" />
                      <span>Customer ID *</span>
                    </label>
                    <input
                      type="text"
                      value={createOrderData.customerId}
                      onChange={(e) =>
                        setCreateOrderData((prev) => ({
                          ...prev,
                          customerId: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-iris focus:ring-4 focus:ring-iris/10 transition-all duration-300 bg-white"
                      placeholder="Enter customer ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="w-4 h-4 text-iris" />
                      <span>Customer Name</span>
                    </label>
                    <input
                      type="text"
                      value={createOrderData.customerName}
                      onChange={(e) =>
                        setCreateOrderData((prev) => ({
                          ...prev,
                          customerName: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-iris focus:ring-4 focus:ring-iris/10 transition-all duration-300 bg-white"
                      placeholder="Enter customer name"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-iris" />
                  <span>Shipping Information</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4 text-iris" />
                      <span>Street Address *</span>
                    </label>
                    <input
                      type="text"
                      value={createOrderData.shippingAddress.street}
                      onChange={(e) =>
                        setCreateOrderData((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            street: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-iris focus:ring-4 focus:ring-iris/10 transition-all duration-300 bg-white"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      value={createOrderData.shippingAddress.city}
                      onChange={(e) =>
                        setCreateOrderData((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            city: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-iris focus:ring-4 focus:ring-iris/10 transition-all duration-300 bg-white"
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      State *
                    </label>
                    <input
                      type="text"
                      value={createOrderData.shippingAddress.state}
                      onChange={(e) =>
                        setCreateOrderData((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            state: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-iris focus:ring-4 focus:ring-iris/10 transition-all duration-300 bg-white"
                      placeholder="Enter state"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={createOrderData.shippingAddress.zipCode}
                      onChange={(e) =>
                        setCreateOrderData((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            zipCode: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-iris focus:ring-4 focus:ring-iris/10 transition-all duration-300 bg-white"
                      placeholder="Enter ZIP code"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={createOrderData.shippingAddress.country}
                      onChange={(e) =>
                        setCreateOrderData((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            country: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-iris focus:ring-4 focus:ring-iris/10 transition-all duration-300 bg-white"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-iris" />
                    <span>Order Items</span>
                  </h4>
                  <button
                    onClick={() => {
                      setCreateOrderData((prev) => ({
                        ...prev,
                        items: [
                          ...prev.items,
                          {
                            perfumeId: "",
                            perfumeName: "",
                            quantity: 1,
                            price: 0,
                          },
                        ],
                      }));
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-iris text-white rounded-lg hover:bg-iris/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {createOrderData.items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No items added yet
                    </p>
                    <p className="text-gray-400 text-sm">
                      Click &ldquo;Add Item&rdquo; to start building the order
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {createOrderData.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Perfume ID
                            </label>
                            <input
                              type="text"
                              placeholder="Enter ID"
                              value={item.perfumeId}
                              onChange={(e) => {
                                const newItems = [...createOrderData.items];
                                newItems[index].perfumeId = e.target.value;
                                setCreateOrderData((prev) => ({
                                  ...prev,
                                  items: newItems,
                                }));
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-iris focus:ring-2 focus:ring-iris/10 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Perfume Name
                            </label>
                            <input
                              type="text"
                              placeholder="Enter name"
                              value={item.perfumeName}
                              onChange={(e) => {
                                const newItems = [...createOrderData.items];
                                newItems[index].perfumeName = e.target.value;
                                setCreateOrderData((prev) => ({
                                  ...prev,
                                  items: newItems,
                                }));
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-iris focus:ring-2 focus:ring-iris/10 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Quantity
                            </label>
                            <input
                              type="number"
                              placeholder="1"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...createOrderData.items];
                                newItems[index].quantity =
                                  parseInt(e.target.value) || 1;
                                const total = newItems.reduce(
                                  (sum, itm) => sum + itm.quantity * itm.price,
                                  0
                                );
                                setCreateOrderData((prev) => ({
                                  ...prev,
                                  items: newItems,
                                  totalAmount: total,
                                }));
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-iris focus:ring-2 focus:ring-iris/10 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Price ($)
                            </label>
                            <input
                              type="number"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => {
                                const newItems = [...createOrderData.items];
                                newItems[index].price =
                                  parseFloat(e.target.value) || 0;
                                const total = newItems.reduce(
                                  (sum, itm) => sum + itm.quantity * itm.price,
                                  0
                                );
                                setCreateOrderData((prev) => ({
                                  ...prev,
                                  items: newItems,
                                  totalAmount: total,
                                }));
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-iris focus:ring-2 focus:ring-iris/10 text-sm"
                            />
                          </div>
                          <div className="flex flex-col justify-end">
                            <button
                              onClick={() => {
                                const newItems = createOrderData.items.filter(
                                  (_, i) => i !== index
                                );
                                const total = newItems.reduce(
                                  (sum, itm) => sum + itm.quantity * itm.price,
                                  0
                                );
                                setCreateOrderData((prev) => ({
                                  ...prev,
                                  items: newItems,
                                  totalAmount: total,
                                }));
                              }}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Item Total:</span>
                            <span className="font-semibold text-gray-800">
                              ${(item.quantity * item.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Amount */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-iris">
                    ${createOrderData.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateOrder(false);
                    setCreateOrderData({
                      customerId: "",
                      customerName: "",
                      customerEmail: "",
                      status: "Pending",
                      totalAmount: 0,
                      shippingAddress: {
                        street: "",
                        city: "",
                        state: "",
                        country: "",
                        zipCode: "",
                      },
                      items: [],
                    });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={isCreating || createOrderData.items.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-900 to-purple-600 text-white rounded-lg hover:from-iris/90 hover:to-purple-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
                >
                  {isCreating ? "Creating..." : "Create Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ShoppingBag className="w-5 h-5 text-iris mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} item(s)
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {order.customerName || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {order.totalAmount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* View Details */}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="text-iris hover:text-iris-dark p-1 rounded hover:bg-iris-50"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Quick Status Updates */}
                      {getNextStatuses(order.status).length > 0 && (
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              order.id,
                              e.target.value as OrderStatus
                            )
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-iris"
                        >
                          <option value={order.status}>
                            Current: {order.status}
                          </option>
                          {getNextStatuses(order.status).map((status) => (
                            <option key={status} value={status}>
                              Mark as {status}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Delete Button (Admin only) */}
                      {userRole === "admin" && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Try adjusting your search terms"
              : "No orders available to manage"}
          </p>
        </div>
      )}

      {/* Order Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-8">
        {[
          { status: "pending", label: "Pending", color: "yellow" },
          { status: "processing", label: "Processing", color: "blue" },
          { status: "shipped", label: "Shipped", color: "purple" },
          { status: "delivered", label: "Delivered", color: "green" },
          { status: "cancelled", label: "Cancelled", color: "red" },
        ].map(({ status, label, color }) => {
          const count = (orders || []).filter(
            (order) => order.status === status
          ).length;
          const iconColor = `text-${color}-500`;

          return (
            <div
              key={status}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center">
                <div className={iconColor}>{getStatusIcon(status)}</div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {count}
                  </h3>
                  <p className="text-sm text-gray-600">{label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
