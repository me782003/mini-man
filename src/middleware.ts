import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password'];

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the bare path
  const barePath = pathname.replace(/^\/(en|ar)/, '') || '/';

  const isAuthRoute = AUTH_ROUTES.some(r => barePath === r || barePath.startsWith(r + '/'));

  if (isAuthRoute) {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      const locale = pathname.startsWith('/ar') ? 'ar' : 'en';
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|ar)/:path*', '/((?!_next|.*\\..*).*)'],
};
