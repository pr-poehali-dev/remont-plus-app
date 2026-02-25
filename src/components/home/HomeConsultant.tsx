import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/5a1ec782-2df4-4948-89e4-7eaa77f6f7a2";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const TOPICS = [
  { icon: "Palette", label: "Дизайн-проект", prompt: "Что входит в дизайн-проект интерьера и сколько он стоит?" },
  { icon: "Sofa", label: "Выбор стиля", prompt: "Какой стиль интерьера выбрать для квартиры? Расскажи о популярных стилях с аргументами." },
  { icon: "Hammer", label: "Ремонт под ключ", prompt: "Что включает в себя ремонт под ключ и чем он лучше, чем нанимать рабочих самостоятельно?" },
  { icon: "Layers", label: "Отделочные материалы", prompt: "Какие отделочные материалы лучше выбрать для ремонта квартиры? Сравни варианты по цене и качеству." },
  { icon: "Lightbulb", label: "Освещение", prompt: "Как правильно выбрать освещение для квартиры? Какие светильники и где устанавливать?" },
  { icon: "DollarSign", label: "Бюджет и смета", prompt: "Как составить бюджет на ремонт квартиры и на чём можно сэкономить без потери качества?" },
];

function formatText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-semibold text-[#1a1a1a] mt-3 mb-1">{line.slice(2, -2)}</p>;
    }
    if (line.match(/^\*\*.+\*\*/)) {
      return (
        <p key={i} className="mb-1">
          {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    }
    if (line.startsWith("• ") || line.startsWith("- ")) {
      return (
        <div key={i} className="flex gap-2 mb-1">
          <span className="text-[#c9a84c] mt-1 flex-shrink-0">▸</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    }
    if (line.match(/^\d+\.\s/)) {
      return (
        <div key={i} className="flex gap-2 mb-1">
          <span className="text-[#c9a84c] font-semibold flex-shrink-0 w-5">{line.match(/^\d+/)?.[0]}.</span>
          <span>{line.replace(/^\d+\.\s/, "")}</span>
        </div>
      );
    }
    if (line === "") return <div key={i} className="h-2" />;
    return <p key={i} className="mb-1 leading-relaxed">{line}</p>;
  });
}

