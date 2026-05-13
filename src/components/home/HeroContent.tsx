import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import reachGoal from "@/lib/metrika";

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  emoji: string;
  icon: string;
  gradient: string;
  glow: string;
  path: string;
  requireAuth: boolean;
  logo?: string;
  external?: boolean;
}

interface HeroContentProps {
  user: User | null;
  regionLabel: string;
  sections: Section[];
}

export default function HeroContent({ user, regionLabel, sections }: HeroContentProps) {
  const navigate = useNavigate();

  const handleNavigate = (section: Section) => {
    reachGoal("home_hero_click", { section: section.id, path: section.path });
    if (section.external) {
      window.open(section.path, "_blank", "noopener");
      return;
    }
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
    <>
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
              {section.external && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/15 backdrop-blur text-[9px] font-bold text-white/90 leading-none border border-white/20">
                  <Icon name="ExternalLink" size={8} />
                  Партнёр
                </span>
              )}
              <div
                className={`w-11 h-11 rounded-xl ${section.logo ? "bg-white p-1" : `bg-gradient-to-br ${section.gradient}`} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 overflow-hidden`}
              >
                {section.logo ? (
                  <img
                    src={section.logo}
                    alt={section.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xl">{section.emoji}</span>
                )}
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
    </>
  );
}