import type { BathLayout, RoofType, WallMaterial } from "./BathHouseTypes";

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
  photo: string;
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
    photo: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/f09b557d-23a5-4636-8a15-e99534d7e066.jpg",
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
    photo: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3963f0b7-a54f-486b-84a6-1ef06ee780fe.jpg",
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
    photo: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/877840ca-f7f7-4da4-b2bb-a868c60ee2a6.jpg",
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
    photo: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/9a7e8f8c-3a5a-4427-8df2-ecccfdd37c46.jpg",
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
    photo: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/636e0277-c5df-4e66-a6cd-f805e76ef461.jpg",
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
    photo: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/beaa9c86-b9ef-4ae6-83db-d56e80125f9f.jpg",
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
    photo: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/13655425-586e-455c-916e-7b69684b32c4.jpg",
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
    photo: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/6f445070-d676-428a-bdfb-9a6a1089bcdc.jpg",
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
    photo: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/70ce5f0f-c612-45f7-9880-720d703b2fad.jpg",
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
    photo: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/f4442ff7-bacd-41b8-be35-71c3cc272f73.jpg",
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
      <div className="h-28 overflow-hidden relative bg-slate-100">
        <img
          src={tpl.photo}
          alt={tpl.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {selected && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
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
