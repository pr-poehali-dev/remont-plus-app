import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

const NOTIFY_URL = "https://functions.poehali.dev/a8b87e78-89d1-48d8-ba76-8da2e0df32a3";

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [signing, setSigning] = useState(false);

  const BUSINESS_OPTIONS = [
    { value: "self_employed", label: "Самозанятый" },
    { value: "ip", label: "ИП" },
    { value: "ooo", label: "ООО" },
    { value: "individual", label: "Физлицо" },
  ];

  const contractNum = `АГ-${user.id}-${new Date().getFullYear()}`;
  const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  const handleSign = async () => {
    setSigning(true);
    localStorage.setItem(`agency_contract_signed_${user.id}`, "true");
    localStorage.setItem(`agency_contract_date_${user.id}`, today);
    setSigned(true);
    setShowConfirm(false);

    // Отправляем email-подтверждение мастеру
    if (user.email) {
      fetch(NOTIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "notify_contract_signed",
          master_name: user.name,
          master_email: user.email,
          contract_num: contractNum,
          contract_date: today,
        }),
      }).catch(() => {});
    }
    setSigning(false);
  };

  const handlePrint = () => {
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
    <>
      {/* Модальное окно подтверждения */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon name="FileSignature" size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Подписание договора</h3>
                  <p className="text-orange-100 text-xs">Прочитайте условия перед подписанием</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
                <p className="font-semibold text-gray-900">Вы подписываете агентский договор № {contractNum}</p>
                <p>Между <strong>ООО «Авангард»</strong> (Агрегатор) и <strong>{user.name}</strong> (Мастер).</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ключевые условия:</p>
                <div className="space-y-2">
                  {[
                    { icon: "Percent", text: "Комиссия Авангард — 5% от суммы каждого договора" },
                    { icon: "Wallet", text: "Вам выплачивается 95% в течение 3 рабочих дней после оплаты заказчиком" },
                    { icon: "Calendar", text: "Срок договора — 1 год с автоматической пролонгацией" },
                    { icon: "ShieldCheck", text: "Авангард гарантирует сохранность средств и своевременные выплаты" },
                  ].map((item) => (
                    <div key={item.icon} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name={item.icon} size={13} className="text-orange-500" />
                      </div>
                      <p className="text-sm text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                <Icon name="Mail" size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  После подписания подтверждение будет отправлено на <strong>{user.email}</strong>
                </p>
              </div>

              <p className="text-xs text-gray-400">
                Нажимая «Подписать», вы соглашаетесь с условиями агентского договора (гл. 52 ГК РФ) и даёте согласие на обработку персональных данных согласно ФЗ-152.
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <Button
                onClick={handleSign}
                disabled={signing}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Icon name="PenLine" size={16} className="mr-2" />
                {signing ? "Подписываю..." : "Подписать договор"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={signing}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Основная панель */}
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
          {/* Суть механизма */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-800">
            <div className="flex gap-2 items-start">
              <Icon name="Info" size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold mb-1">Как работают расчёты через Авангард:</p>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  {[
                    { step: "1", text: "Заказчик платит → на счёт Авангард" },
                    { step: "2", text: "Авангард удерживает 5% комиссии" },
                    { step: "3", text: "Вам 95% за 3 рабочих дня" },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2 flex-1">
                      <span className="w-5 h-5 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center font-bold shrink-0">{s.step}</span>
                      <span className="text-xs">{s.text}</span>
                    </div>
                  ))}
                </div>
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
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={() => setShowConfirm(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Icon name="PenLine" size={16} className="mr-2" />
                  Подписать договор
                </Button>
                <Button variant="outline" onClick={handlePrint}>
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
                  Договор № {contractNum} · Срок: 1 год с автопролонгацией
                </p>
              </div>
              <Button variant="outline" onClick={handlePrint} className="shrink-0">
                <Icon name="Printer" size={16} className="mr-2" />
                Распечатать договор
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
