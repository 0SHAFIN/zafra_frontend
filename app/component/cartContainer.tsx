"use client";
import { useCart } from "../context/cart-context";
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import Link from "next/link";

interface CartContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartContainer({ isOpen, onClose }: CartContainerProps) {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Cart Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-iris to-periwinkle">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2"
              >
                <X className="w-6 h-6 cursor-pointer text-iris" />
              </button>
            </div>
            <p className="text-white/80 mt-1">{state.totalItems} item(s)</p>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some perfumes to get started!</p>
                <button
                  onClick={onClose}
                  className="bg-iris text-white px-6 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        🌸
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-600 truncate">{item.brand}</h3>
                      <h4 className="text-sm font-bold text-gray-800 truncate">{item.name}</h4>
                      <p className="text-sm font-bold text-iris">${item.price.toFixed(2)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-xl font-bold text-iris">${state.totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={clearCart}
                  className="w-full text-red-500 hover:text-red-700 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
                
                <button className="w-full bg-iris text-white py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300">
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
