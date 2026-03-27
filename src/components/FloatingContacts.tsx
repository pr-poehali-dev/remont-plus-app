import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import reachGoal from "@/lib/metrika";

const PHONE = "+79277486868";
const PHONE_DISPLAY = "8 (927) 748-68-68";
const WA_URL = `https://wa.me/79277486868?text=${encodeURIComponent("Здравствуйте! Хочу рассчитать стоимость ремонта")}`;
const LEAD_URL = "https://functions.poehali.dev/536b1902-f1a6-497f-811d-d2fbad49442a";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  let d = digits;
  if (d.startsWith("8") && d.length > 1) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  let r = "+7";
  if (d.length > 1) r += " (" + d.slice(1, 4);
  if (d.length >= 4) r += ") " + d.slice(4, 7);
  if (d.length >= 7) r += "-" + d.slice(7, 9);
  if (d.length >= 9) r += "-" + d.slice(9, 11);
  return r;
}

export default function FloatingContacts() {
  const [expanded, setExpanded] = useState(false);
  const [showCallback, setShowCallback] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const isPrint = typeof window !== "undefined" && window.location.pathname.includes("/print");
  if (isPrint) return null;

  const handleCallback = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 11) return;
    setStatus("loading");
    try {
      await fetch(LEAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: digits,
          source: "callback",
          page_url: window.location.pathname,
          consent: true,
        }),
      });
      setStatus("success");
      reachGoal("callback_request", { source: "floating_contacts" });
      setTimeout(() => {
        setShowCallback(false);
        setStatus("idle");
        setPhone("");
        setName("");
      }, 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <>
      {/* Callback modal */}
      {showCallback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {status === "success" ? (
              <div className="px-6 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Check" size={28} className="text-green-600" />
                </div>
                <p className="font-bold text-lg text-gray-900">Заявка принята!</p>
                <p className="text-sm text-gray-500 mt-1">Перезвоним в течение 15 минут</p>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white relative">
                  <button
                    onClick={() => setShowCallback(false)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
                  >
                    <Icon name="X" size={14} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <Icon name="PhoneCall" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-base">Заказать звонок</p>
                      <p className="text-blue-100 text-xs mt-0.5">Перезвоним за 15 минут</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <Input
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    onKeyDown={(e) => e.key === "Enter" && handleCallback()}
                    autoFocus
                  />
                  {status === "error" && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <Icon name="AlertCircle" size={12} />
                      Ошибка. Попробуйте ещё раз.
                    </p>
                  )}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11"
                    onClick={handleCallback}
                    disabled={phone.replace(/\D/g, "").length < 11 || status === "loading"}
                  >
                    {status === "loading" ? (
                      <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Отправляем...</>
                    ) : (
                      <><Icon name="PhoneCall" size={16} className="mr-2" />Перезвоните мне</>
                    )}
                  </Button>
                  <p className="text-[10px] text-gray-400 text-center">
                    Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating buttons — left side, above bottom */}
      <div className="fixed bottom-6 left-4 z-40 flex flex-col gap-2.5 print:hidden">
        {expanded && (
          <div className="flex flex-col gap-2.5 animate-in slide-in-from-bottom-2 duration-200">
            {/* Callback */}
            <button
              onClick={() => { setShowCallback(true); setExpanded(false); }}
              className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center transition-all hover:scale-110"
              title="Заказать звонок"
            >
              <Icon name="PhoneCall" size={20} />
            </button>

            {/* Phone */}
            <a
              href={`tel:${PHONE}`}
              onClick={() => reachGoal("phone_click", { source: "floating" })}
              className="w-12 h-12 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-900 flex items-center justify-center transition-all hover:scale-110"
              title={PHONE_DISPLAY}
            >
              <Icon name="Phone" size={20} />
            </a>

            {/* WhatsApp */}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => reachGoal("whatsapp_click", { source: "floating" })}
              className="w-12 h-12 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 flex items-center justify-center transition-all hover:scale-110"
              title="Написать в WhatsApp"
            >
              <Icon name="MessageCircle" size={20} />
            </a>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
            expanded
              ? "bg-gray-600 hover:bg-gray-700 text-white rotate-45"
              : "bg-orange-500 hover:bg-orange-600 text-white animate-pulse"
          }`}
          title="Связаться с нами"
        >
          <Icon name={expanded ? "Plus" : "Headphones"} size={24} />
        </button>
      </div>
    </>
  );
}