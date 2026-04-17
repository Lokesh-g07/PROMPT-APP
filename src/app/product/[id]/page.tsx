import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/firestore';
import AddToCartButton from './AddToCartButton';
import ViewTracker from './ViewTracker';

export const revalidate = 60; // Revalidate occasionally

export default async function ProductDetailPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <ViewTracker productId={product.id} />
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        {/* Product Image */}
        <div className="w-full md:w-1/2 relative bg-slate-100 aspect-square md:aspect-auto">
          <Image
            src={product.imageUrl}
            alt={`Image of ${product.name}`}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
            {product.category}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            {product.name}
          </h1>
          <div className="text-2xl font-bold text-slate-900 mb-6">
            ₹{product.price.toLocaleString('en-IN')}
          </div>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            {product.description}
          </p>
          
          <div className="mt-auto">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
