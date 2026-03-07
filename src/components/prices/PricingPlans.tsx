import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const Check = () => <Icon name="Check" size={15} className="text-green-500 mt-0.5 shrink-0" />;
const Cross = () => <Icon name="X" size={15} className="text-gray-300 mt-0.5 shrink-0" />;

export default function PricingPlans() {
  const navigate = useNavigate();

  const scrollToForm = () => {
    const el = document.getElementById("tariff-lead-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else navigate("/tariffs#form");
  };

  return (
    <div className="mb-12">

      {/* B2B */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🏢</span>
          <h2 className="text-xl font-bold">Для студий и строительных компаний (B2B)</h2>
        </div>
        <p className="text-gray-500 mb-6 ml-10">🚀 Автоматизация дизайн‑проектов, смет и управления ремонтом</p>
        <div className="grid sm:grid-cols-3 gap-4">

          {/* STUDIO */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
              <span className="font-bold text-base tracking-wide">STUDIO</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">19 000 ₽</div>
            <div className="text-xs text-gray-400 mb-1">/ месяц</div>
            <p className="text-sm text-gray-400 mb-4">Для небольших команд</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />До 20 проектов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Генерация смет</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Базовые визуализации</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Экспорт PDF / Excel</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />ИИ‑эксперт для клиентов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Шоурум готовых проектов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Поддержка</li>
              <li className="flex items-start gap-2 text-gray-400"><Cross />Без органайзера</li>
              <li className="flex items-start gap-2 text-gray-400"><Cross />Без голосового ЯСЕН</li>
            </ul>
            <Button variant="outline" className="w-full" onClick={scrollToForm}>Оставить заявку</Button>
          </div>

          {/* BUSINESS */}
          <div className="relative bg-white rounded-2xl border-2 border-blue-500 p-6 flex flex-col shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Выбор компаний</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="font-bold text-base tracking-wide">BUSINESS</span>
              <span className="text-yellow-500 text-base">⭐</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">39 000 ₽</div>
            <div className="text-xs text-gray-400 mb-1">/ месяц</div>
            <p className="text-sm text-gray-400 mb-4">Для активных студий и строительных компаний</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />До 60 проектов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Расширенные визуализации</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Учёт региональных цен</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Брендирование отчётов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Интеграция с CRM</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />ИИ‑эксперт для клиентов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Органайзер ремонта</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Шоурум + каталог проектов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Голосовой ассистент ЯСЕН</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Приоритетная поддержка</li>
            </ul>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={scrollToForm}>Оставить заявку</Button>
          </div>

          {/* ENTERPRISE */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span className="font-bold text-base tracking-wide">ENTERPRISE</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">от 120 000 ₽</div>
            <div className="text-xs text-gray-400 mb-1">/ месяц</div>
            <p className="text-sm text-gray-400 mb-4">Для крупных компаний и сетей</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />Неограниченные проекты</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />White‑label</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />API‑доступ</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Индивидуальные настройки</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />ИИ‑эксперт (брендированный)</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Органайзер + ЯСЕН (полный)</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Шоурум + витрина портфолио</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Персональный менеджер</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Обучение команды</li>
            </ul>
            <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50" onClick={scrollToForm}>Оставить заявку</Button>
          </div>
        </div>
      </div>

    </div>
  );
}