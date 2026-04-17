"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '@/types';
import { useAuth } from './AuthContext';
import { getCart, addToCart as firestoreAddToCart } from '@/lib/firestore';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  cartCount: 0,
  addToCart: async () => {},
  loading: true,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getCart(user.uid).then(items => {
        setCart(items);
        setLoading(false);
      });
    } else {
      setCart([]);
      setLoading(false);
    }
  }, [user]);

  const addToCart = async (productId: string, quantity: number) => {
    if (!user) {
      alert("Please log in to add items to your cart.");
      return;
    }
    
    // Optimistic UI update
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { productId, quantity }];
    });

    try {
      await firestoreAddToCart(user.uid, productId, quantity);
    } catch (error) {
      console.error("Failed to add to cart", error);
      // Revert optimistic update here if necessary
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
