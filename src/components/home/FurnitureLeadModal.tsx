import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import funcUrls from "@/../backend/func2url.json";

interface FurnitureLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  apartmentTitle: string;
  styleName: string;
  totalPrice: string;
  selectedItems: string[];
}

export default function FurnitureLeadModal({
  isOpen,
  onClose,
  apartmentTitle,
  styleName,
  totalPrice,
  selectedItems,
}: FurnitureLeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const formatPhone = (value: string) => {
    const n = value.replace(/\D/g, "");
    if (n.length <= 1) return "+7 ";
    if (n.length <= 4) return `+7 (${n.slice(1)}`;
    if (n.length <= 7) return `+7 (${n.slice(1, 4)}) ${n.slice(4)}`;
    if (n.length <= 9) return `+7 (${n.slice(1, 4)}) ${n.slice(4, 7)}-${n.slice(7)}`;
    return `+7 (${n.slice(1, 4)}) ${n.slice(4, 7)}-${n.slice(7, 9)}-${n.slice(9, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(funcUrls["furniture-lead"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone.replace(/\D/g, ""),
          apartment: apartmentTitle,
          style: styleName,
          totalPrice,
          items: selectedItems,
        }),
      });
    } catch (err) {
      console.error(err);
    }
    setSent(true);
  };

  const handleClose = () => {
    setSent(false);
    setName("");
    setPhone("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{sent ? "Заявка отправлена!" : "Заказать подбор мебели"}</DialogTitle>
          <DialogDescription>
            {sent
              ? "Мы свяжемся с вами в ближайшее время для уточнения деталей"
              : `${apartmentTitle} · ${styleName} · ${totalPrice}`}
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="Check" size={32} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Наш менеджер подберёт лучшие варианты под ваш бюджет и стиль</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Имя</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к вам обращаться?" required />
            </div>
            <div>
              <Label>Телефон</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+7 (___) ___-__-__"
                required
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
              <p className="font-medium text-gray-700 mb-1">Выбрано {selectedItems.length} предметов</p>
              <p>{selectedItems.slice(0, 5).join(", ")}{selectedItems.length > 5 ? ` и ещё ${selectedItems.length - 5}` : ""}</p>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
            >
              Отправить заявку
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
