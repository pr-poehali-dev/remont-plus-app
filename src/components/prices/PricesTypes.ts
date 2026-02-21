export interface Region {
  id: number;
  name: string;
  code: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export interface PriceItem {
  id: number;
  name: string;
  description: string | null;
  unit: string;
  price: number;
}

export interface PriceCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  items: PriceItem[];
}
