import Icon from "@/components/ui/icon";

interface Props {
  onCalcClick: () => void;
}

export default function HomeFinalCta({ onCalcClick }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#0f0f13] py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-52 left-1/2 -translate-x-1/2 w-[760px] h-[760px] rounded-full
                   bg-[radial-gradient(circle,rgba(251,191,36,0.14),transparent_62%)]"
      />
      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Узнайте, сколько стоит ваш ремонт
        </h2>
        <p className="mt-4 text-lg text-gray-400 leading-relaxed">
          Две минуты — и у вас на руках понятный расчёт вместо приблизительной
          цифры от знакомого прораба
        </p>

        <button
          onClick={onCalcClick}
          className="mt-8 h-14 px-8 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-lg font-bold
                     shadow-lg shadow-amber-400/25 transition inline-flex items-center gap-2"
        >
          <Icon name="Calculator" size={20} />
          Рассчитать смету
        </button>

        <p className="mt-3.5 text-sm text-gray-500">
          Бесплатно · Без регистрации · Результат сразу
        </p>
      </div>
    </section>
  );
}
