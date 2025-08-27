import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'bm'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/', '/(en|bm)/:path*']
};
