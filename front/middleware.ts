import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'fr', 'sv'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/', '/(fr|sv|en)/:path*']
};