import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const PREVIEW_PROJECTS = [
  {
    area: 46,
    title: "Скандинавская студия",
    style: "Скандинавский",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0f811ec7-9d65-4386-bd57-b66969c73916.jpg",
    budget: "1 420 000 ₽",
    accent: "from-sky-400 to-blue-600",
  },
  {
    area: 65,
    title: "Тёплый Contemporary",
    style: "Contemporary",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/fc026756-2891-4aaf-bfa3-e57b99fe2a4d.jpg",
    budget: "2 180 000 ₽",
    accent: "from-amber-400 to-orange-500",
  },
  {
    area: 98,
    title: "Премиальный Dark Lux",
    style: "Лофт / Ар-деко",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/aa382c8a-8c03-4a36-a2cc-c746e0670257.jpg",
    budget: "3 950 000 ₽",
    accent: "from-violet-500 to-purple-700",
  },
];

export default function HomeReadyProjects() {
  const navigate = useNavigate();

  return (
    <section className="mb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">
            Готовые решения
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            Готовые дизайн-проекты
          </h2>
          <p className="text-gray-500 mt-2 max-w-md">
            Три полноценных проекта — со сметами, списками материалов и ценами на работы.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full px-5 shrink-0"
          onClick={() => navigate("/ready-projects")}
        >
          Все проекты
          <Icon name="ArrowRight" size={16} className="ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PREVIEW_PROJECTS.map((p) => (
          <div
            key={p.area}
            className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate("/ready-projects")}
          >
            <div className="relative h-52 overflow-hidden">
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className={`absolute top-3 left-3 bg-gradient-to-r ${p.accent} text-white text-xs font-bold px-3 py-1.5 rounded-full`}>
                {p.area} м²
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-white font-bold text-lg leading-tight">{p.title}</h3>
                <p className="text-white/70 text-xs mt-0.5">{p.style}</p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Бюджет проекта</div>
                  <div className="text-lg font-bold text-gray-900">{p.budget}</div>
                </div>
                <div className="flex items-center gap-1 text-orange-500 text-sm font-semibold group-hover:gap-2 transition-all">
                  Смета
                  <Icon name="ArrowRight" size={15} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
