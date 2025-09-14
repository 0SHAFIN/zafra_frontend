"use client";
import Link from "next/link";
import {ShoppingCart, User} from "lucide-react";

import { useEffect, useState } from "react";
import CartContainer from "./cartContainer";
import { getAllCart } from "@/lib/apiCall";
export default function Navbar() {

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [cartItems, setCartItems] = useState<any>(null);
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("user");
        
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setIsLoggedIn(true);
                setUser(parsedUser);
            } catch (error) {
                console.error("Error parsing user data:", error);
                setIsLoggedIn(false);
                setUser(null);
            }
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
        const getCartItems = async () => {
        const cartItems = await getAllCart();
            setCartItems(cartItems.cartProducts.length);
            console.log("cartItems", cartItems);
        }
        getCartItems();
    }, []);



    
    return (
        <>
            <nav className="w-full h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-iris transition-colors">
                        Zafra
                    </Link>
                    
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/perfumes" className="text-gray-600 hover:text-iris transition-colors font-medium">
                            All Perfumes
                        </Link>
                        <Link href="/about" className="text-gray-600 hover:text-iris transition-colors font-medium">
                            About
                        </Link>
                        <Link href="/contact" className="text-gray-600 hover:text-iris transition-colors font-medium">
                            Contact
                        </Link>
                        <Link href="/quiz" className="text-gray-600 hover:text-iris transition-colors font-medium">
                            Find My Scent
                        </Link>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="relative">
                        {cartItems > 0 && (
                            <div className="bg-iris text-white text-[10px] rounded-full absolute top-0 -right-2 w-4 h-4 flex items-center justify-center font-bold">
                                {cartItems}
                            </div>
                        )}
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="text-gray-600 hover:text-iris transition-colors p-2"
                            title="Shopping Cart"
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                        {isLoggedIn ? (
                            <Link 
                                href="/profile" 
                                className="text-gray-600 hover:text-iris transition-colors p-2"
                                title="Profile"
                            >
                                <User className="w-5 h-5" />
                            </Link>
                        ) : (
                            <Link 
                                href="/login" 
                                className="bg-iris text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 hover:scale-105"
                            >
                                Login
                            </Link>
                        )}
                        
                        {/* Mobile menu button */}
                        <button className="md:hidden text-gray-600 hover:text-iris transition-colors p-2">
                            <span className="text-xl">☰</span>
                        </button>
                    </div>
                </div>
            </nav>
            
            <CartContainer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}