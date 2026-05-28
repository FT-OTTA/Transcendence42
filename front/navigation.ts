import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'fr', 'sv'] as const;

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always' 
});

export const { Link, useRouter, usePathname } = createNavigation(routing);