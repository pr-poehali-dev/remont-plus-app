export const AUTH_URL = "https://functions.poehali.dev/2642096f-c763-42ef-8dc1-67e3acce37b3";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  user_type: string;
}

export interface Master {
  id: number;
  full_name: string;
  location: string;
  experience_years: number;
  specializations: string[];
  business_status: string;
  has_tools: boolean;
  verified: boolean;
  rating: number;
  reviews: number;
  guarantee_period: string;
  guarantee_description?: string;
  payment_methods: string[];
  certificates: string[];
  portfolio_links: string[];
  phone?: string;
  email?: string;
  telegram?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  description?: string;
}

export const GUARANTEE_LABELS: Record<string, string> = {
  none: "Без гарантии",
  "3m": "3 месяца",
  "6m": "6 месяцев",
  "1y": "1 год",
  "2y": "2 года",
  "3y": "3 года",
};

export const BUSINESS_LABELS: Record<string, string> = {
  self_employed: "Самозанятый",
  ip: "ИП",
  ooo: "ООО",
  individual: "Физлицо",
};

export const DEMO_MASTERS: Master[] = [
  {
    id: 1,
    full_name: "Алексей Петров",
    location: "Москва",
    experience_years: 8,
    specializations: ["Укладка плитки", "Сантехника", "Электрика"],
    business_status: "ip",
    has_tools: true,
    verified: true,
    rating: 4.9,
    reviews: 47,
    guarantee_period: "1y",
    guarantee_description: "Гарантия на все виды работ 1 год. Бесплатное устранение дефектов.",
    payment_methods: ["card", "transfer"],
    certificates: ["Электрик 3-й разряд", "Сантехника (допуск)"],
    portfolio_links: [],
    phone: "+7 (999) 123-45-67",
    telegram: "@alexey_master",
    description: "Выполняю комплексный ремонт квартир под ключ. Работаю аккуратно, сдаю в срок.",
  },
  {
    id: 2,
    full_name: "Дмитрий Козлов",
    location: "Санкт-Петербург",
    experience_years: 12,
    specializations: ["Отделка стен", "Покраска", "Шпаклёвка"],
    business_status: "self_employed",
    has_tools: true,
    verified: true,
    rating: 4.7,
    reviews: 83,
    guarantee_period: "6m",
    guarantee_description: "Гарантия на отделочные работы 6 месяцев.",
    payment_methods: ["cash", "card"],
    certificates: [],
    portfolio_links: [],
    phone: "+7 (911) 456-78-90",
    telegram: "@dmitry_otdelka",
    description: "Специализируюсь на чистовой отделке. Работаю с любыми материалами.",
  },
  {
    id: 3,
    full_name: "Сергей Волков",
    location: "Самара",
    experience_years: 5,
    specializations: ["Монтаж гипсокартона", "Натяжные потолки"],
    business_status: "individual",
    has_tools: true,
    verified: false,
    rating: 4.5,
    reviews: 21,
    guarantee_period: "3m",
    payment_methods: ["cash"],
    certificates: [],
    portfolio_links: [],
    phone: "+7 (925) 789-01-23",
    description: "Быстро и качественно монтирую конструкции из ГКЛ и натяжные потолки.",
  },
];
