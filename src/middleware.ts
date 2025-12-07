import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const protectedPaths = ['/dashboard', '/invoices', '/items'];
  const isProtectedRoute = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  const isPublicOnlyRoute = pathname === '/login' || pathname === '/signup';

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicOnlyRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/invoices/:path*',
    '/items/:path*',
    '/login',
    '/signup',
  ],
};