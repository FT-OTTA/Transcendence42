"use client";

import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="w-full py-1 text-slate-400 text-center text-xs border-t border-slate-800 mt-auto">
      <div className="flex justify-center space-x-6">
        <Link href="/privacy" className="hover:text-white transition">
          {t("privacy")}
        </Link>
        <Link href="/terms" className="hover:text-white transition">
          {t("terms")}
        </Link>
      </div>
      <p className="mt-2 text-xs">
       2026 Otta. {t("rights")}
      </p>
    </footer>
  );
}