import { useState, useEffect } from "react";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta from "@/components/SEOMeta";
import HomeHero from "@/components/home/HomeHero";
import HomeHowItWorks from "@/components/home/HomeHowItWorks";
import HomeProjects from "@/components/home/HomeProjects";
import HomeLatestPosts, { type LatestPost } from "@/components/home/HomeLatestPosts";
import HomeCTA from "@/components/home/HomeCTA";
import HomePartner from "@/components/home/HomePartner";
import HomeVideoBanner from "@/components/home/HomeVideoBanner";

const POSTS_URL = "https://functions.poehali.dev/60baa083-841b-461e-9edb-8460b28e7076";

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

interface RegionData {
  label: string;
  city: string;
  prices: [string, string, string];
  districts: [string, string, string];
}

const REGIONS: Record<string, RegionData> = {
  moscow: { label: "Москва и область", city: "Москве", prices: ["от 420 000 ₽", "от 750 000 ₽", "от 380 000 ₽"], districts: ["Хамовники", "Бутово", "Мытищи"] },
  moscow_region: { label: "Московская область", city: "Подмосковье", prices: ["от 380 000 ₽", "от 700 000 ₽", "от 350 000 ₽"], districts: ["Красногорск", "Одинцово", "Балашиха"] },
  spb: { label: "Санкт-Петербург и область", city: "Санкт-Петербурге", prices: ["от 380 000 ₽", "от 700 000 ₽", "от 350 000 ₽"], districts: ["Петроградский р-н", "Василеостровский р-н", "Приморский р-н"] },
  leningrad_region: { label: "Ленинградская область", city: "Ленобласти", prices: ["от 350 000 ₽", "от 640 000 ₽", "от 320 000 ₽"], districts: ["Всеволожск", "Гатчина", "Мурино"] },
  krasnodar: { label: "Краснодарский край", city: "Краснодаре", prices: ["от 340 000 ₽", "от 610 000 ₽", "от 300 000 ₽"], districts: ["Центральный р-н", "Юбилейный", "Прикубанский р-н"] },
  novosibirsk: { label: "Новосибирск и область", city: "Новосибирске", prices: ["от 290 000 ₽", "от 520 000 ₽", "от 260 000 ₽"], districts: ["Центральный р-н", "Октябрьский р-н", "Ленинский р-н"] },
  ekaterinburg: { label: "Екатеринбург и область", city: "Екатеринбурге", prices: ["от 300 000 ₽", "от 550 000 ₽", "от 280 000 ₽"], districts: ["Центр", "Академический", "Ботанический"] },
  kazan: { label: "Казань и область", city: "Казани", prices: ["от 290 000 ₽", "от 520 000 ₽", "от 260 000 ₽"], districts: ["Вахитовский р-н", "Ново-Савиновский р-н", "Советский р-н"] },
  nizhny_novgorod: { label: "Нижний Новгород и область", city: "Нижнем Новгороде", prices: ["от 290 000 ₽", "от 520 000 ₽", "от 260 000 ₽"], districts: ["Нижегородский р-н", "Советский р-н", "Приокский р-н"] },
  samara: { label: "Самара и область", city: "Самаре", prices: ["от 270 000 ₽", "от 490 000 ₽", "от 250 000 ₽"], districts: ["Октябрьский р-н", "Ленинский р-н", "Кировский р-н"] },
  rostov: { label: "Ростов-на-Дону и область", city: "Ростове-на-Дону", prices: ["от 290 000 ₽", "от 520 000 ₽", "от 260 000 ₽"], districts: ["Ворошиловский р-н", "Кировский р-н", "Советский р-н"] },
  voronezh: { label: "Воронеж и область", city: "Воронеже", prices: ["от 270 000 ₽", "от 490 000 ₽", "от 250 000 ₽"], districts: ["Центральный р-н", "Коминтерновский р-н", "Левобережный р-н"] },
  tyumen: { label: "Тюмень и область", city: "Тюмени", prices: ["от 320 000 ₽", "от 580 000 ₽", "от 290 000 ₽"], districts: ["Центральный р-н", "Калининский р-н", "Ленинский р-н"] },
  krasnoyarsk: { label: "Красноярск и область", city: "Красноярске", prices: ["от 300 000 ₽", "от 550 000 ₽", "от 280 000 ₽"], districts: ["Центральный р-н", "Советский р-н", "Октябрьский р-н"] },
  chelyabinsk: { label: "Челябинск и область", city: "Челябинске", prices: ["от 270 000 ₽", "от 490 000 ₽", "от 250 000 ₽"], districts: ["Центральный р-н", "Курчатовский р-н", "Калининский р-н"] },
  other: { label: "Вся Россия", city: "вашем городе", prices: ["от 320 000 ₽", "от 580 000 ₽", "от 290 000 ₽"], districts: ["Центральный р-н", "Новый район", "Пригород"] },
};

function detectRegionFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzMap: Record<string, string> = {
      "Europe/Moscow": "moscow",
      "Europe/Samara": "samara",
      "Asia/Yekaterinburg": "ekaterinburg",
      "Asia/Novosibirsk": "novosibirsk",
      "Asia/Krasnoyarsk": "krasnoyarsk",
      "Asia/Tyumen": "tyumen",
    };
    return tzMap[tz] || "other";
  } catch {
    return "other";
  }
}

export default function Home() {
  useMeta({
    title: "Дизайн-проект и расчёт стоимости ремонта онлайн",
    description: "Создайте дизайн-проект интерьера и рассчитайте стоимость работ и материалов за минуты. Партнёры по всей России предложат лучшие условия.",
    keywords: "дизайн-проект онлайн, расчёт стоимости ремонта, калькулятор ремонта, смета на ремонт, ИИ дизайнер интерьера",
    canonical: "/",
  });

  const [user, setUser] = useState<User | null>(null);
  const [region, setRegion] = useState<RegionData>(REGIONS.other);
  const [latestPosts, setLatestPosts] = useState<LatestPost[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("avangard_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }

    fetch(`${POSTS_URL}?limit=3`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.posts) setLatestPosts(d.posts); })
      .catch(() => {});

    const savedRegion = localStorage.getItem("avangard_calc_region");
    const code = savedRegion || detectRegionFromTimezone();
    setRegion(REGIONS[code] || REGIONS.other);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("avangard_user");
    localStorage.removeItem("avangard_token");
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f13]">
      <SEOMeta
        title="Калькуляторы ремонта и строительства онлайн"
        description="Рассчитайте стоимость ремонта квартиры, дома, бани онлайн. Калькуляторы ванной, потолков, пола, окон, электрики, каркасного дома. Точная смета за 5 минут."
        keywords="калькулятор ремонта онлайн, расчёт стоимости ремонта квартиры, смета на ремонт онлайн"
        path="/"
      />
      <HomeHero user={user} regionLabel={region.label} onLogout={handleLogout} />
      <HomeHowItWorks />

      <div className="bg-[#fafaf8] flex-1 px-4 py-16">
        <div className="w-full max-w-6xl mx-auto">
          <HomeProjects region={region} />
          <HomeVideoBanner />
          <HomePartner />
          <HomeLatestPosts posts={latestPosts} />
          <HomeCTA user={user} />
        </div>
      </div>
    </div>
  );
}