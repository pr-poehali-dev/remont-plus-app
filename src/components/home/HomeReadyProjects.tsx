import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const PREVIEW = [
  {
    area: 46,
    title: "Скандинавская студия",
    style: "Скандинавский минимализм",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/7e2f316a-c808-49e8-b8ae-16ae1e9680ca.jpg",
    budget: "1 850 000 ₽",
    works: "660 000 ₽",
    materials: "340 000 ₽",
    furniture: "510 000 ₽",
    accentFrom: "from-sky-400",
    accentTo: "to-blue-600",
    tags: ["Студия", "Светлый"],
    positions: 74,
  },
  {
    area: 65,
    title: "Тёплый Contemporary",
    style: "Contemporary / Неоклассика",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/a2fbe211-d0d5-4557-8951-884aa6342a3c.jpg",
    budget: "2 900 000 ₽",
    works: "1 050 000 ₽",
    materials: "600 000 ₽",
    furniture: "990 000 ₽",
    accentFrom: "from-amber-400",
    accentTo: "to-orange-500",
    tags: ["2 комнаты", "Паркет ёлочкой"],
    positions: 98,
  },
  {
    area: 98,
    title: "Премиальный Dark Lux",
    style: "Ар-деко / Dark Luxury",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/8745757e-34a3-4da5-8895-30f4dec98106.jpg",
    budget: "от 9 500 000 ₽",
    works: "2 400 000 ₽",
    materials: "3 200 000 ₽",
    furniture: "4 600 000 ₽",
    accentFrom: "from-violet-500",
    accentTo: "to-purple-700",
    tags: ["3 комнаты", "Мрамор"],
    positions: 126,
  },
];

export default function HomeReadyProjects() {
  const navigate = useNavigate();

  return (
    <section className="mb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
            Готовые решения
          </span>
          <h2 className="text-3xl font-black text-gray-900 mt-1">
            Готовые дизайн-проекты
          </h2>
          <p className="text-gray-500 mt-2 max-w-md text-sm leading-relaxed">
            Три полноценных проекта — со сметами работ, спецификацией материалов с брендами и подборкой мебели для 46, 65 и 98 м².
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full px-5 shrink-0"
          onClick={() => navigate("/ready-projects")}
        >
          Смотреть все проекты
          <Icon name="ArrowRight" size={16} className="ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PREVIEW.map((p) => (
          <div
            key={p.area}
            className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/ready-projects")}
          >
            {/* Фото */}
            <div className="relative h-52 overflow-hidden">
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div
                className={`absolute top-3 left-3 bg-gradient-to-r ${p.accentFrom} ${p.accentTo} text-white text-xs font-black px-3 py-1.5 rounded-full shadow`}
              >
                {p.area} м²
              </div>
              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white/90 text-xs font-semibold px-2.5 py-1 rounded-full">
                {p.positions} позиций
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-white font-black text-lg leading-snug">{p.title}</h3>
                <p className="text-white/65 text-xs mt-0.5">{p.style}</p>
              </div>
            </div>

            {/* Контент */}
            <div className="p-5">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Мини-смета */}
              <div className="space-y-1.5 mb-4">
                {[
                  { label: "Работы", value: p.works },
                  { label: "Материалы", value: p.materials },
                  { label: "Мебель", value: p.furniture },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">{row.label}</span>
                    <span className="text-gray-600 font-medium tabular-nums">{row.value}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-semibold">Итого</span>
                  <span className="font-black text-gray-900 text-sm tabular-nums">{p.budget}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 text-orange-500 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Открыть смету
                <Icon name="ChevronRight" size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
