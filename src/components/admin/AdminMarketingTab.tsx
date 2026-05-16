import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import * as XLSX from "xlsx";

const API_URL = "https://functions.poehali.dev/5566c153-084c-456d-bf40-8ca10d1a8509";
const HEADERS = { "Content-Type": "application/json", "X-Admin-Token": "admin2025" };
const STORAGE_KEY = "admin_marketing_history";

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

const CATEGORIES = [
  { id: "all", label: "Все", icon: "Sparkles" },
  { id: "content", label: "Контент", icon: "PenLine" },
  { id: "ads", label: "Реклама", icon: "Megaphone" },
  { id: "strategy", label: "Стратегия", icon: "Target" },
  { id: "analytics", label: "Аналитика", icon: "BarChart2" },
];

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
        if (line.startsWith("- ") || line.startsWith("• ")) return <p key={i} className="flex gap-2"><span className="text-violet-400 shrink-0">•</span><span>{line.slice(2)}</span></p>;
        if (/^\d+\.\s/.test(line)) {
          const match = line.match(/^(\d+)\.\s(.*)$/);
          if (match) return <p key={i} className="flex gap-2"><span className="text-violet-500 font-bold shrink-0 w-5">{match[1]}.</span><span>{match[2]}</span></p>;
        }
        if (line.trim() === "") return <div key={i} className="h-2" />;
        const withBold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={i} dangerouslySetInnerHTML={{ __html: withBold }} />;
      })}
    </div>
  );
}

