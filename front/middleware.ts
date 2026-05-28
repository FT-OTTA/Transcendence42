import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'fr', 'sv'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  console.log("DEBUG [Middleware]: Intercepted incoming URL demand path:", request.nextUrl.pathname);
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(fr|sv|en)/:path*']
};