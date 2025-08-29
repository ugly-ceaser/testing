import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    const isAdmin = req.nextUrl.pathname.startsWith('/admin');

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return null;
    }

    if (isDashboard || isAdmin) {
      if (!isAuth) {
        let from = req.nextUrl.pathname;
        if (req.nextUrl.search) {
          from += req.nextUrl.search;
        }
        return NextResponse.redirect(
          new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
        );
      }

      if (isAdmin && token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
};