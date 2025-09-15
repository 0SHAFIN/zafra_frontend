"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import PerfumeCard from "../component/perfume-card";
import { Search, Filter } from "lucide-react";

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

export default function AllPerfumesPage() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [filteredPerfumes, setFilteredPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { value: "all", label: "All Perfumes" },
    { value: "Men", label: "Men's Perfumes" },
    { value: "Women", label: "Women's Perfumes" },
    { value: "Unisex", label: "Unisex Perfumes" },
  ];

  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/perfumes"); // Fixed endpoint
        const data = response.data;
        console.log("Perfumes data:", data); // Add logging to debug

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
        setFilteredPerfumes(mappedPerfumes);
      } catch (error) {
        console.error("Error fetching perfumes:", error);
        // Fallback data
        const fallbackData: Perfume[] = [
          {
            id: "1",
            name: "Midnight Jasmine",
            description:
              "A seductive blend of jasmine, vanilla, and sandalwood",
            price: 89,
            image: "🌸",
            category: "Women",
            brand: "Zafra",
            stock: 25,
          },
          {
            id: "2",
            name: "Ocean Breeze",
            description: "Fresh aquatic notes with citrus and marine accords",
            price: 75,
            image: "🌊",
            category: "Men",
            brand: "Zafra",
            stock: 30,
          },
          {
            id: "3",
            name: "Royal Oud",
            description: "Luxurious oud wood with rose and amber",
            price: 125,
            image: "🌹",
            category: "Unisex",
            brand: "Zafra",
            stock: 15,
            discount: 15,
          },
          {
            id: "4",
            name: "Citrus Burst",
            description: "Vibrant lemon, bergamot, and grapefruit",
            price: 65,
            image: "🍋",
            category: "Men",
            brand: "Zafra",
            stock: 0,
          },
          {
            id: "5",
            name: "Eau de Parfum",
            description: "A classic fragrance with floral and woody notes",
            price: 100,
            image: "🌹",
            category: "Women",
            brand: "Zafra",
            stock: 20,
          },
          {
            id: "6",
            name: "Eau de Toilette",
            description: "A refreshing fragrance with citrus and mint",
            price: 85,
            image: "🍋",
            category: "Unisex",
            brand: "Zafra",
            stock: 18,
          },
        ];
        setPerfumes(fallbackData);
        setFilteredPerfumes(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfumes();
  }, []);

  useEffect(() => {
    let filtered = perfumes;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (perfume) => perfume.category === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (perfume) =>
          perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          perfume.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          perfume.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPerfumes(filtered);
  }, [perfumes, selectedCategory, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris mx-auto mb-4"></div>
              <p className="text-gray-600">Loading perfumes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            All <span className="text-iris">Perfumes</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Discover our complete collection of luxury fragrances for every
            occasion and personality
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search perfumes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <Filter className="text-gray-600 w-5 h-5" />
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                      selectedCategory === category.value
                        ? "bg-iris text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredPerfumes.length} of {perfumes.length} perfumes
            {selectedCategory !== "all" && ` in ${selectedCategory} category`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Perfumes Grid/List */}
        {filteredPerfumes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              No perfumes found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="bg-iris text-white px-6 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {filteredPerfumes.map((perfume) => (
              <PerfumeCard key={perfume.id} {...perfume} className="" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
