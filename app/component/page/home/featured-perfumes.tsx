"use client";
import Link from "next/link";
import PerfumeCard from "../../perfume-card";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../../../context/cart-context";

const featuredPerfumes = [
  {
    id: 1,
    name: "Midnight Jasmine",
    description: "A seductive blend of jasmine, vanilla, and sandalwood",
    price: "$89",
    image: "🌸",
    category: "Floral",
    rating: 4.8
  },
  {
    id: 2,
    name: "Ocean Breeze",
    description: "Fresh aquatic notes with citrus and marine accords",
    price: "$75",
    image: "🌊",
    category: "Fresh",
    rating: 4.6
  },
  {
    id: 3,
    name: "Royal Oud",
    description: "Luxurious oud wood with rose and amber",
    price: "$125",
    image: "🌹",
    category: "Woody",
    rating: 4.9
  },
  {
    id: 4,
    name: "Citrus Burst",
    description: "Vibrant lemon, bergamot, and grapefruit",
    price: "$65",
    image: "🍋",
    category: "Citrus",
    rating: 4.5
  },
  {
    id: 5,
    name: "Eau de Parfum",
    description: "A classic fragrance with floral and woody notes",
    price: "$100",
    image: "🌹",
    category: "Floral",
    rating: 4.7
  },
  {
    id: 6,
    name: "Eau de Toilette",
    description: "A refreshing fragrance with citrus and mint",
    price: "$85",
    image: "🍋",
    category: "Citrus",
    rating: 4.6
  }

];

export default function FeaturedPerfumes() {
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const { addToCart } = useCart();

  const handleAddToCart = (perfume: any) => {
    // Convert API data to cart format
    const cartItem = {
      id: perfume.id,
      name: perfume.name,
      brand: perfume.brand || "Zafra",
      price: typeof perfume.price === 'string' ? parseFloat(perfume.price.replace('$', '')) : perfume.price,
      image: perfume.image,
      discount: perfume.discount
    };
    addToCart(cartItem);
  };

  useEffect(() => {
   const getAllPerfumes = async () => {
    try {
      const response = await axios.get("http://localhost:3000/perfume");
      const data = await response.data;
      console.log(data);
      setPerfumes(data);
    } catch (error) {
      console.error("Error fetching perfumes:", error);
      // Fallback to static data if API fails
      setPerfumes(featuredPerfumes);
    }
   };
   getAllPerfumes();
  }, []);

  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Featured <span className="text-iris">Fragrances</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most beloved scents, carefully curated for every occasion and personality
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {perfumes.map((perfume: any, index: number) => (
            <PerfumeCard
              key={perfume.id || index}
              {...perfume}
              onAddToCart={() => handleAddToCart(perfume)}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/perfumes"
            className="inline-flex items-center bg-gradient-to-r from-iris to-periwinkle text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            View All Perfumes
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
