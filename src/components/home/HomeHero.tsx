import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

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
    requireAuth: false,
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
    requireAuth: false,
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
    description: "Расчёт напольных покрытий: ламинат, паркет, плитка, SPC, ковролин, эпоксидный пол — смета с монтажом",
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
    id: "furniture",
    title: "МЕБЕЛЬ",
    description: "Подберите мебель для квартиры по комплектации и бюджету — калькулятор с разбивкой по комнатам",
    emoji: "🛋️",
    icon: "Sofa",
    gradient: "from-amber-600 via-yellow-600 to-amber-500",
    glow: "group-hover:shadow-amber-400/50",
    path: "/furniture",
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

const PHONE_NUMBER = "8 (927) 748-68-68";
const PHONE_LINK = "tel:+79277486868";
const WHATSAPP_LINK =
  "https://wa.me/79277486868?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%80%D0%B0%D1%81%D1%81%D1%87%D0%B8%D1%82%D0%B0%D1%82%D1%8C%20%D1%81%D1%82%D0%BE%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D1%8C%20%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82%D0%B0";
const CALLBACK_ENDPOINT =
  "https://functions.poehali.dev/69fd9787-d0eb-4342-b94b-9d14bb3f36e7";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  let d = digits;
  if (d.startsWith("8") && d.length > 1) d = "7" + d.slice(1);
  if (d.length === 0) return "+7";
  let result = "+7";
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length >= 4) result += ")";
  if (d.length > 4) result += " " + d.slice(4, 7);
  if (d.length > 7) result += "-" + d.slice(7, 9);
  if (d.length > 9) result += "-" + d.slice(9, 11);
  return result;
}

