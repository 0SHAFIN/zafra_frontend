"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Product, productAPI, managerAPI } from "@/lib/api";
import { perfumeCreateSchema, PerfumeFormData } from "@/lib/validation";
import { useToast } from "@/app/component/ui/ToastProvider";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Tag,
  X,
  Upload,
} from "lucide-react";

// Utility function to safely format price
const formatPrice = (price: number | string | undefined | null): string => {
  if (price === null || price === undefined) return "0.00";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return !isNaN(numPrice) ? numPrice.toFixed(2) : "0.00";
};

interface ProductManagementProps {
  userRole: "admin" | "manager";
}

// Using zod-derived type PerfumeFormData

export default function ProductManagement({
  userRole,
}: ProductManagementProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<PerfumeFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    brand: "",
    image: "",
    discount: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Category options for dropdown
  const categoryOptions = ["Men", "Women", "Unisex"];

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data =
        userRole === "manager"
          ? await managerAPI.getProducts()
          : await productAPI.getAllAdmin();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching perfumes:", error);
      showError(
        "Failed to Load",
        "Unable to load perfumes. Please refresh the page."
      );
    } finally {
      setLoading(false);
    }
  }, [userRole, showError]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "",
      stock: 0,
      brand: "",
      image: "",
      discount: 0,
    });
    setFormErrors({});
    setEditingProduct(null);
    setShowForm(false);
    setImageLoadError(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== "admin" && !editingProduct) {
      showWarning("Access Denied", "Managers can only edit existing perfumes");
      return;
    }
    try {
      setFormLoading(true);
      // Validate with zod schema
      const parseResult = perfumeCreateSchema.safeParse(formData);
      if (!parseResult.success) {
        const newErrors: Record<string, string> = {};
        parseResult.error.issues.forEach((iss) => {
          if (iss.path[0]) newErrors[String(iss.path[0])] = iss.message;
        });
        setFormErrors(newErrors);
        const summary = Object.entries(newErrors)
          .slice(0, 4)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(" | ");
        showError(
          "Validation Failed",
          summary || "Please correct the highlighted fields"
        );
        return;
      }
      const dataToSend = parseResult.data;

      if (editingProduct) {
        if (userRole === "manager") {
          await managerAPI.updateProduct(editingProduct.id, dataToSend);
        } else {
          await productAPI.update(editingProduct.id, dataToSend);
        }
      } else {
        await productAPI.create(dataToSend);
      }
      await fetchProducts();
      resetForm();
      showSuccess(
        editingProduct ? "Perfume Updated" : "Perfume Created",
        editingProduct
          ? "Perfume has been updated successfully"
          : "New perfume has been added to your inventory"
      );
    } catch (error: unknown) {
      console.error("Error saving perfume:", error);
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage =
          axiosError.response?.data?.message || "API error occurred";
      }
      showError("Save Failed", errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    if (userRole !== "admin") {
      showWarning("Access Denied", "Only admins can delete perfumes");
      return;
    }

    if (!confirm("Are you sure you want to delete this perfume?")) return;

    try {
      await productAPI.delete(productId);
      await fetchProducts();
      showSuccess(
        "Perfume Deleted",
        "Perfume has been removed from your inventory"
      );
    } catch (error) {
      console.error("Error deleting perfume:", error);
      showError("Delete Failed", "Unable to delete perfume. Please try again.");
    }
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const formDataToSet = {
      name: product.name,
      description: product.description,
      price:
        typeof product.price === "string"
          ? parseFloat(product.price)
          : product.price,
      category: product.category,
      stock:
        typeof product.stock === "string"
          ? parseInt(product.stock)
          : product.stock,
      brand: product.brand,
      image: product.image || "",
      discount:
        typeof product.discount === "string"
          ? parseFloat(product.discount)
          : product.discount,
    };
    setFormData(formDataToSet);
    setImageLoadError(false);
    setShowForm(true);
  };

  // Filter products
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Perfume Management
          </h2>
          <p className="text-gray-500">
            {userRole === "admin"
              ? "Create, edit, and manage all perfumes"
              : "View and update existing perfumes"}
          </p>
        </div>
        {userRole === "admin" && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-iris text-white rounded-lg hover:bg-opacity-90 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span>Add Perfume</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search perfumes by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris"
        />
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-0 w-full max-w-3xl max-h-[95vh] overflow-hidden animate-slideUp transform">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 to-purple-600 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-10 transform rotate-12 scale-150"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">
                    {editingProduct ? "Edit Perfume" : "Add New Perfume"}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    {editingProduct
                      ? "Update perfume details and inventory"
                      : "Create a new perfume entry for your store"}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
              {editingProduct && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Edit className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Currently editing
                      </p>
                      <p className="text-blue-700">
                        <strong>{editingProduct.name}</strong> by{" "}
                        {editingProduct.brand}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Package className="w-4 h-4 text-iris" />
                      <span>Perfume Name</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (formErrors.name)
                            setFormErrors({ ...formErrors, name: "" });
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 bg-gray-50 focus:bg-white ${
                          formErrors.name
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-iris focus:ring-iris/10"
                        }`}
                        placeholder="Enter perfume name"
                        aria-invalid={!!formErrors.name}
                        aria-describedby={
                          formErrors.name ? "error-name" : undefined
                        }
                      />
                      {formErrors.name && (
                        <p
                          id="error-name"
                          className="mt-1 text-xs text-red-600 font-medium"
                        >
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Tag className="w-4 h-4 text-iris" />
                      <span>Category</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            category: e.target.value,
                          });
                          if (formErrors.category)
                            setFormErrors({ ...formErrors, category: "" });
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 bg-gray-50 focus:bg-white appearance-none ${
                          formErrors.category
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-iris focus:ring-iris/10"
                        }`}
                        aria-invalid={!!formErrors.category}
                        aria-describedby={
                          formErrors.category ? "error-category" : undefined
                        }
                      >
                        <option value="">Select a category</option>
                        {categoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {formErrors.category && (
                        <p
                          id="error-category"
                          className="mt-1 text-xs text-red-600 font-medium"
                        >
                          {formErrors.category}
                        </p>
                      )}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <svg
                      className="w-4 h-4 text-iris"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                    <span>Description</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        });
                        if (formErrors.description)
                          setFormErrors({ ...formErrors, description: "" });
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 bg-gray-50 focus:bg-white resize-none ${
                        formErrors.description
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-iris focus:ring-iris/10"
                      }`}
                      placeholder="Describe the perfume fragrance, notes, and characteristics..."
                      aria-invalid={!!formErrors.description}
                      aria-describedby={
                        formErrors.description ? "error-description" : undefined
                      }
                    />
                    {formErrors.description && (
                      <p
                        id="error-description"
                        className="mt-1 text-xs text-red-600 font-medium"
                      >
                        {formErrors.description}
                      </p>
                    )}
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {formData.description.length}/500
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>Price ($)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price || 0}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            price:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          });
                          if (formErrors.price)
                            setFormErrors({ ...formErrors, price: "" });
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 bg-gray-50 focus:bg-white ${
                          formErrors.price
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-iris focus:ring-iris/10"
                        }`}
                        placeholder="0.00"
                        aria-invalid={!!formErrors.price}
                        aria-describedby={
                          formErrors.price ? "error-price" : undefined
                        }
                      />
                      {formErrors.price && (
                        <p
                          id="error-price"
                          className="mt-1 text-xs text-red-600 font-medium"
                        >
                          {formErrors.price}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span>Stock</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.stock || 0}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            stock:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          });
                          if (formErrors.stock)
                            setFormErrors({ ...formErrors, stock: "" });
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 bg-gray-50 focus:bg-white ${
                          formErrors.stock
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-iris focus:ring-iris/10"
                        }`}
                        placeholder="0"
                        aria-invalid={!!formErrors.stock}
                        aria-describedby={
                          formErrors.stock ? "error-stock" : undefined
                        }
                      />
                      {formErrors.stock && (
                        <p
                          id="error-stock"
                          className="mt-1 text-xs text-red-600 font-medium"
                        >
                          {formErrors.stock}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg
                        className="w-4 h-4 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      <span>Discount (%)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.discount || 0}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            discount:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          });
                          if (formErrors.discount)
                            setFormErrors({ ...formErrors, discount: "" });
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 bg-gray-50 focus:bg-white ${
                          formErrors.discount
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-iris focus:ring-iris/10"
                        }`}
                        placeholder="0"
                        aria-invalid={!!formErrors.discount}
                        aria-describedby={
                          formErrors.discount ? "error-discount" : undefined
                        }
                      />
                      {formErrors.discount && (
                        <p
                          id="error-discount"
                          className="mt-1 text-xs text-red-600 font-medium"
                        >
                          {formErrors.discount}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => {
                      setFormData({ ...formData, brand: e.target.value });
                      if (formErrors.brand)
                        setFormErrors({ ...formErrors, brand: "" });
                    }}
                    placeholder="e.g. Chanel, Dior, Tom Ford"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.brand
                        ? "border-red-500 focus:ring-red-300"
                        : "border-gray-300 focus:ring-iris"
                    }`}
                    aria-invalid={!!formErrors.brand}
                    aria-describedby={
                      formErrors.brand ? "error-brand" : undefined
                    }
                  />
                  {formErrors.brand && (
                    <p
                      id="error-brand"
                      className="mt-1 text-xs text-red-600 font-medium"
                    >
                      {formErrors.brand}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <svg
                      className="w-4 h-4 text-iris"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Product Image</span>
                  </label>
                  <div className="space-y-4">
                    <div className="relative group">
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value });
                          setImageLoadError(false);
                          if (formErrors.image)
                            setFormErrors({ ...formErrors, image: "" });
                        }}
                        placeholder="https://example.com/image.jpg"
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 bg-gray-50 focus:bg-white ${
                          formErrors.image
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-iris focus:ring-iris/10"
                        }`}
                        aria-invalid={!!formErrors.image}
                        aria-describedby={
                          formErrors.image ? "error-image" : undefined
                        }
                      />
                      {formErrors.image && (
                        <p
                          id="error-image"
                          className="mt-1 text-xs text-red-600 font-medium"
                        >
                          {formErrors.image}
                        </p>
                      )}
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-iris hover:bg-iris/5 rounded-lg transition-all duration-300 group-hover:bg-iris/5"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    </div>

                    {formData.image && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span>Image Preview</span>
                        </p>
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 border-2 border-white rounded-xl overflow-hidden bg-white shadow-sm relative group">
                            {!imageLoadError ? (
                              <Image
                                src={formData.image}
                                alt="Product preview"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={() => setImageLoadError(true)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              {imageLoadError ? (
                                <span className="text-red-600 font-medium">
                                  ⚠️ Invalid image URL
                                </span>
                              ) : (
                                <span className="text-green-600 font-medium">
                                  ✓ Image loaded successfully
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Recommended: 400x400px, JPG/PNG format
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={formLoading}
                    className="px-8 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="relative px-8 py-3 bg-gradient-to-r from-purple-900 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-800 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
                  >
                    {formLoading ? (
                      <div className="flex items-center space-x-3">
                        <svg
                          className="animate-spin w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {editingProduct ? (
                          <>
                            <Edit className="w-5 h-5" />
                            <span>Update Perfume</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            <span>Create Perfume</span>
                          </>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-iris bg-opacity-10 rounded-full">
                  <Package className="w-5 h-5 text-iris" />
                </div>
                <h3 className="font-semibold text-lg text-gray-800">
                  {product.name}
                </h3>
              </div>
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Tag className="w-3 h-3" />
                <span>{product.brand}</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
              {product.description}
            </p>

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium text-gray-800">
                  {product.category}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Price:</span>
                <span className="font-medium text-gray-800 flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {formatPrice(product.price)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Stock:</span>
                <span
                  className={`font-medium ${
                    (typeof product.stock === "string"
                      ? parseInt(product.stock)
                      : product.stock) < 10
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {typeof product.stock === "string"
                    ? parseInt(product.stock)
                    : product.stock}{" "}
                  units
                </span>
              </div>
              {(typeof product.discount === "string"
                ? parseFloat(product.discount)
                : product.discount) > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Discount:</span>
                  <span className="font-medium text-orange-600">
                    {typeof product.discount === "string"
                      ? parseFloat(product.discount)
                      : product.discount}
                    %
                  </span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleEdit(product)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              {userRole === "admin" && (
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No perfumes found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms"
              : userRole === "admin"
              ? "Get started by adding your first perfume"
              : "No perfumes available to manage"}
          </p>
        </div>
      )}
    </div>
  );
}
