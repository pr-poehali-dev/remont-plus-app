import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export interface Crumb {
  name: string;
  /** Путь от корня. У последнего элемента можно не указывать. */
  url?: string;
}

interface Props {
  items: Crumb[];
  /** Тёмный фон — светлый текст */
  dark?: boolean;
  className?: string;
}

/**
 * Хлебные крошки: видимая навигация + микроразметка в одном месте.
 * Разметку для поисковиков отдаёт breadcrumbJsonLd (SEOMeta) —
 * оба берут один и тот же массив, поэтому не расходятся.
 */
export default function Breadcrumbs({ items, dark = false, className = "" }: Props) {
  if (items.length === 0) return null;

  const base = dark ? "text-gray-400" : "text-gray-500";
  const link = dark ? "hover:text-white" : "hover:text-gray-900";
  const current = dark ? "text-white" : "text-gray-900";

  return (
    <nav aria-label="Хлебные крошки" className={`${className}`}>
      <ol className={`flex items-center flex-wrap gap-x-1.5 gap-y-1 text-sm ${base}`}>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <Icon name="ChevronRight" size={13} className="opacity-50 shrink-0" />}
              {last || !c.url ? (
                <span className={`font-medium ${current}`} aria-current="page">
                  {c.name}
                </span>
              ) : (
                <Link to={c.url} className={`${link} transition-colors`}>
                  {c.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
