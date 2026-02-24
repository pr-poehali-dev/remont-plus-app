export const CONTRACTS_URL = "https://functions.poehali.dev/0fa5f44f-a6a1-4e4d-ad3b-9596884f37ea";
export const HEADERS = { "Content-Type": "application/json", "X-Admin-Token": "admin2025" };

export interface Contract {
  id: number;
  title: string;
  contract_number: string;
  contract_type: string;
  counterparty_name: string;
  counterparty_inn: string;
  counterparty_type: string;
  status: string;
  subject: string;
  amount: number | null;
  currency: string;
  signed_at: string | null;
  valid_from: string | null;
  valid_until: string | null;
  auto_renewal: boolean;
  responsible_person: string;
  file_url: string;
  notes: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export const CONTRACT_TYPES = [
  { value: "partner", label: "Партнёрский" },
  { value: "supplier", label: "Поставщик" },
  { value: "service", label: "Услуги" },
  { value: "rental", label: "Аренда" },
  { value: "employment", label: "Трудовой" },
  { value: "nda", label: "NDA / Конфиденциальность" },
  { value: "other", label: "Прочее" },
];

export const STATUSES = [
  { value: "draft", label: "Черновик", color: "bg-gray-100 text-gray-600" },
  { value: "review", label: "На согласовании", color: "bg-yellow-100 text-yellow-700" },
  { value: "active", label: "Действующий", color: "bg-green-100 text-green-700" },
  { value: "signed", label: "Подписан", color: "bg-blue-100 text-blue-700" },
  { value: "expired", label: "Истёк", color: "bg-red-100 text-red-600" },
  { value: "terminated", label: "Расторгнут", color: "bg-gray-100 text-gray-500" },
];

export const EMPTY: Omit<Contract, "id" | "created_at" | "updated_at"> = {
  title: "",
  contract_number: "",
  contract_type: "partner",
  counterparty_name: "",
  counterparty_inn: "",
  counterparty_type: "company",
  status: "draft",
  subject: "",
  amount: null,
  currency: "RUB",
  signed_at: null,
  valid_from: null,
  valid_until: null,
  auto_renewal: false,
  responsible_person: "",
  file_url: "",
  notes: "",
  tags: [],
};

export function statusBadge(status: string) {
  const s = STATUSES.find(x => x.value === status);
  return s ? s : { label: status, color: "bg-gray-100 text-gray-500" };
}

export function typelabel(type: string) {
  return CONTRACT_TYPES.find(x => x.value === type)?.label ?? type;
}

export function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-RU");
}

export function formatAmount(amount: number | null, currency: string) {
  if (amount === null) return "—";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: currency || "RUB", maximumFractionDigits: 0 }).format(amount);
}
