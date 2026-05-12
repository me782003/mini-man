import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password'];

const PROTECTED_ROUTES = ['/cart', '/favorites', '/account', '/checkout', '/payment', '/shipping'];

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the bare path
  const barePath = pathname.replace(/^\/(en|ar)/, '') || '/';
  const locale = pathname.startsWith('/ar') ? 'ar' : 'en';
  const token = request.cookies.get('auth_token')?.value;

  const isAuthRoute = AUTH_ROUTES.some(r => barePath === r || barePath.startsWith(r + '/'));
  const isProtectedRoute = PROTECTED_ROUTES.some(r => barePath === r || barePath.startsWith(r + '/'));

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  if (isProtectedRoute && !token) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|ar)/:path*', '/((?!_next|.*\\..*).*)'],
};
