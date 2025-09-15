"use client";
import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import {
  addToCart as addToCartApi,
  getAllCart,
  deleteCart,
} from "@/lib/apiCall";

interface CartProductApi {
  perfumeId?: string;
  id?: string;
  perfumeName?: string;
  name?: string;
  perfumeBrand?: string;
  brand?: string;
  perfumePrice?: number;
  price?: number;
  perfumeImage?: string;
  image?: string;
  perfumeQuantity?: number;
  quantity?: number;
  discount?: number;
}

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  discount?: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CART_ITEMS"; payload: CartItem[] }
  | { type: "ADD_TO_CART_SUCCESS"; payload: CartItem[] }
  | { type: "REMOVE_FROM_CART_SUCCESS"; payload: CartItem[] }
  | { type: "UPDATE_QUANTITY_SUCCESS"; payload: CartItem[] }
  | { type: "CLEAR_CART_SUCCESS" };

interface CartContextType {
  state: CartState;
  addToCart: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to calculate totals from cart items
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.discount
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return sum + price * item.quantity;
  }, 0);
  return { totalItems, totalPrice };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "SET_CART_ITEMS": {
      const { totalItems, totalPrice } = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null,
      };
    }

    case "ADD_TO_CART_SUCCESS": {
      const { totalItems, totalPrice } = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null,
      };
    }

    case "REMOVE_FROM_CART_SUCCESS": {
      const { totalItems, totalPrice } = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null,
      };
    }

    case "UPDATE_QUANTITY_SUCCESS": {
      const { totalItems, totalPrice } = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null,
      };
    }

    case "CLEAR_CART_SUCCESS":
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: false,
    error: null,
  });

  // Load cart items on component mount
  useEffect(() => {
    refreshCart();
  }, []);

  const refreshCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await getAllCart();

      // Transform API response to CartItem format
      const cartItems: CartItem[] =
        response.cartProducts?.map((item: CartProductApi) => ({
          id: item.perfumeId || item.id || "",
          name: item.perfumeName || item.name || "",
          brand: item.perfumeBrand || item.brand || "",
          price: item.perfumePrice || item.price || 0,
          image: item.perfumeImage || item.image || "",
          quantity: item.perfumeQuantity || item.quantity || 0,
          discount: item.discount,
        })) || [];

      dispatch({ type: "SET_CART_ITEMS", payload: cartItems });
    } catch (error) {
      console.error("Error refreshing cart:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to load cart items",
      });
    }
  };

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Call the addToCart API function with correct signature
      const quantity = 1;
      await addToCartApi(item.id, quantity, item.price);

      // Refresh the cart to get updated items
      await refreshCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to add item to cart",
      });
    }
  };
  const removeFromCart = async (id: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Remove item locally for now
      // TODO: Implement removeFromCart API function
      const updatedItems = state.items.filter((item) => item.id !== id);
      dispatch({ type: "REMOVE_FROM_CART_SUCCESS", payload: updatedItems });
    } catch (error) {
      console.error("Error removing from cart:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to remove item from cart",
      });
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      if (quantity <= 0) {
        await removeFromCart(id);
        return;
      }

      // Update quantity locally for now
      // TODO: Implement updateCartItem API function
      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      dispatch({ type: "UPDATE_QUANTITY_SUCCESS", payload: updatedItems });
    } catch (error) {
      console.error("Error updating quantity:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to update item quantity",
      });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Clear cart using API
      const response = await getAllCart();
      if (response.cartId) {
        await deleteCart(response.cartId);
      }

      dispatch({ type: "CLEAR_CART_SUCCESS" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to clear cart",
      });
    }
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
