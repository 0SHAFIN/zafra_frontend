"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/apiCall";
import { useAuthCheck } from "@/lib/auth";
import { getImageUrl } from "@/lib/api";

interface PerfumeCardProps {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  brand?: string;
  stock?: number;
  discount?: number;
  className?: string;
  perfume?: {
    _id: string;
    name: string;
    brand: string;
    price: number;
    description: string;
    imageUrl: string;
    size: string;
    stockQuantity: number;
  };
}

export default function PerfumeCard({
  id,
  name,
  description,
  price,
  image,
  category,
  brand,
  stock,
  discount,
  className,
  perfume,
}: PerfumeCardProps) {
  const [imageError, setImageError] = useState(false);
  const { user } = useAuthCheck();

  // Use either the individual props or the perfume object
  const perfumeData = perfume || {
    _id: id || "",
    name: name || "",
    brand: brand || "",
    price: price || 0,
    description: description || "",
    imageUrl: image || "",
    size: "100ml",
    stockQuantity: stock || 0,
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Stop event bubbling

    if (!user) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      const quantity = 1;
      await addToCart(perfumeData._id, quantity, Number(perfumeData.price));
      alert("Added to cart successfully!");
    } catch (error) {
      console.error("Add to cart error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to add to cart: ${errorMessage}`);
    }
  };

  const finalPrice = discount
    ? Number(perfumeData.price) - (Number(perfumeData.price) * discount) / 100
    : Number(perfumeData.price);

  const isOutOfStock = perfumeData.stockQuantity === 0;

  return (
    <Link href={`/perfumes/${perfumeData._id}`}>
      <div
        className={`min-w-96 group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-iris/20 ${
          className || ""
        }`}
      >
        <div className="h-64 bg-white flex items-center justify-center relative overflow-hidden">
          {!imageError ? (
            <Image
              src={getImageUrl(perfumeData.imageUrl)}
              alt={perfumeData.name}
              fill
              className="object-contain group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            // Fallback: Use regular img tag for problematic URLs
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getImageUrl(perfumeData.imageUrl)}
              alt={perfumeData.name}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
            />
          )}

          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-4 left-4">
              <span className="text-sm font-bold text-white bg-red-500 px-3 py-1 rounded-full shadow-lg">
                -{discount}%
              </span>
            </div>
          )}

          {/* Category Badge */}
          <div className={`absolute top-4 ${discount ? "right-4" : "left-4"}`}>
            <span className="text-sm font-semibold text-iris bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
              {category || "Fragrance"}
            </span>
          </div>

          {/* Stock Status */}
          <div className="absolute bottom-4 right-4">
            {isOutOfStock ? (
              <span className="text-sm font-medium text-red-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                Out of Stock
              </span>
            ) : (
              <span className="text-sm font-medium text-green-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                {perfumeData.stockQuantity} left
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-600 mb-1">
              {perfumeData.brand}
            </h3>
            <h2 className="text-xl font-bold text-gray-800 group-hover:text-iris transition-colors line-clamp-1">
              {perfumeData.name}
            </h2>
          </div>

          <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
            {perfumeData.description}
          </p>

          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              {discount ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-iris">
                    ${finalPrice.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ${Number(perfumeData.price).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-iris">
                  ${Number(perfumeData.price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isOutOfStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-iris text-white hover:bg-opacity-90 hover:scale-105"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
