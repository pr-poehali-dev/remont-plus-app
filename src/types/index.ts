export interface Product {
  id: string;
  name: string;
  volume: number;
  unit: string;
  createdAt: string;
  category: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  volume: number;
  unit: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  status: "new" | "in_progress" | "completed";
  createdAt: string;
  comment?: string;
}

export type AppView =
  | "catalog"
  | "orders"
  | "profile"
  | "history"
  | "stats"
  | "contact";