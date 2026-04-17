"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';

export default function Recommendations() {
  const { user, loading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.uid || null })
        });
        const data = await res.json();
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, authLoading]);

  if (loading) {
    return (
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-10"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full bg-slate-100/50 rounded-3xl mb-16">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Recommended For You</h2>
      <p className="text-slate-500 mb-10 text-lg">Personalized picks based on your style.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {recommendations.map(product => (
          <div key={product.id} className="transform scale-95 origin-top-left hover:scale-100 transition-transform">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
