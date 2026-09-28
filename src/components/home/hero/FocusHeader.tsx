import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

interface Props {
  user: User | null;
  onLogout: () => void;
  onCalcClick: () => void;
}

const PHONE_NUMBER = "8 (927) 748-68-68";
const PHONE_LINK = "tel:+79277486868";

const MORE_MENU: { group: string; items: { label: string; path: string }[] }[] = [
  {
    group: "Отделка и работы",
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
    group: "Строительство",
    items: [
      { label: "Ремонт под ключ", path: "/turnkey" },
      { label: "Баня", path: "/bathhouse" },
      { label: "Каркасный дом", path: "/framehouse" },
      { label: "Офис и коммерция", path: "/office" },
    ],
  },
  {
    group: "Дополнительно",
    items: [
      { label: "Дизайн-проект", path: "/designer" },
      { label: "Смета по ТЗ", path: "/tender" },
      { label: "Проверка договора", path: "/contract-audit" },
      { label: "Хоумстейджинг", path: "/homestaging" },
      { label: "Мебель", path: "/furniture" },
      { label: "Органайзер ремонта", path: "/organizer" },
      { label: "ИИ-эксперт", path: "/expert" },
      { label: "Для компаний", path: "/partner" },
    ],
  },
];

export default function FocusHeader({ user, onLogout, onCalcClick }: Props) {
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0f0f13]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="shrink-0 font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
          АВАНГАРД
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          <a href="#how" className="px-3 py-2 text-sm text-gray-300 hover:text-white transition">
            Как это работает
          </a>
          <Link to="/masters" className="px-3 py-2 text-sm text-gray-300 hover:text-white transition">
            Мастерам
          </Link>
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(v => !v)}
              className="px-3 py-2 text-sm text-gray-300 hover:text-white transition flex items-center gap-1"
            >
              Ещё <Icon name={moreOpen ? "ChevronUp" : "ChevronDown"} size={14} />
            </button>
            {moreOpen && (
              <div className="absolute left-0 top-full mt-1 w-[560px] rounded-xl bg-[#17171d] border border-white/10 shadow-2xl p-4 grid grid-cols-3 gap-4">
                {MORE_MENU.map(g => (
                  <div key={g.group}>
                    <p className="text-[11px] font-semibold uppercase text-gray-500 mb-1.5">{g.group}</p>
                    <ul className="space-y-0.5">
                      {g.items.map(it => (
                        <li key={it.path}>
                          <Link
                            to={it.path}
                            onClick={() => setMoreOpen(false)}
                            className="block px-2 py-1 -mx-2 rounded text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
                          >
                            {it.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <a href={PHONE_LINK} className="hidden md:block text-sm text-gray-400 hover:text-white transition">
            {PHONE_NUMBER}
          </a>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              aria-label="Профиль"
              className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-gray-300 hover:text-white hover:border-white/30 transition"
            >
              <Icon name={user ? "User" : "CircleUser"} size={18} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-[#17171d] border border-white/10 shadow-2xl py-1.5">
                {user ? (
                  <>
                    <p className="px-3 py-1.5 text-xs text-gray-500 truncate">{user.name || user.email}</p>
                    <Link to="/organizer" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                      Мои расчёты
                    </Link>
                    <button onClick={() => { setProfileOpen(false); onLogout(); }} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white">
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setProfileOpen(false); navigate("/login"); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                      Войти
                    </button>
                    <button onClick={() => { setProfileOpen(false); navigate("/register"); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                      Регистрация
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onCalcClick}
            className="h-10 px-4 sm:px-5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-sm font-bold transition whitespace-nowrap"
          >
            Рассчитать смету
          </button>

          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Меню"
            className="lg:hidden w-9 h-9 rounded-lg border border-white/15 flex items-center justify-center text-gray-300"
          >
            <Icon name={mobileOpen ? "X" : "Menu"} size={18} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#17171d] px-4 py-4 max-h-[70vh] overflow-y-auto">
          <a href="#how" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-200">Как это работает</a>
          <Link to="/masters" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-200">Мастерам</Link>
          {MORE_MENU.map(g => (
            <div key={g.group} className="mt-3">
              <p className="text-[11px] font-semibold uppercase text-gray-500 mb-1">{g.group}</p>
              <div className="grid grid-cols-2 gap-x-3">
                {g.items.map(it => (
                  <Link key={it.path} to={it.path} onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-gray-300">
                    {it.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <a href={PHONE_LINK} className="block mt-4 pt-3 border-t border-white/10 text-sm text-gray-400">{PHONE_NUMBER}</a>
        </div>
      )}
    </header>
  );
}
