// app/manager/orders/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Truck, CheckCircle, XCircle, Save, Clock } from "lucide-react";

interface OrderDetails {
  cartId: string;
  cartTotal: number;
  cartQuantity: number;
  cartProducts: Array<{
    perfumeName: string;
    perfumeBrand: string;
    perfumeImage: string;
    perfumePrice: number;
    perfumeQuantity: number;
  }>;
  customerName: string;
  customerEmail: string;
  customerPhone: number;
  paymentStatus?: boolean;
  deliveryStatus?: boolean;
  orderCreatedDate?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // First get all orders
        const response = await axios.get(
          "http://localhost:3000/customer/get-all-carts-admin"
        );
        
        // Find the specific order by ID
        const foundOrder = response.data.find((o: OrderDetails) => o.cartId === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          console.error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const updateOrderStatus = async (field: 'paymentStatus' | 'deliveryStatus', value: boolean) => {
    if (!order) return;

    setUpdating(true);
    try {
      // Backend API call to update order status
      const response = await axios.patch(
        `http://localhost:3000/cart/${orderId}/status`,
        {
          [field]: value,
          // Maintain the other status
          ...(field === 'paymentStatus' 
            ? { deliveryStatus: order.deliveryStatus } 
            : { paymentStatus: order.paymentStatus }
          )
        }
      );

      if (response.status === 200) {
        // Update local state
        setOrder(prev => prev ? { ...prev, [field]: value } : null);
        alert("Order status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-xl">Order not found.</p>
          <button
            onClick={() => router.push("/manager/orders")}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-600 hover:text-purple-700 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Order Details: {order.cartId}
          </h1>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{order.customerPhone}</p>
            </div>
          
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Order Status Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Payment Status
              </h3>
              <div className="flex items-center gap-4">
                <div className={`flex items-center ${
                  order.paymentStatus ? 'text-green-600' : 'text-red-600'
                }`}>
                  {order.paymentStatus ? (
                    <CheckCircle className="h-6 w-6 mr-2" />
                  ) : (
                    <XCircle className="h-6 w-6 mr-2" />
                  )}
                  <span className="font-semibold">
                    {order.paymentStatus ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <button
                  onClick={() => updateOrderStatus('paymentStatus', !order.paymentStatus)}
                  disabled={updating}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Toggle Status'}
                </button>
              </div>
            </div>

            {/* Delivery Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Delivery Status
              </h3>
              <div className="flex items-center gap-4">
                <div className={`flex items-center ${
                  order.deliveryStatus ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.deliveryStatus ? (
                    <Truck className="h-6 w-6 mr-2" />
                  ) : (
                    <Clock className="h-6 w-6 mr-2" />
                  )}
                  <span className="font-semibold">
                    {order.deliveryStatus ? 'Delivered' : 'Processing'}
                  </span>
                </div>
                <button
                  onClick={() => updateOrderStatus('deliveryStatus', !order.deliveryStatus)}
                  disabled={updating}
                  className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Delivery'}
                </button>
              </div>
            </div>
          </div>
        </div>

     
        {/* Products List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Products ({order.cartProducts.length})
          </h2>
          <div className="space-y-4">
            {order.cartProducts.map((product, index) => (
              <div key={index} className="flex items-center border-b pb-4 last:border-b-0">
                <img
                  src={product.perfumeImage}
                  alt={product.perfumeName}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{product.perfumeName}</h3>
                  <p className="text-sm text-gray-600">{product.perfumeBrand}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.perfumePrice}</p>
                  <p className="text-sm text-gray-600">
                    Qty: {product.perfumeQuantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total: ${(product.perfumePrice * product.perfumeQuantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}