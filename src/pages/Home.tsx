import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

const roles = [
  {
    id: "customer",
    title: "ДИЗАЙН-ПРОЕКТ",
    description: "Создайте дизайн-проект с помощью ИИ, рассчитайте смету и найдите мастеров",
    icon: "Home",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "hover:border-amber-300",
    path: "/designer",
  },
  {
    id: "contractor",
    title: "МАСТЕР",
    description: "Находите заказы на ремонт, управляйте проектами и получайте клиентов",
    icon: "Hammer",
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
    border: "hover:border-blue-300",
    path: "/profile",
  },
  {
    id: "catalog",
    title: "КАТАЛОГ",
    description: "Строительные материалы и товары от проверенных поставщиков",
    icon: "Store",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "hover:border-emerald-300",
    path: "/suppliers",
  },
  {
    id: "showroom",
    title: "ШОУРУМ",
    description: "Готовые дизайнерские решения для ванных, кухонь, гостиных и спален",
    icon: "Image",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "hover:border-violet-300",
    path: "/showroom",
  },
  {
    id: "prices",
    title: "ПРАЙС-ЛИСТ",
    description: "Цены на все виды работ: отделка, сантехника, электрика, двери, окна, кондиционеры",
    icon: "ClipboardList",
    color: "from-rose-500 to-red-500",
    bg: "bg-rose-50",
    border: "hover:border-rose-300",
    path: "/prices",
  },
  {
    id: "lemanapro",
    title: "ЛЕМАНАПРО",
    description: "Каталог товаров для ремонта от ЛеманаПро — Самара",
    icon: "ShoppingCart",
    color: "from-green-500 to-lime-500",
    bg: "bg-green-50",
    border: "hover:border-green-300",
    path: "/lemanapro",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("avangard_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("avangard_user");
    localStorage.removeItem("avangard_token");
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Compass" className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight">АВАНГАРД</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 mr-2">
                <Icon name="Phone" className="h-4 w-4" />
                <span className="font-medium text-gray-700">8 (927) 748-68-68</span>
              </div>
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="User" className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  {user.role === "admin" && (
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                      <Icon name="Shield" className="mr-1.5 h-4 w-4" />
                      Админ
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <Icon name="LogOut" className="mr-1.5 h-4 w-4" />
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                    <Icon name="LogIn" className="mr-1.5 h-4 w-4" />
                    Войти
                  </Button>
                  <Button size="sm" onClick={() => navigate("/register")}>
                    <Icon name="UserPlus" className="mr-1.5 h-4 w-4" />
                    Регистрация
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">ДИЗАЙН ПРОЕКТ И РЕМОНТ ПОД КОНТРОЛЕМ</h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              {user
                ? `${user.name}, выберите раздел`
                : "Создайте дизайн-проект с ИИ, найдите проверенных мастеров и контролируйте каждый этап ремонта"}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card
                key={role.id}
                className={`p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-transparent ${role.border}`}
                onClick={() => navigate(["showroom", "lemanapro", "prices"].includes(role.id) ? role.path : (user ? role.path : `/login?redirect=${role.path}`))}
              >
                <div className={`w-16 h-16 rounded-2xl ${role.bg} flex items-center justify-center mb-6`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                    <Icon name={role.icon} className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-3 tracking-wide">{role.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{role.description}</p>
                <div className="mt-6 flex items-center text-sm font-medium text-gray-400">
                  Перейти <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        АВАНГАРД &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}