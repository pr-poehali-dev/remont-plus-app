import { ReactNode, useState } from "react";
import { AppView } from "@/types";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface NavItem {
  view: AppView;
  label: string;
  icon: string;
}

interface Props {
  role: "assembler" | "customer";
  currentView: AppView;
  onViewChange: (v: AppView) => void;
  onLogout: () => void;
  notifications?: number;
  children: ReactNode;
}

const ASSEMBLER_NAV: NavItem[] = [
  { view: "catalog", label: "Каталог", icon: "Package" },
  { view: "orders", label: "Заявки", icon: "ClipboardList" },
  { view: "stats", label: "Статистика", icon: "BarChart2" },
  { view: "history", label: "История", icon: "History" },
  { view: "profile", label: "Кабинет", icon: "User" },
  { view: "contact", label: "Контакты", icon: "MessageSquare" },
];

const CUSTOMER_NAV: NavItem[] = [
  { view: "catalog", label: "Каталог", icon: "ShoppingBag" },
  { view: "orders", label: "Мои заявки", icon: "FileText" },
  { view: "history", label: "История", icon: "History" },
  { view: "profile", label: "Кабинет", icon: "User" },
  { view: "contact", label: "Контакты", icon: "MessageSquare" },
];

export default function Layout({ role, currentView, onViewChange, onLogout, notifications = 0, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = role === "assembler" ? ASSEMBLER_NAV : CUSTOMER_NAV;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-card border-r border-border shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <div className="text-sm font-semibold text-foreground">Миксология</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {role === "assembler" ? "Супервайзер" : "Заявка"}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150",
                currentView === item.view
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
              {item.view === "orders" && notifications > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                  {notifications}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Icon name="LogOut" size={16} />
            Сменить роль
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="text-sm font-semibold">Миксология</div>
        <div className="flex items-center gap-2">
          {notifications > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
              {notifications}
            </span>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            <Icon name={mobileOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-background pt-14 animate-fade-in">
          <nav className="px-4 py-4 space-y-1">
            {nav.map((item) => (
              <button
                key={item.view}
                onClick={() => { onViewChange(item.view); setMobileOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium",
                  currentView === item.view
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            ))}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm text-muted-foreground hover:bg-secondary mt-4"
            >
              <Icon name="LogOut" size={18} />
              Сменить роль
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 md:pt-0 pt-14">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}