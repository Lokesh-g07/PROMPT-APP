"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, User as UserIcon, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logOut } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions(null);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, userId: user?.uid || 'anonymous' })
        });
        const data = await res.json();
        if (data.intent) {
          setSuggestions(data.intent);
          setShowSuggestions(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      let url = `/products?q=${encodeURIComponent(query)}`;
      if (suggestions?.category) url += `&category=${encodeURIComponent(suggestions.category)}`;
      if (suggestions?.maxPrice) url += `&maxPrice=${suggestions.maxPrice}`;
      router.push(url);
    }
  };

  const handleSuggestionClick = (keyword: string) => {
    setQuery(keyword);
    setShowSuggestions(false);
    let url = `/products?q=${encodeURIComponent(keyword)}`;
    if (suggestions?.category) url += `&category=${encodeURIComponent(suggestions.category)}`;
    if (suggestions?.maxPrice) url += `&maxPrice=${suggestions.maxPrice}`;
    router.push(url);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
            <span className="font-bold text-2xl text-blue-600 tracking-tight">ShopSense<span className="text-pink-500">.</span></span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl px-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="Search products, brands and categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && suggestions && setShowSuggestions(true)}
                aria-label="Search products"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                </div>
              )}
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions && (
                <div className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Intent</div>
                  {suggestions.category && (
                    <div className="px-4 py-1 text-sm text-slate-700 flex items-center">
                      <span className="font-medium mr-2">Category:</span> {suggestions.category}
                    </div>
                  )}
                  {suggestions.maxPrice && (
                    <div className="px-4 py-1 text-sm text-slate-700 flex items-center">
                      <span className="font-medium mr-2">Under:</span> ₹{suggestions.maxPrice}
                    </div>
                  )}
                  {suggestions.keywords && suggestions.keywords.length > 0 && (
                    <>
                      <div className="px-4 py-2 mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-t border-slate-50">Suggestions</div>
                      <ul>
                        {suggestions.keywords.map((kw: string, i: number) => (
                          <li key={i}>
                            <button
                              type="button"
                              onClick={() => handleSuggestionClick(kw)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              <Search className="h-3 w-3 inline mr-2 text-slate-400" />
                              {kw.toLowerCase() === query.toLowerCase() ? (
                                <strong>{kw}</strong>
                              ) : (
                                kw
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/cart" 
              className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-full"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-pink-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/orders" 
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded p-1"
                >
                  Orders
                </Link>
                <button
                  onClick={logOut}
                  className="flex items-center space-x-1 text-sm font-medium text-slate-600 hover:text-pink-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-pink-600 rounded p-1"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center space-x-2 text-sm font-medium text-slate-700 hover:text-blue-600 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded p-1"
              >
                <UserIcon className="h-5 w-5" />
                <span>Log in</span>
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products mobile"
            />
          </form>
        </div>
      </div>
    </nav>
  );
}
