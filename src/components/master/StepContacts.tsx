import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { MasterProfile, BUSINESS_STATUSES } from "./types";

interface Props {
  profile: MasterProfile;
  update: (field: keyof MasterProfile, value: unknown) => void;
}

export default function StepContacts({ profile, update }: Props) {
  return (
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
  );
}
