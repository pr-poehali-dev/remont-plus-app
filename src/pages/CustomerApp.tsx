import { useState } from "react";
import Layout from "@/components/Layout";
import { useStore } from "@/store/useStore";
import { AppView, OrderItem } from "@/types";
import CustomerCatalogPage from "@/pages/customer/CatalogPage";
import CustomerOrdersPage from "@/pages/customer/OrdersPage";
import HistoryPage from "@/pages/shared/HistoryPage";
import ProfilePage from "@/pages/shared/ProfilePage";
import ContactPage from "@/pages/shared/ContactPage";

interface Props {
  onLogout: () => void;
}

export default function CustomerApp({ onLogout }: Props) {
  const [view, setView] = useState<AppView>("catalog");
  const store = useStore();

  const handleOrder = async (customerName: string, items: OrderItem[], comment: string) => {
    await store.addOrder({ customerName, items, comment });
  };

  const renderView = () => {
    switch (view) {
      case "catalog":
        return (
          <CustomerCatalogPage
            products={store.products}
            onSubmitOrder={handleOrder}
          />
        );
      case "orders":
        return <CustomerOrdersPage orders={store.orders} />;
      case "history":
        return <HistoryPage orders={store.orders} role="customer" />;
      case "profile":
        return <ProfilePage role="customer" />;
      case "contact":
        return <ContactPage />;
      default:
        return null;
    }
  };

  if (store.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      role="customer"
      currentView={view}
      onViewChange={setView}
      onLogout={onLogout}
      notifications={0}
    >
      {renderView()}
    </Layout>
  );
}