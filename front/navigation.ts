import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'fr', 'sv'] as const;

export const { Link, useRouter, usePathname } = createNavigation({ locales });