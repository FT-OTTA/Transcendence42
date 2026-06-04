"use client";

import { useTranslations } from "next-intl";
import Navbar from "../../components/navigation/Navbar"
import Footer from "@/app/components/footer/footer";

export default function TermsOfService() {
  const t = useTranslations("TOS");

  return (
    <main
            className=" overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center h-screen box-border p-4 flex flex-col text-white/80">      
      <Navbar/>
        <h1 className="text-3xl font-bold py-15 mb-6">{t("title")}</h1>
        <p className="mb-4">{t("lastUpdated")}</p>

        <p className="mb-6">{t("welcome")}</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">{t("section1Title")}</h2>
        <p className="mb-4">{t("section1Content")}</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">{t("section2Title")}</h2>
        <p className="mb-4">{t("section2Content")}</p>

        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("section2List.cheating")}</li>
          <li>{t("section2List.harassment")}</li>
          <li>{t("section2List.disruption")}</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">{t("section3Title")}</h2>
        <p className="mb-4">{t("section3Content")}</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">{t("section4Title")}</h2>
        <p className="mb-4">{t("section4Content")}</p>
        <Footer/>
    </main>
  );
}