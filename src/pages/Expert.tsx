import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";

const API_URL = "https://functions.poehali.dev/5a1ec782-2df4-4948-89e4-7eaa77f6f7a2";
const NOTIFY_URL = "https://functions.poehali.dev/a8b87e78-89d1-48d8-ba76-8da2e0df32a3";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const TOPICS = [
  { icon: "Palette", label: "Дизайн-проект", prompt: "Что входит в дизайн-проект интерьера и сколько он стоит? Расскажи подробно с аргументами." },
  { icon: "Sofa", label: "Выбор стиля", prompt: "Какой стиль интерьера выбрать для квартиры? Расскажи о популярных стилях с аргументами — почему выбрать именно тот или иной стиль." },
  { icon: "Hammer", label: "Ремонт под ключ", prompt: "Что включает в себя ремонт под ключ и чем он лучше, чем нанимать рабочих самостоятельно? Дай обоснованные аргументы." },
  { icon: "Layers", label: "Отделочные материалы", prompt: "Какие отделочные материалы лучше выбрать для ремонта квартиры? Сравни варианты по цене и качеству с конкретными аргументами." },
  { icon: "Lightbulb", label: "Освещение", prompt: "Как правильно выбрать освещение для квартиры? Какие светильники, где устанавливать и почему — дай подробные рекомендации." },
  { icon: "DollarSign", label: "Бюджет и смета", prompt: "Как составить бюджет на ремонт квартиры? На чём можно сэкономить без потери качества и на чём экономить не стоит — с обоснованием." },
  { icon: "PaintBucket", label: "Цвет интерьера", prompt: "Как выбрать цветовую гамму интерьера? Какие сочетания работают и почему, какие ошибки чаще всего допускают?" },
  { icon: "Ruler", label: "Планировка", prompt: "Как правильно спланировать пространство квартиры? Эргономика, зонирование, типичные ошибки при планировке." },
  { icon: "FloorPlan", label: "Кухня", prompt: "Как выбрать и спланировать кухню? Рабочий треугольник, материалы фасадов, столешницы — с аргументами за каждый вариант." },
  { icon: "Bath", label: "Ванная и санузел", prompt: "Как сделать ремонт ванной комнаты правильно? Какую плитку выбрать, какую сантехнику, на чём нельзя экономить." },
];

function formatText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-bold text-gray-900 mt-4 mb-1.5 text-base">{line.slice(2, -2)}</p>;
    }
    if (line.match(/^\*\*.+\*\*/)) {
      return (
        <p key={i} className="mb-1.5 text-sm leading-relaxed">
          {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j} className="text-gray-900">{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    }
    if (line.startsWith("• ") || line.startsWith("- ")) {
      return (
        <div key={i} className="flex gap-2 mb-1.5 text-sm">
          <span className="text-[#c9a84c] flex-shrink-0 mt-0.5 font-bold">▸</span>
          <span className="text-gray-700">{line.slice(2)}</span>
        </div>
      );
    }
    if (line.match(/^\d+\.\s/)) {
      return (
        <div key={i} className="flex gap-2 mb-1.5 text-sm">
          <span className="text-[#c9a84c] font-bold flex-shrink-0 w-5">{line.match(/^\d+/)?.[0]}.</span>
          <span className="text-gray-700">{line.replace(/^\d+\.\s/, "")}</span>
        </div>
      );
    }
    if (line === "") return <div key={i} className="h-2" />;
    return <p key={i} className="mb-1.5 leading-relaxed text-sm text-gray-700">{line}</p>;
  });
}

