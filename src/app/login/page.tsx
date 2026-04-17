"use client";

import React, { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag } from 'lucide-react';

function LoginContent() {
  const { user, signIn, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  useEffect(() => {
    if (user && !loading) {
      router.push(returnUrl);
    }
  }, [user, loading, router, returnUrl]);

  if (loading) {
    return <div className="p-10 text-center animate-pulse">Loading...</div>;
  }

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to ShopSense
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to access your orders, saved items, and personalized AI recommendations.
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={signIn}
            className="w-full flex justify-center py-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all group"
            aria-label="Sign in with Google"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform"
            />
            Continue with Google
          </button>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center animate-pulse">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
