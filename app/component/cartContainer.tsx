"use client";
import { getAllCart, deleteCart } from "@/lib/apiCall";
import { Minus, Plus, Trash2, ShoppingBag, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";

interface CartContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartContainer({ isOpen, onClose }: CartContainerProps) {
  interface CartItem {
    perfumeName: string;
    perfumeBrand: string;
    perfumeImage: string;
    perfumePrice: number;
    perfumeQuantity: number;
  }

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  useEffect(() => {
    const getCartItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getAllCart();
        console.log("API Response:", response);
        if (response.cartProducts.length === 0) {
          setError("No cart found");
          setCartItems([]);
          return;
        }
        setCartId(response.cartId);
        console.log("cartId", response.cartId);
        setCartItems(response.cartProducts);
        
       
      } catch (error) {
        console.error("Error fetching cart:", error);
        setError("No cart found");
        setCartItems([]);
        setCartId(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (isOpen) {
      getCartItems();
    }
  }, [isOpen]);

  useEffect(() => {
    console.log("cartItems in cartContainer", cartItems);
  }, [cartItems]);

  const handleClearCart = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteCart(cartId || '');
      console.log("response", response);
      setCartItems([]);
      setShowDeleteConfirm(false);
      
      console.log("Cart cleared successfully");
    } catch (error) {
      console.error("Error clearing cart:", error);
      setError("Failed to clear cart");
    } finally {
      setIsDeleting(false);
    }
  };

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
              <div className="flex items-center gap-2">                              
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors p-2"
                >
                  <X className="w-6 h-6 cursor-pointer text-iris" />
                </button>
              </div>
            </div>
      
          </div>
            
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <RefreshCw className="w-16 h-16 text-gray-400 mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Loading cart...</h3>
                <p className="text-gray-500">Please wait while we fetch your items</p>
              </div>
            )  : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                <p className="text-gray-500">Add some perfumes to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item: CartItem, index: number) => (
                  <div key={`${item.perfumeName}-${index}`} className="bg-lavender rounded-lg p-3 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.perfumeImage} 
                        alt={item.perfumeName} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-800 truncate">{item.perfumeName}</h3>
                      <p className="text-xs text-gray-600 truncate">{item.perfumeBrand}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs font-semibold text-iris">${item.perfumePrice}</p>
                        <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-700 font-medium">
                          Qty: {item.perfumeQuantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-iris">
                  ${cartItems.reduce((total, item) => total + (item.perfumePrice * item.perfumeQuantity), 0).toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-3">
                <Link 
                  href="/checkout" 
                  className="w-full bg-iris text-white py-3 px-6 rounded-lg font-semibold text-center block hover:bg-opacity-90 transition-colors"
                  onClick={onClose}
                >
                  Proceed to Checkout
                </Link>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-500 text-white py-2 px-6 rounded-lg font-semibold text-center hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
              </div>
            </div>
          )}
      
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Clear Cart</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                disabled={isDeleting}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Clear Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
