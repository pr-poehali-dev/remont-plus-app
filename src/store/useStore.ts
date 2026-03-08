import { useState, useEffect, useCallback } from "react";
import { Product, Order, OrderItem } from "@/types";
import { api } from "@/api";

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        api.products.list(),
        api.orders.list(),
      ]);
      setProducts(prods);
      setOrders(ords);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(async () => {
      try {
        const ords = await api.orders.list();
        setOrders((prev) => {
          const prevNewCount = prev.filter((o) => o.status === "new").length;
          const currNewCount = ords.filter((o) => o.status === "new").length;
          if (currNewCount > prevNewCount) {
            setNotifications((n) => ["Новая заявка поступила", ...n]);
          }
          return ords;
        });
      } catch (_e) { console.warn("polling error", _e); }
    }, 15000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const addProduct = async (name: string, volume: number, category = "") => {
    const product = await api.products.create(name, volume, "л", category);
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = async (id: string, name: string, volume: number, category = "") => {
    const updated = await api.products.update(id, name, volume, "л", category);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const deleteProduct = async (id: string) => {
    await api.products.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addOrder = async (order: { customerName: string; items: OrderItem[]; comment?: string }) => {
    const result = await api.orders.create(order.customerName, order.items, order.comment || "");
    const ords = await api.orders.list();
    setOrders(ords);
    setNotifications((prev) => [`Новая заявка от ${order.customerName}`, ...prev]);
    return result;
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    await api.orders.updateStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const deleteOrder = async (id: string) => {
    await api.orders.remove(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const clearNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    products,
    orders,
    loading,
    notifications,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    clearNotification,
    reload: loadAll,
  };
}