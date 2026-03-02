export type DocFormat = "smeta" | "kp" | "ks2" | "ks3" | "act";

export interface OfficeExportState {
  docType: DocFormat;
  showForm: boolean;
  customer: string;
  contractor: string;
  address: string;
  phone: string;
  email: string;
  validDays: string;
  foremanName: string;
  foremanPhone: string;
  supplyName: string;
  supplyPhone: string;
  contractNumber: string;
  contractDate: string;
  actNumber: string;
  actDateFrom: string;
  actDateTo: string;
}

export function makeExportState(): OfficeExportState {
  return {
    docType: "smeta",
    showForm: false,
    customer: "",
    contractor: "",
    address: "",
    phone: "",
    email: "",
    validDays: "30",
    foremanName: "",
    foremanPhone: "",
    supplyName: "",
    supplyPhone: "",
    contractNumber: "",
    contractDate: "",
    actNumber: "1",
    actDateFrom: "",
    actDateTo: "",
  };
}

export const DOC_TABS: { id: DocFormat; label: string }[] = [
  { id: "smeta", label: "📋 Смета" },
  { id: "kp", label: "📄 КП" },
  { id: "ks2", label: "📑 КС-2" },
  { id: "ks3", label: "📊 КС-3" },
  { id: "act", label: "✅ Акт" },
];
