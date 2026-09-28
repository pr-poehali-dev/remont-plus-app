import { forwardRef } from "react";
import QuickEstimateForm from "./QuickEstimateForm";

const FocusHero = forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <section ref={ref} className="relative overflow-hidden bg-[#0f0f13]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full
                   bg-[radial-gradient(circle,rgba(251,191,36,0.16),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]
                   bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
                   bg-[size:56px_56px]"
      />

      <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white leading-[1.1] tracking-tight">
              Смета на ремонт квартиры{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                за 2 минуты
              </span>
            </h1>

            <p className="mt-5 text-lg text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Укажите площадь и тип ремонта — получите расчёт работ и материалов
              с ценами по вашему городу. Без регистрации и звонков.
            </p>

            <ul className="mt-7 space-y-2.5 text-left max-w-md mx-auto lg:mx-0">
              {[
                "Каждая позиция с ценой — видно, из чего складывается сумма",
                "Отдельно работы, отдельно материалы",
                "Готовую смету можно скачать в PDF",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[15px] text-gray-400">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center lg:justify-end">
            <QuickEstimateForm />
          </div>
        </div>
      </div>
    </section>
  );
});

FocusHero.displayName = "FocusHero";

export default FocusHero;
