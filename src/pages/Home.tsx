import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

const sections = [
  {
    id: "customer",
    title: "ДИЗАЙН-ПРОЕКТ",
    description: "Визуализируйте будущий интерьер с помощью ИИ, составьте смету и подберите специалиста",
    emoji: "🎨",
    icon: "Palette",
    gradient: "from-amber-400 via-orange-400 to-rose-400",
    glow: "group-hover:shadow-orange-300/50",
    path: "/designer",
    requireAuth: true,
  },
  {
    id: "contractor",
    title: "МАСТЕР",
    description: "Принимайте заказы, ведите объекты и развивайте клиентскую базу на одной платформе",
    emoji: "🔨",
    icon: "Hammer",
    gradient: "from-blue-400 via-indigo-400 to-violet-400",
    glow: "group-hover:shadow-blue-300/50",
    path: "/masters",
    requireAuth: false,
  },
  {
    id: "catalog",
    title: "КАТАЛОГ",
    description: "Стройматериалы и отделочные товары от надёжных поставщиков с доставкой на объект",
    emoji: "🏗️",
    icon: "Store",
    gradient: "from-emerald-400 via-teal-400 to-cyan-400",
    glow: "group-hover:shadow-emerald-300/50",
    path: "/suppliers",
    requireAuth: true,
  },
  {
    id: "showroom",
    title: "ШОУРУМ",
    description: "Вдохновляйтесь готовыми концепциями для ванной, кухни, гостиной и спальни",
    emoji: "✨",
    icon: "Sparkles",
    gradient: "from-violet-400 via-purple-400 to-fuchsia-400",
    glow: "group-hover:shadow-violet-300/50",
    path: "/showroom",
    requireAuth: false,
  },
  {
    id: "tariffs",
    title: "ЦЕНЫ",
    description: "Тарифы на дизайн-проект и смету — для частных клиентов и строительных компаний",
    emoji: "💎",
    icon: "BadgePercent",
    gradient: "from-rose-400 via-pink-400 to-red-400",
    glow: "group-hover:shadow-rose-300/50",
    path: "/tariffs",
    requireAuth: false,
  },
  {
    id: "prices",
    title: "БЮДЖЕТ",
    description: "Прозрачные расценки на отделку, сантехнику, электрику, монтаж дверей и окон",
    emoji: "📋",
    icon: "ClipboardList",
    gradient: "from-orange-400 via-amber-400 to-yellow-400",
    glow: "group-hover:shadow-amber-300/50",
    path: "/prices",
    requireAuth: false,
  },
  {
    id: "lemanapro",
    title: "ЛЕМАНАПРО",
    description: "Широкий ассортимент товаров для обустройства и обновления жилья от ЛеманаПро",
    emoji: "🛒",
    icon: "ShoppingCart",
    gradient: "from-green-400 via-lime-400 to-emerald-400",
    glow: "group-hover:shadow-green-300/50",
    path: "/lemanapro",
    requireAuth: false,
  },
  {
    id: "windows",
    title: "ОКНА",
    description: "Расчёт стоимости окон ПВХ и алюминиевых конструкций, смета и КП с чертежом",
    emoji: "🪟",
    icon: "AppWindow",
    gradient: "from-sky-400 via-blue-400 to-indigo-400",
    glow: "group-hover:shadow-sky-300/50",
    path: "/windows",
    requireAuth: false,
  },
];

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
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [region, setRegion] = useState<RegionData>(REGIONS.other);

  useEffect(() => {
    const saved = localStorage.getItem("avangard_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
    const savedRegion = localStorage.getItem("avangard_calc_region");
    const code = savedRegion || detectRegionFromTimezone();
    setRegion(REGIONS[code] || REGIONS.other);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("avangard_user");
    localStorage.removeItem("avangard_token");
    setUser(null);
  };

  const handleNavigate = (section: typeof sections[0]) => {
    if (section.requireAuth && !user) {
      navigate(`/login?redirect=${section.path}`);
    } else {
      navigate(section.path);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f13]">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#0f0f13]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-20 left-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-10 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.5) 80px, rgba(255,255,255,0.5) 81px), repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.5) 80px, rgba(255,255,255,0.5) 81px)`,
            }}
          />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/5">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Icon name="Compass" className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">АВАНГАРД</span>
              </div>
              <div className="flex items-center gap-3">
                <a href="mailto:info@avangard-ai.ru" className="hidden md:flex items-center gap-2 text-sm text-white/50 hover:text-white/90 transition-colors mr-2">
                  <Icon name="Mail" className="h-4 w-4" />
                  <span className="font-medium">info@avangard-ai.ru</span>
                </a>
                {user ? (
                  <>
                    <div className="hidden sm:flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Icon name="User" className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-medium text-white/80">{user.name}</span>
                    </div>
                    {user.role === "admin" && (
                      <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="rounded-full border-white/20 text-white/80 hover:bg-white/10">
                        <Icon name="Shield" className="mr-1.5 h-4 w-4" />
                        Админ
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full text-white/60 hover:text-white hover:bg-white/10">
                      <Icon name="LogOut" className="mr-1.5 h-4 w-4" />
                      Выйти
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="rounded-full text-white/70 hover:text-white hover:bg-white/10">
                      Войти
                    </Button>
                    <Button size="sm" onClick={() => navigate("/register")} className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-0 text-white shadow-lg shadow-orange-500/30">
                      <Icon name="UserPlus" className="mr-1.5 h-4 w-4" />
                      Регистрация
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero content */}
        <main className="relative z-10 px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-14 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-400"></span>
                </span>
                {region.label}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                <span className="text-white">ДИЗАЙН-ПРОЕКТ</span>
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">И РЕМОНТ ПОД КОНТРОЛЕМ</span>
              </h1>
              <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                {user
                  ? `${user.name}, выберите раздел для работы`
                  : "Умный ИИ-дизайнер, аттестованные мастера и прозрачный контроль на каждом этапе — от эскиза до сдачи объекта"}
              </p>
            </div>

            {/* Sections — one row of 6 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 animate-slide-up">
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="group relative cursor-pointer"
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => handleNavigate(section)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
                  <div className="relative bg-white/8 backdrop-blur-sm rounded-2xl p-4 border border-white/10 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/12 group-hover:-translate-y-1 text-center flex flex-col items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                      <span className="text-xl">{section.emoji}</span>
                    </div>
                    <div>
                      <h2 className="text-xs font-bold tracking-wide text-white/90 leading-tight mb-1">{section.title}</h2>
                      <p className="text-white/40 text-[11px] leading-snug line-clamp-2">{section.description}</p>
                    </div>
                    <div className={`w-full h-0.5 rounded-full bg-gradient-to-r ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center animate-fade-in" style={{ animationDelay: "500ms" }}>
              <div className="inline-flex items-center gap-6 bg-white/8 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ring-2 ring-white/10 text-xs">🏠</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white/10 text-xs">🔧</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center ring-2 ring-white/10 text-xs">📐</div>
                  </div>
                  <span className="text-sm text-white/50">Проверенные мастера</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <span className="text-sm text-white/50">Рейтинг <strong className="text-white/80">4.8</strong></span>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <span className="text-sm text-white/50">С 2020 года</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Light content below hero */}
      <div className="bg-[#fafaf8] flex-1 px-4 py-16">
        <div className="w-full max-w-6xl mx-auto">

          <section className="mt-0">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Реализованные объекты</span>
              </h2>
              <p className="text-gray-500 text-lg">Завершённые проекты отделки в {region.city}</p>
              <p className="text-gray-400 text-sm mt-1">Потяните ползунок, чтобы сравнить «до» и «после»</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  before: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/d1145c26-c0f3-473a-870a-652d6c28a68c.jpg",
                  after: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/c50e56a4-0403-4a15-9304-377f1e623dcd.jpg",
                  title: "Ванная комната", area: "8 м²", time: "14 дней", price: region.prices[0], district: region.districts[0],
                },
                {
                  before: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/88872eca-f623-4351-8d0f-b9961cc1509b.jpg",
                  after: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e8794aeb-95cc-471b-af60-ac670e68e682.jpg",
                  title: "Кухня-гостиная", area: "25 м²", time: "21 день", price: region.prices[1], district: region.districts[1],
                },
                {
                  before: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/f206b6d0-2b52-40ab-88bb-a249dcf1519d.jpg",
                  after: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3c16649d-8e76-43b4-9b6f-0ed4f4f2ff25.jpg",
                  title: "Гостиная", area: "18 м²", time: "12 дней", price: region.prices[2], district: region.districts[2],
                },
              ].map((project, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                  <BeforeAfterSlider
                    beforeImg={project.before}
                    afterImg={project.after}
                    className="aspect-[4/3]"
                  />
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900">{project.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Icon name="MapPin" size={12} />{project.district}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Icon name="Ruler" size={14} />{project.area}</span>
                      <span className="flex items-center gap-1"><Icon name="Clock" size={14} />{project.time}</span>
                    </div>
                    <p className="mt-2 font-semibold text-orange-500">{project.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Почему выбирают АВАНГАРД</span>
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">Мы объединяем технологии искусственного интеллекта и опыт живых специалистов, чтобы ваш ремонт прошёл без стресса и непредвиденных расходов.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "Bot", title: "ИИ-дизайнер бесплатно", text: "Создайте трёхмерную визуализацию квартиры за несколько минут. Подберите стиль, цветовую гамму и расстановку мебели ещё до начала отделки.", color: "text-amber-500" },
                { icon: "ShieldCheck", title: "Только проверенные мастера", text: "Все специалисты в базе прошли верификацию: портфолио, отзывы прошлых заказчиков и оценка по завершении каждого объекта.", color: "text-blue-500" },
                { icon: "Calculator", title: "Смета онлайн за 2 минуты", text: "Укажите площадь и вид работ — калькулятор рассчитает ориентировочную стоимость с учётом актуальных цен на материалы.", color: "text-emerald-500" },
                { icon: "ClipboardCheck", title: "Контроль на каждом шаге", text: "Следите за ходом ремонта через личный кабинет: фотоотчёты, этапы сдачи-приёмки и история платежей в одном месте.", color: "text-violet-500" },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                  <Icon name={item.icon} size={32} className={`${item.color} mb-4`} />
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Мнения наших заказчиков</span>
              </h2>
              <p className="text-gray-500 text-lg">Реальные истории людей, которые уже обновили своё жильё</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Анна К.", text: "Обновили ванную всего за две недели. Плитка уложена безупречно, швы ровные, затирка аккуратная. Бригада убрала за собой весь строительный мусор. Однозначно советую!", rating: 5, date: "Январь 2026", emoji: "👩" },
                { name: "Дмитрий П.", text: "Заказывал комплексную отделку кухни-гостиной. Трёхмерная визуализация интерьера помогла заранее увидеть итог и избежать лишних правок. В итоге — точно в смете и графике.", rating: 5, date: "Декабрь 2025", emoji: "👨" },
                { name: "Елена М.", text: "Онлайн-калькулятор сразу показал приблизительную стоимость по видам работ — никаких неожиданностей. Специалист явился в условленное время, сделал всё аккуратно и чисто.", rating: 5, date: "Февраль 2026", emoji: "👩" },
              ].map((review, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i} className="text-amber-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">«{review.text}»</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-lg">
                        {review.emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{review.name}</p>
                        <p className="text-xs text-gray-400">{review.date}</p>
                      </div>
                    </div>
                    <Icon name="Quote" size={20} className="text-orange-200" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20 mb-4">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-10 md:p-14">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Хватит откладывать — начнём?</h2>
                <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">Набросайте концепцию интерьера с помощью ИИ или узнайте предварительную стоимость отделки прямо сейчас — это бесплатно.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" onClick={() => navigate(user ? "/designer" : "/login?redirect=/designer")} className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-8 shadow-xl text-base font-semibold">
                    🎨 Создать дизайн-проект
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/calculator")} className="border-2 border-white/50 text-white hover:bg-white/20 rounded-full px-8 text-base font-semibold bg-transparent">
                    📋 Рассчитать смету
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="bg-[#fafaf8] py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        АВАНГАРД &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}