"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { placeOrder, getProductById } from '@/lib/firestore';
import { Product } from '@/types';

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading } = useCart();
  const router = useRouter();
  
  const [address, setAddress] = useState({
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [total, setTotal] = useState(0);
  const [fullItems, setFullItems] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?returnUrl=/checkout');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setAddress(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  useEffect(() => {
    const loadProducts = async () => {
      let calcTotal = 0;
      const itemsWithProduct = [];
      for (const item of cart) {
        const prod = await getProductById(item.productId);
        if (prod) {
          calcTotal += prod.price * item.quantity;
          itemsWithProduct.push({ ...item, product: prod });
        }
      }
      setTotal(calcTotal);
      setFullItems(itemsWithProduct);
    };

    if (cart.length > 0) {
      loadProducts();
    }
  }, [cart]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setError('');
    setSubmitting(true);

    try {
      // 1. Validate via API
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, items: fullItems, address, total })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Validation failed');
      }

      // 2. Place order via Firestore
      await placeOrder(user.uid, fullItems, address, total);

      // Redirect to orders
      router.push('/orders');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || cartLoading) {
    return <div className="p-10 text-center animate-pulse">Loading...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <button onClick={() => router.push('/products')} className="text-blue-600 hover:underline">
          Go back to shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 w-full">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Checkout</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Shipping Information</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input type="email" name="email" value={address.email} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input type="tel" name="phone" value={address.phone} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+919876543210" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
            <input type="text" name="street" value={address.street} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
              <input type="text" name="city" value={address.city} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
              <input type="text" name="state" value={address.state} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ZIP / Postal Code</label>
              <input type="text" name="zipCode" value={address.zipCode} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <div className="text-xl font-bold text-slate-900">Total: ₹{total.toLocaleString('en-IN')}</div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
            >
              {submitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
