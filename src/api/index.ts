import { Product, Order, OrderItem } from "@/types";

const PRODUCTS_URL = "https://functions.poehali.dev/30082acc-5932-4442-8539-b4eb2a86ded5";
const ORDERS_URL = "https://functions.poehali.dev/256ee70f-4e5a-4291-996e-0770d536ecb8";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Products
export const api = {
  products: {
    list: () => request<Product[]>(PRODUCTS_URL),
    categories: () => request<string[]>(`${PRODUCTS_URL}?categories=1`),
    create: (name: string, volume: number, unit = "л", category = "") =>
      request<Product>(PRODUCTS_URL, {
        method: "POST",
        body: JSON.stringify({ name, volume, unit, category }),
      }),
    update: (id: string, name: string, volume: number, unit = "л", category = "") =>
      request<Product>(`${PRODUCTS_URL}?id=${id}`, {
        method: "PUT",
        body: JSON.stringify({ name, volume, unit, category }),
      }),
    remove: (id: string) =>
      request<{ ok: boolean }>(`${PRODUCTS_URL}?id=${id}`, { method: "DELETE" }),
  },

  orders: {
    list: (status?: string) =>
      request<Order[]>(status ? `${ORDERS_URL}?status=${status}` : ORDERS_URL),
    create: (customerName: string, items: OrderItem[], comment = "") =>
      request<{ id: string; status: string }>(ORDERS_URL, {
        method: "POST",
        body: JSON.stringify({ customer_name: customerName, comment, items }),
      }),
    updateStatus: (id: string, status: Order["status"]) =>
      request<{ ok: boolean }>(`${ORDERS_URL}?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    remove: (id: string) =>
      request<{ ok: boolean }>(`${ORDERS_URL}?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
};