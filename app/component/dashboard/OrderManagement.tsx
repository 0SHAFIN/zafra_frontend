"use client";
import { useState, useEffect } from "react";
import { Order, orderAPI, customerAPI, Customer, Cart } from "@/lib/api";
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
  Edit,
  Package,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

interface OrderManagementProps {
  userRole: "admin" | "manager";
}

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export default function OrderManagement({ userRole }: OrderManagementProps) {
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
    shippingAddress: "",
    items: [] as {
      perfumeId: string;
      perfumeName: string;
      quantity: number;
      price: number;
    }[],
    totalAmount: 0,
  });

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getAll();
      // Ensure data is an array
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle status update
  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status. Please try again.");
    }
  };

  // Handle delete (admin only)
  const handleDelete = async (orderId: string) => {
    if (userRole !== "admin") {
      alert("Only admins can delete orders");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    )
      return;

    try {
      await orderAPI.delete(orderId);
      await fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Error deleting order. Please try again.");
    }
  };

  // Handle create order (admin only)
  const handleCreateOrder = async () => {
    if (userRole !== "admin") {
      alert("Only admins can create orders");
      return;
    }

    if (
      !createOrderData.customerId ||
      !createOrderData.shippingAddress ||
      createOrderData.items.length === 0
    ) {
      alert("Please fill in all required fields and add at least one item");
      return;
    }

    try {
      setIsCreating(true);
      await orderAPI.create({
        customerId: createOrderData.customerId,
        customerName: createOrderData.customerName,
        items: createOrderData.items,
        totalAmount: createOrderData.totalAmount,
        status: "pending",
        shippingAddress: createOrderData.shippingAddress,
      });

      // Reset form
      setCreateOrderData({
        customerId: "",
        customerName: "",
        customerEmail: "",
        shippingAddress: "",
        items: [],
        totalAmount: 0,
      });

      setShowCreateOrder(false);
      await fetchOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle create order from cart
  const handleCreateFromCart = async (cartId: string) => {
    if (userRole !== "admin") {
      alert("Only admins can create orders from cart");
      return;
    }

    try {
      await orderAPI.createFromCart(cartId);
      await fetchOrders();
    } catch (error) {
      console.error("Error creating order from cart:", error);
      alert("Error creating order from cart. Please try again.");
    }
  };

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New Order</h3>
              <button
                onClick={() => setShowCreateOrder(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer ID *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
                    placeholder="Enter customer ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Address *
                </label>
                <textarea
                  value={createOrderData.shippingAddress}
                  onChange={(e) =>
                    setCreateOrderData((prev) => ({
                      ...prev,
                      shippingAddress: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
                  placeholder="Enter shipping address"
                />
              </div>

              {/* Order Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Order Items
                  </label>
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
                    className="text-iris hover:text-iris-dark text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {createOrderData.items.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items added yet</p>
                ) : (
                  <div className="space-y-2">
                    {createOrderData.items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <input
                          type="text"
                          placeholder="Perfume ID"
                          value={item.perfumeId}
                          onChange={(e) => {
                            const newItems = [...createOrderData.items];
                            newItems[index].perfumeId = e.target.value;
                            setCreateOrderData((prev) => ({
                              ...prev,
                              items: newItems,
                            }));
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Perfume Name"
                          value={item.perfumeName}
                          onChange={(e) => {
                            const newItems = [...createOrderData.items];
                            newItems[index].perfumeName = e.target.value;
                            setCreateOrderData((prev) => ({
                              ...prev,
                              items: newItems,
                            }));
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
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
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            placeholder="Price"
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
                            className="px-2 py-1 border border-gray-300 rounded text-sm flex-1"
                          />
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
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowCreateOrder(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={isCreating}
                  className="px-4 py-2 bg-iris text-white rounded-lg hover:bg-iris-dark disabled:opacity-50"
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
