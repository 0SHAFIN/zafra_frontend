"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface Perfume {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  brand: string;
  category: string;
  stock: number;
  image: string;
}

export default function PerfumesPage() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newPerfume, setNewPerfume] = useState<Omit<Perfume, "id">>({
    name: "",
    brand: "",
    category: "",
    price: 0,
    discount: 0,
    stock: 0,
    image: "",
    description: "",
  });

  const baseURL = "http://localhost:3000/perfume";

  const fetchPerfumes = async () => {
    try {
      const res = await axios.get(baseURL);
      setPerfumes(res.data);
    } catch (err) {
      console.error("Failed to fetch perfumes:", err);
      alert("Failed to fetch perfumes from backend");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfumes();
  }, []);

  const handleCreatePerfume = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(baseURL, newPerfume);
      setPerfumes([...perfumes, res.data]);
      setNewPerfume({
        name: "",
        brand: "",
        category: "",
        price: 0,
        discount: 0,
        stock: 0,
        image: "",
        description: "",
      });
      setShowCreateForm(false);
      alert("Perfume added successfully!");
    } catch (err) {
      console.error("Failed to create perfume:", err);
      alert("Failed to create perfume");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Our Perfumes</h1>

      {/* Button to show create form */}
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="mb-6 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
      >
        {showCreateForm ? "Cancel" : "Add New Perfume"}
      </button>

      {/* Create Perfume Form */}
      {showCreateForm && (
        <div className="mb-8 bg-green-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Add New Perfume</h2>
          <form onSubmit={handleCreatePerfume} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                placeholder="Enter perfume name"
                value={newPerfume.name}
                onChange={(e) => setNewPerfume({ ...newPerfume, name: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input
                type="text"
                placeholder="Brand"
                value={newPerfume.brand}
                onChange={(e) => setNewPerfume({ ...newPerfume, brand: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                placeholder="Category"
                value={newPerfume.category}
                onChange={(e) => setNewPerfume({ ...newPerfume, category: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                placeholder="Price"
                value={newPerfume.price}
                onChange={(e) => setNewPerfume({ ...newPerfume, price: Number(e.target.value) })}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount %</label>
              <input
                type="number"
                placeholder="Discount"
                value={newPerfume.discount}
                onChange={(e) =>
                  setNewPerfume({ ...newPerfume, discount: Number(e.target.value) })
                }
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                placeholder="Stock quantity"
                value={newPerfume.stock}
                onChange={(e) => setNewPerfume({ ...newPerfume, stock: Number(e.target.value) })}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="text"
                placeholder="Image URL"
                value={newPerfume.image}
                onChange={(e) => setNewPerfume({ ...newPerfume, image: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                placeholder="Description"
                value={newPerfume.description}
                onChange={(e) =>
                  setNewPerfume({ ...newPerfume, description: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full transition"
              >
                Create Perfume
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Perfume Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {perfumes.map((perfume) => (
            <Link
              key={perfume.id}
              href={`/manager/products/perfumes/${perfume.id}`}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition block"
            >
              <img
                src={perfume.image}
                alt={perfume.name}
                className="h-60 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{perfume.name}</h3>
                <p className="text-sm text-gray-500">{perfume.brand}</p>
                <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                  {perfume.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-semibold text-purple-700">${perfume.price}</span>
                  {perfume.discount > 0 && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs">
                      -{perfume.discount}%
                    </span>
                  )}
                </div>
                <p className="mt-2 text-gray-500 text-sm">Stock: {perfume.stock}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
