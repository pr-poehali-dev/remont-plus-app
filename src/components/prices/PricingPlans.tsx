import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { type PlanInfo, B2C_PLANS, B2B_PLANS, Check } from "./pricingTypes";
import PaymentModal from "./PaymentModal";
import B2BPaymentChoice from "./InvoiceModal";

export default function PricingPlans() {
  const [payPlan, setPayPlan] = useState<PlanInfo | null>(null);
  const [b2bPlan, setB2bPlan] = useState<PlanInfo | null>(null);

  return (
    <div className="mb-12 space-y-14">

      {payPlan && <PaymentModal plan={payPlan} onClose={() => setPayPlan(null)} />}
      {b2bPlan && <B2BPaymentChoice plan={b2bPlan} onClose={() => setB2bPlan(null)} />}

      {/* B2C */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🏠</span>
          <h2 className="text-xl font-bold">Для частных клиентов (B2C)</h2>
        </div>
        <p className="text-gray-500 mb-6 ml-10">Расчёт сметы, документация и оптимизация бюджета на ремонт</p>

        <div className="grid sm:grid-cols-3 gap-4">

          {/* Базовый */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
              <span className="font-bold text-base tracking-wide">БАЗОВЫЙ</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">1 490 ₽</div>
            <div className="text-xs text-gray-400 mb-1">разовый платёж</div>
            <p className="text-sm text-gray-500 mb-1 font-medium">Для предварительного расчёта бюджета</p>
            <p className="text-xs text-gray-400 mb-4">Подходит для оценки бюджета перед началом ремонта</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />Расчёт сметы по выбранному виду работ</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Учёт региональных коэффициентов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Итоговая стоимость работ и материалов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Выгрузка сметы в PDF</li>
            </ul>
            <Button variant="outline" className="w-full" onClick={() => setPayPlan(B2C_PLANS[0])}>
              <Icon name="CreditCard" size={16} className="mr-2" />Оплатить 1 490 ₽
            </Button>
          </div>

          {/* Профессиональный */}
          <div className="relative bg-white rounded-2xl border-2 border-blue-500 p-6 flex flex-col shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Рекомендуем</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="font-bold text-base tracking-wide">ПРОФЕССИОНАЛЬНЫЙ</span>
              <span className="text-yellow-500 text-base">⭐</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">2 990 ₽</div>
            <div className="text-xs text-gray-400 mb-1">разовый платёж</div>
            <p className="text-sm text-blue-600 mb-1 font-semibold">Для договора и официальных расчётов</p>
            <p className="text-xs text-gray-400 mb-4">Подходит для работы с подрядчиком и подписания договора</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />Всё из тарифа «Базовый»</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Детализированная смета</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Коммерческое предложение (КП)</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />КС‑2</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />КС‑3</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Акт выполненных работ</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Проверка корректности расчётов</li>
            </ul>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setPayPlan(B2C_PLANS[1])}>
              <Icon name="CreditCard" size={16} className="mr-2" />Оплатить 2 990 ₽
            </Button>
          </div>

          {/* Премиум */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span className="font-bold text-base tracking-wide">ПРЕМИУМ</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">4 990 ₽</div>
            <div className="text-xs text-gray-400 mb-1">разовый платёж</div>
            <p className="text-sm text-purple-600 mb-1 font-semibold">Для сложных объектов и оптимизации</p>
            <p className="text-xs text-gray-400 mb-4">Подходит для комплексного ремонта и ИЖС</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />Всё из тарифа «Профессиональный»</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Оптимизация сметы (поиск избыточных затрат)</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Анализ возможных отклонений бюджета</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Подбор альтернативных решений</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Приоритетная поддержка</li>
            </ul>
            <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => setPayPlan(B2C_PLANS[2])}>
              <Icon name="CreditCard" size={16} className="mr-2" />Оплатить 4 990 ₽
            </Button>
          </div>
        </div>
      </div>

      {/* B2B */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🏢</span>
          <h2 className="text-xl font-bold">Для строительных компаний (B2B)</h2>
        </div>
        <p className="text-gray-500 mb-6 ml-10">Автоматизация смет и документации для бригад, подрядчиков и застройщиков</p>

        <div className="grid sm:grid-cols-3 gap-4">

          {/* Старт */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
              <span className="font-bold text-base tracking-wide">СТАРТ</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">5 900 ₽</div>
            <div className="text-xs text-gray-400 mb-1">/ месяц</div>
            <p className="text-sm text-gray-500 mb-1 font-medium">Для небольших бригад и подрядчиков</p>
            <p className="text-xs text-gray-400 mb-4">Быстрый старт автоматизации смет</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />До 30 смет в месяц</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Формирование КП, КС‑2, КС‑3, актов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Учёт региональных коэффициентов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Выгрузка в PDF</li>
            </ul>
            <Button variant="outline" className="w-full" onClick={() => setB2bPlan(B2B_PLANS[0])}>
              Подключить
            </Button>
          </div>

          {/* Бизнес */}
          <div className="relative bg-white rounded-2xl border-2 border-blue-500 p-6 flex flex-col shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Рекомендуем</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="font-bold text-base tracking-wide">БИЗНЕС</span>
              <span className="text-yellow-500 text-base">⭐</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">12 900 ₽</div>
            <div className="text-xs text-gray-400 mb-1">/ месяц</div>
            <p className="text-sm text-blue-600 mb-1 font-semibold">Для строительных компаний</p>
            <p className="text-xs text-gray-400 mb-4">Оптимальный тариф для регулярной работы</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />До 150 смет в месяц</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Интеллектуальная оптимизация смет</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Проверка корректности документации</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Приоритетная поддержка</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Обновление коэффициентов</li>
            </ul>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setB2bPlan(B2B_PLANS[1])}>
              Подключить
            </Button>
          </div>

          {/* Профи */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span className="font-bold text-base tracking-wide">ПРОФИ</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">24 900 ₽</div>
            <div className="text-xs text-gray-400 mb-1">/ месяц</div>
            <p className="text-sm text-purple-600 mb-1 font-semibold">Для застройщиков и крупных подрядчиков</p>
            <p className="text-xs text-gray-400 mb-4">Системное использование внутри компании</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />Безлимит по сметам</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />White‑label (брендирование документов)</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />API‑доступ</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Персональный менеджер</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Приоритетные обновления</li>
            </ul>
            <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => setB2bPlan(B2B_PLANS[2])}>
              Подключить
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}