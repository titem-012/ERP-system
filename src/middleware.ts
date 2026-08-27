import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value; // 'ADMIN' or 'CASHIER'

  const isAuthRoute = pathname === '/login';
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/cashier');

  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    // Redirect logged-in users away from login page
    if (isAuthRoute) {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (role === 'CASHIER') {
        return NextResponse.redirect(new URL('/cashier/stock-out', request.url));
      }
    }

    // Admin routes protection
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/cashier/stock-out', request.url));
    }

    // Cashier routes protection
    if (pathname.startsWith('/cashier') && role !== 'CASHIER') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/admin/:path*', '/cashier/:path*'],
};
