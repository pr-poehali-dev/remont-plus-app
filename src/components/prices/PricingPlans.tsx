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
            <div className="text-xs text-gray-400 mb-1">/ месяц · ~633 ₽ в день</div>
            <p className="text-sm text-gray-500 mb-1 font-medium">Старт автоматизации</p>
            <p className="text-xs text-gray-400 mb-4">Для небольших команд, которые хотят ускорить работу со сметами и проектами</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />До 20 проектов в месяц</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Автоматическая генерация смет</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Базовые визуализации интерьера</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Экспорт PDF / Excel клиенту</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />ИИ‑эксперт для ваших клиентов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Шоурум готовых проектов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Техническая поддержка</li>
              <li className="flex items-start gap-2 text-gray-400"><Cross />Органайзер ремонта</li>
              <li className="flex items-start gap-2 text-gray-400"><Cross />Голосовой ассистент ЯСЕН</li>
            </ul>
            <Button variant="outline" className="w-full" onClick={scrollToForm}>Получить доступ</Button>
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
            <div className="text-xs text-gray-400 mb-1">/ месяц · ~1 300 ₽ в день</div>
            <p className="text-sm text-blue-600 mb-1 font-semibold">Полный арсенал инструментов</p>
            <p className="text-xs text-gray-400 mb-4">Для активных студий, где важны скорость, брендинг и контроль над каждым объектом</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />До 60 проектов в месяц</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Расширенные визуализации</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Региональные цены на материалы</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Сметы и отчёты под вашим брендом</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Интеграция с CRM</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />ИИ‑эксперт для клиентов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Органайзер ремонта с чек-листами</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Шоурум + каталог ваших проектов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Голосовой ассистент ЯСЕН</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Приоритетная поддержка</li>
            </ul>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={scrollToForm}>Получить доступ</Button>
          </div>

          {/* ENTERPRISE */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span className="font-bold text-base tracking-wide">ENTERPRISE</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">от 120 000 ₽</div>
            <div className="text-xs text-gray-400 mb-1">/ месяц · индивидуальные условия</div>
            <p className="text-sm text-purple-600 mb-1 font-semibold">Платформа под ключ</p>
            <p className="text-xs text-gray-400 mb-4">Для крупных компаний и сетей, которым нужна своя платформа с полным white-label</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />Неограниченные проекты</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Полный White‑label (ваш домен, логотип)</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />API‑доступ для интеграций</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Индивидуальные настройки под бизнес</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Брендированный ИИ‑эксперт</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Органайзер + ЯСЕН в полном объёме</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Шоурум + витрина вашего портфолио</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Персональный менеджер</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Обучение и онбординг команды</li>
            </ul>
            <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50" onClick={scrollToForm}>Обсудить условия</Button>
          </div>
        </div>
      </div>

    </div>
  );
}