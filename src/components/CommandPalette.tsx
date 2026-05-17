import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const SEARCH_URL = "https://functions.poehali.dev/babf764d-7911-435e-9fee-941e1b0bdc20";

interface StaticItem {
  title: string;
  description: string;
  path: string;
  icon: string;
  keywords: string;
  group: "Калькуляторы" | "Сервисы" | "Каталог" | "Аккаунт";
}

const STATIC_ITEMS: StaticItem[] = [
  { title: "Калькулятор ремонта", description: "Смета за 2 минуты", path: "/calculator", icon: "Calculator", keywords: "ремонт смета калькулятор стоимость квартира", group: "Калькуляторы" },
  { title: "Новостройка", description: "Расчёт ремонта в новостройке", path: "/newbuild", icon: "Building2", keywords: "новостройка ремонт черновой чистовой", group: "Калькуляторы" },
  { title: "Ремонт под ключ", description: "Полный цикл работ", path: "/turnkey", icon: "Key", keywords: "под ключ полный готовый", group: "Калькуляторы" },
  { title: "Ванная комната", description: "Ремонт ванной и санузла", path: "/bathroom", icon: "Bath", keywords: "ванная санузел туалет плитка", group: "Калькуляторы" },
  { title: "Потолки", description: "Натяжные и подвесные", path: "/ceilings", icon: "Square", keywords: "потолок натяжной подвесной гипсокартон", group: "Калькуляторы" },
  { title: "Полы", description: "Расчёт укладки полов", path: "/flooring", icon: "LayoutGrid", keywords: "пол ламинат паркет плитка стяжка", group: "Калькуляторы" },
  { title: "Электрика", description: "Электромонтажные работы", path: "/electrics", icon: "Zap", keywords: "электрика проводка розетки щиток", group: "Калькуляторы" },
  { title: "Окна", description: "Установка окон", path: "/windows", icon: "Square", keywords: "окна пластиковые установка пвх", group: "Калькуляторы" },
  { title: "Баня", description: "Строительство бани", path: "/bathhouse", icon: "Flame", keywords: "баня сауна сруб", group: "Калькуляторы" },
  { title: "Каркасный дом", description: "Под ключ", path: "/framehouse", icon: "Home", keywords: "каркасный дом дача коттедж", group: "Калькуляторы" },
  { title: "Офис", description: "Ремонт офисов", path: "/office", icon: "Briefcase", keywords: "офис коммерческий", group: "Калькуляторы" },

  { title: "ИИ-эксперт", description: "Задать вопрос по интерьеру", path: "/expert", icon: "Sparkles", keywords: "ии эксперт чат гпт совет", group: "Сервисы" },
  { title: "Home Staging", description: "ИИ-визуализация интерьера", path: "/homestaging", icon: "Wand2", keywords: "хоумстейджинг фото визуализация ии", group: "Сервисы" },
  { title: "Шоурум", description: "Готовые проекты", path: "/showroom", icon: "Image", keywords: "шоурум готовые портфолио проекты", group: "Сервисы" },
  { title: "Дизайнер", description: "Заказать дизайн-проект", path: "/designer", icon: "Pencil", keywords: "дизайнер проект интерьер", group: "Сервисы" },
  { title: "Органайзер ремонта", description: "Чек-листы и этапы", path: "/organizer", icon: "ClipboardList", keywords: "органайзер план этапы чеклист", group: "Сервисы" },
  { title: "Готовые проекты", description: "Купить готовый проект", path: "/ready-projects", icon: "FolderOpen", keywords: "готовые типовые проекты", group: "Сервисы" },
  { title: "Планировщик", description: "Интерьер 3D", path: "/interior-planner", icon: "Box", keywords: "планировщик 3д интерьер", group: "Сервисы" },

  { title: "Подрядчики и мастера", description: "Найти специалиста", path: "/masters", icon: "Users", keywords: "мастера подрядчики строители рабочие", group: "Каталог" },
  { title: "Каталог материалов", description: "Цены на материалы", path: "/catalog", icon: "Package", keywords: "каталог материалы стройматериалы", group: "Каталог" },
  { title: "Мебель", description: "Купить мебель", path: "/furniture", icon: "Armchair", keywords: "мебель диван шкаф стол", group: "Каталог" },
  { title: "Прайс-лист работ", description: "Цены на работы", path: "/prices", icon: "ListOrdered", keywords: "прайс цены работы расценки", group: "Каталог" },
  { title: "Поставщики", description: "База поставщиков", path: "/suppliers", icon: "Truck", keywords: "поставщики база магазины", group: "Каталог" },
  { title: "Блог", description: "Статьи о ремонте", path: "/blog", icon: "BookOpen", keywords: "блог статьи советы", group: "Каталог" },

  { title: "Личный кабинет", description: "Подписка и платежи", path: "/account", icon: "User", keywords: "кабинет личный профиль", group: "Аккаунт" },
  { title: "Тарифы", description: "Выбрать подписку", path: "/tariffs", icon: "Crown", keywords: "тарифы подписка цены платно", group: "Аккаунт" },
  { title: "Войти", description: "Авторизация", path: "/login", icon: "LogIn", keywords: "вход авторизация логин", group: "Аккаунт" },
  { title: "Регистрация", description: "Создать аккаунт", path: "/register", icon: "UserPlus", keywords: "регистрация аккаунт", group: "Аккаунт" },
];

