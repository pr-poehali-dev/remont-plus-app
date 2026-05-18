import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import type { EstimateItem } from "@/hooks/useCalculatorState";

interface Props {
  items: EstimateItem[];
  selectedRegion: string;
}

/**
 * Кодирует состояние калькулятора в URL и показывает QR-код,
 * чтобы пользователь продолжил работу с телефона.
 * Также можно скопировать ссылку или отправить себе на email/Telegram.
 */
export default function OpenOnPhoneButton({ items, selectedRegion }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const buildShareUrl = (): string => {
    const payload = {
      items,
      region: selectedRegion,
      t: Date.now(),
    };
    const json = JSON.stringify(payload);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return `${window.location.origin}/calculator?session=${encoded}`;
  };

  const shareUrl = buildShareUrl();
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(
    shareUrl,
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Ссылка скопирована",
        description: "Откройте её на телефоне, чтобы продолжить расчёт",
      });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast({
        title: "Не удалось скопировать",
        description: "Попробуйте вручную выделить ссылку",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Моя смета на ремонт",
          text: "Продолжите расчёт на телефоне:",
          url: shareUrl,
        });
      } catch {
        /* отмена пользователем — ок */
      }
    } else {
      handleCopy();
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 border-sky-300 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
      >
        <Icon name="QrCode" size={16} />
        <span className="hidden sm:inline">Открыть на телефоне</span>
        <span className="sm:hidden">На телефон</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Smartphone" size={20} className="text-sky-600" />
              Продолжить на телефоне
            </DialogTitle>
            <DialogDescription>
              Отсканируйте QR-код камерой смартфона — ваша смета откроется в браузере телефона
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            <div className="rounded-2xl bg-white border-2 border-sky-100 p-3 shadow-sm">
              <img
                src={qrSrc}
                alt="QR-код"
                width={240}
                height={240}
                className="w-60 h-60"
                loading="lazy"
              />
            </div>

            <div className="w-full space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Icon name={copied ? "Check" : "Copy"} size={16} />
                  {copied ? "Скопировано" : "Скопировать ссылку"}
                </Button>
                <Button
                  onClick={handleNativeShare}
                  className="flex-1 gap-2 bg-sky-600 hover:bg-sky-700"
                >
                  <Icon name="Share2" size={16} />
                  Поделиться
                </Button>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={14} className="mt-0.5 text-gray-400 shrink-0" />
                  <span>
                    Ссылка действительна, пока вы не закроете эту сессию.
                    В смете сохранены{" "}
                    <b className="text-gray-700">{items.length}</b> позиции и выбранный регион.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
