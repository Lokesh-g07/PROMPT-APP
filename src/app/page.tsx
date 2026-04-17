import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getProducts } from '@/lib/firestore';
import ProductCard from '@/components/product/ProductCard';
import Recommendations from '@/components/product/Recommendations';

export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  const products = await getProducts();
  const featured = products.slice(0, 9); // 3x3 grid

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?blur=10')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Discover What You <span className="text-pink-400">Love</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-blue-100 max-w-3xl mx-auto mb-10">
            ShopSense is your AI-powered shopping assistant. Find the best products tailored just for you.
          </p>
          
          <form action="/products" className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              name="q"
              placeholder="What are you looking for today?"
              className="w-full pl-12 pr-4 py-4 rounded-full text-lg text-slate-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-pink-500/50 transition-shadow"
              required
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-pink-500 text-white px-6 rounded-full font-bold hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Featured Products</h2>
            <p className="text-slate-500 mt-2 text-lg">Handpicked essentials for you.</p>
          </div>
          <Link href="/products" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
            View all &rarr;
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-medium text-slate-600">No products found. Please run the seed script.</h3>
          </div>
        )}
      </section>

      {/* Recommendations Section */}
      <Recommendations />
    </div>
  );
}
