import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/2642096f-c763-42ef-8dc1-67e3acce37b3";

const SPECIALIZATIONS = [
  "Штукатурка", "Покраска", "Укладка плитки", "Электрика",
  "Сантехника", "Гипсокартон", "Поклейка обоев", "Стяжка пола",
  "Ламинат/паркет", "Натяжные потолки", "Демонтаж", "Кладка",
  "Утепление", "Фасадные работы", "Кровля", "Столярные работы",
  "Дизайн интерьера", "Мебель на заказ", "Металлоконструкции", "Сварочные работы",
];

const PAYMENT_METHODS = [
  { id: "cash", label: "Наличные" },
  { id: "card", label: "Банковская карта" },
  { id: "transfer", label: "Онлайн-перевод" },
  { id: "invoice", label: "По счёту" },
];

const PAYMENT_SCHEDULES = [
  { id: "prepay", label: "Предоплата 100%" },
  { id: "postpay", label: "Постоплата" },
  { id: "staged", label: "Поэтапно" },
  { id: "split", label: "50/50 (аванс + по завершении)" },
];

const BUSINESS_STATUSES = [
  { id: "self_employed", label: "Самозанятый" },
  { id: "ip", label: "ИП" },
  { id: "ooo", label: "ООО" },
  { id: "individual", label: "Физлицо" },
];

const GUARANTEE_PERIODS = [
  { id: "none", label: "Без гарантии" },
  { id: "3m", label: "3 месяца" },
  { id: "6m", label: "6 месяцев" },
  { id: "1y", label: "1 год" },
  { id: "2y", label: "2 года" },
  { id: "3y", label: "3 года" },
];

interface MasterProfile {
  full_name: string;
  phone: string;
  email: string;
  telegram: string;
  whatsapp: string;
  instagram: string;
  website: string;
  citizenship: string;
  experience_years: number | null;
  specializations: string[];
  has_tools: boolean;
  work_style: string;
  technologies_knowledge: string;
  certificates: string[];
  portfolio_photos: string[];
  portfolio_links: string[];
  payment_methods: string[];
  payment_schedule: string;
  discount_info: string;
  business_status: string;
  description: string;
  location: string;
  guarantee_period: string;
  guarantee_description: string;
}

const emptyProfile: MasterProfile = {
  full_name: "", phone: "", email: "", telegram: "", whatsapp: "",
  instagram: "", website: "", citizenship: "", experience_years: null,
  specializations: [], has_tools: false, work_style: "both",
  technologies_knowledge: "", certificates: [], portfolio_photos: [],
  portfolio_links: [], payment_methods: [], payment_schedule: "",
  discount_info: "", business_status: "", description: "", location: "",
  guarantee_period: "", guarantee_description: "",
};

interface Props {
  userId: number;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  onComplete?: () => void;
}

