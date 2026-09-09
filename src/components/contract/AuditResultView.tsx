import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { RISK_META, VERDICT_META, type AuditResult } from "./contractAuditTypes";

interface Props {
  data: AuditResult;
  locked?: boolean;
  onUnlock?: () => void;
  unlocking?: boolean;
  price?: number;
}

export default function AuditResultView({ data, locked = false, onUnlock, unlocking, price = 1490 }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState<number | null>(0);
  const v = VERDICT_META[data.verdict] ?? VERDICT_META.fix;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Формулировка скопирована", description: "Вставьте её в договор или отправьте заказчику" });
  };

  const scoreColor =
    data.risk_score >= 70 ? "text-red-600" : data.risk_score >= 40 ? "text-orange-500" : "text-emerald-600";

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{data.title}</h2>
            {data.summary && <p className="text-sm text-gray-500 mt-1">{data.summary}</p>}
          </div>
          <div className="text-center shrink-0">
            <div className={`text-3xl font-extrabold tabular-nums ${scoreColor}`}>{data.risk_score}</div>
            <div className="text-xs text-gray-400">риск из 100</div>
          </div>
        </div>

        <div className={`mt-4 rounded-xl border p-3 flex items-start gap-2.5 ${v.cls}`}>
          <Icon name={v.icon} size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">{v.label}</p>
            {data.verdict_text && <p className="text-sm mt-0.5 opacity-90">{data.verdict_text}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {(["critical", "high", "medium", "info"] as const).map((k) => (
            <div key={k} className={`rounded-lg border p-2.5 text-center ${RISK_META[k].badge}`}>
              <div className="text-xl font-bold tabular-nums">{data.counts?.[k] ?? 0}</div>
              <div className="text-[11px] font-medium">{RISK_META[k].label}</div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mt-4 pt-3 border-t text-sm">
          <div className="flex justify-between gap-2"><span className="text-gray-400">Заказчик</span><span className="text-gray-800 text-right">{data.parties?.customer}</span></div>
          <div className="flex justify-between gap-2"><span className="text-gray-400">Подрядчик</span><span className="text-gray-800 text-right">{data.parties?.contractor}</span></div>
          <div className="flex justify-between gap-2"><span className="text-gray-400">Сумма</span><span className="text-gray-800 text-right">{data.parties?.amount}</span></div>
          <div className="flex justify-between gap-2"><span className="text-gray-400">Срок</span><span className="text-gray-800 text-right">{data.parties?.term}</span></div>
        </div>
      </Card>

      <div className="relative">
        {locked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
            <div className="bg-white shadow-lg border border-gray-200 rounded-xl px-6 py-5 text-center max-w-xs">
              <Icon name="Lock" size={28} className="mx-auto text-teal-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900">Разбор пунктов скрыт</p>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Вердикт виден. Откройте опасные пункты, цитаты и готовые формулировки на замену.
              </p>
              {onUnlock && (
                <Button onClick={onUnlock} disabled={unlocking} className="w-full bg-teal-600 hover:bg-teal-700">
                  {unlocking ? (
                    <><Icon name="LoaderCircle" size={15} className="animate-spin mr-2" /> Открываем…</>
                  ) : (
                    <><Icon name="Unlock" size={15} className="mr-2" /> Открыть разбор — {price} ₽</>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className={locked ? "blur-[6px] pointer-events-none select-none space-y-4" : "space-y-4"}>
          {data.issues.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="ShieldAlert" size={16} className="text-red-500" /> Опасные пункты ({data.issues.length})
              </h3>
              <div className="space-y-2">
                {data.issues.map((it, i) => {
                  const m = RISK_META[it.risk];
                  const isOpen = open === i;
                  return (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpen(isOpen ? null : i)}
                        className="w-full flex items-start gap-2.5 p-3 text-left hover:bg-gray-50 transition"
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${m.dot}`} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">{it.clause}</span>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded border ${m.badge}`}>{m.label}</span>
                            <span className="text-[11px] text-gray-400">{it.category}</span>
                          </span>
                          <span className="block text-sm text-gray-600 mt-1">{it.problem}</span>
                        </span>
                        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-gray-400 shrink-0 mt-1" />
                      </button>

                      {isOpen && (
                        <div className="px-3 pb-3 pt-0 space-y-3 border-t border-gray-100">
                          {it.quote && (
                            <div className="bg-red-50 border-l-2 border-red-300 px-3 py-2 mt-3">
                              <p className="text-[11px] font-semibold text-red-600 mb-0.5">Формулировка в договоре</p>
                              <p className="text-sm text-gray-700 italic">«{it.quote}»</p>
                            </div>
                          )}
                          {it.money_risk && it.money_risk !== "—" && (
                            <p className="text-sm text-gray-700 flex items-center gap-1.5">
                              <Icon name="Banknote" size={14} className="text-red-500" />
                              <span className="font-medium">Риск потерь:</span> {it.money_risk}
                            </p>
                          )}
                          {it.fix && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-[11px] font-semibold text-emerald-700">Заменить на</p>
                                <button onClick={() => copy(it.fix)} className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 text-xs">
                                  <Icon name="Copy" size={13} /> копировать
                                </button>
                              </div>
                              <p className="text-sm text-gray-800">{it.fix}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {data.missing.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="FilePlus2" size={16} className="text-teal-600" /> Чего не хватает в договоре
              </h3>
              <div className="space-y-3">
                {data.missing.map((m, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-3">
                    <p className="text-sm font-semibold text-gray-900">{m.what}</p>
                    {m.why && <p className="text-xs text-gray-500 mt-0.5">{m.why}</p>}
                    {m.text && (
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-2.5 mt-2">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-[11px] font-semibold text-teal-700">Готовый пункт</p>
                          <button onClick={() => copy(m.text)} className="text-teal-600 hover:text-teal-800 flex items-center gap-1 text-xs">
                            <Icon name="Copy" size={13} /> копировать
                          </button>
                        </div>
                        <p className="text-sm text-gray-800">{m.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {data.negotiation.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="MessagesSquare" size={16} className="text-indigo-600" /> Что сказать заказчику
              </h3>
              <ol className="space-y-2">
                {data.negotiation.map((n, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ol>
              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={() => copy(data.negotiation.map((n, i) => `${i + 1}. ${n}`).join("\n"))}
              >
                <Icon name="Copy" size={15} className="mr-2" /> Скопировать все тезисы
              </Button>
            </Card>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Аудит носит рекомендательный характер и не заменяет консультацию юриста.
      </p>
    </div>
  );
}
