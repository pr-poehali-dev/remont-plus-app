import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import reachGoal from "@/lib/metrika";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  context: string;
  suggestions?: string[];
  endpoint?: string;
  title?: string;
  className?: string;
}

const DEFAULT_ENDPOINT = "https://functions.poehali.dev/ai-expert";
const DEFAULT_SUGGESTIONS = [
  "Что можно сэкономить без потери качества?",
  "Какие материалы лучше выбрать?",
  "На что обратить внимание?",
];

export default function InlineAIHelper({
  context,
  suggestions = DEFAULT_SUGGESTIONS,
  endpoint = DEFAULT_ENDPOINT,
  title = "ИИ-консультант",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    reachGoal("inline_ai_message", { context: context.slice(0, 50) });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, context }),
      });
      const data = await res.json().catch(() => ({}));
      const answer =
        data.answer ||
        data.reply ||
        data.text ||
        "Спасибо за вопрос! Сейчас я не смог получить ответ — попробуйте позже или загляните в раздел /expert.";
      setMessages((m) => [...m, { role: "assistant", content: String(answer) }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Не удалось получить ответ. Проверьте интернет и попробуйте снова." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); reachGoal("inline_ai_open"); }}
        className={`w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all group ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <Icon name="Sparkles" size={20} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-bold text-sm">Спросить ИИ-консультанта</p>
          <p className="text-xs text-white/80 truncate">Подскажет, на чём сэкономить и что выбрать</p>
        </div>
        <Icon name="ArrowRight" size={18} className="flex-shrink-0" />
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
          <Icon name="Sparkles" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">{title}</p>
          <p className="text-xs text-white/80">Задайте вопрос по вашему расчёту</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Свернуть"
        >
          <Icon name="ChevronDown" size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[360px] min-h-[180px] bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <Icon name="MessageSquare" size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-xs text-gray-500">Выберите готовый вопрос или напишите свой</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-violet-500 text-white rounded-br-md"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
              <Icon name="Loader2" size={14} className="animate-spin" />
              ИИ печатает...
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 0 && suggestions.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-100 flex flex-wrap gap-1.5 bg-white">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-full font-medium transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="p-3 border-t border-gray-100 bg-white flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ваш вопрос..."
          className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white h-10 px-4"
        >
          <Icon name="Send" size={16} />
        </Button>
      </form>
    </div>
  );
}
