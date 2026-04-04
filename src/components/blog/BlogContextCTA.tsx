import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import reachGoal from "@/lib/metrika";

interface CalcLink {
  path: string;
  title: string;
  description: string;
  icon: string;
  emoji: string;
  gradient: string;
  btnColor: string;
  btnLabel: string;
}

const CALC_LINKS: CalcLink[] = [
  { path: "/bathroom", title: "Калькулятор ванной", description: "Плитка, сантехника, гидроизоляция, тёплый пол — точная смета за 3 минуты", icon: "Droplets", emoji: "🚿", gradient: "from-teal-500 to-cyan-600", btnColor: "bg-teal-600 hover:bg-teal-700", btnLabel: "Рассчитать ванную" },
  { path: "/windows", title: "Калькулятор окон", description: "ПВХ, алюминий, стеклопакеты — расчёт с чертежом и сметой", icon: "AppWindow", emoji: "🪟", gradient: "from-sky-500 to-blue-600", btnColor: "bg-sky-600 hover:bg-sky-700", btnLabel: "Рассчитать окна" },
  { path: "/ceilings", title: "Калькулятор потолков", description: "Натяжные потолки ПВХ и тканевые — расчёт с освещением", icon: "Layers", emoji: "🏠", gradient: "from-violet-500 to-purple-600", btnColor: "bg-violet-600 hover:bg-violet-700", btnLabel: "Рассчитать потолки" },
  { path: "/flooring", title: "Калькулятор полов", description: "Ламинат, плитка, паркет, SPC — расчёт с монтажом", icon: "SquareStack", emoji: "🪵", gradient: "from-amber-500 to-orange-600", btnColor: "bg-amber-600 hover:bg-amber-700", btnLabel: "Рассчитать полы" },
  { path: "/electrics", title: "Калькулятор электрики", description: "Розетки, кабели, щиток, автоматы — полная смета", icon: "Zap", emoji: "⚡", gradient: "from-blue-500 to-indigo-600", btnColor: "bg-blue-600 hover:bg-blue-700", btnLabel: "Рассчитать электрику" },
  { path: "/newbuild", title: "Калькулятор новостройки", description: "Ремонт с нуля: стяжка, штукатурка, электрика, полы — по помещениям", icon: "Building2", emoji: "🏗️", gradient: "from-orange-500 to-red-600", btnColor: "bg-orange-600 hover:bg-orange-700", btnLabel: "Рассчитать ремонт" },
  { path: "/turnkey", title: "Ремонт под ключ", description: "Полный расчёт квартиры — все работы и материалы в одной смете", icon: "KeyRound", emoji: "🔑", gradient: "from-emerald-500 to-teal-600", btnColor: "bg-emerald-600 hover:bg-emerald-700", btnLabel: "Рассчитать под ключ" },
  { path: "/bathhouse", title: "Калькулятор бани", description: "Строительство бани с нуля — брус, каркас, печь, вентиляция", icon: "Flame", emoji: "🪵", gradient: "from-amber-600 to-orange-700", btnColor: "bg-amber-700 hover:bg-amber-800", btnLabel: "Рассчитать баню" },
  { path: "/framehouse", title: "Калькулятор каркасного дома", description: "OSB, SIP, ЛСТК — фундамент, фасад, утепление, коммуникации", icon: "Home", emoji: "🏗", gradient: "from-green-600 to-emerald-700", btnColor: "bg-green-700 hover:bg-green-800", btnLabel: "Рассчитать дом" },
  { path: "/designer", title: "ИИ-дизайнер интерьера", description: "Создайте дизайн-проект с планировкой, цветами и материалами", icon: "Palette", emoji: "🎨", gradient: "from-rose-500 to-pink-600", btnColor: "bg-rose-600 hover:bg-rose-700", btnLabel: "Создать проект" },
  { path: "/office", title: "Калькулятор офиса", description: "Ремонт офисов и коммерческих помещений — вентиляция, сигнализация", icon: "Building2", emoji: "🏢", gradient: "from-slate-500 to-blue-700", btnColor: "bg-slate-700 hover:bg-slate-800", btnLabel: "Рассчитать офис" },
];

