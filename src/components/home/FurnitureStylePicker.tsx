import Icon from "@/components/ui/icon";
import { STYLES } from "./furnitureData";

interface FurnitureStylePickerProps {
  selectedStyle: string;
  onSelectStyle: (id: string) => void;
  onNext: () => void;
}

export default function FurnitureStylePicker({
  selectedStyle,
  onSelectStyle,
  onNext,
}: FurnitureStylePickerProps) {
  return (
    <section className="py-10">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-2">Шаг 1 из 2</p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Выберите стиль интерьера</h2>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Стиль влияет на подбор мебели, материалы и итоговую стоимость комплекта
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
        {STYLES.map((s) => {
          const active = s.id === selectedStyle;
          return (
            <button
              key={s.id}
              onClick={() => onSelectStyle(s.id)}
              className="group relative rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                boxShadow: active ? `0 0 0 3px ${s.accent}` : "0 1px 3px rgba(0,0,0,.08)",
              }}
            >
              <div className="aspect-[4/5] relative">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {active && (
                  <div
                    className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: s.accent }}
                  >
                    <Icon name="Check" size={16} className="text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                  <p className="text-white font-bold text-sm">{s.title}</p>
                  <p className="text-white/70 text-xs mt-0.5">{s.subtitle}</p>
                  {s.priceMultiplier > 1 && (
                    <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white/90 backdrop-blur-sm">
                      +{Math.round((s.priceMultiplier - 1) * 100)}% к стоимости
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={onNext}
          className="px-8 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
        >
          Далее — подбор мебели
          <Icon name="ArrowRight" size={18} />
        </button>
      </div>
    </section>
  );
}