export default function AdminMarketingTab() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<QuickPrompt[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(API_URL, { headers: HEADERS })
      .then(r => r.json())
      .then(d => setQuickPrompts(d.quick_prompts || []));
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

    const res = await fetch(API_URL, {
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

  function parseTableFromText(text: string): string[][] | null {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const tableLines = lines.filter(l => l.includes("|") && l.split("|").length >= 3);
    if (tableLines.length < 2) return null;
    const rows = tableLines
      .filter(l => !/^\|[-| ]+\|$/.test(l))
      .map(l => l.replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
    return rows.length >= 2 ? rows : null;
  }

  function exportLastAssistantMessage() {
    const assistantMessages = messages.filter(m => m.role === "assistant");
    if (!assistantMessages.length) return;
    const lastMsg = assistantMessages[assistantMessages.length - 1];
    const text = lastMsg.content;

    const table = parseTableFromText(text);
    const wb = XLSX.utils.book_new();

    if (table) {
      const ws = XLSX.utils.aoa_to_sheet(table);
      XLSX.utils.book_append_sheet(wb, ws, "Таблица");
    }

    const textLines = text.split("\n").map(l => [l.replace(/[#*_`]/g, "").trim()]);
    const wsText = XLSX.utils.aoa_to_sheet([["Аналитический отчёт Марины"], [""], ...textLines]);
    wsText["!cols"] = [{ wch: 120 }];
    XLSX.utils.book_append_sheet(wb, wsText, "Отчёт");

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `marina-report-${date}.xlsx`);
  }

  function exportFullChat() {
    const wb = XLSX.utils.book_new();
    const rows: string[][] = [["Время", "Роль", "Сообщение"]];
    messages.forEach(m => {
      rows.push([formatTime(m.ts), m.role === "user" ? "Вы" : "Марина", m.content]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 10 }, { wch: 10 }, { wch: 120 }];
    XLSX.utils.book_append_sheet(wb, ws, "Переписка");

    const assistantMessages = messages.filter(m => m.role === "assistant");
    assistantMessages.forEach((m, i) => {
      const table = parseTableFromText(m.content);
      if (table) {
        const ws2 = XLSX.utils.aoa_to_sheet(table);
        XLSX.utils.book_append_sheet(wb, ws2, `Таблица ${i + 1}`);
      }
    });

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `marina-full-${date}.xlsx`);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-sm">
            <Icon name="Sparkles" size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              Марина — AI-маркетолог
              <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                GPT-4o
              </span>
            </h2>
            <p className="text-sm text-gray-500">15 лет опыта в маркетинге ремонтно-строительной отрасли</p>
          </div>
        </div>
        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={exportLastAssistantMessage} className="text-gray-500 hover:text-green-600">
              <Icon name="FileSpreadsheet" size={14} className="mr-1.5" />
              Экспорт ответа
            </Button>
            <Button variant="ghost" size="sm" onClick={exportFullChat} className="text-gray-500 hover:text-green-600">
              <Icon name="Download" size={14} className="mr-1.5" />
              Весь чат
            </Button>
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-gray-400 hover:text-red-500">
              <Icon name="Trash2" size={14} className="mr-1.5" />
              Очистить
            </Button>
          </div>
        )}
      </div>

      {/* Область чата */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-4 mb-3">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 py-8">
            {/* Приветствие */}
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icon name="Sparkles" size={30} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Привет! Я Марина 👋</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ваш персональный AI-маркетолог с экспертизой в ремонтно-строительной отрасли.
                Помогу с контентом, рекламой, стратегией и аналитикой.
              </p>
            </div>

            {/* Быстрые запросы */}
            <div className="w-full max-w-2xl">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center mb-3">
                С чего начнём?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickPrompts.map(qp => (
                  <button
                    key={qp.id}
                    onClick={() => send(qp.text)}
                    className="flex flex-col items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl text-center hover:border-violet-400 hover:bg-violet-50 hover:shadow-sm transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center">
                      <Icon name={qp.icon} size={16} className="text-violet-600" />
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Icon name="Sparkles" size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] group relative ${m.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    m.role === "user"
                      ? "bg-violet-600 text-white rounded-tr-sm"
                      : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
                  }`}>
                    {m.role === "user"
                      ? <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                      : <MarkdownText text={m.content} />
                    }
                  </div>
                  <div className={`flex items-center gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] text-gray-400">{formatTime(m.ts)}</span>
                    {m.role === "assistant" && (
                      <>
                        <button
                          onClick={() => handleCopy(m.content, i)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-400 hover:text-violet-600 flex items-center gap-1"
                        >
                          <Icon name={copied === i ? "Check" : "Copy"} size={11} />
                          {copied === i ? "Скопировано" : "Копировать"}
                        </button>
                        <button
                          onClick={() => {
                            const wb = XLSX.utils.book_new();
                            const table = parseTableFromText(m.content);
                            if (table) {
                              const ws = XLSX.utils.aoa_to_sheet(table);
                              XLSX.utils.book_append_sheet(wb, ws, "Таблица");
                            }
                            const textLines = m.content.split("\n").map(l => [l.replace(/[#*_`]/g, "").trim()]);
                            const wsText = XLSX.utils.aoa_to_sheet([["Отчёт Марины"], [""], ...textLines]);
                            wsText["!cols"] = [{ wch: 120 }];
                            XLSX.utils.book_append_sheet(wb, wsText, "Отчёт");
                            XLSX.writeFile(wb, `marina-${Date.now()}.xlsx`);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-400 hover:text-green-600 flex items-center gap-1"
                        >
                          <Icon name="FileSpreadsheet" size={11} />
                          Excel
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="User" size={14} className="text-gray-500" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name="Sparkles" size={14} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2].map(j => (
                      <span key={j} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />

            {/* Быстрые подсказки под чатом */}
            {!loading && quickPrompts.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 mb-2 flex items-center gap-1">
                  <Icon name="Zap" size={11} />
                  Быстрые запросы
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map(qp => (
                    <button
                      key={qp.id}
                      onClick={() => send(qp.text)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                    >
                      <Icon name={qp.icon} size={11} />
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Поле ввода */}
      <div className="shrink-0">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Спросите Марину о маркетинге... (Enter — отправить, Shift+Enter — новая строка)"
            rows={3}
            disabled={loading}
            className="resize-none pr-16 text-sm rounded-xl border-gray-200 focus:border-violet-400 bg-white"
          />
          <Button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="absolute bottom-3 right-3 h-9 w-9 p-0 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
          >
            {loading
              ? <Icon name="Loader2" size={16} className="animate-spin" />
              : <Icon name="Send" size={16} />
            }
          </Button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5 text-center">
          Модель GPT-4o · История сохраняется в браузере
        </p>
      </div>
    </div>
  );
}