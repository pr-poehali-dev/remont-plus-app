import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { createShareLink, SharedEstimate, formatRub } from "@/lib/shareEstimate";
import reachGoal from "@/lib/metrika";

interface Props {
  data: SharedEstimate;
  className?: string;
  variant?: "buttons" | "compact";
}

export default function QuickShare({ data, className = "", variant = "buttons" }: Props) {
  const [url, setUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const ensureLink = (): string => {
    if (url) return url;
    const { url: u } = createShareLink(data);
    setUrl(u);
    return u;
  };

  const shareText = () => {
    const u = ensureLink();
    return `АВАНГАРД · ${data.title}\nИтого: ${formatRub(data.total)} ₽\nДетальная смета: ${u}`;
  };

  const onCopy = async () => {
    const u = ensureLink();
    try {
      await navigator.clipboard.writeText(u);
      setCopied(true);
      reachGoal("estimate_share", { channel: "copy", type: data.type });
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  const openExt = (channel: string, link: string) => {
    reachGoal("estimate_share", { channel, type: data.type });
    window.open(link, "_blank", "noopener");
  };

  const onWhatsapp = () => openExt("whatsapp", `https://wa.me/?text=${encodeURIComponent(shareText())}`);
  const onTelegram = () => {
    const u = ensureLink();
    openExt("telegram", `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(`АВАНГАРД · ${data.title} · ${formatRub(data.total)} ₽`)}`);
  };
  const onNative = async () => {
    const u = ensureLink();
    try {
      // @ts-expect-error navigator.share types
      if (navigator.share) {
        // @ts-expect-error navigator.share
        await navigator.share({ title: `АВАНГАРД · ${data.title}`, text: `Итого: ${formatRub(data.total)} ₽`, url: u });
        reachGoal("estimate_share", { channel: "native", type: data.type });
      } else {
        onCopy();
      }
    } catch { /* user cancelled */ }
  };

  if (variant === "compact") {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { ensureLink(); setOpen(!open); }}
          className="gap-1.5"
        >
          <Icon name="Share2" size={14} />
          Поделиться
        </Button>
        {open && (
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-gray-200 shadow-xl p-2 min-w-[200px]">
            <button onClick={onWhatsapp} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-50 text-sm">
              <Icon name="MessageCircle" size={16} className="text-emerald-600" />
              WhatsApp
            </button>
            <button onClick={onTelegram} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-sky-50 text-sm">
              <Icon name="Send" size={16} className="text-sky-600" />
              Telegram
            </button>
            <button onClick={onCopy} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 text-sm">
              <Icon name={copied ? "Check" : "Link"} size={16} className={copied ? "text-emerald-600" : "text-gray-600"} />
              {copied ? "Скопировано" : "Скопировать ссылку"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Share2" size={18} className="text-amber-500" />
        <h4 className="font-bold text-gray-900 text-sm">Поделиться расчётом</h4>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Отправьте смету подрядчику или сохраните себе — ссылка работает 1 клик.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onWhatsapp} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 h-9 text-xs">
          <Icon name="MessageCircle" size={14} />
          WhatsApp
        </Button>
        <Button onClick={onTelegram} className="bg-sky-500 hover:bg-sky-600 text-white gap-1.5 h-9 text-xs">
          <Icon name="Send" size={14} />
          Telegram
        </Button>
        <Button onClick={onNative} variant="outline" className="gap-1.5 h-9 text-xs">
          <Icon name="Share" size={14} />
          Другое
        </Button>
        <Button onClick={onCopy} variant="outline" className="gap-1.5 h-9 text-xs">
          <Icon name={copied ? "Check" : "Link"} size={14} className={copied ? "text-emerald-600" : ""} />
          {copied ? "Скопировано" : "Скопировать"}
        </Button>
      </div>
    </div>
  );
}
