import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

const DEFAULT_QUESTIONS = [
  "Сколько стоит ремонт квартиры 50 м²?",
  "С чего начать ремонт в новостройке?",
  "Как выбрать надёжного подрядчика?",
  "Какой бюджет заложить на ванную?",
];

const CONTEXT_QUESTIONS: Record<string, { greeting: string; questions: string[] }> = {
  "/windows": {
    greeting: "Вижу, вы считаете окна! Помогу с выбором профиля, стеклопакета и подскажу по ценам.",
    questions: [
      "Какой профиль окон лучше — KBE, Rehau или Veka?",
      "Двухкамерный или трёхкамерный стеклопакет?",
      "Сколько стоит остекление балкона 6 метров?",
      "Как сэкономить на окнах без потери качества?",
    ],
  },
  "/ceilings": {
    greeting: "Считаете потолки? Подскажу по материалам, освещению и ценам на монтаж.",
    questions: [
      "ПВХ или тканевый натяжной потолок — что лучше?",
      "Сколько точечных светильников нужно на комнату?",
      "Можно ли делать натяжной потолок в ванной?",
      "Какой потолок визуально увеличит комнату?",
    ],
  },
  "/flooring": {
    greeting: "Подбираете полы? Помогу сравнить покрытия, рассчитать расход и выбрать оптимальный вариант.",
    questions: [
      "Ламинат или SPC-плитка — что практичнее?",
      "Какой класс ламината нужен для кухни?",
      "Нужна ли подложка под тёплый пол?",
      "Как рассчитать запас плитки на подрезку?",
    ],
  },
  "/electrics": {
    greeting: "Считаете электрику? Подскажу по разводке, автоматам, и сколько розеток нужно.",
    questions: [
      "Сколько розеток нужно в однокомнатной квартире?",
      "Медь или алюминий — какой кабель лучше?",
      "Нужен ли УЗО в ванной комнате?",
      "Как спланировать электрику в новостройке?",
    ],
  },
  "/bathroom": {
    greeting: "Ремонт ванной — одна из самых частых задач! Помогу с плиткой, сантехникой и гидроизоляцией.",
    questions: [
      "Какую плитку выбрать для маленькой ванной?",
      "Нужна ли гидроизоляция под плитку?",
      "Акриловая ванна или душевая кабина?",
      "Как уложиться в бюджет при ремонте ванной?",
    ],
  },
  "/newbuild": {
    greeting: "Ремонт в новостройке — с нуля! Подскажу порядок работ, материалы и на чём можно сэкономить.",
    questions: [
      "С чего начать ремонт в новостройке?",
      "Нужна ли стяжка если застройщик уже сделал?",
      "Сколько времени занимает ремонт с нуля?",
      "Когда лучше делать электрику — до или после штукатурки?",
    ],
  },
  "/turnkey": {
    greeting: "Ремонт под ключ — самый популярный формат! Помогу разобраться в бюджете и этапах.",
    questions: [
      "Что входит в ремонт квартиры под ключ?",
      "Сколько стоит ремонт двушки под ключ?",
      "Как контролировать подрядчика при ремонте?",
      "Какие скрытые расходы бывают при ремонте?",
    ],
  },
  "/bathhouse": {
    greeting: "Строите баню? Помогу с выбором материала стен, печи и планировкой.",
    questions: [
      "Баня из бруса или каркасная — что лучше?",
      "Какую печь выбрать для бани 4×6?",
      "Нужна ли вентиляция в парной?",
      "Как правильно утеплить баню изнутри?",
    ],
  },
  "/framehouse": {
    greeting: "Каркасный дом — быстро и доступно! Подскажу по технологиям, утеплению и фундаменту.",
    questions: [
      "OSB или ЦСП для каркасного дома?",
      "Какой фундамент нужен для каркасника?",
      "Каркасный дом для круглогодичного проживания — реально?",
      "Сколько стоит каркасный дом 100 м² под ключ?",
    ],
  },
  "/office": {
    greeting: "Ремонт офиса или коммерческого помещения? Помогу с бюджетом и требованиями.",
    questions: [
      "Какие нормы для ремонта офисных помещений?",
      "Нужна ли пожарная сигнализация в офисе?",
      "Сколько стоит ремонт офиса за м²?",
      "Как спланировать open space?",
    ],
  },
  "/designer": {
    greeting: "Создаёте дизайн-проект? Помогу с выбором стиля, цветовых решений и планировкой.",
    questions: [
      "Какой стиль интерьера сейчас в тренде?",
      "Как сочетать цвета в интерьере?",
      "Нужен ли дизайн-проект для ремонта?",
      "Как визуально увеличить маленькую комнату?",
    ],
  },
  "/masters": {
    greeting: "Подбираете мастера? Подскажу, на что обратить внимание при выборе подрядчика.",
    questions: [
      "Как проверить надёжность подрядчика?",
      "Что должно быть в договоре на ремонт?",
      "Бригада или компания — кого выбрать?",
      "Как правильно принимать работу у мастера?",
    ],
  },
  "/calculator": {
    greeting: "Составляете смету? Помогу разобраться с расценками и подскажу, где можно сэкономить.",
    questions: [
      "Какие работы самые дорогие при ремонте?",
      "Как проверить, не завышена ли смета?",
      "На чём можно сэкономить при ремонте?",
      "Какой порядок работ при капремонте?",
    ],
  },
  "/organizer": {
    greeting: "Планируете ремонт по этапам? Подскажу оптимальные сроки и последовательность работ.",
    questions: [
      "Сколько длится ремонт однокомнатной квартиры?",
      "В каком порядке делать ремонт?",
      "Как спланировать бюджет по этапам?",
      "Какие этапы ремонта можно делать параллельно?",
    ],
  },
};

export default function ChatWidget() {
  const navigate = useNavigate();
  const location = useLocation();
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
          <p className="text-xs text-gray-700 font-medium">
            {CONTEXT_QUESTIONS[location.pathname]
              ? CONTEXT_QUESTIONS[location.pathname].questions[0]
              : "Задайте вопрос ИИ-эксперту по ремонту"}
          </p>
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
                    {CONTEXT_QUESTIONS[location.pathname]?.greeting ||
                      "Привет! Я ИИ-эксперт Авангард — помогу с любым вопросом по ремонту, дизайну и материалам. Спрашивайте!"}
                  </div>
                </div>
                <div className="space-y-1.5 pl-9">
                  {(CONTEXT_QUESTIONS[location.pathname]?.questions || DEFAULT_QUESTIONS).map((q) => (
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