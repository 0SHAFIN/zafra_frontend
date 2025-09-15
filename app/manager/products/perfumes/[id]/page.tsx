"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Upload, X } from "lucide-react";

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
    notes?: string[];
    size?: string;
    concentration?: string;
}

export default function PerfumeDetailPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const router = useRouter();

    const baseURL = "http://localhost:3000/perfume";

    const [perfume, setPerfume] = useState<Perfume | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categories = ["Men's Perfumes", "Unisex Perfumes", "Women's Perfumes"];
  const concentrations = ["EDT", "EDP", "Parfum", "Extrait"];
    const sizes = ["30ml", "50ml", "75ml", "100ml", "125ml"];

    const fetchPerfume = async () => {
        if (!id) return;
        try {
            const res = await axios.get(`${baseURL}/${id}`);
            setPerfume(res.data);
            setImagePreview(res.data.image);
        } catch (err) {
            console.error("Failed to fetch perfume:", err);
            alert("Failed to fetch perfume details from backend");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPerfume();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!perfume) return;
        const { name, value } = e.target;
        setPerfume(prev => ({
            ...prev!,
            [name]: name === 'price' || name === 'discount' || name === 'stock' ? Number(value) : value
        }));
    };



    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!perfume) return;
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setPerfume(prev => ({ ...prev!, image: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!perfume) return;

        setIsUpdating(true);
        try {
            await axios.put(`${baseURL}/${id}`, perfume);
            alert("Perfume updated successfully!");
        } catch (err) {
            console.error("Failed to update perfume:", err);
            alert("Failed to update perfume");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this perfume? This action cannot be undone.")) return;

        try {
            await axios.delete(`${baseURL}/${id}`);
            alert("Perfume deleted successfully!");
            router.push("/manager/products");
        } catch (err) {
            console.error("Failed to delete perfume:", err);
            alert("Failed to delete perfume");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading perfume details...</p>
                </div>
            </div>
        );
    }

    if (!perfume) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-red-500 text-xl">Perfume not found.</p>
                    <button
                        onClick={() => router.push("/manager/products")}
                        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-purple-600 hover:text-purple-700 mr-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-1" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-purple-700">Edit Perfume</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Image</h2>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt={perfume.name}
                                        className="w-full h-80 object-cover rounded-lg mb-4"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview("");
                                            setPerfume(prev => ({ ...prev!, image: "" }));
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-12">
                                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-sm text-gray-600 mb-4">
                                        Upload a new image for this perfume
                                    </p>
                                    <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                                        Choose Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Current Details */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Details</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p><span className="font-medium">ID:</span> {perfume.id}</p>
                                <p><span className="font-medium">Brand:</span> {perfume.brand}</p>
                                <p><span className="font-medium">Category:</span> {perfume.category}</p>
                                <p><span className="font-medium">Price:</span> ${perfume.price}</p>
                                <p><span className="font-medium">Stock:</span> {perfume.stock} units</p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <form onSubmit={handleUpdate} className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Perfume Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={perfume.name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Brand *
                                        </label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={perfume.brand}
                                            onChange={handleInputChange}
                                            
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category *
                                        </label>
                                        <select
                                            name="category"
                                            value={perfume.category}
                                            onChange={handleInputChange}
                                            
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Concentration
                                        </label>
                                        <select
                                            name="concentration"
                                            value={perfume.concentration || "EDP"}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            {concentrations.map(conc => (
                                                <option key={conc} value={conc}>{conc}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Size
                                        </label>
                                        <select
                                            name="size"
                                            value={perfume.size || "50ml"}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            {sizes.map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Image URL *
                                        </label>
                                        <input
                                            type="url"
                                            name="image"
                                            value={perfume.image}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Stock */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pricing & Stock</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price ($) *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={perfume.price}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount (%)
                                        </label>
                                        <input
                                            type="number"
                                            name="discount"
                                            value={perfume.discount}
                                            onChange={handleInputChange}
                                            min="0"
                                            max="100"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Stock Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={perfume.stock}
                                            onChange={handleInputChange}
                                            
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={perfume.description}
                                    onChange={handleInputChange}
                                    
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                           

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                                >
                                    <Save className="h-5 w-5 mr-2" />
                                    {isUpdating ? "Updating..." : "Update Perfume"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
                                >
                                    <Trash2 className="h-5 w-5 mr-2" />
                                    Delete Perfume
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}