export default function MasterQuestionnaire({ userId, userName, userPhone, userEmail, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<MasterProfile>({
    ...emptyProfile,
    full_name: userName || "",
    phone: userPhone || "",
    email: userEmail || "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCertificate, setNewCertificate] = useState("");
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_master_profile", user_id: userId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.exists && data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const update = (field: keyof MasterProfile, value: unknown) =>
    setProfile((p) => ({ ...p, [field]: value }));

  const toggleInArray = (field: "specializations" | "payment_methods", value: string) => {
    const arr = profile[field] as string[];
    update(field, arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_master_profile", user_id: userId, profile }),
      });
      const data = await res.json();
      if (data.success && data.profile_completed) {
        onComplete?.();
      }
    } catch (e) {
      console.error("Save error:", e);
    }
    setSaving(false);
  };

  const steps = [
    { title: "Контакты", icon: "User" },
    { title: "Специализация", icon: "Wrench" },
    { title: "Портфолио", icon: "Award" },
    { title: "Гарантии и оплата", icon: "ShieldCheck" },
  ];

  const canNext = () => {
    if (step === 0) return profile.full_name && profile.phone;
    if (step === 1) return profile.specializations.length > 0;
    return true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icon name="Loader2" size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full
                ${i === step ? "bg-orange-500 text-white shadow-lg" : i < step ? "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200" : "bg-gray-100 text-gray-400"}`}
            >
              <Icon name={i < step ? "Check" : s.icon} size={16} />
              <span className="hidden md:inline">{s.title}</span>
              <span className="md:hidden">{i + 1}</span>
            </button>
            {i < steps.length - 1 && <div className={`h-0.5 w-4 flex-shrink-0 ${i < step ? "bg-green-300" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

        {/* ШАГ 0: Контактная информация */}
        {step === 0 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="User" size={22} className="text-orange-500" /> Контактная информация
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ФИО *</label>
              <Input value={profile.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Иванов Иван Иванович" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                <Input value={profile.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+7 (999) 123-45-67" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} placeholder="master@email.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <Input className="pl-7" value={profile.telegram} onChange={(e) => update("telegram", e.target.value)} placeholder="username" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <Input value={profile.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+7 (999) 123-45-67" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <Input className="pl-7" value={profile.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="profile" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Сайт</label>
                <Input value={profile.website} onChange={(e) => update("website", e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Город / регион</label>
                <Input value={profile.location} onChange={(e) => update("location", e.target.value)} placeholder="Москва" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Гражданство</label>
                <Input value={profile.citizenship} onChange={(e) => update("citizenship", e.target.value)} placeholder="РФ" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Правовой статус</label>
              <div className="grid grid-cols-2 gap-2">
                {BUSINESS_STATUSES.map((bs) => (
                  <button
                    key={bs.id}
                    onClick={() => update("business_status", profile.business_status === bs.id ? "" : bs.id)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                      ${profile.business_status === bs.id ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"}`}
                  >
                    {bs.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ШАГ 1: Специализация и опыт */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="Wrench" size={22} className="text-orange-500" /> Специализация и опыт
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Опыт работы (лет)</label>
                <Input
                  type="number" min={0} max={50}
                  value={profile.experience_years ?? ""}
                  onChange={(e) => update("experience_years", e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Формат работы</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "solo", label: "Сам" },
                    { id: "team", label: "Команда" },
                    { id: "both", label: "Оба" },
                  ].map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => update("work_style", ws.id)}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all
                        ${profile.work_style === ws.id ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"}`}
                    >
                      {ws.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Специализация * (выберите все подходящие)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => toggleInArray("specializations", spec)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all text-left
                      ${profile.specializations.includes(spec) ? "bg-orange-50 text-orange-700 border-orange-300 font-medium" : "bg-white text-gray-600 border-gray-200 hover:border-orange-200"}`}
                  >
                    {profile.specializations.includes(spec) && <Icon name="Check" size={14} className="inline mr-1" />}
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200">
              <Checkbox
                id="has_tools"
                checked={profile.has_tools}
                onCheckedChange={(v) => update("has_tools", !!v)}
              />
              <label htmlFor="has_tools" className="text-sm font-medium text-gray-700 cursor-pointer">
                Есть свой инструмент и оборудование
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Знание технологий и материалов</label>
              <Textarea
                value={profile.technologies_knowledge}
                onChange={(e) => update("technologies_knowledge", e.target.value)}
                placeholder="Опишите, с какими технологиями и материалами вы работаете..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
              <Textarea
                value={profile.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Кратко расскажите о себе и своём подходе к работе..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* ШАГ 2: Портфолио и сертификаты */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="Award" size={22} className="text-orange-500" /> Портфолио и сертификаты
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Сертификаты и курсы</label>
              <div className="space-y-2">
                {profile.certificates.map((cert, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Icon name="FileText" size={16} className="text-orange-500" />
                    <span className="text-sm flex-1">{cert}</span>
                    <button
                      onClick={() => update("certificates", profile.certificates.filter((_, j) => j !== i))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newCertificate}
                    onChange={(e) => setNewCertificate(e.target.value)}
                    placeholder="Название сертификата или курса"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newCertificate.trim()) {
                        update("certificates", [...profile.certificates, newCertificate.trim()]);
                        setNewCertificate("");
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!newCertificate.trim()}
                    onClick={() => {
                      if (newCertificate.trim()) {
                        update("certificates", [...profile.certificates, newCertificate.trim()]);
                        setNewCertificate("");
                      }
                    }}
                  >
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ссылки на примеры работ</label>
              <div className="space-y-2">
                {profile.portfolio_links.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Icon name="Link" size={16} className="text-blue-500" />
                    <a href={link} target="_blank" rel="noreferrer" className="text-sm text-blue-600 flex-1 truncate hover:underline">{link}</a>
                    <button
                      onClick={() => update("portfolio_links", profile.portfolio_links.filter((_, j) => j !== i))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="https://..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newLink.trim()) {
                        update("portfolio_links", [...profile.portfolio_links, newLink.trim()]);
                        setNewLink("");
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!newLink.trim()}
                    onClick={() => {
                      if (newLink.trim()) {
                        update("portfolio_links", [...profile.portfolio_links, newLink.trim()]);
                        setNewLink("");
                      }
                    }}
                  >
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-sm text-orange-700">
                <Icon name="Info" size={14} className="inline mr-1" />
                Фото выполненных работ можно будет загрузить позже в личном кабинете
              </p>
            </div>
          </div>
        )}

        {/* ШАГ 3: Гарантии и условия оплаты */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="ShieldCheck" size={22} className="text-orange-500" /> Гарантии и условия оплаты
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Гарантийный период</label>
              <div className="grid grid-cols-3 gap-2">
                {GUARANTEE_PERIODS.map((gp) => (
                  <button
                    key={gp.id}
                    onClick={() => update("guarantee_period", profile.guarantee_period === gp.id ? "" : gp.id)}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all
                      ${profile.guarantee_period === gp.id ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"}`}
                  >
                    {gp.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Условия гарантии</label>
              <Textarea
                value={profile.guarantee_description}
                onChange={(e) => update("guarantee_description", e.target.value)}
                placeholder="Опишите, на что распространяется гарантия и каковы условия её применения..."
                rows={3}
              />
            </div>

            <div className="border-t border-gray-100 pt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Форма расчёта (можно несколько)</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => toggleInArray("payment_methods", pm.id)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                      ${profile.payment_methods.includes(pm.id) ? "bg-orange-50 text-orange-700 border-orange-300" : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"}`}
                  >
                    {profile.payment_methods.includes(pm.id) && <Icon name="Check" size={14} className="inline mr-1" />}
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">График платежей</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_SCHEDULES.map((ps) => (
                  <button
                    key={ps.id}
                    onClick={() => update("payment_schedule", profile.payment_schedule === ps.id ? "" : ps.id)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                      ${profile.payment_schedule === ps.id ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"}`}
                  >
                    {ps.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Скидки и специальные условия</label>
              <Textarea
                value={profile.discount_info}
                onChange={(e) => update("discount_info", e.target.value)}
                placeholder="Например: скидка 10% при заказе от 100 000 ₽, бесплатный замер..."
                rows={3}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="gap-2"
          >
            <Icon name="ChevronLeft" size={16} /> Назад
          </Button>

          <span className="text-sm text-gray-400">Шаг {step + 1} из {steps.length}</span>

          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="gap-2 bg-orange-500 hover:bg-orange-600"
            >
              Далее <Icon name="ChevronRight" size={16} />
            </Button>
          ) : (
            <Button
              onClick={save}
              disabled={saving}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Check" size={16} />}
              Сохранить анкету
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
