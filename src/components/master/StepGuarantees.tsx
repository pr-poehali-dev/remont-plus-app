import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { MasterProfile, GUARANTEE_PERIODS, PAYMENT_METHODS, PAYMENT_SCHEDULES } from "./types";

interface Props {
  profile: MasterProfile;
  update: (field: keyof MasterProfile, value: unknown) => void;
  toggleInArray: (field: "specializations" | "payment_methods", value: string) => void;
}

export default function StepGuarantees({ profile, update, toggleInArray }: Props) {
  return (
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
  );
}
