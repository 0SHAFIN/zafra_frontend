"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/api";

import {
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";
import { getPerfumeById, addToCart } from "@/lib/apiCall";

interface Perfume {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  stock: number;
  discount?: number;
}

export default function PerfumeDetailPage() {
  const params = useParams();
  const perfumeId = params.id as string;
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage] = useState(0);

  const images = [getImageUrl(perfume?.image)];

  useEffect(() => {
    const fetchPerfume = async () => {
      setLoading(true);
      try {
        // Use the dedicated getPerfumeById endpoint for better performance
        const perfumeData = await getPerfumeById(perfumeId);
        console.log("perfume data", perfumeData);
        setPerfume(perfumeData);
      } catch (error) {
        console.error("Error fetching perfume:", error);
      } finally {
        setLoading(false);
      }
    };

    if (perfumeId) {
      fetchPerfume();
    }
  }, [perfumeId]);

  useEffect(() => {
    console.log("perfume", perfume);
  }, [perfume]);

  const handleAddToCart = async () => {
    if (perfume) {
      console.log("Adding to cart:", { perfumeId: perfume.id, quantity });
      try {
        await addToCart(perfume.id, quantity, perfume.price);
        // You could add a success message or toast here
        console.log("Successfully added to cart");
      } catch (error) {
        console.error("Error adding to cart:", error);
        // You could add an error message or toast here
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris mx-auto mb-4"></div>
              <p className="text-gray-600">Loading perfume details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              Perfume not found
            </h3>
            <p className="text-gray-500">
              The perfume you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const discountedPrice = perfume.discount
    ? perfume.price - (perfume.price * perfume.discount) / 100
    : perfume.price;
  const isOutOfStock = perfume.stock === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-iris transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/perfumes"
              className="hover:text-iris transition-colors"
            >
              Perfumes
            </Link>
            <span>/</span>
            <span className="text-gray-800">{perfume.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg relative">
              <Image
                src={images[selectedImage]}
                alt={perfume.name}
                fill
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {perfume.brand}
              </h3>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {perfume.name}
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {perfume.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              {perfume.discount ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-iris">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    ${perfume.price}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{perfume.discount}%
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-iris">
                  ${perfume.price}
                </span>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Category:</span>
                <span className="bg-iris text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {perfume.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Stock:</span>
                {isOutOfStock ? (
                  <span className="text-red-600 font-semibold">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-green-600 font-semibold">
                    {perfume.stock} available
                  </span>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(perfume.stock, quantity + 1))
                    }
                    disabled={quantity >= perfume.stock}
                    className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-full font-semibold transition-all duration-300 ${
                    isOutOfStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-iris text-white hover:bg-opacity-90 hover:scale-105"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-6 h-6 text-iris mx-auto mb-2" />
                <p className="text-sm text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-iris mx-auto mb-2" />
                <p className="text-sm text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-iris mx-auto mb-2" />
                <p className="text-sm text-gray-600">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
