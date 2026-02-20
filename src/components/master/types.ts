export interface MasterProfile {
  full_name: string;
  phone: string;
  email: string;
  telegram: string;
  whatsapp: string;
  instagram: string;
  website: string;
  citizenship: string;
  experience_years: number | null;
  specializations: string[];
  has_tools: boolean;
  work_style: string;
  technologies_knowledge: string;
  certificates: string[];
  portfolio_photos: string[];
  portfolio_links: string[];
  payment_methods: string[];
  payment_schedule: string;
  discount_info: string;
  business_status: string;
  description: string;
  location: string;
  guarantee_period: string;
  guarantee_description: string;
}

export const emptyProfile: MasterProfile = {
  full_name: "", phone: "", email: "", telegram: "", whatsapp: "",
  instagram: "", website: "", citizenship: "", experience_years: null,
  specializations: [], has_tools: false, work_style: "both",
  technologies_knowledge: "", certificates: [], portfolio_photos: [],
  portfolio_links: [], payment_methods: [], payment_schedule: "",
  discount_info: "", business_status: "", description: "", location: "",
  guarantee_period: "", guarantee_description: "",
};

export const SPECIALIZATIONS = [
  "Штукатурка", "Покраска", "Укладка плитки", "Электрика",
  "Сантехника", "Гипсокартон", "Поклейка обоев", "Стяжка пола",
  "Ламинат/паркет", "Натяжные потолки", "Демонтаж", "Кладка",
  "Утепление", "Фасадные работы", "Кровля", "Столярные работы",
  "Дизайн интерьера", "Мебель на заказ", "Металлоконструкции", "Сварочные работы",
];

export const PAYMENT_METHODS = [
  { id: "cash", label: "Наличные" },
  { id: "card", label: "Банковская карта" },
  { id: "transfer", label: "Онлайн-перевод" },
  { id: "invoice", label: "По счёту" },
];

export const PAYMENT_SCHEDULES = [
  { id: "prepay", label: "Предоплата 100%" },
  { id: "postpay", label: "Постоплата" },
  { id: "staged", label: "Поэтапно" },
  { id: "split", label: "50/50 (аванс + по завершении)" },
];

export const BUSINESS_STATUSES = [
  { id: "self_employed", label: "Самозанятый" },
  { id: "ip", label: "ИП" },
  { id: "ooo", label: "ООО" },
  { id: "individual", label: "Физлицо" },
];

export const GUARANTEE_PERIODS = [
  { id: "none", label: "Без гарантии" },
  { id: "3m", label: "3 месяца" },
  { id: "6m", label: "6 месяцев" },
  { id: "1y", label: "1 год" },
  { id: "2y", label: "2 года" },
  { id: "3y", label: "3 года" },
];
