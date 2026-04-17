"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrders } from '@/lib/firestore';
import { Order } from '@/types';
import Image from 'next/image';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getOrders(user.uid).then(data => {
        setOrders(data);
        setLoading(false);
      });
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <div className="p-10 text-center animate-pulse">Loading orders...</div>;
  }

  if (!user) {
    return null; // Middleware handles redirect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
          <p className="text-lg text-slate-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Order Placed</div>
                  <div className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Total</div>
                  <div className="font-medium text-slate-900">₹{order.total.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Order ID</div>
                  <div className="font-medium text-slate-900 text-sm">{order.id}</div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{item.product.name}</h4>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-slate-900">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
