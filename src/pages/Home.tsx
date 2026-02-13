import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    id: "customer",
    title: "ЗАКАЗЧИК",
    description: "Создайте дизайн-проект с помощью ИИ, рассчитайте смету и найдите исполнителей",
    icon: "Home",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "hover:border-amber-300",
    path: "/designer",
  },
  {
    id: "contractor",
    title: "ИСПОЛНИТЕЛЬ",
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
    path: "/catalog",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Compass" className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight">АВАНГАРД</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <Icon name="Phone" className="h-4 w-4" />
              <span className="font-medium text-gray-700">+7 (987) 980-77-77</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Ремонт и строительство</h1>
            <p className="text-gray-500 text-lg">Выберите, кто вы</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card
                key={role.id}
                className={`p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-transparent ${role.border}`}
                onClick={() => navigate(role.path)}
              >
                <div className={`w-16 h-16 rounded-2xl ${role.bg} flex items-center justify-center mb-6`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                    <Icon name={role.icon} className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-3 tracking-wide">{role.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{role.description}</p>
                <div className="mt-6 flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-600">
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