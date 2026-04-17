"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { getProductById, addToCart as firestoreUpdateCart } from '@/lib/firestore';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
  const { cart, loading, addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const productData: Record<string, Product> = {};
      for (const item of cart) {
        if (!products[item.productId]) {
          const prod = await getProductById(item.productId);
          if (prod) {
            productData[item.productId] = prod;
          }
        }
      }
      setProducts(prev => ({ ...prev, ...productData }));
      setFetching(false);
    };

    if (cart.length > 0) {
      loadProducts();
    } else {
      setFetching(false);
    }
  }, [cart]);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!user) return;
    // We compute the difference so addToCart (which adds relative amount) works
    // Alternatively, we could just overwrite in context, but for simplicity we rely on addToCart with relative diff
    const currentItem = cart.find(i => i.productId === productId);
    if (currentItem) {
      const diff = newQuantity - currentItem.quantity;
      if (diff !== 0) {
        await addToCart(productId, diff);
      }
    }
  };

  const removeItem = async (productId: string) => {
    if (!user) return;
    const currentItem = cart.find(i => i.productId === productId);
    if (currentItem) {
      await addToCart(productId, -currentItem.quantity);
    }
  };

  const total = cart.reduce((acc, item) => {
    const price = products[item.productId]?.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  if (loading || fetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/4 mb-8"></div>
        <div className="space-y-4">
          <div className="h-32 bg-slate-200 rounded w-full"></div>
          <div className="h-32 bg-slate-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Your Cart is Empty</h1>
        <p className="text-slate-500 mb-8 text-lg">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/products" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full" aria-live="polite">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          {cart.map(item => {
            const product = products[item.productId];
            if (!product) return null;
            
            return (
              <div key={item.productId} className="flex flex-col sm:flex-row bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-6">
                <div className="w-full sm:w-32 h-32 relative rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{product.category}</p>
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-2 border border-slate-200 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={item.quantity <= 1}
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium text-slate-900" aria-label={`Current quantity of ${product.name}`}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-slate-600 mb-6 border-b border-slate-100 pb-6">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-medium text-slate-900">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-slate-900">Total</span>
              <span className="text-2xl font-extrabold text-blue-600">₹{total.toLocaleString('en-IN')}</span>
            </div>
            
            <Link 
              href="/checkout"
              className="w-full block text-center bg-pink-500 text-white font-bold py-4 rounded-xl hover:bg-pink-600 transition-colors shadow-lg hover:shadow-pink-500/30 focus:outline-none focus:ring-4 focus:ring-pink-500 focus:ring-offset-2"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
