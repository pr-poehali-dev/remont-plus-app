import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

const LEAD_GATE_URL = "https://functions.poehali.dev/1106f965-18b2-4e0f-b402-05fa69b8e3e1";
const STORAGE_KEY = "avangard_lead_gate";

export function isLeadGatePassed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { passed } = JSON.parse(raw);
    return passed === true;
  } catch {
    return false;
  }
}

function markLeadGatePassed() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ passed: true, ts: Date.now() }));
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  let d = digits;
  if (d.startsWith("8") && d.length > 1) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  let result = "+7";
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length >= 4) result += ") " + d.slice(4, 7);
  if (d.length >= 7) result += "-" + d.slice(7, 9);
  if (d.length >= 9) result += "-" + d.slice(9, 11);
  return result;
}

interface LeadGateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  totalSum?: string;
  itemsCount?: number;
  region?: string;
  calcType?: string;
}

export default function LeadGateModal({
  open,
  onClose,
  onSuccess,
  totalSum,
  itemsCount,
  region,
  calcType = "Калькулятор ремонта",
}: LeadGateModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const phoneRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length >= 11;

  const handleSubmit = async () => {
    if (!isPhoneValid) {
      setErrorMsg("Введите корректный номер телефона");
      phoneRef.current?.focus();
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(LEAD_GATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phoneDigits,
          calc_type: calcType,
          total_sum: totalSum || "",
          items_count: itemsCount || 0,
          region: region || "",
          source: "export_pdf",
          page_url: window.location.href,
        }),
      });

      if (!res.ok) throw new Error("Server error");

      markLeadGatePassed();
      setStatus("success");

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch {
      setStatus("error");
      setErrorMsg("Не удалось отправить. Попробуйте ещё раз.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {status === "success" ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="Check" size={32} className="text-green-600" />
            </div>
            <p className="font-bold text-lg text-gray-900 mb-1">Готово!</p>
            <p className="text-sm text-gray-500">Открываем документ для печати...</p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Icon name="X" size={14} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <Icon name="FileText" size={20} />
                </div>
                <div>
                  <p className="font-bold text-base leading-tight">Скачать смету бесплатно</p>
                  <p className="text-orange-100 text-xs mt-0.5">Укажите контакт — и документ откроется</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {totalSum && (
                <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                  <Icon name="Calculator" size={18} className="text-orange-500 shrink-0" />
                  <div className="text-sm">
                    <span className="text-gray-500">Итого по смете: </span>
                    <span className="font-bold text-orange-600">{totalSum}</span>
                    {itemsCount ? (
                      <span className="text-gray-400 ml-1">· {itemsCount} позиций</span>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label htmlFor="lead-name" className="text-sm">Ваше имя</Label>
                  <Input
                    id="lead-name"
                    placeholder="Как к вам обращаться?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="lead-phone" className="text-sm">
                    Телефон <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    ref={phoneRef}
                    id="lead-phone"
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="mt-1.5"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} />
                  {errorMsg}
                </p>
              )}

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11"
                onClick={handleSubmit}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Отправляем...
                  </>
                ) : (
                  <>
                    <Icon name="Download" size={16} className="mr-2" />
                    Получить PDF бесплатно
                  </>
                )}
              </Button>

              <p className="text-[10px] text-gray-400 text-center leading-tight">
                Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
                Менеджер может связаться для уточнения деталей.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
