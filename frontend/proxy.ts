import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefixes (more reliable in production)
  localePrefix: 'always'
});

export default function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match root path
    '/',
    // Match all pathnames except for:
    // - API routes
    // - Next.js internals (_next)
    // - Static files (files with extensions)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
