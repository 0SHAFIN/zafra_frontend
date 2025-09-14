"use client";
import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { addToCart as addToCartAPI, getAllCart, deleteCart } from '../../lib/apiCall';

interface CartItem {
  id: string;
  cartId?: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  discount?: number;
  perfumeId: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

type CartAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART_DATA'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCartData: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CART_DATA': {
      const items = action.payload;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...state,
        items,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null
      };
    }
    
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + action.payload.price
        };
      }
      
      const newItems = [...state.items, { ...action.payload, quantity: 1 }];
      return {
        ...state,
        items: newItems,
        totalItems: state.totalItems + 1,
        totalPrice: state.totalPrice + action.payload.price
      };
    }
    
    case 'REMOVE_FROM_CART': {
      const itemToRemove = state.items.find(item => item.id === action.payload);
      if (!itemToRemove) return state;
      
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems - itemToRemove.quantity,
        totalPrice: state.totalPrice - (itemToRemove.price * itemToRemove.quantity)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.id === action.payload.id);
      if (!item) return state;
      
      const quantityDiff = action.payload.quantity - item.quantity;
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + quantityDiff,
        totalPrice: state.totalPrice + (quantityDiff * item.price)
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
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
    error: null
  });

  const fetchCartData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await getAllCart();
      
      if (response.cartProducts && response.cartProducts.length > 0) {
        const transformedItems: CartItem[] = response.cartProducts.map((item: any) => ({
          id: item.perfumeId,
          cartId: item.cartId,
          name: item.perfumeName,
          brand: item.perfumeBrand,
          price: item.perfumePrice,
          image: item.perfumeImage,
          quantity: item.perfumeQuantity,
          perfumeId: item.perfumeId
        }));
        
        dispatch({ type: 'SET_CART_DATA', payload: transformedItems });
      } else {
        dispatch({ type: 'SET_CART_DATA', payload: [] });
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart data' });
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await addToCartAPI(1, item.price, item.perfumeId);
      dispatch({ type: 'ADD_TO_CART', payload: item });
      await fetchCartData();
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const item = state.items.find(item => item.id === id);
      if (item && item.cartId) {
        await deleteCart(item.cartId);
      }
      dispatch({ type: 'REMOVE_FROM_CART', payload: id });
      await fetchCartData();
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(id);
        return;
      }
      dispatch({ type: 'SET_LOADING', payload: true });
      const item = state.items.find(item => item.id === id);
      if (item) {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
        await fetchCartData();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update quantity' });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      for (const item of state.items) {
        if (item.cartId) {
          await deleteCart(item.cartId);
        }
      }
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchCartData();
    }
  }, []);

  return (
    <CartContext.Provider value={{
      state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      fetchCartData
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}