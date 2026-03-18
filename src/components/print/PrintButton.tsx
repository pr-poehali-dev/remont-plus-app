import { isLeadGatePassed } from "@/components/calculator/LeadGateModal";

interface PrintButtonProps {
  onRequestLeadGate?: () => void;
}

export default function PrintButton({ onRequestLeadGate }: PrintButtonProps) {
  const handlePrint = () => {
    if (!isLeadGatePassed()) {
      if (onRequestLeadGate) {
        onRequestLeadGate();
      }
      return;
    }
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        padding: "12px 20px",
        borderRadius: 10,
        border: "none",
        background: "#111",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: "pointer",
        marginBottom: 14,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "#333")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "#111")
      }
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Распечатать / PDF
    </button>
  );
}
