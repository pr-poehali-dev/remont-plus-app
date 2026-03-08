import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  role: "assembler" | "customer";
}

export default function ProfilePage({ role }: Props) {
  const [name, setName] = useState(role === "assembler" ? "Иван Петров" : "ИП Смирнов");
  const [company, setCompany] = useState(role === "assembler" ? "Склад №1" : "ООО АвтоСервис");
  const [phone, setPhone] = useState("+7 (900) 123-45-67");
  const [email, setEmail] = useState("user@example.com");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade-in max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Личный кабинет</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Настройки профиля</p>
      </div>

      {/* Avatar */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-xl font-semibold">{name.charAt(0)}</span>
        </div>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {role === "assembler" ? "Супервайзер" : "Заявка"} · {company}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        {[
          { label: "Имя / Название", value: name, onChange: setName },
          { label: "Организация", value: company, onChange: setCompany },
          { label: "Телефон", value: phone, onChange: setPhone },
          { label: "Email", value: email, onChange: setEmail },
        ].map((field) => (
          <div key={field.label}>
            <label className="block text-xs text-muted-foreground mb-1.5">{field.label}</label>
            <input
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        ))}

        <div className="pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {saved ? (
              <>
                <Icon name="Check" size={14} />
                Сохранено
              </>
            ) : (
              <>
                <Icon name="Save" size={14} />
                Сохранить изменения
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications block */}
      <div className="bg-card border border-border rounded-xl p-5 mt-4">
        <h3 className="font-medium text-sm mb-3">Уведомления</h3>
        <div className="space-y-2">
          {[
            { label: "Новые заявки", desc: "Получать уведомление при поступлении заявки" },
            { label: "Смена статуса", desc: "Уведомлять при изменении статуса заявки" },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">{n.label}</div>
                <div className="text-xs text-muted-foreground">{n.desc}</div>
              </div>
              <div className="w-9 h-5 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}