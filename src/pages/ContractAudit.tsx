import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEOMeta, { breadcrumbJsonLd } from "@/components/SEOMeta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { toast } from "@/hooks/use-toast";
import { extractFromFiles } from "@/lib/documentExtract";
import AuditResultView from "@/components/contract/AuditResultView";
import type { AuditResult } from "@/components/contract/contractAuditTypes";
import { isMasterAccess } from "@/lib/masterAccess";
import funcUrls from "@/../backend/func2url.json";

const AUDIT_URL = (funcUrls as Record<string, string>)["contract-audit"];
const PAY_URL = (funcUrls as Record<string, string>)["yookassa-yookassa"];
const PAID_KEY = "contract_audit_paid";
const AUDIT_PRICE = 1990;

export default function ContractAudit() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [extracted, setExtracted] = useState<{ text: string; images: string[] } | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const master = isMasterAccess();
  const [paid, setPaid] = useState<boolean>(() => localStorage.getItem(PAID_KEY) === "1" || isMasterAccess());
  const [unlocking, setUnlocking] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).slice(0, 12);
    setFileNames(arr.map((f) => f.name));
    setParsing(true);
    try {
      const res = await extractFromFiles(arr);
      setExtracted(res);
      if (res.text && !text) setText(res.text.slice(0, 60000));
      if (res.images.length > 0) {
        toast({ title: "Договор загружен", description: `Распознаём ${res.images.length} стр. через ИИ` });
      } else if (res.text) {
        toast({ title: "Текст договора извлечён", description: "Можно запускать проверку" });
      } else {
        toast({ title: "Не удалось прочитать", description: "Попробуйте другой файл или вставьте текст", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка чтения файла", variant: "destructive" });
    } finally {
      setParsing(false);
    }
  }, [text]);

  const runAudit = async () => {
    const payloadText = (text || extracted?.text || "").trim();
    const images = extracted?.images ?? [];
    if (!payloadText && images.length === 0) {
      toast({ title: "Добавьте договор", description: "Загрузите файл или вставьте текст договора", variant: "destructive" });
      return;
    }
    if (!AUDIT_URL) {
      toast({
        title: "Проверка договоров скоро заработает",
        description: "Сервис проверки сейчас разворачивается. Загляните через несколько минут.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setResult(null);
    if (!master) {
      setPaid(false);
      localStorage.removeItem(PAID_KEY);
    }
    try {
      const resp = await fetch(AUDIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: payloadText, images }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Ошибка проверки");
      setResult(data as AuditResult);
      const crit = data.counts?.critical ?? 0;
      toast({
        title: "Проверка завершена",
        description: crit > 0 ? `Найдено критичных пунктов: ${crit}` : `Найдено замечаний: ${data.issues?.length ?? 0}`,
      });
    } catch (e) {
      toast({ title: "Не удалось проверить договор", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    let user: { name?: string; email?: string } | null = null;
    try { user = JSON.parse(localStorage.getItem("avangard_user") || "null"); } catch { user = null; }
    let email = user?.email || localStorage.getItem("tender_email") || "";
    if (!email) {
      email = (window.prompt("Укажите email для чека об оплате:", "") || "").trim();
      if (!email) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({ title: "Некорректный email", variant: "destructive" });
        return;
      }
      localStorage.setItem("tender_email", email);
    }

    setUnlocking(true);
    try {
      const resp = await fetch(PAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: AUDIT_PRICE,
          user_name: user?.name || "",
          user_email: email,
          description: "Юридический аудит договора",
          return_url: window.location.href,
          cart_items: [{ id: "contract_audit", name: "Юридический аудит договора", price: AUDIT_PRICE, quantity: 1 }],
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.payment_url) throw new Error(data.error || "Не удалось создать оплату");
      localStorage.setItem("audit_pending_order", data.order_number || "");
      window.location.href = data.payment_url;
    } catch (e) {
      toast({ title: "Оплата недоступна", description: e instanceof Error ? e.message : "", variant: "destructive" });
      setUnlocking(false);
    }
  };

  useEffect(() => {
    const orderNumber = localStorage.getItem("audit_pending_order");
    if (!orderNumber || paid) return;
    fetch(PAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check_status", order_number: orderNumber }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.status === "paid") {
          localStorage.setItem(PAID_KEY, "1");
          localStorage.removeItem("audit_pending_order");
          setPaid(true);
          toast({ title: "Оплата получена", description: "Разбор договора открыт полностью" });
        }
      })
      .catch(() => {});
  }, [paid]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOMeta
        title="Проверка договора подряда — юридический аудит договора заказчика"
        description="Загрузите договор, который заказчик даёт на подпись. ИИ найдёт кабальные пункты, штрафы и риски неоплаты, предложит готовые формулировки на замену."
        keywords="проверка договора подряда, аудит договора, кабальный договор строительство, риски подрядчика"
        path="/contract-audit"
        jsonLd={[breadcrumbJsonLd([{ name: "Главная", url: "/" }, { name: "Проверка договора", url: "/contract-audit" }])]}
      />

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Icon name="ShieldCheck" size={20} className="text-teal-600" /> Проверка договора
            </h1>
            <p className="text-xs text-gray-500">Загрузите договор заказчика — найдём опасные пункты до подписания</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/40 transition"
            >
              {parsing ? (
                <>
                  <Icon name="LoaderCircle" size={26} className="mx-auto text-teal-600 animate-spin mb-2" />
                  <p className="text-sm text-gray-500">Читаем документ…</p>
                </>
              ) : (
                <>
                  <Icon name="FileUp" size={26} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Загрузить договор</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, Word, фото или скан — можно несколько страниц</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.rtf,image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {fileNames.length > 0 && (
              <div className="space-y-1">
                {fileNames.map((n, i) => (
                  <p key={i} className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
                    <Icon name="FileText" size={12} className="text-teal-600 shrink-0" /> {n}
                  </p>
                ))}
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400 mb-1.5">…или вставьте текст договора</p>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Вставьте текст договора подряда, который заказчик предлагает подписать…"
                className="min-h-[160px] text-sm"
              />
            </div>

            <Button onClick={runAudit} disabled={loading || parsing} className="w-full bg-teal-600 hover:bg-teal-700">
              {loading ? (
                <><Icon name="LoaderCircle" size={16} className="animate-spin mr-2" /> Изучаем договор…</>
              ) : (
                <><Icon name="ShieldCheck" size={16} className="mr-2" /> Проверить договор</>
              )}
            </Button>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Что проверяем</p>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {[
                "Оплата: аванс, удержания, риск неоплаты",
                "Штрафы и пени — нет ли перекоса против вас",
                "Приёмка работ и подписание актов",
                "Объём работ и «прочие работы» без сметы",
                "Сроки и продление при задержках заказчика",
                "Гарантия, расторжение, ответственность",
              ].map((s, i) => (
                <li key={i} className="flex gap-2">
                  <Icon name="Check" size={14} className="text-emerald-600 shrink-0 mt-0.5" /> {s}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {result ? (
            <AuditResultView
              data={result}
              locked={!paid}
              onUnlock={handleUnlock}
              unlocking={unlocking}
              price={AUDIT_PRICE}
            />
          ) : (
            <Card className="p-10 text-center text-gray-400 h-full flex flex-col items-center justify-center">
              <Icon name="ScanSearch" size={44} className="mb-3 opacity-40" />
              <p className="text-sm max-w-sm">
                Загрузите договор, который заказчик даёт на подпись. ИИ проверит его глазами юриста по подряду:
                найдёт кабальные пункты, риски неоплаты и штрафы, а также подготовит готовые формулировки на замену.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}