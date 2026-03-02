import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const SALES_URL = "https://functions.poehali.dev/0bd83394-12a6-4b3b-a52b-b76da9e791d9";
const HEADERS = { "Content-Type": "application/json", "X-Admin-Token": "admin2025" };
const STORAGE_KEY = "sales_widget_history";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

export interface CalcContext {
  calcName: string;           // "Калькулятор ремонта" / "Офисный калькулятор"
  totalPrice: number;
  region?: string;
  items?: { name: string; total: number }[];  // Топ позиций
  summary?: string;           // Краткое текстовое описание расчёта
}

// ── Markdown рендерер ──────────────────────────────────────────────────────

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5 text-xs leading-relaxed">
      {lines.map((line, i) => {
        if (/^###\s/.test(line)) return <p key={i} className="font-bold text-gray-900 text-xs mt-1">{line.replace(/^###\s/, "")}</p>;
        if (/^##\s/.test(line)) return <p key={i} className="font-bold text-gray-900 text-sm mt-1">{line.replace(/^##\s/, "")}</p>;
        if (/^#\s/.test(line)) return <p key={i} className="font-bold text-gray-900 text-sm mt-1">{line.replace(/^#\s/, "")}</p>;
        if (/^[-•]\s/.test(line)) return (
          <p key={i} className="flex gap-1.5">
            <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
            <span dangerouslySetInnerHTML={{ __html: line.replace(/^[-•]\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          </p>
        );
        if (/^\d+\.\s/.test(line)) return (
          <p key={i} className="flex gap-1.5">
            <span className="text-emerald-600 font-bold shrink-0">{line.match(/^\d+/)?.[0]}.</span>
            <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          </p>
        );
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
      })}
    </div>
  );
}

// ── Форматирование контекста для промпта ───────────────────────────────────

function buildContextMessage(ctx: CalcContext): string {
  const price = ctx.totalPrice.toLocaleString("ru-RU");
  let msg = `[КОНТЕКСТ РАСЧЁТА]\nКалькулятор: ${ctx.calcName}\nИтоговая сумма: ${price} ₽`;
  if (ctx.region) msg += `\nРегион: ${ctx.region}`;
  if (ctx.summary) msg += `\nСостав: ${ctx.summary}`;
  if (ctx.items && ctx.items.length > 0) {
    msg += `\nОсновные позиции:\n` + ctx.items.slice(0, 5).map(it => `— ${it.name}: ${it.total.toLocaleString("ru-RU")} ₽`).join("\n");
  }
  msg += `\n\nКлиент видит эту смету прямо сейчас. Проанализируй её и дай конкретный совет менеджеру: что уточнить у клиента, что можно допродать, какие возражения ожидать.`;
  return msg;
}

// ── Быстрые подсказки для контекста калькулятора ──────────────────────────

const CALC_HINTS = [
  { id: "analyze", label: "Анализ сметы", icon: "BarChart2", text: "Проанализируй смету и скажи, что можно допродать этому клиенту." },
  { id: "objection", label: "Возможные возражения", icon: "AlertCircle", text: "Какие возражения клиент скорее всего выдвинет по этой смете? Дай скрипты ответов." },
  { id: "upsell", label: "Допродажи", icon: "TrendingUp", text: "Что ещё можно предложить клиенту с такой сметой? Конкретные допродажи с ценами." },
  { id: "close", label: "Как закрыть сделку", icon: "CheckCircle", text: "Как закрыть сделку с клиентом на эту сумму? Дай скрипт финального разговора." },
];

// ── Основной компонент ─────────────────────────────────────────────────────

interface Props {
  calcContext?: CalcContext;
}

export default function SalesWidget({ calcContext }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextSent, setContextSent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Когда виджет открывается и есть контекст — отправляем его автоматически
  useEffect(() => {
    if (open && calcContext && calcContext.totalPrice > 0 && !contextSent && messages.length === 0) {
      setContextSent(true);
      sendMessage(buildContextMessage(calcContext), true);
    }
  }, [open, calcContext]);

  const sendMessage = async (text: string, isSystem = false) => {
    const userMsg: Message = { role: "user", content: text, ts: Date.now() };
    const newMessages = isSystem ? messages : [...messages, userMsg];
    if (!isSystem) setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(SALES_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(-20).map(m => ({ role: m.role, content: m.content })),
          calc_context: calcContext ? buildContextMessage(calcContext) : "",
        }),
      });
      const data = await res.json();
      const assistantMsg: Message = { role: "assistant", content: data.answer || "Не удалось получить ответ.", ts: Date.now() };

      if (isSystem) {
        setMessages([assistantMsg]);
      } else {
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch {
      const errMsg: Message = { role: "assistant", content: "Ошибка соединения. Попробуйте ещё раз.", ts: Date.now() };
      setMessages(prev => isSystem ? [errMsg] : [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    sendMessage(text);
  };

  const handleHint = (text: string) => sendMessage(text);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClear = () => {
    setMessages([]);
    setContextSent(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Повторно отправить контекст при изменении суммы
  const handleResendContext = () => {
    if (!calcContext) return;
    setContextSent(true);
    sendMessage(buildContextMessage(calcContext), true);
  };

  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Плавающая кнопка */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Пульсирующая подсказка при первом открытии */}
        {!open && messages.length === 0 && calcContext && calcContext.totalPrice > 0 && (
          <div className="bg-white border border-emerald-200 rounded-xl px-3 py-2 shadow-lg text-xs text-gray-700 max-w-[200px] text-center animate-bounce">
            💡 Алексей проанализирует смету
          </div>
        )}
        <button
          onClick={() => setOpen(v => !v)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${
            open ? "bg-gray-700 hover:bg-gray-800" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {open
            ? <Icon name="X" size={22} className="text-white" />
            : (
              <div className="relative">
                <Icon name="BrainCircuit" size={24} className="text-white" />
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white" />
                )}
              </div>
            )
          }
        </button>
      </div>

      {/* Панель чата */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[580px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">

          {/* Шапка */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Icon name="BrainCircuit" size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">Алексей</p>
                <p className="text-emerald-100 text-[10px]">AI-менеджер по продажам</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {calcContext && calcContext.totalPrice > 0 && (
                <button
                  onClick={handleResendContext}
                  title="Обновить контекст сметы"
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Icon name="RefreshCw" size={13} className="text-white" />
                </button>
              )}
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  title="Очистить историю"
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Icon name="Trash2" size={13} className="text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Контекст сметы */}
          {calcContext && calcContext.totalPrice > 0 && (
            <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                <Icon name="Calculator" size={12} />
                <span className="font-medium">{calcContext.calcName}</span>
                <span className="text-emerald-500">·</span>
                <span className="font-bold">{calcContext.totalPrice.toLocaleString("ru-RU")} ₽</span>
              </div>
              <span className="text-[9px] text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded-full">в контексте</span>
            </div>
          )}

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && !loading && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="TrendingUp" size={22} className="text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Привет! Я Алексей 👋</p>
                <p className="text-xs text-gray-500 mb-4">Помогу закрыть сделку и увеличить чек</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {CALC_HINTS.map(h => (
                    <button
                      key={h.id}
                      onClick={() => handleHint(h.text)}
                      className="text-left p-2 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-xs text-gray-700"
                    >
                      <span className="font-medium">{h.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-1.5 mt-0.5 shrink-0">
                    <Icon name="BrainCircuit" size={12} className="text-emerald-600" />
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`rounded-2xl px-3 py-2 ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-sm text-xs"
                      : "bg-gray-50 border border-gray-100 rounded-tl-sm"
                  }`}>
                    {msg.role === "user"
                      ? <p className="text-xs leading-relaxed">{msg.content}</p>
                      : <MarkdownText text={msg.content} />
                    }
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 px-1">
                    <span className="text-[9px] text-gray-400">{fmtTime(msg.ts)}</span>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => {
                          const url = "https://t.me/share/url?url=%20&text=" + encodeURIComponent(msg.content);
                          window.open(url, "_blank");
                        }}
                        title="Отправить в Telegram"
                        className="flex items-center gap-1 text-[9px] text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <Icon name="Send" size={10} />
                        <span>Telegram</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-1.5 shrink-0">
                  <Icon name="BrainCircuit" size={12} className="text-emerald-600" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-3 py-2.5">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Быстрые подсказки */}
          {messages.length > 0 && (
            <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto shrink-0 border-t border-gray-50">
              {CALC_HINTS.map(h => (
                <button
                  key={h.id}
                  onClick={() => handleHint(h.text)}
                  disabled={loading}
                  className="shrink-0 text-[10px] px-2 py-1 rounded-full border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-gray-600 transition-all whitespace-nowrap disabled:opacity-40"
                >
                  {h.label}
                </button>
              ))}
            </div>
          )}

          {/* Поле ввода */}
          <div className="px-3 pb-3 pt-1.5 shrink-0 border-t border-gray-100">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                placeholder="Спросить Алексея…"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-0 focus:outline-none text-xs px-3 py-2 bg-gray-50 placeholder-gray-400 min-h-[36px] max-h-[90px] disabled:opacity-50"
                style={{ lineHeight: "1.4" }}
              />
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="h-9 w-9 p-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 shrink-0"
              >
                <Icon name="Send" size={14} className="text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}