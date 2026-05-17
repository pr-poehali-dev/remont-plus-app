import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const footerLinks = [
  {
    title: "Услуги",
    items: [
      { label: "Калькулятор ремонта", href: "/calculator" },
      { label: "Подрядчики", href: "/masters" },
      { label: "Дизайн интерьера", href: "/designer" },
      { label: "Хоумстейджинг", href: "/homestaging" },
      { label: "Готовые проекты", href: "/ready-projects" },
    ],
  },
  {
    title: "Каталог",
    items: [
      { label: "Материалы", href: "/catalog" },
      { label: "Поставщики", href: "/suppliers" },
      { label: "Шоурум", href: "/showroom" },
      { label: "Цены на материалы", href: "/prices" },
      { label: "Мебель", href: "/furniture" },
    ],
  },
  {
    title: "Компания",
    items: [
      { label: "Тарифы", href: "/tariffs" },
      { label: "Блог", href: "/blog" },
      { label: "Партнёрам", href: "/partner" },
      { label: "Эксперт", href: "/expert" },
    ],
  },
  {
    title: "Документы",
    items: [
      { label: "Политика конфиденциальности", href: "/privacy" },
      { label: "Пользовательское соглашение", href: "/terms" },
    ],
  },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Icon name="Hammer" className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Авангард Строй</span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              Платформа для ремонта и строительства: калькуляторы, подрядчики, дизайн и материалы в одном месте.
            </p>
            <div className="flex gap-3">
              <a
                href="https://t.me/+QgiLIa1gFRY4Y2Iy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 transition-colors flex items-center justify-center"
              >
                <Icon name="Send" className="w-4 h-4" />
              </a>
              <a
                href="mailto:info@avangard-stroy.ru"
                aria-label="Email"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 transition-colors flex items-center justify-center"
              >
                <Icon name="Mail" className="w-4 h-4" />
              </a>
              <a
                href="tel:+78001234567"
                aria-label="Телефон"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 transition-colors flex items-center justify-center"
              >
                <Icon name="Phone" className="w-4 h-4" />
              </a>
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            © {year} Авангард Строй. Все права защищены.
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Конфиденциальность
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Условия
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
