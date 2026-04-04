import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import reachGoal from "@/lib/metrika";

const AI_CHAT_URL = "https://functions.poehali.dev/bead5363-79de-43a3-8d46-8c1cc2b00ad4";
const SESSION_KEY = "avangard_chat_session";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "Сколько стоит ремонт квартиры 50 м²?",
  "С чего начать ремонт в новостройке?",
  "Как выбрать надёжного подрядчика?",
  "Какой бюджет заложить на ванную?",
];

export default function ChatWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() =>
    localStorage.getItem(SESSION_KEY) || ""
  );
  const [unread, setUnread] = useState(0);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setPulse(false);
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
      if (newMessages.length === 1) reachGoal("chat_started");

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
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center ${
          open
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-gradient-to-br from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600"
        }`}
        aria-label="ИИ-эксперт по ремонту"
      >
        {open ? (
          <Icon name="X" size={22} />
        ) : (
          <Icon name="Sparkles" size={22} />
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
        {!open && pulse && (
          <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-30" />
        )}
      </button>

      {!open && messages.length === 0 && pulse && (
        <div className="fixed bottom-[88px] right-6 z-50 bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-3 max-w-[220px] animate-fade-in">
          <p className="text-xs text-gray-700 font-medium">Задайте вопрос ИИ-эксперту по ремонту</p>
          <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-white border-r border-b border-gray-200" />
        </div>
      )}

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: 540 }}>

          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="Sparkles" size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">ИИ-эксперт</p>
              <p className="text-white/70 text-xs">Консультант по ремонту и дизайну</p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/expert");
              }}
              className="text-white/70 hover:text-white transition-colors p-1"
              title="Развернуть на всю страницу"
            >
              <Icon name="Maximize2" size={15} />
            </button>
            <button
              onClick={clearChat}
              className="text-white/70 hover:text-white transition-colors p-1"
              title="Очистить чат"
            >
              <Icon name="Trash2" size={15} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <Icon name="ChevronDown" size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="Sparkles" size={12} className="text-white" />
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-gray-800 max-w-[85%]">
                    Привет! Я ИИ-эксперт Авангард — помогу с любым вопросом по ремонту, дизайну и материалам. Спрашивайте!
                  </div>
                </div>
                <div className="space-y-1.5 pl-9">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-xl border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors"
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
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="Sparkles" size={12} className="text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gray-800 text-white rounded-tr-sm"
                      : "bg-orange-50 border border-orange-100 text-gray-800 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                  <Icon name="Sparkles" size={12} className="text-white" />
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-3 border-t border-gray-100 flex gap-2 shrink-0">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Задайте вопрос по ремонту..."
              className="flex-1 text-sm rounded-xl border-gray-200 focus-visible:ring-orange-400"
              disabled={loading}
            />
            <Button
              size="icon"
              className="rounded-xl shrink-0 bg-orange-500 hover:bg-orange-600"
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
