// app/manager/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface PerfumeDetails {
  perfumeName: string;
  perfumeBrand: string;
  perfumeImage: string;
  perfumePrice: number;
  perfumeQuantity: number;
}

interface CartDetails {
  cartId: string;
  cartTotal: number;
  cartQuantity: number;
  cartProducts: PerfumeDetails[];
  customerName: string;
  customerEmail: string;
  customerPhone: number;
  paymentStatus?: boolean;
  deliveryStatus?: boolean;
  orderCreatedDate?: string;
}

export default function AllCartsPage() {
  const [carts, setCarts] = useState<CartDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/customer/get-all-carts-admin"
        );
        setCarts(response.data);
      } catch (err: any) {
        console.error("Error fetching carts:", err);
        setError(err.response?.data?.message || "Failed to fetch all carts.");
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
  }, []);

  const getStatusBadge = (payment: boolean, delivery: boolean) => {
    if (payment && delivery) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>;
    } else if (payment && !delivery) {
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Processing</span>;
    } else {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending Payment</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        All Customer Orders
      </h1>

      {carts.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {carts.map((cart) => (
            <Link
              key={cart.cartId}
              href={`/manager/orders/${cart.cartId}`}
              className="block"
            >
              <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Order ID: {cart.cartId}
                    </h2>
                    <p className="text-gray-600">
                      Customer: {cart.customerName}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Email: {cart.customerEmail} | Phone: {cart.customerPhone}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(cart.paymentStatus || false, cart.deliveryStatus || false)}
                    <p className="text-gray-600 mt-2">
                      Total: ${cart.cartTotal}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Items: {cart.cartQuantity}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {cart.cartProducts.slice(0, 3).map((product, idx) => (
                    <div
                      key={idx}
                      className="border p-3 rounded-lg flex items-center"
                    >
                      <img
                        src={product.perfumeImage}
                        alt={product.perfumeName}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-sm">
                          {product.perfumeName}
                        </h4>
                        <p className="text-gray-600 text-xs">
                          Qty: {product.perfumeQuantity} × ${product.perfumePrice}
                        </p>
                      </div>
                    </div>
                  ))}
                  {cart.cartProducts.length > 3 && (
                    <div className="flex items-center justify-center text-gray-500">
                      +{cart.cartProducts.length - 3} more items
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Click to view and manage order details
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}