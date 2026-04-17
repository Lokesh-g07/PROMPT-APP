import React from 'react';
import { getProducts } from '@/lib/firestore';
import ProductCard from '@/components/product/ProductCard';
import SidebarFilter from '@/components/product/SidebarFilter';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; maxPrice?: string };
}) {
  // Currently basic local filtering.
  // Will be augmented with Smart Search API later.
  let products = await getProducts();
  const q = searchParams.q?.toLowerCase();
  const category = searchParams.category;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : null;

  if (q) {
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (category) {
    products = products.filter(p => p.category === category);
  }
  if (maxPrice) {
    products = products.filter(p => p.price <= maxPrice);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <SidebarFilter />
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {q ? `Search Results for "${searchParams.q}"` : category ? `${category} Products` : 'All Products'}
          </h1>
          <p className="text-slate-500 mt-1">{products.length} items found</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-medium text-slate-600 mb-2">No products match your criteria.</h3>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
