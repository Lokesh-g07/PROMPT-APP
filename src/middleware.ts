import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Check for an auth token in cookies
  const authToken = request.cookies.get('auth-token')?.value;
  
  // Protected routes
  const protectedRoutes = ['/orders', '/checkout', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !authToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('returnUrl', pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const isAdmin = request.cookies.get('admin')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/orders/:path*', '/checkout/:path*', '/admin/:path*'],
};
