import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';

interface SettingItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  defaultValue: boolean;
}

const settingsList: SettingItem[] = [
  { id: 'adblock', icon: 'ShieldCheck', title: 'Блокировка рекламы', description: 'Автоматически скрывать рекламу на просматриваемых сайтах', defaultValue: true },
  { id: 'sandbox', icon: 'Box', title: 'Песочница (sandbox)', description: 'Изолировать просматриваемые сайты для безопасности', defaultValue: true },
  { id: 'animations', icon: 'Sparkles', title: 'Анимации', description: 'Плавные переходы и анимации интерфейса', defaultValue: true },
  { id: 'history', icon: 'Clock', title: 'История поиска', description: 'Сохранять историю поисковых запросов', defaultValue: false },
];

function getSettingValue(id: string, defaultValue: boolean): boolean {
  try {
    const v = localStorage.getItem(`setting_${id}`);
    return v !== null ? JSON.parse(v) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setSettingValue(id: string, value: boolean) {
  localStorage.setItem(`setting_${id}`, JSON.stringify(value));
}

export default function Settings() {
  const [values, setValues] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    settingsList.forEach(s => { map[s.id] = getSettingValue(s.id, s.defaultValue); });
    return map;
  });

  const toggle = (id: string) => {
    const newVal = !values[id];
    setSettingValue(id, newVal);
    setValues(prev => ({ ...prev, [id]: newVal }));
  };

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Настройки</h1>
        <p className="text-sm text-muted-foreground mb-6">Настройте поисковик под себя</p>

        <div className="space-y-3">
          {settingsList.map((s, i) => (
            <div
              key={s.id}
              className="rounded-2xl border border-border/50 bg-card/50 p-5 flex items-center justify-between gap-4 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name={s.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              </div>
              <Switch checked={values[s.id]} onCheckedChange={() => toggle(s.id)} />
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border/50 bg-card/50 p-5 animate-fade-in">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Icon name="Info" size={18} className="text-primary" />
            О приложении
          </h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>НексусПоиск — безопасный поисковик со встроенным просмотром</p>
            <p>Версия: 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
