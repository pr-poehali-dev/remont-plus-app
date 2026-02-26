import type { BathLayout, RoofType, WallMaterial } from "./BathHouseTypes";
import { ExteriorSVG } from "./BathHouseExterior";

export interface BathTemplate {
  id: string;
  name: string;
  subtitle: string;
  area: string;
  style: string;
  roofType: RoofType;
  wallMaterial: WallMaterial;
  layout: BathLayout;
  terrace: boolean;
  description: string;
  tags: string[];
}

export const BATH_TEMPLATES: BathTemplate[] = [
  {
    id: "classic_log",
    name: "Русская классика",
    subtitle: "Сруб из бревна",
    area: "24–30 м²",
    style: "russian_classic",
    roofType: "gable",
    wallMaterial: "log_rounded",
    layout: "3room",
    terrace: false,
    description: "Традиционная баня из круглого бревна с двускатной крышей. Максимальный жар, настоящий русский пар.",
    tags: ["Популярная", "Традиционная"],
  },
  {
    id: "modern_frame",
    name: "Современная каркасная",
    subtitle: "Каркас + имитация бруса",
    area: "20–28 м²",
    style: "modern_minimalist",
    roofType: "flat_single",
    wallMaterial: "frame_sip",
    layout: "3room",
    terrace: true,
    description: "Минималистичный дизайн, быстрый прогрев, панорамные окна. Строится за 2–3 месяца.",
    tags: ["Быстро", "Экономично"],
  },
  {
    id: "scandinavian",
    name: "Скандинавская",
    subtitle: "Профилированный брус",
    area: "22–32 м²",
    style: "scandinavian",
    roofType: "gable",
    wallMaterial: "timber_profiled",
    layout: "3room",
    terrace: true,
    description: "Сухой пар, электрическая печь, светлая отделка осиной. Терраса с видом на природу.",
    tags: ["Сухой пар", "Эстетика"],
  },
  {
    id: "house_bath",
    name: "Дом-баня",
    subtitle: "2 этажа: баня + жильё",
    area: "45–70 м²",
    style: "modern_minimalist",
    roofType: "mansard",
    wallMaterial: "timber_glued",
    layout: "house_bath",
    terrace: true,
    description: "Первый этаж — полноценная баня. Мансарда — спальня или комната отдыха для гостей.",
    tags: ["Два в одном", "Клееный брус"],
  },
  {
    id: "brick_classic",
    name: "Кирпичная",
    subtitle: "Долговечная классика",
    area: "28–40 м²",
    style: "russian_classic",
    roofType: "hip",
    wallMaterial: "brick",
    layout: "4room",
    terrace: false,
    description: "Кирпич держит тепло часами. Вальмовая крыша, 4 помещения, кирпичная печь-каменка.",
    tags: ["Долговечность", "Солидность"],
  },
  {
    id: "eco_log",
    name: "Эко-баня",
    subtitle: "Рубленый вручную сруб",
    area: "18–24 м²",
    style: "eco_natural",
    roofType: "gable",
    wallMaterial: "log_hand",
    layout: "2room",
    terrace: false,
    description: "Компактная баня из ручного сруба. Минимум химии, максимум природы. Идеальна для небольших участков.",
    tags: ["Компактная", "Природность"],
  },
  {
    id: "finnish_electric",
    name: "Финская сауна",
    subtitle: "Каркас + электропечь",
    area: "16–22 м²",
    style: "finnish_sauna",
    roofType: "flat_single",
    wallMaterial: "frame_osb",
    layout: "2room",
    terrace: false,
    description: "Сухой сауна-режим 80–100°C. Быстрый разогрев за 20 минут. Электропечь без дымохода.",
    tags: ["Без дымохода", "Быстрый разогрев"],
  },
  {
    id: "glued_mansard",
    name: "Баня с мансардой",
    subtitle: "Клееный брус + мансарда",
    area: "35–50 м²",
    style: "modern_minimalist",
    roofType: "mansard",
    wallMaterial: "timber_glued",
    layout: "3room",
    terrace: true,
    description: "Мансардная крыша даёт дополнительное пространство. Клееный брус — без усадки, отделка сразу.",
    tags: ["Без усадки", "Мансарда"],
  },
  {
    id: "gazebo_bath",
    name: "Баня-беседка",
    subtitle: "Компакт на свайном фундаменте",
    area: "12–18 м²",
    style: "eco_natural",
    roofType: "hip",
    wallMaterial: "frame_sip",
    layout: "2room",
    terrace: false,
    description: "Небольшая баня для 2–3 человек. Свайный фундамент, быстрый монтаж, минимальная площадь участка.",
    tags: ["Мини-баня", "Свайный фундамент"],
  },
  {
    id: "gas_block",
    name: "Баня из газоблока",
    subtitle: "Бюджетно и надёжно",
    area: "24–36 м²",
    style: "russian_classic",
    roofType: "gable",
    wallMaterial: "block_gas",
    layout: "3room",
    terrace: false,
    description: "Газобетонные блоки + тщательная гидро/пароизоляция. Дешевле кирпича, теплее каркаса.",
    tags: ["Бюджетно", "Надёжно"],
  },
];

interface TemplateCardProps {
  tpl: BathTemplate;
  selected: boolean;
  onSelect: () => void;
}

export function BathTemplateCard({ tpl, selected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
        selected ? "border-amber-500 shadow-amber-200 shadow-md" : "border-gray-200 hover:border-amber-300"
      }`}
    >
      <div className="bg-slate-800 h-28 overflow-hidden relative">
        <ExteriorSVG roofType={tpl.roofType} wallMaterial={tpl.wallMaterial} terrace={tpl.terrace} />
        {selected && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            ✓ Выбрана
          </div>
        )}
      </div>
      <div className="p-2.5 bg-white">
        <div className="font-bold text-xs text-gray-900 truncate">{tpl.name}</div>
        <div className="text-[10px] text-gray-500 truncate">{tpl.subtitle}</div>
        <div className="text-[10px] text-amber-700 font-semibold mt-1">{tpl.area}</div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {tpl.tags.map(tag => (
            <span key={tag} className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-full border border-amber-200">{tag}</span>
          ))}
        </div>
      </div>
    </button>
  );
}
