"use client";

import { useEffect, useState } from "react";
import axios from "axios";

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
        setError(
          err.response?.data?.message || "Failed to fetch all carts."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">Loading carts...</p>
    );
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        All Customer Carts
      </h1>

      {carts.length === 0 ? (
        <p className="text-gray-500">No carts found.</p>
      ) : (
        carts.map((cart) => (
          <div
            key={cart.cartId}
            className="bg-white shadow-md rounded-lg p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Cart ID: {cart.cartId}
            </h2>
            <p className="text-gray-600 mb-1">
              Customer: {cart.customerName} | Email: {cart.customerEmail} | Phone: {cart.customerPhone}
            </p>
            <p className="text-gray-600 mb-2">
              Total Quantity: {cart.cartQuantity}, Total Price: ${cart.cartTotal}
            </p>

            {cart.cartProducts.length === 0 ? (
              <p className="text-gray-500">No products in this cart.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cart.cartProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="border p-4 rounded-lg flex flex-col items-center"
                  >
                    <img
                      src={product.perfumeImage}
                      alt={product.perfumeName}
                      className="w-full h-32 object-cover mb-2 rounded"
                    />
                    <h3 className="font-semibold">{product.perfumeName}</h3>
                    <p className="text-gray-600">{product.perfumeBrand}</p>
                    <p className="text-gray-600">
                      Quantity: {product.perfumeQuantity} | Price: ${product.perfumePrice}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
