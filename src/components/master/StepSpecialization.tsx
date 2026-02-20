import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { MasterProfile, SPECIALIZATIONS } from "./types";

interface Props {
  profile: MasterProfile;
  update: (field: keyof MasterProfile, value: unknown) => void;
  toggleInArray: (field: "specializations" | "payment_methods", value: string) => void;
}

export default function StepSpecialization({ profile, update, toggleInArray }: Props) {
  return (
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
  );
}
