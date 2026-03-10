import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

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
    description: "Создайте дизайн-проект интерьера за минуты — стиль, планировка, цветовые решения",
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
    description: "Партнёрам: размещайте предложения, получайте заявки и развивайте клиентскую базу",
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
    description: "Товары от партнёров-поставщиков по всей России — сравните цены и выберите лучшее",
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
    description: "Доступные тарифы на дизайн-проект и смету — для частных клиентов и компаний",
    emoji: "💎",
    icon: "BadgePercent",
    gradient: "from-rose-400 via-pink-400 to-red-400",
    glow: "group-hover:shadow-rose-300/50",
    path: "/tariffs",
    requireAuth: false,
  },
  {
    id: "prices",
    title: "ПРАЙС",
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
  {
    id: "ceilings",
    title: "ПОТОЛКИ",
    description: "Расчёт натяжных потолков: ПВХ и тканевые полотна, освещение, смета и КП",
    emoji: "🏠",
    icon: "Layers",
    gradient: "from-violet-400 via-purple-400 to-indigo-400",
    glow: "group-hover:shadow-violet-300/50",
    path: "/ceilings",
    requireAuth: false,
  },
  {
    id: "flooring",
    title: "ПОЛЫ",
    description: "Расчёт напольных покрытий: ламинат, паркет, плитка, SPC, ковролин — смета с монтажом",
    emoji: "🪵",
    icon: "SquareStack",
    gradient: "from-amber-400 via-yellow-400 to-orange-400",
    glow: "group-hover:shadow-amber-300/50",
    path: "/flooring",
    requireAuth: false,
  },
  {
    id: "electrics",
    title: "ЭЛЕКТРИКА",
    description: "Расчёт электромонтажа: розетки, выключатели, прокладка кабеля, щиток — смета и КП",
    emoji: "⚡",
    icon: "Zap",
    gradient: "from-blue-400 via-cyan-400 to-sky-400",
    glow: "group-hover:shadow-blue-300/50",
    path: "/electrics",
    requireAuth: false,
  },
  {
    id: "bathroom",
    title: "САНУЗЕЛ",
    description: "Расчёт ремонта ванной и санузла: плитка, сантехника, гидроизоляция, тёплый пол",
    emoji: "🚿",
    icon: "Droplets",
    gradient: "from-teal-400 via-cyan-400 to-emerald-400",
    glow: "group-hover:shadow-teal-300/50",
    path: "/bathroom",
    requireAuth: false,
  },
  {
    id: "newbuild",
    title: "НОВОСТРОЙКА",
    description: "Ремонт в новостройке по помещениям: стяжка, штукатурка, полы, электрика, двери",
    emoji: "🏗️",
    icon: "Building2",
    gradient: "from-orange-400 via-amber-400 to-yellow-400",
    glow: "group-hover:shadow-orange-300/50",
    path: "/newbuild",
    requireAuth: false,
  },
  {
    id: "turnkey",
    title: "ПОД КЛЮЧ",
    description: "Ремонт квартиры под ключ: полный расчёт всех работ с разбивкой по статьям бюджета",
    emoji: "🔑",
    icon: "KeyRound",
    gradient: "from-emerald-400 via-green-400 to-teal-400",
    glow: "group-hover:shadow-emerald-300/50",
    path: "/turnkey",
    requireAuth: false,
  },
  {
    id: "organizer",
    title: "ОРГАНАЙЗЕР",
    description: "Календарный план ремонта: этапы, сроки, бюджет план/факт и контрольные точки",
    emoji: "📋",
    icon: "ClipboardList",
    gradient: "from-cyan-400 via-sky-400 to-blue-400",
    glow: "group-hover:shadow-cyan-300/50",
    path: "/organizer",
    requireAuth: false,
  },
  {
    id: "bathhouse",
    title: "БАНЯ",
    description: "Калькулятор строительства бани с нуля: брус, бревно, каркас, кирпич — смета, печь, вентиляция, схемы",
    emoji: "🪵",
    icon: "Flame",
    gradient: "from-amber-700 via-orange-600 to-amber-600",
    glow: "group-hover:shadow-orange-400/50",
    path: "/bathhouse",
    requireAuth: false,
  },
  {
    id: "framehouse",
    title: "КАРКАСНИК",
    description: "Калькулятор строительства каркасного дома: OSB, SIP, ЛСТК — фасад, фундамент, отопление, смета",
    emoji: "🏗",
    icon: "Home",
    gradient: "from-green-800 via-green-700 to-emerald-600",
    glow: "group-hover:shadow-green-500/50",
    path: "/framehouse",
    requireAuth: false,
  },
  {
    id: "office",
    title: "ОФИС",
    description: "Расчёт ремонта и оснащения коммерческих помещений: офисов, складов — вентиляция, сигнализация, огнезащита",
    emoji: "🏢",
    icon: "Building2",
    gradient: "from-slate-600 via-blue-700 to-indigo-700",
    glow: "group-hover:shadow-blue-500/50",
    path: "/office",
    requireAuth: false,
  },
  {
    id: "expert",
    title: "ЭКСПЕРТ",
    description: "ИИ-консультант по дизайну, интерьеру и ремонту — задайте любой вопрос онлайн",
    emoji: "💡",
    icon: "Sparkles",
    gradient: "from-amber-400 via-yellow-400 to-orange-400",
    glow: "group-hover:shadow-amber-300/50",
    path: "/expert",
    requireAuth: false,
  },
];

interface Props {
  user: User | null;
  regionLabel: string;
  onLogout: () => void;
}

export default function HomeHero({ user, regionLabel, onLogout }: Props) {
  const navigate = useNavigate();

  const handleNavigate = (section: typeof sections[0]) => {
    if (section.requireAuth && !user) {
      navigate(`/login?redirect=${section.path}`);
    } else {
      navigate(section.path);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <img
          src="https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/520fcd66-90d0-4649-93b8-f373fb09119d.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/tariffs")}
                className="hidden md:flex rounded-full border-white/25 text-white/80 hover:bg-white/15 hover:text-white gap-1.5"
              >
                <Icon name="Building2" className="h-3.5 w-3.5" />
                Для компаний
              </Button>
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
                  <Button variant="ghost" size="sm" onClick={onLogout} className="rounded-full text-white/60 hover:text-white hover:bg-white/10">
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
              {regionLabel}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              <span className="text-white">ДИЗАЙН-ПРОЕКТ</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">И РАСЧЁТ СТОИМОСТИ ЗА МИНУТЫ</span>
            </h1>
            <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {user
                ? `${user.name}, выберите раздел для работы`
                : "Создайте дизайн-проект, рассчитайте стоимость работ и материалов — партнёры по всей России предложат лучшие условия"}
            </p>
          </div>

          {/* Sections grid */}
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

          {/* Stats bar */}
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
  );
}