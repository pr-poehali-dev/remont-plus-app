import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { PROJECTS, fmt, calcWorkTotal, calcMaterialsTotal, calcInteriorTotal } from "@/types/readyProjects";
import { ProjectCard } from "@/components/ready-projects/ProjectCard";

export default function ReadyProjects() {
  const navigate = useNavigate();

  const totals = PROJECTS.map((p) => ({
    id: p.id,
    work: calcWorkTotal(p),
    mat: calcMaterialsTotal(p),
    int: calcInteriorTotal(p),
    grand: calcWorkTotal(p) + calcMaterialsTotal(p) + calcInteriorTotal(p),
  }));

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Шапка */}
      <div className="bg-[#0f0f13] text-white">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-8"
          >
            <Icon name="ArrowLeft" size={16} />
            На главную
          </button>
          <span className="inline-block bg-white/10 text-white/70 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            Готовые решения
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Готовые дизайн-проекты
          </h1>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed mb-10">
            Три полноценных проекта со сметами работ, спецификацией материалов с брендами и подборкой мебели. Используйте как основу для своего ремонта или для запроса подрядчикам.
          </p>

          {/* Сводка по проектам */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PROJECTS.map((p, i) => {
              const t = totals[i];
              return (
                <div
                  key={p.id}
                  className={`bg-gradient-to-br ${p.accentFrom} ${p.accentTo} rounded-2xl p-5`}
                >
                  <div className="text-white font-black text-xl mb-0.5">{p.area} м²</div>
                  <div className="text-white/90 font-semibold text-sm mb-3">{p.title}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-white/70 text-xs">
                      <span>Работы</span>
                      <span className="tabular-nums">{fmt(t.work)}</span>
                    </div>
                    <div className="flex justify-between text-white/70 text-xs">
                      <span>Материалы</span>
                      <span className="tabular-nums">{fmt(t.mat)}</span>
                    </div>
                    <div className="flex justify-between text-white/70 text-xs">
                      <span>Мебель</span>
                      <span className="tabular-nums">{fmt(t.int)}</span>
                    </div>
                    <div className="border-t border-white/20 mt-2 pt-2 flex justify-between text-white font-black text-sm">
                      <span>Итого</span>
                      <span className="tabular-nums">{fmt(t.grand)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Карточки проектов */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-52 h-52 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Нужен индивидуальный проект?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
              Калькулятор рассчитает точную смету для вашей квартиры — с учётом площади, региона и выбранных материалов. Займёт 5 минут.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-8 font-bold shadow-xl text-base"
                onClick={() => navigate("/calculator")}
              >
                <Icon name="Calculator" size={18} className="mr-2" />
                Рассчитать смету
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/50 text-white hover:bg-white/20 rounded-full px-8 text-base bg-transparent"
                onClick={() => navigate("/expert")}
              >
                <Icon name="MessageCircle" size={18} className="mr-2" />
                Спросить ИИ-эксперта
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