export default function HomeConsultant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      const history = updatedMessages.slice(0, -1).map((m) => ({
        role: m.role,
        text: m.text,
      }));

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTopicClick = (prompt: string) => {
    sendMessage(prompt);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleReset = () => {
    setMessages([]);
    setStarted(false);
    setInput("");
  };

  return (
    <section className="py-20 bg-[#0f0f13]">
      <div className="max-w-5xl mx-auto px-4">

        {/* Заголовок */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
            <span className="text-[#c9a84c] text-sm font-medium tracking-wide">ИИ-консультант онлайн</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Консультация по дизайну<br />и ремонту — бесплатно
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto" style={{ fontFamily: "Rubik, sans-serif" }}>
            Задайте любой вопрос — получите профессиональный ответ с аргументами<br className="hidden md:block" /> и рекомендациями от ИИ-эксперта АВАНГАРД
          </p>
        </div>

        {/* Карточка-калькулятор */}
        <div className="bg-[#18181f] border border-white/8 rounded-3xl overflow-hidden shadow-2xl">

          {/* Верхняя панель */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#13131a]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex items-center justify-center shadow-lg shadow-[#c9a84c]/20">
                <Icon name="Sparkles" size={18} className="text-[#0f0f13]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Эксперт АВАНГАРД
                </p>
                <p className="text-white/40 text-xs" style={{ fontFamily: "Rubik, sans-serif" }}>
                  Дизайн · Интерьер · Ремонт
                </p>
              </div>
            </div>
            {started && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors"
              >
                <Icon name="RotateCcw" size={13} />
                Новый вопрос
              </button>
            )}
          </div>

          {/* Область сообщений */}
          <div
            className="overflow-y-auto px-6 py-6 space-y-5"
            style={{ minHeight: 340, maxHeight: 420, fontFamily: "Rubik, sans-serif" }}
          >
            {!started ? (
              /* Начальный экран */
              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex-shrink-0 flex items-center justify-center">
                    <Icon name="Sparkles" size={14} className="text-[#0f0f13]" />
                  </div>
                  <div className="bg-[#1e1e28] rounded-2xl rounded-tl-sm px-5 py-4 max-w-md">
                    <p className="text-white/90 text-sm leading-relaxed">
                      Привет! Я эксперт по дизайну интерьера и ремонту компании АВАНГАРД. Помогу вам разобраться в любом вопросе — от выбора стиля до сметы. Выберите тему или задайте свой вопрос:
                    </p>
                  </div>
                </div>

                {/* Темы-кнопки */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 ml-11">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => handleTopicClick(topic.prompt)}
                      className="flex items-center gap-2.5 bg-[#1e1e28] hover:bg-[#252533] border border-white/8 hover:border-[#c9a84c]/40 rounded-xl px-4 py-3 text-left transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#c9a84c]/10 group-hover:bg-[#c9a84c]/20 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Icon name={topic.icon} size={15} className="text-[#c9a84c]" />
                      </div>
                      <span className="text-white/70 group-hover:text-white text-xs font-medium transition-colors leading-tight">
                        {topic.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Сообщения */
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex-shrink-0 flex items-center justify-center mt-1">
                        <Icon name="Sparkles" size={14} className="text-[#0f0f13]" />
                      </div>
                    )}
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center mt-1">
                        <Icon name="User" size={14} className="text-white/60" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#c9a84c]/15 border border-[#c9a84c]/25 text-white/90 rounded-tr-sm"
                          : "bg-[#1e1e28] text-white/80 rounded-tl-sm"
                      }`}
                    >
                      {msg.role === "assistant" ? formatText(msg.text) : msg.text}
                    </div>
                  </div>
                ))}

                {/* Индикатор загрузки */}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex-shrink-0 flex items-center justify-center">
                      <Icon name="Sparkles" size={14} className="text-[#0f0f13]" />
                    </div>
                    <div className="bg-[#1e1e28] rounded-2xl rounded-tl-sm px-5 py-4">
                      <div className="flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 bg-[#c9a84c]/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-[#c9a84c]/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-[#c9a84c]/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        <span className="text-white/30 text-xs ml-2">Анализирую...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Быстрые темы после ответа */}
                {!isLoading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
                  <div className="ml-11">
                    <p className="text-white/30 text-xs mb-2">Другие темы:</p>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.slice(0, 4).map((topic) => (
                        <button
                          key={topic.label}
                          onClick={() => handleTopicClick(topic.prompt)}
                          className="flex items-center gap-1.5 bg-[#1e1e28] hover:bg-[#252533] border border-white/8 hover:border-[#c9a84c]/30 rounded-full px-3 py-1.5 text-xs text-white/50 hover:text-white/80 transition-all"
                        >
                          <Icon name={topic.icon} size={11} className="text-[#c9a84c]/70" />
                          {topic.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Поле ввода */}
          <div className="border-t border-white/8 px-4 py-4 bg-[#13131a]">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Задайте вопрос по дизайну или ремонту..."
                  rows={1}
                  disabled={isLoading}
                  className="w-full bg-[#1e1e28] border border-white/10 focus:border-[#c9a84c]/50 rounded-xl px-4 py-3 text-white/90 text-sm placeholder:text-white/25 resize-none outline-none transition-colors leading-relaxed disabled:opacity-50"
                  style={{
                    fontFamily: "Rubik, sans-serif",
                    minHeight: 46,
                    maxHeight: 120,
                    scrollbarWidth: "none",
                  }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 120) + "px";
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] hover:from-[#d4b55a] hover:to-[#f0d47a] flex items-center justify-center flex-shrink-0 transition-all shadow-lg shadow-[#c9a84c]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Icon name="Send" size={16} className="text-[#0f0f13]" />
              </button>
            </div>
            <p className="text-white/20 text-xs mt-2 text-center" style={{ fontFamily: "Rubik, sans-serif" }}>
              Enter — отправить · Shift+Enter — новая строка
            </p>
          </div>
        </div>

        {/* CTA кнопка */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/calculator"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] hover:from-[#d4b55a] hover:to-[#f0d47a] text-[#0f0f13] font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-[#c9a84c]/25 hover:shadow-[#c9a84c]/40 hover:scale-[1.02]"
            style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15 }}
          >
            <Icon name="FileText" size={18} />
            Заказать дизайн-проект
          </a>
          <a
            href="/calculator"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
            style={{ fontFamily: "Rubik, sans-serif" }}
          >
            <Icon name="Calculator" size={15} />
            Рассчитать стоимость ремонта
          </a>
        </div>

        {/* Нижние аргументы */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: "ShieldCheck", text: "Проверенные рекомендации", sub: "Только обоснованные советы" },
            { icon: "Clock", text: "Ответ за секунды", sub: "Без ожидания менеджера" },
            { icon: "MessageCircle", text: "Любой вопрос", sub: "Дизайн, материалы, бюджет" },
          ].map((item) => (
            <div key={item.text} className="flex flex-col items-center text-center gap-2 py-4">
              <Icon name={item.icon} size={20} className="text-[#c9a84c]" />
              <p className="text-white/70 text-xs font-medium" style={{ fontFamily: "Montserrat, sans-serif" }}>{item.text}</p>
              <p className="text-white/30 text-xs" style={{ fontFamily: "Rubik, sans-serif" }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}