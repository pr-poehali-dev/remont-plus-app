import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { MasterProfile, emptyProfile } from "./types";
import StepContacts from "./StepContacts";
import StepSpecialization from "./StepSpecialization";
import StepPortfolio from "./StepPortfolio";
import StepGuarantees from "./StepGuarantees";

const AUTH_URL = "https://functions.poehali.dev/2642096f-c763-42ef-8dc1-67e3acce37b3";

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
        {step === 0 && <StepContacts profile={profile} update={update} />}
        {step === 1 && <StepSpecialization profile={profile} update={update} toggleInArray={toggleInArray} />}
        {step === 2 && <StepPortfolio profile={profile} update={update} />}
        {step === 3 && <StepGuarantees profile={profile} update={update} toggleInArray={toggleInArray} />}

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
