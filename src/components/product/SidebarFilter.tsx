"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports'];

export default function SidebarFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get('category') || 'All';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Filters</h2>
      
      {/* Category Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Categories</h3>
        <ul className="space-y-2">
          {CATEGORIES.map(category => (
            <li key={category}>
              <button
                onClick={() => handleCategoryChange(category)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  currentCategory === category
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                aria-pressed={currentCategory === category}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Max Price (₹)</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 5000"
            aria-label="Maximum price filter"
          />
          <button
            onClick={handlePriceApply}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
