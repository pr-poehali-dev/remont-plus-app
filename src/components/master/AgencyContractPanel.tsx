import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  user_type: string;
}

interface Props {
  user: User;
}

export default function AgencyContractPanel({ user }: Props) {
  const navigate = useNavigate();
  const [inn, setInn] = useState("");
  const [businessStatus, setBusinessStatus] = useState("self_employed");
  const [signed, setSigned] = useState(() => !!localStorage.getItem(`agency_contract_signed_${user.id}`));
  const [signDate] = useState(() => localStorage.getItem(`agency_contract_date_${user.id}`) || "");

  const BUSINESS_OPTIONS = [
    { value: "self_employed", label: "Самозанятый" },
    { value: "ip", label: "ИП" },
    { value: "ooo", label: "ООО" },
    { value: "individual", label: "Физлицо" },
  ];

  const handleSign = () => {
    const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
    localStorage.setItem(`agency_contract_signed_${user.id}`, "true");
    localStorage.setItem(`agency_contract_date_${user.id}`, today);
    setSigned(true);
  };

  const handlePrint = () => {
    const contractNum = `АГ-${user.id}-${new Date().getFullYear()}`;
    const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
    navigate("/agency/contract", {
      state: {
        masterName: user.name,
        masterPhone: user.phone || "",
        masterEmail: user.email || "",
        businessStatus,
        inn,
        contractDate: signDate || today,
        contractNum,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center gap-3">
        <Icon name="FileSignature" size={22} className="text-white" />
        <div>
          <h2 className="text-white font-bold text-lg">Агентский договор</h2>
          <p className="text-orange-100 text-xs">Подписывается один раз — действует бессрочно</p>
        </div>
        {signed && (
          <div className="ml-auto flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <Icon name="CheckCircle" size={14} className="text-white" />
            <span className="text-white text-xs font-medium">Подписан</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-800">
          <div className="flex gap-2 items-start">
            <Icon name="Info" size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <div>
              <strong>Как работает финансовый механизм:</strong>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>Заказчик оплачивает работы на счёт Авангард</li>
                <li>Авангард удерживает комиссию <strong>5%</strong> от суммы договора</li>
                <li>Оставшиеся <strong>95%</strong> переводятся вам в течение 3 рабочих дней</li>
              </ol>
            </div>
          </div>
        </div>

        {!signed ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Форма деятельности</label>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBusinessStatus(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      businessStatus === opt.value
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ИНН</label>
              <Input
                value={inn}
                onChange={(e) => setInn(e.target.value)}
                placeholder="Введите ваш ИНН"
                maxLength={12}
                className="max-w-xs"
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              <Icon name="Lock" size={14} className="mt-0.5 shrink-0" />
              <span>Нажимая «Подписать», вы подтверждаете согласие с условиями агентского договора и даёте согласие на обработку персональных данных в соответствии с ФЗ-152.</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={handleSign}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Icon name="PenLine" size={16} className="mr-2" />
                Подписать договор
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
              >
                <Icon name="Eye" size={16} className="mr-2" />
                Просмотреть текст
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <Icon name="CheckCircle" size={18} />
                Договор подписан {signDate && `— ${signDate}`}
              </div>
              <p className="text-sm text-gray-500">
                Мастер: {user.name} · Комиссия: 5% от суммы договора
              </p>
              <p className="text-xs text-gray-400">
                Договор № АГ-{user.id}-{new Date().getFullYear()} · Срок: 1 год с автопролонгацией
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="shrink-0"
            >
              <Icon name="Printer" size={16} className="mr-2" />
              Распечатать договор
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
