"use client";

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    await addToCart(product.id, quantity);
    // Simple visual feedback
    setTimeout(() => setAdding(false), 500);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
          Quantity
        </label>
        <select
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border border-slate-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Quantity for ${product.name}`}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>
      
      <button
        onClick={handleAdd}
        disabled={adding}
        className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2 font-bold text-lg transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          adding 
            ? 'bg-green-500 text-white scale-95' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/30'
        }`}
      >
        <ShoppingCart className="h-6 w-6" />
        <span>{adding ? 'Added to Cart!' : 'Add to Cart'}</span>
      </button>
    </div>
  );
}
