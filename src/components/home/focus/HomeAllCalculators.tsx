import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const GROUPS = [
  {
    title: "Отделка и работы",
    items: [
      { label: "Окна", path: "/windows" },
      { label: "Потолки", path: "/ceilings" },
      { label: "Полы", path: "/flooring" },
      { label: "Электрика", path: "/electrics" },
      { label: "Санузел", path: "/bathroom" },
      { label: "Новостройка", path: "/newbuild" },
    ],
  },
  {
    title: "Строительство",
    items: [
      { label: "Ремонт под ключ", path: "/turnkey" },
      { label: "Баня", path: "/bathhouse" },
      { label: "Каркасный дом", path: "/framehouse" },
      { label: "Офис и коммерция", path: "/office" },
    ],
  },
  {
    title: "Дополнительно",
    items: [
      { label: "Дизайн-проект", path: "/designer" },
      { label: "Смета по ТЗ", path: "/tender" },
      { label: "Проверка договора", path: "/contract-audit" },
      { label: "Хоумстейджинг", path: "/homestaging" },
      { label: "Мебель", path: "/furniture" },
      { label: "Органайзер ремонта", path: "/organizer" },
      { label: "ИИ-эксперт", path: "/expert" },
    ],
  },
];

export default function HomeAllCalculators() {
  return (
    <section className="bg-[#fafaf8] py-16 sm:py-20 border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-center">
          Нужен расчёт по отдельным работам
        </h2>
        <p className="mt-2.5 text-center text-gray-500">
          Если вас интересует не весь ремонт, а конкретное направление
        </p>

        <div className="grid sm:grid-cols-3 gap-x-8 gap-y-7 mt-9">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2.5">
                {g.title}
              </p>
              <ul className="space-y-1">
                {g.items.map((it) => (
                  <li key={it.path}>
                    <Link
                      to={it.path}
                      className="group flex items-center gap-1.5 py-1 text-[15px] text-gray-700 hover:text-amber-600 transition"
                    >
                      {it.label}
                      <Icon
                        name="ArrowRight"
                        size={13}
                        className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
