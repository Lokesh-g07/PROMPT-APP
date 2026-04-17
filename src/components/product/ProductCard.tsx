"use client";

import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard = memo(({ product, priority = false }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    addToCart(product.id, 1);
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-slate-100">
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-100 outline-none focus-visible:ring-4 focus-visible:ring-blue-500 inset-0 z-0">
        <Image
          src={product.imageUrl}
          alt={`Image of ${product.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      
      <div className="p-5 flex flex-col flex-grow z-10 bg-white">
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
          {product.category}
        </div>
        <Link href={`/product/${product.id}`} className="outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
          <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xl font-extrabold text-slate-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            onClick={handleAddToCart}
            className="p-3 bg-slate-100 text-slate-700 rounded-full hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            aria-label={`Add ${product.name} to cart`}
            title="Add to Cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-slate-100 animate-pulse">
    <div className="aspect-square bg-slate-200" />
    <div className="p-5 flex flex-col flex-grow">
      <div className="h-3 bg-slate-200 rounded w-1/4 mb-3" />
      <div className="h-5 bg-slate-200 rounded w-3/4 mb-4" />
      <div className="mt-auto pt-4 flex items-center justify-between">
        <div className="h-6 bg-slate-200 rounded w-1/3" />
        <div className="h-10 w-10 bg-slate-200 rounded-full" />
      </div>
    </div>
  </div>
);
