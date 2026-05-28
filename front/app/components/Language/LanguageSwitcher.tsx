'use client';

import { useState } from 'react';
import { useRouter, usePathname } from '@/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  console.log("DEBUG [LanguageSwitcher]: Current framework pathname:", pathname);

  const changeLanguage = (nextLocale: 'en' | 'fr' | 'sv') => {
    router.replace(pathname, { locale: nextLocale });
    setOpen(false);
  };

  return (
    <div className="relative w-fit z-50">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-white text-xl hover:text-blue-300 transition cursor-pointer"
      >
        🌐
      </button>

      {open && (
        <div className="absolute left-0 mt-2 bg-black/90 text-white rounded-lg shadow-lg overflow-hidden min-w-[120px] border border-blue-300/20">
          <button
            onClick={() => changeLanguage('en')}
            className="block px-4 py-2 hover:bg-white/10 w-full text-left text-sm cursor-pointer"
          >
            English
          </button>

          <button
            onClick={() => changeLanguage('fr')}
            className="block px-4 py-2 hover:bg-white/10 w-full text-left text-sm cursor-pointer"
          >
            Français
          </button>

          <button
            onClick={() => changeLanguage('sv')}
            className="block px-4 py-2 hover:bg-white/10 w-full text-left text-sm cursor-pointer"
          >
            Svenska
          </button>
        </div>
      )}
    </div>
  );
}