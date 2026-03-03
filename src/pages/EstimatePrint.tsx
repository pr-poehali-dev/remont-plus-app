import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { COMMON_STYLES } from "@/components/print/PrintTypes";
import type { PrintData } from "@/components/print/PrintTypes";
import SmetaView from "@/components/print/SmetaView";
import KpView from "@/components/print/KpView";
import PrintPaywall from "@/components/print/PrintPaywall";

export default function EstimatePrint() {
  const location = useLocation();
  const data: PrintData | null = location.state ?? null;
  const docTitle = data
    ? data.docType === "kp"
      ? `КП-${data.docNum} от ${data.date}`
      : `Смета № С-${data.docNum} от ${data.date}`
    : "";

  useEffect(() => {
    if (data) document.title = docTitle;

    const blockKey = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.key === "p") ||
        (e.ctrlKey && e.shiftKey && e.key === "s") ||
        (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const showOverlay = () => {
      const el = document.getElementById("screenshot-block");
      if (el) { el.style.display = "flex"; setTimeout(() => { el.style.display = "none"; }, 2000); }
    };

    document.addEventListener("keyup", (e) => { if (e.key === "PrintScreen") showOverlay(); });
    document.addEventListener("keydown", blockKey);
    return () => { document.removeEventListener("keydown", blockKey); };
  }, [data, docTitle]);

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Нет данных для печати. Вернитесь в калькулятор и нажмите «Скачать PDF».</p>
      </div>
    );
  }

  const docContent = (
    <>
      <style>{COMMON_STYLES + `
        #screenshot-block {
          display: none; position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.92); color: #fff;
          flex-direction: column; align-items: center; justify-content: center;
          font-family: Arial, sans-serif; font-size: 18px; text-align: center; gap: 12px;
        }
        body { -webkit-user-select: none; user-select: none; }
        @media print { #screenshot-block { display: none !important; } }
      `}</style>
      <div id="screenshot-block">
        <div style={{ fontSize: 48 }}>🚫</div>
        <div style={{ fontWeight: 700 }}>Скриншот заблокирован</div>
        <div style={{ fontSize: 13, opacity: 0.7, maxWidth: 300 }}>
          Для сохранения используйте кнопку «Распечатать / PDF»
        </div>
      </div>
      {data.docType === "kp" ? <KpView data={data} /> : <SmetaView data={data} />}
    </>
  );

  return (
    <PrintPaywall>
      {docContent}
    </PrintPaywall>
  );
}