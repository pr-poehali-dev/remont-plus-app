import { useState, useEffect, useRef } from "react";
import SEOMeta from "@/components/SEOMeta";
import { useMeta } from "@/hooks/useMeta";
import FocusHeader from "@/components/home/hero/FocusHeader";
import FocusHero from "@/components/home/hero/FocusHero";
import HomeThreeSteps from "@/components/home/focus/HomeThreeSteps";
import HomeEstimateExample from "@/components/home/focus/HomeEstimateExample";
import HomePriceTrust from "@/components/home/focus/HomePriceTrust";
import HomeAfterEstimate from "@/components/home/focus/HomeAfterEstimate";
import HomeReviews from "@/components/home/focus/HomeReviews";
import HomeAllCalculators from "@/components/home/focus/HomeAllCalculators";
import HomeFaq, { faqJsonLd } from "@/components/home/focus/HomeFaq";
import HomeFinalCta from "@/components/home/focus/HomeFinalCta";
import SiteFooter from "@/components/SiteFooter";

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

export default function Home() {
  useMeta({
    title: "Смета на ремонт квартиры онлайн за 2 минуты",
    description:
      "Укажите площадь и тип ремонта — получите расчёт работ и материалов с ценами по вашему городу. Бесплатно, без регистрации, результат сразу на экране.",
    keywords:
      "смета на ремонт квартиры, расчёт стоимости ремонта, калькулятор ремонта онлайн, цена ремонта квартиры",
    canonical: "/",
  });

  const [user, setUser] = useState<User | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("avangard_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("avangard_user");
    localStorage.removeItem("avangard_token");
    setUser(null);
  };

  const scrollToCalc = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      document.getElementById("qe-area")?.focus({ preventScroll: true });
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f13]">
      <SEOMeta
        title="Смета на ремонт квартиры онлайн за 2 минуты"
        description="Укажите площадь и тип ремонта — получите расчёт работ и материалов с ценами по вашему городу. Бесплатно, без регистрации."
        keywords="смета на ремонт квартиры, расчёт стоимости ремонта, калькулятор ремонта онлайн"
        path="/"
        jsonLd={[faqJsonLd]}
      />

      <FocusHeader user={user} onLogout={handleLogout} onCalcClick={scrollToCalc} />

      <main className="flex-1">
        <FocusHero ref={heroRef} />
        <HomeThreeSteps onCalcClick={scrollToCalc} />
        <HomeEstimateExample />
        <HomePriceTrust />
        <HomeAfterEstimate />
        <HomeReviews />
        <HomeAllCalculators />
        <HomeFaq />
        <HomeFinalCta onCalcClick={scrollToCalc} />
      </main>

      <SiteFooter />
    </div>
  );
}
