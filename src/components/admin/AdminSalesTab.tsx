import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/0bd83394-12a6-4b3b-a52b-b76da9e791d9";
const HEADERS = { "Content-Type": "application/json", "X-Admin-Token": "admin2025" };
const STORAGE_KEY = "admin_sales_history";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface QuickPrompt {
  id: string;
  label: string;
  icon: string;
  text: string;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <p key={i} className="font-bold text-gray-900 mt-3 mb-1">{line.slice(4)}</p>;
        if (line.startsWith("## ")) return <p key={i} className="font-bold text-base text-gray-900 mt-3 mb-1">{line.slice(3)}</p>;
        if (line.startsWith("# ")) return <p key={i} className="font-bold text-lg text-gray-900 mt-2 mb-1">{line.slice(2)}</p>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-gray-800">{line.slice(2, -2)}</p>;
        if (line.startsWith("- ") || line.startsWith("• ")) return <p key={i} className="flex gap-2"><span className="text-emerald-400 shrink-0">•</span><span>{line.slice(2)}</span></p>;
        if (/^\d+\.\s/.test(line)) {
          const match = line.match(/^(\d+)\.\s(.*)$/);
          if (match) return <p key={i} className="flex gap-2"><span className="text-emerald-500 font-bold shrink-0 w-5">{match[1]}.</span><span>{match[2]}</span></p>;
        }
        if (line.trim() === "") return <div key={i} className="h-2" />;
        const withBold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={i} dangerouslySetInnerHTML={{ __html: withBold }} />;
      })}
    </div>
  );
}

export default function AdminSalesTab() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<QuickPrompt[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [apiUrl, setApiUrl] = useState(API_URL);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/func2url.json")
      .then(r => r.json())
      .then((urls: Record<string, string>) => {
        const url = urls["sales-agent"];
        if (url) {
          setApiUrl(url);
          return fetch(url, { headers: HEADERS });
        }
        return null;
      })
      .then(r => r?.json())
      .then(d => { if (d) setQuickPrompts(d.quick_prompts || []); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg, ts: Date.now() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        message: msg,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await res.json();
    const answer = data.answer || "Не удалось получить ответ.";
    setMessages(prev => [...prev, { role: "assistant", content: answer, ts: Date.now() }]);
    setLoading(false);
  }

  function handleCopy(content: string, idx: number) {
    copyText(content);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  function clearHistory() {
    if (confirm("Очистить историю переписки?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
            <Icon name="TrendingUp" size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              Алексей — AI-менеджер по продажам
              <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                GPT-4o
              </span>
            </h2>
            <p className="text-sm text-gray-500">12 лет опыта в продажах ремонтно-строительных услуг</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-gray-400 hover:text-red-500">
            <Icon name="Trash2" size={14} className="mr-1.5" />
            Очистить
          </Button>
        )}
      </div>

      {/* Область чата */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-4 mb-3">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 py-8">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icon name="TrendingUp" size={30} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Привет! Я Алексей 👋</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ваш персональный AI-менеджер по продажам. Помогу закрывать сделки, 
                работать с возражениями и составлять скрипты под любую ситуацию.
              </p>
            </div>

            <div className="w-full max-w-2xl">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center mb-3">
                С чего начнём?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickPrompts.map(qp => (
                  <button
                    key={qp.id}
                    onClick={() => send(qp.text)}
                    className="flex flex-col items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl text-center hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center">
                      <Icon name={qp.icon as Parameters<typeof Icon>[0]["name"]} fallback="MessageSquare" size={16} className="text-emerald-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 leading-tight">{qp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Icon name="TrendingUp" size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] group relative ${m.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <Card className={`px-4 py-3 shadow-sm border-0 ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white rounded-2xl rounded-tr-sm"
                      : "bg-white rounded-2xl rounded-tl-sm"
                  }`}>
                    {m.role === "user"
                      ? <p className="text-sm leading-relaxed">{m.content}</p>
                      : <MarkdownText text={m.content} />
                    }
                  </Card>
                  <div className={`flex items-center gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <span className="text-[11px] text-gray-400">{formatTime(m.ts)}</span>
                    {m.role === "assistant" && (
                      <button
                        onClick={() => handleCopy(m.content, i)}
                        className="text-[11px] text-gray-400 hover:text-emerald-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon name={copied === i ? "Check" : "Copy"} size={11} />
                        {copied === i ? "Скопировано" : "Копировать"}
                      </button>
                    )}
                  </div>
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="User" size={14} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name="TrendingUp" size={14} className="text-white" />
                </div>
                <Card className="px-4 py-3 bg-white border-0 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </Card>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Быстрые подсказки при активном чате */}
      {!isEmpty && quickPrompts.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 shrink-0">
          {quickPrompts.slice(0, 4).map(qp => (
            <button
              key={qp.id}
              onClick={() => send(qp.text)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 whitespace-nowrap transition-all shrink-0 disabled:opacity-50"
            >
              <Icon name={qp.icon as Parameters<typeof Icon>[0]["name"]} fallback="MessageSquare" size={12} />
              {qp.label}
            </button>
          ))}
        </div>
      )}

      {/* Поле ввода */}
      <div className="flex gap-2 shrink-0">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          placeholder="Спросите Алексея про скрипты, возражения, закрытие сделок..."
          className="resize-none min-h-[52px] max-h-[120px] rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20"
          rows={1}
          disabled={loading}
        />
        <Button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="h-[52px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shrink-0"
        >
          <Icon name={loading ? "Loader2" : "Send"} size={18} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>
    </div>
  );
}