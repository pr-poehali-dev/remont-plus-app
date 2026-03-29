import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

export default function HeroBottomBar() {
  const navigate = useNavigate();

  return (
    <>
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
    </>
  );
}