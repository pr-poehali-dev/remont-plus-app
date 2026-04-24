import HeroHeader from "./HeroHeader";
import HeroContent from "./HeroContent";
import HeroBottomBar from "./HeroBottomBar";

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
    id: "homestaging",
    title: "ХОУМСТЕЙДЖИНГ",
    description: "ИИ-анализ фото квартиры перед продажей или арендой — конкретные рекомендации, как повысить стоимость",
    emoji: "🏡",
    icon: "Home",
    gradient: "from-rose-400 via-pink-400 to-fuchsia-400",
    glow: "group-hover:shadow-pink-300/50",
    path: "/homestaging",
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

      <HeroHeader user={user} onLogout={onLogout} />

      {/* Hero content */}
      <main className="relative z-10 px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="w-full max-w-6xl mx-auto">
          <HeroContent user={user} regionLabel={regionLabel} sections={sections} />
          <HeroBottomBar />
        </div>
      </main>
    </div>
  );
}