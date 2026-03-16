import Icon from "@/components/ui/icon";

export const PAYMENT_URL = "https://functions.poehali.dev/610d6f7d-fc4b-4907-b4f2-2e678dc3217d";

export const TOCHKA_CHECKOUT_URLS: Record<string, string> = {
  b2c_basic: "https://checkout.tochka.com/d527d3a3-af1a-49cf-b2f7-87b76ce2ff32",
  b2c_professional: "https://checkout.tochka.com/81599376-f33c-4d28-90f5-917eee673289",
  b2c_premium: "https://checkout.tochka.com/4a412bae-2f37-49f7-ac2f-b90ac933b79f",
  b2b_start: "https://checkout.tochka.com/64207214-077c-46ff-988a-78911b76bfa7",
};

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

export function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export const Check = () => <Icon name="Check" size={15} className="text-green-500 mt-0.5 shrink-0" />;

export default {};