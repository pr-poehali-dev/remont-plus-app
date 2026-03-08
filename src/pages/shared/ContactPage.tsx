import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!form.name.trim() || !form.message.trim()) return;
    setSent(true);
  };

  return (
    <div className="animate-fade-in max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Контакты и поддержка</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Напишите нам — ответим в течение дня</p>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { icon: "Phone", label: "Телефон", value: "+7 (800) 555-35-35" },
          { icon: "Mail", label: "Email", value: "info@sborpro.ru" },
          { icon: "MapPin", label: "Адрес", value: "г. Москва, ул. Складская, 12" },
        ].map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <Icon name={c.icon} size={18} className="mx-auto mb-2 text-muted-foreground" />
            <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
            <div className="text-xs font-medium leading-tight">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Feedback form */}
      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-scale-in">
          <Icon name="CheckCircle" size={32} className="mx-auto mb-3 text-green-500" />
          <div className="font-semibold text-green-800 mb-1">Сообщение отправлено!</div>
          <p className="text-sm text-green-600">Мы свяжемся с вами в ближайшее время</p>
          <button
            onClick={() => { setSent(false); setForm({ name: "", message: "" }); }}
            className="mt-4 text-xs text-green-700 underline"
          >
            Отправить ещё
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm">Обратная связь</h3>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Ваше имя</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Иван Иванов"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Сообщение</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Опишите вопрос или проблему..."
              rows={4}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <button
            onClick={handleSend}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="Send" size={14} />
            Отправить
          </button>
        </div>
      )}
    </div>
  );
}
