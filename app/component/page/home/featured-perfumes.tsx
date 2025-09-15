"use client";
import Link from "next/link";
import PerfumeCard from "../../perfume-card";
import { useEffect, useState } from "react";
import axios from "axios";

// Extended interface to handle backend perfume data
interface PerfumeData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  image?: string;
  brand?: string;
  discount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function FeaturedPerfumes() {
  const [perfumes, setPerfumes] = useState<PerfumeData[]>([]);

  useEffect(() => {
    const getAllPerfumes = async () => {
      try {
        const response = await axios.get("http://localhost:3000/perfumes");
        const data = await response.data;
        console.log(data);

        // Map backend data to frontend interface
        const mappedPerfumes = data.map(
          (perfume: {
            _id?: string;
            id?: string;
            name: string;
            description: string;
            price: number;
            imageUrl?: string;
            image?: string;
            category?: string;
            brand?: string;
            stockQuantity?: number;
            stock?: number;
            discount?: number;
          }) => ({
            id: perfume._id || perfume.id || "",
            name: perfume.name,
            description: perfume.description,
            price: Number(perfume.price) || 0,
            image: perfume.imageUrl || perfume.image || "",
            category: perfume.category || "Unisex",
            brand: perfume.brand || "Zafra",
            stock: perfume.stockQuantity || perfume.stock || 0,
            discount: perfume.discount || 0,
          })
        );

        setPerfumes(mappedPerfumes);
      } catch (error) {
        console.error("Error fetching perfumes:", error);
        // Set empty array on error instead of static data
        setPerfumes([]);
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
            Discover our most beloved scents, carefully curated for every
            occasion and personality
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {perfumes.map((perfume: PerfumeData, index: number) => (
            <PerfumeCard
              key={perfume.id || index}
              id={perfume.id}
              name={perfume.name}
              description={perfume.description}
              price={perfume.price}
              image={perfume.imageUrl || perfume.image || ""} // Handle both imageUrl and image props
              category={perfume.category}
              brand={perfume.brand || "Zafra"} // Use brand if available, default to Zafra
              stock={perfume.stock}
              discount={perfume.discount || 0} // Use discount if available, default to 0
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/perfumes"
            className="inline-flex items-center bg-gradient-to-r from-iris to-periwinkle text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            View All Perfumes
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
