import { useEffect } from "react";
import { type SharePanelProps, fmt, syncTariffFromBackend } from "./sharePanelUtils";
import PrintButton from "./PrintButton";
import SocialShareButtons from "./SocialShareButtons";

export type { SharePanelProps };

export default function SharePanel({
  docTitle,
  totalSum,
  customerEmail,
  docType,
  estimateItems,
  estimateParams,
  customer,
  contractor,
  address,
  phone,
  docDate,
  calcName,
}: SharePanelProps) {
  useEffect(() => {
    syncTariffFromBackend();
  }, []);

  const text = `${docType === "kp" ? "Коммерческое предложение" : "Смета"}: ${docTitle}\nИтоговая стоимость: ${fmt(totalSum)} ₽\n\nСформировано в АВАНГАРД: https://avangard.pro`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent("https://avangard.pro")}&text=${encodeURIComponent(text)}`;
  const vkUrl = `https://vk.com/share.php?comment=${encodeURIComponent(text)}`;

  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 16,
      }}
      className="no-print"
    >
      <PrintButton />
      <SocialShareButtons
        text={text}
        whatsappUrl={whatsappUrl}
        telegramUrl={telegramUrl}
        vkUrl={vkUrl}
        emailPayload={{
          docTitle,
          docType,
          calcName,
          totalSum,
          estimateItems,
          estimateParams,
          customer,
          contractor,
          address,
          phone,
          docDate,
        }}
        defaultEmail={customerEmail ?? ""}
      />
    </div>
  );
}