export default function Expert() {
  useMeta({
    title: "Эксперт по дизайну и ремонту — консультация ИИ онлайн",
    description: "ИИ-консультант АВАНГАРД ответит на любой вопрос по дизайну интерьера, выбору материалов и ремонту. Без регистрации.",
  });

  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [briefModal, setBriefModal] = useState<{ text: string } | null>(null);
  const [briefName, setBriefName] = useState("");
  const [briefPhone, setBriefPhone] = useState("");
  const [briefSending, setBriefSending] = useState(false);
  const [briefSent, setBriefSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasTZ = (text: string) => text.includes("Техническое задание");

  const extractTZ = (text: string) => {
    const start = text.indexOf("**📋 Техническое задание");
    const block = start !== -1 ? text.slice(start) : text;
    return block.replace(/\*\*/g, "").replace(/---/g, "").trim();
  };

  const copyTZ = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(extractTZ(text));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const sendBrief = async () => {
    setBriefSending(true);
    try {
      await fetch(NOTIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_design_brief",
          name: briefName,
          phone: briefPhone,
          brief: briefModal?.text ?? "",
        }),
      });
      setBriefSent(true);
    } finally {
      setBriefSending(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setStarted(true);

    const userMsg: Message = { role: "user", text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const history = updatedMessages.slice(0, -1).map((m) => ({ role: m.role, text: m.text }));
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.message || "Не удалось получить ответ." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Произошла ошибка. Попробуйте ещё раз." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Шапка */}
      <div className="bg-gradient-to-r from-[#0f0f13] to-[#1a1a24] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-white/40 hover:text-white/80 transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex items-center justify-center shadow-lg shadow-[#c9a84c]/20">
              <Icon name="Sparkles" size={18} className="text-[#0f0f13]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base tracking-wide" style={{ fontFamily: "Montserrat, sans-serif" }}>
                ЭКСПЕРТ
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/40 text-xs" style={{ fontFamily: "Rubik, sans-serif" }}>
                  онлайн · вход свободный
                </span>
              </div>
            </div>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-white/30 text-xs" style={{ fontFamily: "Rubik, sans-serif" }}>
            <Icon name="Shield" size={13} />
            Дизайн · Интерьер · Ремонт
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col" style={{ minHeight: "calc(100vh - 72px)" }}>

        {/* Топик-кнопки (начальный экран) */}
        {!started && (
          <div className="mb-6">
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm" style={{ fontFamily: "Rubik, sans-serif" }}>
                Выберите тему или задайте свой вопрос ниже
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {TOPICS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => sendMessage(t.prompt)}
                  className="flex flex-col items-center gap-2 bg-white hover:bg-[#c9a84c]/5 border border-gray-100 hover:border-[#c9a84c]/40 rounded-2xl px-3 py-4 text-center transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c]/10 to-[#e8c96a]/10 group-hover:from-[#c9a84c]/20 group-hover:to-[#e8c96a]/20 flex items-center justify-center transition-colors">
                    <Icon name={t.icon} size={18} className="text-[#c9a84c]" />
                  </div>
                  <span className="text-gray-600 group-hover:text-gray-900 text-xs font-medium leading-tight transition-colors">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Область сообщений */}
        <div className="flex-1 space-y-5 mb-4" style={{ fontFamily: "Rubik, sans-serif" }}>
          {started && (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex-shrink-0 flex items-center justify-center mt-1 shadow-md">
                      <Icon name="Sparkles" size={15} className="text-[#0f0f13]" />
                    </div>
                  )}
                  {msg.role === "user" && (
                    <div className="w-9 h-9 rounded-full bg-[#0f0f13] flex-shrink-0 flex items-center justify-center mt-1">
                      <Icon name="User" size={15} className="text-white/70" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2 max-w-[80%]">
                    <div className={`rounded-2xl px-5 py-4 shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#0f0f13] text-white rounded-tr-sm text-sm"
                        : "bg-white text-gray-700 rounded-tl-sm border border-gray-100"
                    }`}>
                      {msg.role === "assistant" ? formatText(msg.text) : msg.text}
                    </div>
                    {msg.role === "assistant" && hasTZ(msg.text) && (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => copyTZ(msg.text, i)}
                          className="flex items-center gap-1.5 bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 border border-[#c9a84c]/30 text-[#8a6f28] hover:text-[#6b5420] text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{ fontFamily: "Rubik, sans-serif" }}
                        >
                          <Icon name={copiedIndex === i ? "Check" : "Copy"} size={12} />
                          {copiedIndex === i ? "Скопировано!" : "Скопировать ТЗ"}
                        </button>
                        <button
                          onClick={() => { setBriefModal({ text: extractTZ(msg.text) }); setBriefSent(false); setBriefName(""); setBriefPhone(""); }}
                          className="flex items-center gap-1.5 bg-[#0f0f13] hover:bg-[#1a1a24] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                          style={{ fontFamily: "Rubik, sans-serif" }}
                        >
                          <Icon name="Send" size={12} />
                          Отправить дизайнеру
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex-shrink-0 flex items-center justify-center shadow-md">
                    <Icon name="Sparkles" size={15} className="text-[#0f0f13]" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm border border-gray-100">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      <span className="text-gray-400 text-xs ml-2">Анализирую...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Другие темы после ответа */}
              {!isLoading && messages[messages.length - 1]?.role === "assistant" && (
                <div className="ml-12">
                  <p className="text-gray-400 text-xs mb-2">Другие темы:</p>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.slice(0, 6).map((t) => (
                      <button
                        key={t.label}
                        onClick={() => sendMessage(t.prompt)}
                        className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-100 hover:border-[#c9a84c]/40 rounded-full px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 transition-all shadow-sm"
                      >
                        <Icon name={t.icon} size={11} className="text-[#c9a84c]" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Ввод */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sticky bottom-4">
          <div className="flex gap-3 items-end">
            {started && (
              <button
                onClick={() => { setMessages([]); setStarted(false); setInput(""); }}
                className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 mb-2"
                title="Начать заново"
              >
                <Icon name="RotateCcw" size={16} />
              </button>
            )}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Задайте вопрос по дизайну, интерьеру или ремонту..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#c9a84c]/60 rounded-xl px-4 py-3 text-gray-800 text-sm placeholder:text-gray-400 resize-none outline-none transition-colors disabled:opacity-50 leading-relaxed"
              style={{
                fontFamily: "Rubik, sans-serif",
                minHeight: 46,
                maxHeight: 140,
                scrollbarWidth: "none",
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 140) + "px";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] hover:from-[#d4b55a] flex items-center justify-center flex-shrink-0 transition-all shadow-md shadow-[#c9a84c]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none mb-0.5"
            >
              <Icon name="Send" size={16} className="text-[#0f0f13]" />
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-2 text-center" style={{ fontFamily: "Rubik, sans-serif" }}>
            Enter — отправить · Shift+Enter — новая строка · вход свободный, без регистрации
          </p>
        </div>

        {/* CTA */}
        <div className="mt-4 flex gap-3 justify-center">
          <a
            href="/calculator"
            className="inline-flex items-center gap-2 bg-[#0f0f13] hover:bg-[#1a1a24] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <Icon name="FileText" size={14} />
            Заказать дизайн-проект
          </a>
          <a
            href="/calculator"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            style={{ fontFamily: "Rubik, sans-serif" }}
          >
            <Icon name="Calculator" size={14} />
            Рассчитать стоимость
          </a>
        </div>
      </div>

      {/* Модалка отправки ТЗ */}
      {briefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setBriefModal(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "Rubik, sans-serif" }}
          >
            <button onClick={() => setBriefModal(null)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors">
              <Icon name="X" size={18} />
            </button>

            {briefSent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={28} className="text-green-500" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Отправлено!</h3>
                <p className="text-gray-500 text-sm">Дизайнер свяжется с вами в ближайшее время.</p>
                <button onClick={() => setBriefModal(null)} className="mt-5 w-full bg-[#0f0f13] hover:bg-[#1a1a24] text-white text-sm font-semibold py-3 rounded-xl transition-colors">
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex items-center justify-center flex-shrink-0">
                    <Icon name="Send" size={16} className="text-[#0f0f13]" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Отправить ТЗ дизайнеру</h3>
                    <p className="text-gray-400 text-xs">Дизайнер свяжется и обсудит детали</p>
                  </div>
                </div>

                <div className="bg-[#fafaf8] border border-gray-100 rounded-xl p-3 mb-4 max-h-36 overflow-y-auto">
                  <p className="text-gray-500 text-xs leading-relaxed whitespace-pre-wrap">{briefModal.text.slice(0, 400)}{briefModal.text.length > 400 ? "…" : ""}</p>
                </div>

                <div className="space-y-3 mb-5">
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={briefName}
                    onChange={(e) => setBriefName(e.target.value)}
                    className="w-full border border-gray-200 focus:border-[#c9a84c]/60 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Телефон для связи"
                    value={briefPhone}
                    onChange={(e) => setBriefPhone(e.target.value)}
                    className="w-full border border-gray-200 focus:border-[#c9a84c]/60 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={sendBrief}
                  disabled={!briefName.trim() || !briefPhone.trim() || briefSending}
                  className="w-full bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] hover:from-[#d4b55a] text-[#0f0f13] text-sm font-bold py-3 rounded-xl transition-all shadow-md shadow-[#c9a84c]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {briefSending ? <><Icon name="Loader2" size={15} className="animate-spin" />Отправляем…</> : <><Icon name="Send" size={15} />Отправить дизайнеру</>}
                </button>
                <p className="text-gray-400 text-xs text-center mt-3">Нажимая кнопку, вы соглашаетесь на обработку персональных данных</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}