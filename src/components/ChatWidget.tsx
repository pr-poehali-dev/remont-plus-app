import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

const AI_CHAT_URL = "https://functions.poehali.dev/bead5363-79de-43a3-8d46-8c1cc2b00ad4";
const SESSION_KEY = "avangard_chat_session";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "Сколько стоит ремонт ванной?",
  "С чего начать ремонт квартиры?",
  "Как выбрать подрядчика?",
  "Какие документы нужны для сметы?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() =>
    localStorage.getItem(SESSION_KEY) || ""
  );
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          messages: newMessages,
        }),
      });
      const data = await res.json();

      if (data.sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem(SESSION_KEY, data.sessionId);
      }

      const assistantMsg: Message = { role: "assistant", content: data.message };
      setMessages((prev) => [...prev, assistantMsg]);

      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ошибка соединения. Попробуйте ещё раз." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId("");
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <>
      {/* Кнопка открытия */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Открыть чат-помощника"
      >
        {open ? (
          <Icon name="X" size={22} />
        ) : (
          <Icon name="MessageCircle" size={22} />
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Диалог */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: 520 }}>

          {/* Шапка */}
          <div className="bg-primary px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="Bot" size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Авангард Ассистент</p>
              <p className="text-white/70 text-xs">Консультант по ремонту · онлайн</p>
            </div>
            <button
              onClick={clearChat}
              className="text-white/60 hover:text-white transition-colors p-1"
              title="Очистить чат"
            >
              <Icon name="Trash2" size={15} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-1"
            >
              <Icon name="ChevronDown" size={18} />
            </button>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="Bot" size={14} className="text-primary" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-gray-800 max-w-[85%]">
                    Привет! Я помогу разобраться с ремонтом — от выбора материалов до расчёта сметы. Спрашивайте!
                  </div>
                </div>
                <div className="space-y-1.5 pl-9">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-xl border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="Bot" size={14} className="text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-800 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name="Bot" size={14} className="text-primary" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Поле ввода */}
          <div className="px-3 py-3 border-t border-gray-100 flex gap-2 shrink-0">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Задайте вопрос..."
              className="flex-1 text-sm rounded-xl border-gray-200"
              disabled={loading}
            />
            <Button
              size="icon"
              className="rounded-xl shrink-0"
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
            >
              <Icon name="Send" size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
