"use client";
import { useCart } from "../context/cart-context";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-8" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any perfumes to your cart yet.</p>
            <Link 
              href="/"
              className="bg-iris text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all duration-300 hover:scale-105"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Clear Cart
              </button>
            </div>
            <p className="text-gray-600 mt-2">{state.totalItems} item(s) in your cart</p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-lavender to-periwinkle rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      🌸
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.brand}</h3>
                    <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
                    <p className="text-lg font-bold text-iris">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    Total: ${state.totalPrice.toFixed(2)}
                  </p>
                  <p className="text-gray-600">{state.totalItems} item(s)</p>
                </div>
                <div className="flex gap-4">
                  <Link 
                    href="/"
                    className="bg-gray-200 text-gray-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                  >
                    Continue Shopping
                  </Link>
                  <button className="bg-iris text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all duration-300 hover:scale-105">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
