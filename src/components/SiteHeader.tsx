import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import ThemeToggle from "@/components/ThemeToggle";
import { useCommandPalette } from "@/components/CommandPaletteProvider";

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

const NAV_LINKS = [
  { label: "Калькулятор", href: "/calculator" },
  { label: "Подрядчики", href: "/masters" },
  { label: "Каталог", href: "/catalog" },
  { label: "Шоурум", href: "/showroom" },
  { label: "Блог", href: "/blog" },
  { label: "Тарифы", href: "/tariffs" },
];

export default function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const palette = useCommandPalette();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("avangard_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("avangard_user");
    localStorage.removeItem("avangard_token");
    setUser(null);
    navigate("/");
  };

  const isAdmin = user?.role === "admin" || user?.user_type === "admin";

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm"
          : "bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="На главную">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Icon name="Compass" className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              АВАНГАРД
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={palette.open}
              className="hidden md:inline-flex items-center gap-2 px-3 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Поиск по сайту"
            >
              <Icon name="Search" className="w-4 h-4" />
              <span>Поиск…</span>
              <kbd className="ml-2 hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-500">
                Ctrl K
              </kbd>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={palette.open}
              aria-label="Поиск"
            >
              <Icon name="Search" className="w-5 h-5" />
            </Button>
            <ThemeToggle className="hidden sm:inline-flex" />

            {user ? (
              <>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/admin")}
                    className="hidden md:inline-flex"
                  >
                    <Icon name="Shield" className="w-4 h-4 mr-1" />
                    Админ
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/invite")}
                  className="hidden xl:inline-flex text-orange-600 hover:text-orange-700"
                  title="Пригласи друга — получи 500 ₽"
                >
                  <Icon name="Gift" className="w-4 h-4 mr-1" />
                  Пригласить
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/account")}
                  className="hidden md:inline-flex"
                >
                  <Icon name="User" className="w-4 h-4 mr-1" />
                  Кабинет
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  aria-label="Выйти"
                  className="hidden md:inline-flex"
                >
                  <Icon name="LogOut" className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="hidden md:inline-flex"
                >
                  Войти
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="hidden md:inline-flex bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-0"
                >
                  Регистрация
                </Button>
              </>
            )}

            {/* Mobile burger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            >
              <Icon name={mobileOpen ? "X" : "Menu"} className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 py-3 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
            {user ? (
              <>
                <Link
                  to="/account"
                  className="px-3 py-3 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Icon name="User" className="w-4 h-4" />
                  Личный кабинет
                </Link>
                <Link
                  to="/invite"
                  className="px-3 py-3 text-sm font-medium rounded-md text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 flex items-center gap-2"
                >
                  <Icon name="Gift" className="w-4 h-4" />
                  Пригласить друга
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-3 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Icon name="Shield" className="w-4 h-4" />
                    Админ-панель
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-3 text-sm font-medium rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <Icon name="LogOut" className="w-4 h-4" />
                  Выйти
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-1">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/login")}>
                  Войти
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0"
                  onClick={() => navigate("/register")}
                >
                  Регистрация
                </Button>
              </div>
            )}
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-slate-500">Тема оформления</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}