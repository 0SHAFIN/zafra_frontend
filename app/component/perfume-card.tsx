"use client";
import Link from "next/link";
import {ShoppingCart} from "lucide-react";
import { addToCart } from "@/lib/apiCall";

interface PerfumeCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  stock: number;
  discount?: number;
  className?: string;
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
  className = "",
}: PerfumeCardProps) {
  const discountedPrice = discount ? price - (price * discount / 100) : price;
  const isOutOfStock = stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    const totalPrice = price * 1;
    const quantity = 1;
    const perfumeId = id;
    console.log( quantity, totalPrice, perfumeId);
    addToCart(quantity, totalPrice, perfumeId);
  };

  return (
    <Link href={`/perfumes/${id}`}>
    <div 
      className={`min-w-96 group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-iris/20 ${className}`}
    >
      <div className="h-64 bg-white flex items-center justify-center relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
        />
        
        
        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-4 left-4">
            <span className="text-sm font-bold text-white bg-red-500 px-3 py-1 rounded-full shadow-lg">
              -{discount}%
            </span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className={`absolute top-4 ${discount ? 'right-4' : 'left-4'}`}>
          <span className="text-sm font-semibold text-iris bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
            {category}
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
              {stock} left
            </span>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-600 mb-1">{brand}</h3>
          <h2 className="text-xl font-bold text-gray-800 group-hover:text-iris transition-colors line-clamp-1">
            {name}
          </h2>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
          {description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            {discount ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-iris">${discountedPrice.toFixed(2)}</span>
                <span className="text-lg text-gray-500 line-through">${price}</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-iris">${price}</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-iris text-white hover:bg-opacity-90 hover:scale-105'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
}
