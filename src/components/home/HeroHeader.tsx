import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

interface HeroHeaderProps {
  user: User | null;
  onLogout: () => void;
}

const PHONE_NUMBER = "8 (927) 748-68-68";
const PHONE_LINK = "tel:+79277486868";
const WHATSAPP_LINK =
  "https://wa.me/79277486868?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%80%D0%B0%D1%81%D1%81%D1%87%D0%B8%D1%82%D0%B0%D1%82%D1%8C%20%D1%81%D1%82%D0%BE%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D1%8C%20%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82%D0%B0";
const CALLBACK_ENDPOINT =
  "https://functions.poehali.dev/69fd9787-d0eb-4342-b94b-9d14bb3f36e7";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  let d = digits;
  if (d.startsWith("8") && d.length > 1) d = "7" + d.slice(1);
  if (d.length === 0) return "+7";
  let result = "+7";
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length >= 4) result += ")";
  if (d.length > 4) result += " " + d.slice(4, 7);
  if (d.length > 7) result += "-" + d.slice(7, 9);
  if (d.length > 9) result += "-" + d.slice(9, 11);
  return result;
}

export default function HeroHeader({ user, onLogout }: HeroHeaderProps) {
  const navigate = useNavigate();
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState("+7");
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackSent, setCallbackSent] = useState(false);
  const callbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!callbackOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        callbackRef.current &&
        !callbackRef.current.contains(e.target as Node)
      ) {
        setCallbackOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [callbackOpen]);

  const handleCallbackSubmit = async () => {
    const digits = callbackPhone.replace(/\D/g, "");
    if (digits.length < 11) return;
    setCallbackLoading(true);
    try {
      await fetch(CALLBACK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Обратный звонок",
          phone: callbackPhone,
          source: "callback",
          page_url: window.location.href,
          consent: true,
        }),
      });
      setCallbackSent(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (typeof w.ym === "function") {
          const counters = w.Ya?._metrika?.counters;
          const id = counters ? Object.keys(counters)[0] : undefined;
          if (id) w.ym(Number(id), "reachGoal", "callback_request");
        }
      } catch {
        /* metrika may not be loaded */
      }
    } catch {
      /* silently fail */
    } finally {
      setCallbackLoading(false);
    }
  };

  return (
    <header className="relative z-10 border-b border-white/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Icon name="Compass" className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              АВАНГАРД
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Phone - desktop only */}
            <a
              href={PHONE_LINK}
              className="hidden md:flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Icon name="Phone" className="h-4 w-4" />
              <span className="font-semibold">{PHONE_NUMBER}</span>
            </a>

            {/* Email - desktop only */}
            <a
              href="mailto:info@avangard-ai.ru"
              className="hidden md:flex items-center gap-2 text-sm text-white/50 hover:text-white/90 transition-colors"
            >
              <Icon name="Mail" className="h-4 w-4" />
              <span className="font-medium">info@avangard-ai.ru</span>
            </a>

            {/* Divider - desktop only */}
            <div className="hidden md:block w-px h-6 bg-white/15" />

            {/* WhatsApp - always visible */}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-green-500 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30"
              title="Написать в WhatsApp"
            >
              <Icon name="MessageCircle" className="h-4 w-4 text-white" />
            </a>

            {/* Callback button - always visible */}
            <div className="relative" ref={callbackRef}>
              <Button
                size="sm"
                onClick={() => {
                  setCallbackOpen(!callbackOpen);
                  setCallbackSent(false);
                  setCallbackPhone("+7");
                }}
                className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-0 text-white shadow-lg shadow-orange-500/30 gap-1.5 text-xs md:text-sm"
              >
                <Icon name="PhoneCall" className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Заказать звонок</span>
                <span className="sm:hidden">Звонок</span>
              </Button>

              {/* Callback modal/dropdown */}
              {callbackOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 animate-fade-in">
                  {callbackSent ? (
                    <div className="text-center py-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                        <Icon
                          name="Check"
                          className="h-6 w-6 text-green-600"
                        />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        Заявка отправлена!
                      </p>
                      <p className="text-xs text-gray-500">
                        Перезвоним в течение 5 минут!
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-3 text-xs text-gray-400"
                        onClick={() => setCallbackOpen(false)}
                      >
                        Закрыть
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        Заказать обратный звонок
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        Перезвоним в течение 5 минут
                      </p>
                      <input
                        type="tel"
                        value={callbackPhone}
                        onChange={(e) =>
                          setCallbackPhone(formatPhone(e.target.value))
                        }
                        placeholder="+7 (___) ___-__-__"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all mb-3"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleCallbackSubmit}
                        disabled={
                          callbackPhone.replace(/\D/g, "").length < 11 ||
                          callbackLoading
                        }
                        className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-0 text-white shadow-lg shadow-orange-500/30"
                      >
                        {callbackLoading ? (
                          <Icon
                            name="Loader2"
                            className="h-4 w-4 animate-spin"
                          />
                        ) : (
                          "Перезвоните мне"
                        )}
                      </Button>
                      <p className="text-[10px] text-gray-300 mt-2 text-center leading-tight">
                        Нажимая кнопку, вы соглашаетесь с{" "}
                        <a
                          href="/privacy"
                          className="underline hover:text-gray-500"
                        >
                          политикой конфиденциальности
                        </a>
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Divider - desktop only */}
            <div className="hidden md:block w-px h-6 bg-white/15" />

            {/* For companies - desktop only */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/tariffs")}
              className="hidden md:flex rounded-full border-white/25 text-white/80 hover:bg-white/15 hover:text-white gap-1.5"
            >
              <Icon name="Building2" className="h-3.5 w-3.5" />
              Для компаний
            </Button>

            {/* Auth buttons */}
            {user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/account")}
                  className="rounded-full border-white/20 text-white/80 hover:bg-white/10 gap-1.5"
                >
                  <Icon name="User" className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Личный кабинет</span>
                  <span className="md:hidden">ЛК</span>
                </Button>
                {user.role === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin")}
                    className="hidden md:flex rounded-full border-white/20 text-white/80 hover:bg-white/10"
                  >
                    <Icon name="Shield" className="mr-1.5 h-4 w-4" />
                    Админ
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="hidden md:flex rounded-full text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Icon name="LogOut" className="mr-1.5 h-4 w-4" />
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="hidden md:flex rounded-full text-white/70 hover:text-white hover:bg-white/10"
                >
                  Войти
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="hidden md:flex rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 shadow-none gap-1.5"
                >
                  <Icon name="UserPlus" className="h-3.5 w-3.5" />
                  Регистрация
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}