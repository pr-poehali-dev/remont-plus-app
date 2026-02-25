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
  { icon: "Layers", label: "Материалы", prompt: "Какие отделочные материалы лучше выбрать для ремонта квартиры? Сравни варианты по цене и качеству." },
  { icon: "Lightbulb", label: "Освещение", prompt: "Как правильно выбрать освещение для квартиры? Какие светильники и где устанавливать?" },
  { icon: "DollarSign", label: "Бюджет", prompt: "Как составить бюджет на ремонт квартиры и на чём можно сэкономить без потери качества?" },
];

function formatText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-semibold text-gray-800 mt-2 mb-1 text-xs">{line.slice(2, -2)}</p>;
    }
    if (line.match(/^\*\*.+\*\*/)) {
      return (
        <p key={i} className="mb-1 text-xs">
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
        <div key={i} className="flex gap-1.5 mb-0.5 text-xs">
          <span className="text-[#c9a84c] flex-shrink-0 mt-0.5">▸</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    }
    if (line.match(/^\d+\.\s/)) {
      return (
        <div key={i} className="flex gap-1.5 mb-0.5 text-xs">
          <span className="text-[#c9a84c] font-semibold flex-shrink-0 w-4">{line.match(/^\d+/)?.[0]}.</span>
          <span>{line.replace(/^\d+\.\s/, "")}</span>
        </div>
      );
    }
    if (line === "") return <div key={i} className="h-1.5" />;
    return <p key={i} className="mb-0.5 leading-relaxed text-xs">{line}</p>;
  });
}

export default function HomeConsultant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (e.key === "Enter") { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col" style={{ minHeight: 480 }}>

      {/* Шапка */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0f0f13] to-[#1a1a24]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex items-center justify-center shadow-md">
            <Icon name="Sparkles" size={16} className="text-[#0f0f13]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: "Montserrat, sans-serif" }}>
              ЭКСПЕРТ
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/50 text-xs" style={{ fontFamily: "Rubik, sans-serif" }}>онлайн · доступ свободный</span>
            </div>
          </div>
        </div>
        {started && (
          <button
            onClick={() => { setMessages([]); setStarted(false); setInput(""); }}
            className="text-white/30 hover:text-white/60 transition-colors"
            title="Новый вопрос"
          >
            <Icon name="RotateCcw" size={14} />
          </button>
        )}
      </div>

      {/* Сообщения */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50"
        style={{ maxHeight: 300, fontFamily: "Rubik, sans-serif" }}
      >
        {!started ? (
          <div className="space-y-4">
            {/* Приветствие */}
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex-shrink-0 flex items-center justify-center mt-0.5">
                <Icon name="Sparkles" size={12} className="text-[#0f0f13]" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 max-w-[85%]">
                <p className="text-gray-700 text-xs leading-relaxed">
                  Привет! Я ИИ-эксперт АВАНГАРД по дизайну и ремонту. Выберите тему или задайте свой вопрос:
                </p>
              </div>
            </div>
            {/* Темы */}
            <div className="grid grid-cols-2 gap-1.5 ml-9">
              {TOPICS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => sendMessage(t.prompt)}
                  className="flex items-center gap-2 bg-white hover:bg-[#c9a84c]/5 border border-gray-100 hover:border-[#c9a84c]/40 rounded-xl px-3 py-2 text-left transition-all group"
                >
                  <Icon name={t.icon} size={13} className="text-[#c9a84c] flex-shrink-0" />
                  <span className="text-gray-600 group-hover:text-gray-800 text-xs leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Icon name="Sparkles" size={12} className="text-[#0f0f13]" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-[#0f0f13] text-white rounded-tr-sm"
                    : "bg-white text-gray-700 rounded-tl-sm border border-gray-100"
                }`}>
                  {msg.role === "assistant" ? formatText(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex-shrink-0 flex items-center justify-center">
                  <Icon name="Sparkles" size={12} className="text-[#0f0f13]" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Ввод */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Задайте вопрос..."
            disabled={isLoading}
            className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#c9a84c]/60 rounded-xl px-3 py-2.5 text-gray-800 text-xs placeholder:text-gray-400 outline-none transition-colors disabled:opacity-50"
            style={{ fontFamily: "Rubik, sans-serif" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] hover:from-[#d4b55a] flex items-center justify-center flex-shrink-0 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="Send" size={14} className="text-[#0f0f13]" />
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <a
          href="/calculator"
          className="flex items-center justify-center gap-2 w-full bg-[#0f0f13] hover:bg-[#1a1a24] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <Icon name="FileText" size={13} />
          Заказать дизайн-проект
        </a>
      </div>
    </div>
  );
}
