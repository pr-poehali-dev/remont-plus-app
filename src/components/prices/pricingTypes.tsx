import Icon from "@/components/ui/icon";

export const YOOKASSA_API = "https://functions.poehali.dev/e6b5ad8a-7f98-42a1-bc93-3c36cbaef75d";

export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  period?: string;
}

export const B2C_PLANS: PlanInfo[] = [
  { id: "b2c_basic", name: "Базовый", price: 1490 },
  { id: "b2c_professional", name: "Профессиональный", price: 2990 },
  { id: "b2c_premium", name: "Премиум", price: 4990 },
];

export const B2B_PLANS: PlanInfo[] = [
  { id: "b2b_start", name: "Старт", price: 5900, period: "мес" },
  { id: "b2b_business", name: "Бизнес", price: 12900, period: "мес" },
  { id: "b2b_pro", name: "Профи", price: 24900, period: "мес" },
];

export const COMPANY_REQUISITES = {
  name: 'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "МАТ-ЛАБС"',
  shortName: 'ООО "МАТ-ЛАБС"',
  inn: "6312223437",
  kpp: "631201001",
  account: "40702810220000292435",
  bankName: 'ООО "Банк Точка"',
  bik: "044525104",
  corrAccount: "30101810745374525104",
};

export function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export const Check = () => <Icon name="Check" size={15} className="text-green-500 mt-0.5 shrink-0" />;

export default {};