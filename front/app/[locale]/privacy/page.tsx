import Footer from "@/app/components/footer/footer";
import Navbar from "@/app/components/navigation/Navbar";
import { useTranslations } from "next-intl";

export default function PrivacyPolicy() {
    const p = useTranslations("Privacy");
    return (
        <main
            className=" overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center h-screen box-border p-4 flex flex-col text-white/80">
            <Navbar/>
            <h1 className="text-3xl font-bold mb-6 py-15">{p("policy")}</h1>
            <p className="mb-4">{p("last_update")}</p>
            <h2 className="text-xl font-semibold mt-6 mb-2">1.{p("collected_title")} </h2>
            <p className="mb-4">{p("collected_usage")}</p>
            <h2 className="text-xl font-semibold mt-6 mb-2">2. {p("usage_title")}</h2>
            <p className="mb-4">{p("usage_usage")}</p>
            <Footer/>
        </main>
    );
}