export default function HomeHero({ user, regionLabel, onLogout }: Props) {
  const navigate = useNavigate();
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState("+7");
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackSent, setCallbackSent] = useState(false);
  const callbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!callbackOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        callbackRef.current &&
        !callbackRef.current.contains(e.target as Node)
      ) {
        setCallbackOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [callbackOpen]);

  const handleCallbackSubmit = async () => {
    const digits = callbackPhone.replace(/\D/g, "");
    if (digits.length < 11) return;
    setCallbackLoading(true);
    try {
      await fetch(CALLBACK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Обратный звонок",
          phone: callbackPhone,
          source: "callback",
          page_url: window.location.href,
          consent: true,
        }),
      });
      setCallbackSent(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (typeof w.ym === "function") {
          const counters = w.Ya?._metrika?.counters;
          const id = counters ? Object.keys(counters)[0] : undefined;
          if (id) w.ym(Number(id), "reachGoal", "callback_request");
        }
      } catch {
        /* metrika may not be loaded */
      }
    } catch {
      /* silently fail */
    } finally {
      setCallbackLoading(false);
    }
  };

  const handleNavigate = (section: (typeof sections)[0]) => {
    if (section.path.startsWith("/#")) {
      const id = section.path.slice(2);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(
          () =>
            document
              .getElementById(id)
              ?.scrollIntoView({ behavior: "smooth" }),
          300,
        );
      }
      return;
    }
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
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Icon name="Compass" className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                АВАНГАРД
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Phone - desktop only */}
              <a
                href={PHONE_LINK}
                className="hidden md:flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Icon name="Phone" className="h-4 w-4" />
                <span className="font-semibold">{PHONE_NUMBER}</span>
              </a>

              {/* Email - desktop only */}
              <a
                href="mailto:info@avangard-ai.ru"
                className="hidden md:flex items-center gap-2 text-sm text-white/50 hover:text-white/90 transition-colors"
              >
                <Icon name="Mail" className="h-4 w-4" />
                <span className="font-medium">info@avangard-ai.ru</span>
              </a>

              {/* Divider - desktop only */}
              <div className="hidden md:block w-px h-6 bg-white/15" />

              {/* WhatsApp - always visible */}
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-green-500 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30"
                title="Написать в WhatsApp"
              >
                <Icon name="MessageCircle" className="h-4 w-4 text-white" />
              </a>

              {/* Callback button - always visible */}
              <div className="relative" ref={callbackRef}>
                <Button
                  size="sm"
                  onClick={() => {
                    setCallbackOpen(!callbackOpen);
                    setCallbackSent(false);
                    setCallbackPhone("+7");
                  }}
                  className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-0 text-white shadow-lg shadow-orange-500/30 gap-1.5 text-xs md:text-sm"
                >
                  <Icon name="PhoneCall" className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Заказать звонок</span>
                  <span className="sm:hidden">Звонок</span>
                </Button>

                {/* Callback modal/dropdown */}
                {callbackOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 animate-fade-in">
                    {callbackSent ? (
                      <div className="text-center py-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                          <Icon
                            name="Check"
                            className="h-6 w-6 text-green-600"
                          />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          Заявка отправлена!
                        </p>
                        <p className="text-xs text-gray-500">
                          Перезвоним в течение 5 минут!
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-3 text-xs text-gray-400"
                          onClick={() => setCallbackOpen(false)}
                        >
                          Закрыть
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          Заказать обратный звонок
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                          Перезвоним в течение 5 минут
                        </p>
                        <input
                          type="tel"
                          value={callbackPhone}
                          onChange={(e) =>
                            setCallbackPhone(formatPhone(e.target.value))
                          }
                          placeholder="+7 (___) ___-__-__"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all mb-3"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={handleCallbackSubmit}
                          disabled={
                            callbackPhone.replace(/\D/g, "").length < 11 ||
                            callbackLoading
                          }
                          className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-0 text-white shadow-lg shadow-orange-500/30"
                        >
                          {callbackLoading ? (
                            <Icon
                              name="Loader2"
                              className="h-4 w-4 animate-spin"
                            />
                          ) : (
                            "Перезвоните мне"
                          )}
                        </Button>
                        <p className="text-[10px] text-gray-300 mt-2 text-center leading-tight">
                          Нажимая кнопку, вы соглашаетесь с{" "}
                          <a
                            href="/privacy"
                            className="underline hover:text-gray-500"
                          >
                            политикой конфиденциальности
                          </a>
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Divider - desktop only */}
              <div className="hidden md:block w-px h-6 bg-white/15" />

              {/* For companies - desktop only */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/tariffs")}
                className="hidden md:flex rounded-full border-white/25 text-white/80 hover:bg-white/15 hover:text-white gap-1.5"
              >
                <Icon name="Building2" className="h-3.5 w-3.5" />
                Для компаний
              </Button>

              {/* Auth buttons */}
              {user ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/account")}
                    className="rounded-full border-white/20 text-white/80 hover:bg-white/10 gap-1.5"
                  >
                    <Icon name="User" className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Личный кабинет</span>
                    <span className="md:hidden">ЛК</span>
                  </Button>
                  {user.role === "admin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/admin")}
                      className="hidden md:flex rounded-full border-white/20 text-white/80 hover:bg-white/10"
                    >
                      <Icon name="Shield" className="mr-1.5 h-4 w-4" />
                      Админ
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="hidden md:flex rounded-full text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Icon name="LogOut" className="mr-1.5 h-4 w-4" />
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="hidden md:flex rounded-full text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Войти
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/register")}
                    className="hidden md:flex rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 shadow-none gap-1.5"
                  >
                    <Icon name="UserPlus" className="h-3.5 w-3.5" />
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
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                И РАСЧЁТ СТОИМОСТИ ЗА МИНУТЫ
              </span>
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
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${section.gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}
                />
                <div className="relative bg-white/8 backdrop-blur-sm rounded-2xl p-4 border border-white/10 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/12 group-hover:-translate-y-1 text-center flex flex-col items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <span className="text-xl">{section.emoji}</span>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold tracking-wide text-white/90 leading-tight mb-1">
                      {section.title}
                    </h2>
                    <p className="text-white/40 text-[11px] leading-snug line-clamp-2">
                      {section.description}
                    </p>
                  </div>
                  <div
                    className={`w-full h-0.5 rounded-full bg-gradient-to-r ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Ready Projects CTA */}
          <div
            className="mt-8 flex justify-center animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <button
              onClick={() => navigate("/ready-projects")}
              className="group flex items-center gap-3 bg-gradient-to-r from-amber-400/20 to-orange-500/20 hover:from-amber-400/30 hover:to-orange-500/30 border border-amber-400/30 hover:border-amber-400/60 backdrop-blur-sm rounded-full px-7 py-3.5 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40 shrink-0">
                <Icon name="FileText" className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm leading-none mb-0.5">
                  ГОТОВЫЕ ДИЗАЙН-ПРОЕКТЫ
                </div>
                <div className="text-white/50 text-xs">
                  46, 65 и 98 м² — со сметами, материалами и мебелью
                </div>
              </div>
              <Icon
                name="ChevronRight"
                className="h-4 w-4 text-amber-400 group-hover:translate-x-1 transition-transform ml-1"
              />
            </button>
          </div>

          {/* Stats bar */}
          <div
            className="mt-6 flex justify-center animate-fade-in"
            style={{ animationDelay: "500ms" }}
          >
            <div className="inline-flex items-center gap-6 bg-white/8 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ring-2 ring-white/10 text-xs">
                    🏠
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white/10 text-xs">
                    🔧
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center ring-2 ring-white/10 text-xs">
                    📐
                  </div>
                </div>
                <span className="text-sm text-white/50">
                  Проверенные мастера
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <span className="text-sm text-white/50">
                  Рейтинг{" "}
                  <strong className="text-white/80">4.8</strong>
                </span>
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