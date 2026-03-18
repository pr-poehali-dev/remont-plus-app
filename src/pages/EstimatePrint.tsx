import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { COMMON_STYLES } from "@/components/print/PrintTypes";
import type { PrintData } from "@/components/print/PrintTypes";
import SmetaView from "@/components/print/SmetaView";
import KpView from "@/components/print/KpView";
import LeadGateModal, { isLeadGatePassed } from "@/components/calculator/LeadGateModal";

export default function EstimatePrint() {
  const location = useLocation();
  const data: PrintData | null = location.state ?? null;

  const [leadGateOpen, setLeadGateOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const isAdmin = (() => {
      try {
        const u = JSON.parse(localStorage.getItem("avangard_user") || "null");
        return u?.role === "admin";
      } catch { return false; }
    })();

    if (isAdmin || isLeadGatePassed()) {
      setUnlocked(true);
    } else {
      setLeadGateOpen(true);
    }
  }, []);

  const docTitle = data
    ? data.docType === "kp"
      ? `КП-${data.docNum} от ${data.date}`
      : `Смета № С-${data.docNum} от ${data.date}`
    : "";

  useEffect(() => {
    if (data) document.title = docTitle;
  }, [data, docTitle]);

  const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Нет данных для печати. Вернитесь в калькулятор и нажмите «Скачать PDF».</p>
      </div>
    );
  }

  return (
    <>
      <LeadGateModal
        open={leadGateOpen}
        onClose={() => setLeadGateOpen(false)}
        onSuccess={() => {
          setLeadGateOpen(false);
          setUnlocked(true);
        }}
        totalSum={data.grandTotal ? fmt(data.grandTotal) + " ₽" : undefined}
        itemsCount={data.items?.length}
        region=""
        calcType="Калькулятор ремонта"
      />

      {unlocked ? (
        <>
          <style>{COMMON_STYLES}</style>
          {data.docType === "kp" ? <KpView data={data} /> : <SmetaView data={data} />}
        </>
      ) : (
        <div className="relative bg-gray-50 min-h-screen">
          <div className="relative overflow-hidden" style={{ maxHeight: "65vh" }}>
            <div className="pointer-events-none select-none" style={{ filter: "blur(5px)", opacity: 0.5 }}>
              <style>{COMMON_STYLES}</style>
              {data.docType === "kp" ? <KpView data={data} /> : <SmetaView data={data} />}
            </div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, rgba(249,250,251,0) 20%, rgba(249,250,251,0.9) 65%, rgba(249,250,251,1) 100%)" }}
            />
          </div>
          <div className="flex flex-col items-center px-4 py-8">
            <button
              onClick={() => setLeadGateOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-colors"
            >
              Получить PDF бесплатно
            </button>
            <p className="text-xs text-gray-400 mt-2">Укажите имя и телефон — документ откроется</p>
          </div>
        </div>
      )}
    </>
  );
}