const KEYWORD_MAP: [RegExp, string[]][] = [
  [/ванн|санузел|душ|плитк[аиуео]|сантехник|гидроизоляц|унитаз|раковин|смесител/i, ["/bathroom"]],
  [/окн[аоу]|стеклопакет|остеклен|профиль.*окон|пвх.*окн|балкон.*остекл/i, ["/windows"]],
  [/потолк|натяжн|светильник|точечн.*свет|люстр/i, ["/ceilings"]],
  [/пол[ыу]|ламинат|паркет|плитк.*пол|spc|ковролин|стяжк.*пол|тёплый.*пол|теплый.*пол|напольн/i, ["/flooring"]],
  [/электрик|розетк|выключател|кабел|проводк|щит[ок]|автомат.*электр|узо/i, ["/electrics"]],
  [/новостройк|черновой.*ремонт|ремонт.*нул|стяжк[аиуе]|штукатурк/i, ["/newbuild"]],
  [/под.*ключ|капитальн.*ремонт|ремонт.*квартир|полн.*ремонт/i, ["/turnkey"]],
  [/бан[яиюе]|парн[аяуо]|сауна|печ[ьи].*бан|парилк/i, ["/bathhouse"]],
  [/каркасн.*дом|каркасник|sip.*панел|осб|osb.*дом|фундамент.*дом/i, ["/framehouse"]],
  [/дизайн.*проект|интерьер.*дизайн|стиль.*интерьер|планировк|визуализаци/i, ["/designer"]],
  [/офис|коммерческ.*помещен|open.*space|опен.*спейс/i, ["/office"]],
  [/кухн[яиюе]|кухонн|фартук.*кухн|гарнитур/i, ["/turnkey", "/designer"]],
  [/ремонт|смет[аыуе]|бюджет.*ремонт|стоимост.*ремонт|расчёт|расчет/i, ["/turnkey"]],
];

function detectCalcs(category: string, title: string, content: string): CalcLink[] {
  const text = `${category} ${title} ${content}`.toLowerCase();
  const matched = new Set<string>();

  for (const [pattern, paths] of KEYWORD_MAP) {
    if (pattern.test(text)) {
      paths.forEach(p => matched.add(p));
    }
  }

  if (matched.size === 0) {
    matched.add("/turnkey");
  }

  const results: CalcLink[] = [];
  for (const path of matched) {
    const link = CALC_LINKS.find(l => l.path === path);
    if (link) results.push(link);
    if (results.length >= 2) break;
  }

  return results;
}

interface Props {
  category: string;
  title: string;
  content: string;
  slug?: string;
}

export default function BlogContextCTA({ category, title, content, slug }: Props) {
  const navigate = useNavigate();
  const calcs = detectCalcs(category, title, content);

  if (calcs.length === 0) return null;

  const handleClick = (calc: CalcLink) => {
    reachGoal("blog_cta_click", {
      slug: slug || "",
      category,
      calc_path: calc.path,
      calc_title: calc.title,
    });
    navigate(calc.path);
  };

  return (
    <div className="my-10 space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="flex items-center gap-1.5 font-medium">
          <Icon name="Calculator" size={14} />
          Рассчитайте стоимость
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {calcs.map(calc => (
        <div
          key={calc.path}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 cursor-pointer group"
          onClick={() => handleClick(calc)}
        >
          <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${calc.gradient} opacity-20 rounded-full -translate-y-20 translate-x-20 group-hover:opacity-30 transition-opacity`} />

          <div className="relative flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${calc.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
              <span className="text-2xl">{calc.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base mb-1">{calc.title}</p>
              <p className="text-gray-400 text-sm leading-snug mb-3">{calc.description}</p>
              <button className={`inline-flex items-center gap-2 ${calc.btnColor} text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors`}>
                {calc.btnLabel}
                <Icon name="ArrowRight" size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}