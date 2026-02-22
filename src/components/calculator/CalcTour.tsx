import PageTour from "@/components/ui/PageTour";
import type { TourStep } from "@/components/ui/PageTour";

const STEPS: TourStep[] = [
  {
    title: "Выберите регион",
    text: "Цены на работы отличаются по регионам. Укажите ваш город, чтобы расчёт был точным.",
    icon: "MapPin",
  },
  {
    title: "Добавляйте работы из прайса",
    text: "Нажмите «Добавить из прайса» — выберите нужные виды работ с актуальными ценами.",
    icon: "ClipboardList",
  },
  {
    title: "Используйте шаблоны",
    text: "Готовые наборы работ для типовых помещений — кухня, ванная, спальня. Экономит время.",
    icon: "LayoutTemplate",
  },
  {
    title: "Смета и КП для печати",
    text: "Когда добавите позиции — нажмите «Скачать PDF» и получите готовый документ с вашими реквизитами.",
    icon: "FileText",
  },
];

export default function CalcTour() {
  return <PageTour tourKey="calc_tour_done" steps={STEPS} />;
}
