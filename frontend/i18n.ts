import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['en', 'es', 'fr', 'de'] as const;
export type Locale = (typeof locales)[number];

// Default locale - can be overridden by NEXT_PUBLIC_DEFAULT_LOCALE env var
export const defaultLocale: Locale = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale) || 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // In Next.js 16, we need to await requestLocale instead of using locale
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid, fallback to default instead of notFound()
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