interface PostHit {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  image_url: string;
}

interface MasterHit {
  id: number;
  full_name: string;
  location: string;
  specializations: string[];
  rating: number;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [posts, setPosts] = useState<PostHit[]>([]);
  const [masters, setMasters] = useState<MasterHit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Сброс при открытии
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setPosts([]);
      setMasters([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ESC + блокировка скролла
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Поиск по бэку с debounce
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setPosts([]);
      setMasters([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(SEARCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          setPosts(Array.isArray(data?.posts) ? data.posts : []);
          setMasters(Array.isArray(data?.masters) ? data.masters : []);
        })
        .catch(() => {});
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open]);

  // Фильтр статических элементов
  const q = query.trim().toLowerCase();
  const staticFiltered = q
    ? STATIC_ITEMS.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q) ||
          it.keywords.toLowerCase().includes(q)
      )
    : STATIC_ITEMS.slice(0, 8);

  // Плоский список для навигации
  const flatItems: Array<{ type: "static" | "post" | "master"; data: StaticItem | PostHit | MasterHit }> = [
    ...staticFiltered.map((s) => ({ type: "static" as const, data: s })),
    ...posts.map((p) => ({ type: "post" as const, data: p })),
    ...masters.map((m) => ({ type: "master" as const, data: m })),
  ];

  useEffect(() => {
    setActiveIdx(0);
  }, [query, posts.length, masters.length]);

  const handleSelect = (idx: number) => {
    const item = flatItems[idx];
    if (!item) return;
    if (item.type === "static") {
      navigate((item.data as StaticItem).path);
    } else if (item.type === "post") {
      navigate(`/blog/${(item.data as PostHit).slug}`);
    } else if (item.type === "master") {
      navigate(`/masters?id=${(item.data as MasterHit).id}`);
    }
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(activeIdx);
    }
  };

  if (!open) return null;

  // Группировка static
  const groups: Record<string, StaticItem[]> = {};
  staticFiltered.forEach((it) => {
    groups[it.group] = groups[it.group] || [];
    groups[it.group].push(it);
  });

  let runningIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[10vh] bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-top-4 duration-200"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800">
          <Icon name="Search" className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Найти страницу, статью, мастера…"
            className="flex-1 py-4 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-[15px]"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {flatItems.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              <Icon name="SearchX" className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              Ничего не нашли. Попробуйте другие слова.
            </div>
          )}

          {/* Static items grouped */}
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-1">
              <div className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                {group}
              </div>
              {items.map((it) => {
                const idx = runningIdx++;
                const active = idx === activeIdx;
                return (
                  <button
                    key={it.path}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                      active
                        ? "bg-orange-50 dark:bg-orange-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        active
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <Icon name={it.icon} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {it.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {it.description}
                      </div>
                    </div>
                    {active && (
                      <Icon name="CornerDownLeft" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Blog posts */}
          {posts.length > 0 && (
            <div className="mb-1">
              <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                Статьи блога
              </div>
              {posts.map((p) => {
                const idx = runningIdx++;
                const active = idx === activeIdx;
                return (
                  <button
                    key={`post-${p.id}`}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                      active
                        ? "bg-orange-50 dark:bg-orange-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Icon name="BookOpen" className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {p.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {p.category} · {p.excerpt}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Masters */}
          {masters.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                Мастера
              </div>
              {masters.map((m) => {
                const idx = runningIdx++;
                const active = idx === activeIdx;
                return (
                  <button
                    key={`master-${m.id}`}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                      active
                        ? "bg-orange-50 dark:bg-orange-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {m.full_name.charAt(0) || "М"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {m.full_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {m.location ? `${m.location} · ` : ""}
                        {(m.specializations || []).slice(0, 2).join(", ")}
                      </div>
                    </div>
                    {m.rating > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                        <Icon name="Star" className="w-3 h-3 fill-current" />
                        {m.rating.toFixed(1)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">↑↓</kbd>
              навигация
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">↵</kbd>
              выбрать
            </span>
          </div>
          <span>АВАНГАРД</span>
        </div>
      </div>
    </div>
  );
}
