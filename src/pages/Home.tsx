import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
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
    description: "Создайте дизайн-проект с помощью ИИ, рассчитайте смету и найдите мастеров",
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
    description: "Находите заказы на ремонт, управляйте проектами и получайте клиентов",
    emoji: "🔨",
    icon: "Hammer",
    gradient: "from-blue-400 via-indigo-400 to-violet-400",
    glow: "group-hover:shadow-blue-300/50",
    path: "/profile",
    requireAuth: true,
  },
  {
    id: "catalog",
    title: "КАТАЛОГ",
    description: "Строительные материалы и товары от проверенных поставщиков",
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
    description: "Готовые дизайнерские решения для ванных, кухонь, гостиных и спален",
    emoji: "✨",
    icon: "Sparkles",
    gradient: "from-violet-400 via-purple-400 to-fuchsia-400",
    glow: "group-hover:shadow-violet-300/50",
    path: "/showroom",
    requireAuth: false,
  },
  {
    id: "prices",
    title: "ПРАЙС-ЛИСТ",
    description: "Цены на все виды работ: отделка, сантехника, электрика, двери, окна",
    emoji: "📋",
    icon: "ClipboardList",
    gradient: "from-rose-400 via-pink-400 to-red-400",
    glow: "group-hover:shadow-rose-300/50",
    path: "/prices",
    requireAuth: false,
  },
  {
    id: "lemanapro",
    title: "ЛЕМАНАПРО",
    description: "Каталог товаров для ремонта от ЛеманаПро — Самара",
    emoji: "🛒",
    icon: "ShoppingCart",
    gradient: "from-green-400 via-lime-400 to-emerald-400",
    glow: "group-hover:shadow-green-300/50",
    path: "/lemanapro",
    requireAuth: false,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

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

  const handleNavigate = (section: typeof sections[0]) => {
    if (section.requireAuth && !user) {
      navigate(`/login?redirect=${section.path}`);
    } else {
      navigate(section.path);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
                <Icon name="Compass" className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">АВАНГАРД</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="tel:89277486868" className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors mr-2">
                <Icon name="Phone" className="h-4 w-4" />
                <span className="font-medium">8 (927) 748-68-68</span>
              </a>
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 text-sm bg-orange-50 px-3 py-1.5 rounded-full">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Icon name="User" className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">{user.name}</span>
                  </div>
                  {user.role === "admin" && (
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="rounded-full">
                      <Icon name="Shield" className="mr-1.5 h-4 w-4" />
                      Админ
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full">
                    <Icon name="LogOut" className="mr-1.5 h-4 w-4" />
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="rounded-full">
                    Войти
                  </Button>
                  <Button size="sm" onClick={() => navigate("/register")} className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-0 text-white shadow-lg shadow-orange-200/50">
                    <Icon name="UserPlus" className="mr-1.5 h-4 w-4" />
                    Регистрация
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Самара и область
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">ДИЗАЙН-ПРОЕКТ</span>
              <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">И РЕМОНТ ПОД КОНТРОЛЕМ</span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {user
                ? `${user.name}, выберите раздел для работы`
                : "ИИ-дизайнер, проверенные мастера и полный контроль каждого этапа ремонта"}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 animate-slide-up">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className={`group relative cursor-pointer`}
                style={{ animationDelay: `${idx * 80}ms` }}
                onClick={() => handleNavigate(section)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 ${section.glow}`} />
                <div className="relative bg-white rounded-2xl p-7 border border-gray-100 transition-all duration-300 group-hover:border-transparent group-hover:shadow-2xl group-hover:-translate-y-1.5">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <span className="text-2xl">{section.emoji}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <Icon name="ArrowRight" className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <h2 className="text-lg font-bold mb-2 tracking-wide text-gray-900">{section.title}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">{section.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: "500ms" }}>
            <div className="inline-flex items-center gap-6 bg-white rounded-2xl px-8 py-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ring-2 ring-white text-xs">🏠</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white text-xs">🔧</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center ring-2 ring-white text-xs">📐</div>
                </div>
                <span className="text-sm text-gray-500">Проверенные мастера</span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <span className="text-sm text-gray-500">Рейтинг <strong className="text-gray-900">4.8</strong></span>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span className="text-sm text-gray-500">С 2020 года</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        АВАНГАРД &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
