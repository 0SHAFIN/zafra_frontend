"use client";
import { useState, useEffect } from "react";
import { getAllCart, createOrder } from "@/lib/apiCall";
import {
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuthCheck } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface CartItem {
  perfumeName: string;
  perfumeBrand: string;
  perfumeImage: string;
  perfumePrice: number;
  perfumeQuantity: number;
}

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthCheck();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, isLoading, router]);
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      console.log("userData", parsedData);
      setCustomerData(parsedData);

      // Populate form with customer data from localStorage
      setFormData((prev) => ({
        ...prev,
        name: parsedData.fullName || parsedData.firstName || "",
        email: parsedData.email || "",
        phone: parsedData.phone || "",
        address: parsedData.address || "",
      }));
    }
  }, []);
  useEffect(() => {
    console.log("formData", formData);
  }, [formData]);
  useEffect(() => {
    const getCartItems = async () => {
      setIsLoadingCart(true);

      try {
        const response = await getAllCart();
        console.log("API Response:", response);
        if (response.cartProducts.length === 0) {
          setCartItems([]);
          return;
        }

        setCartItems(response.cartProducts);
        console.log("cartId", response.cartId);
        setCartId(response.cartId);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCartItems([]);
      } finally {
        setIsLoadingCart(false);
      }
    };

    getCartItems();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.perfumePrice * item.perfumeQuantity,
      0
    );
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 100 ? 0 : 10; // Free shipping over $100
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      const response = await createOrder(cartId || "", orderData);
      console.log("Order created:", response);
      setOrderComplete(true);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before checking out.
          </p>
          <Link
            href="/perfumes"
            className="bg-iris text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Order Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. You will receive a confirmation email
            shortly.
          </p>
          <div className="space-y-3">
            <Link
              href="/perfumes"
              className="w-full bg-iris text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors block"
            >
              Continue Shopping
            </Link>
            <Link
              href="/profile"
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors block"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-iris hover:text-opacity-80 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-iris" />
                  Customer Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-transparent resize-none"
                      placeholder="Enter your complete address"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-iris text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Processing Order..."
                  : `Place Order - $${calculateTotal().toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.perfumeImage}
                      alt={item.perfumeName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.perfumeName}
                    </h3>
                    <p className="text-xs text-gray-500">{item.perfumeBrand}</p>
                    <p className="text-xs text-gray-600">
                      Qty: {item.perfumeQuantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ${(item.perfumePrice * item.perfumeQuantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  ${calculateSubtotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {calculateShipping() === 0
                    ? "Free"
                    : `$${calculateShipping().toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-iris">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800 font-medium">
                  Secure Checkout
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Your payment information is encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
