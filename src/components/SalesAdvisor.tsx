import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";

const STORAGE_KEY = "sales_advisor_history";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

// Быстрые подсказки для менеджера прямо в контексте расчёта
const CALC_PROMPTS = [
  { id: "upsell", icon: "TrendingUp", label: "Допродажи", text: "Что ещё можно предложить клиенту исходя из этой сметы?" },
  { id: "objection", icon: "Shield", label: "Возражение «дорого»", text: "Клиент говорит что дорого. Как обосновать стоимость?" },
  { id: "close", icon: "CheckCircle", label: "Закрыть сделку", text: "Как закрыть сделку по этому расчёту прямо сейчас?" },
  { id: "discount", icon: "Tag", label: "Просит скидку", text: "Клиент просит скидку. Что предложить без потери маржи?" },
];

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5 text-xs leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <p key={i} className="font-bold text-gray-900 mt-2 mb-0.5 text-xs">{line.slice(4)}</p>;
        if (line.startsWith("## ")) return <p key={i} className="font-bold text-gray-900 mt-2 mb-0.5 text-xs">{line.slice(3)}</p>;
        if (line.startsWith("- ") || line.startsWith("• ")) return (
          <p key={i} className="flex gap-1.5">
            <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
            <span>{line.slice(2)}</span>
          </p>
        );
        if (/^\d+\.\s/.test(line)) {
          const m = line.match(/^(\d+)\.\s(.*)$/);
          if (m) return <p key={i} className="flex gap-1.5"><span className="text-emerald-600 font-bold shrink-0 w-4">{m[1]}.</span><span>{m[2]}</span></p>;
        }
        if (line.trim() === "") return <div key={i} className="h-1.5" />;
        const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
}

export interface SalesContext {
  calcType: string;       // "офис" | "квартира" | "баня" | "окна" и т.д.
  totalPrice: number;
  zones?: { name: string; area: number; price: number }[];
  regionLabel?: string;
  details?: string;       // произвольный текст с параметрами
}

interface Props {
  context: SalesContext;
  apiUrl?: string;
}

export default function SalesAdvisor({ context, apiUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState(
    apiUrl || "https://functions.poehali.dev/0bd83394-12a6-4b3b-a52b-b76da9e791d9"
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!apiUrl) {
      fetch("/func2url.json")
        .then(r => r.json())
        .then((u: Record<string, string>) => { if (u["sales-agent"]) setResolvedUrl(u["sales-agent"]); })
        .catch(() => {});
    }
  }, [apiUrl]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Формируем контекст сметы для системного промпта (передаётся как первое сообщение)
  function buildContextMessage(): string {
    const { calcType, totalPrice, zones, regionLabel, details } = context;
    const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";
    let ctx = `КОНТЕКСТ ТЕКУЩЕГО РАСЧЁТА:\n`;
    ctx += `— Тип объекта: ${calcType}\n`;
    if (regionLabel) ctx += `— Регион: ${regionLabel}\n`;
    ctx += `— Итоговая стоимость: ${fmt(totalPrice)}\n`;
    if (zones && zones.length > 0) {
      ctx += `— Зоны:\n`;
      zones.forEach(z => { ctx += `  • ${z.name}: ${z.area} м² — ${fmt(z.price)}\n`; });
    }
    if (details) ctx += `— Детали: ${details}\n`;
    return ctx;
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg, ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const res = await fetch(resolvedUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": "admin2025" },
      body: JSON.stringify({
        message: msg,
        history: messages.map(m => ({ role: m.role, content: m.content })),
        calc_context: buildContextMessage(),
      }),
    }).catch(() => null);

    if (!res || !res.ok) {
      setMessages(prev => [...prev, { role: "assistant", content: "Не удалось получить ответ. Проверьте подключение.", ts: Date.now() }]);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setMessages(prev => [...prev, { role: "assistant", content: data.answer || "Нет ответа.", ts: Date.now() }]);
    setLoading(false);
  }

  const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";
  const hasMessages = messages.length > 0;

  return (
    <div className="relative">
      {/* Кнопка-триггер (когда закрыт) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-sm">
            <Icon name="TrendingUp" size={17} className="text-white" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-bold text-emerald-800">Алексей</span>
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                онлайн
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 truncate">
              {hasMessages ? "Продолжить разговор..." : "Советник по продажам · спросить про смету"}
            </p>
          </div>
          <Icon name="ChevronDown" size={14} className="text-emerald-500 shrink-0 ml-auto group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Развёрнутый чат */}
      {open && (
        <div className="border-2 border-emerald-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {/* Шапка */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                <Icon name="TrendingUp" size={13} className="text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-900">Алексей</span>
                <span className="ml-1.5 text-[10px] text-emerald-600">менеджер по продажам</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasMessages && (
                <button
                  onClick={() => { if (confirm("Очистить историю?")) { setMessages([]); sessionStorage.removeItem(STORAGE_KEY); } }}
                  className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-50 transition-all"
                  title="Очистить"
                >
                  <Icon name="Trash2" size={12} />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
                <Icon name="ChevronUp" size={14} />
              </button>
            </div>
          </div>

          {/* Контекст сметы */}
          <div className="px-3 py-2 bg-emerald-50/60 border-b border-emerald-100 text-[10px] text-emerald-700 flex items-center gap-1.5">
            <Icon name="Calculator" size={10} className="shrink-0" />
            <span className="font-medium">{context.calcType}</span>
            <span className="text-emerald-400">·</span>
            <span className="font-bold">{fmt(context.totalPrice)}</span>
            {context.regionLabel && <><span className="text-emerald-400">·</span><span>{context.regionLabel}</span></>}
          </div>

          {/* Сообщения */}
          <div className="h-56 overflow-y-auto p-3 space-y-3 bg-gray-50/30">
            {!hasMessages ? (
              <div className="h-full flex flex-col justify-center items-center gap-3">
                <p className="text-[11px] text-gray-500 text-center leading-relaxed max-w-[220px]">
                  Вижу расчёт на <strong>{fmt(context.totalPrice)}</strong>. Что нужно — скрипт продажи, отработка возражения или идеи для допродаж?
                </p>
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  {CALC_PROMPTS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => send(p.text)}
                      className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left"
                    >
                      <Icon name={p.icon as Parameters<typeof Icon>[0]["name"]} fallback="MessageSquare" size={11} className="text-emerald-500 shrink-0" />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="TrendingUp" size={11} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      m.role === "user"
                        ? "bg-emerald-600 text-white text-xs"
                        : "bg-white border border-gray-100 shadow-sm text-gray-800"
                    }`}>
                      {m.role === "user"
                        ? <p className="text-xs leading-relaxed">{m.content}</p>
                        : <MarkdownText text={m.content} />
                      }
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                      <Icon name="TrendingUp" size={11} className="text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Ввод */}
          <div className="p-2.5 border-t border-gray-100 bg-white flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Спросить у Алексея..."
              rows={1}
              className="resize-none text-xs min-h-[32px] max-h-[80px] py-1.5 px-2.5 flex-1"
              disabled={loading}
            />
            <Button
              size="sm"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 shrink-0"
            >
              {loading
                ? <Icon name="Loader2" size={13} className="animate-spin" />
                : <Icon name="Send" size={13} />
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}