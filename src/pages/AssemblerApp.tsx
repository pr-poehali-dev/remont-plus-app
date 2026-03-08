import { useState } from "react";
import Layout from "@/components/Layout";
import { useStore } from "@/store/useStore";
import { AppView } from "@/types";
import CatalogPage from "@/pages/assembler/CatalogPage";
import OrdersPage from "@/pages/assembler/OrdersPage";
import StatsPage from "@/pages/assembler/StatsPage";
import HistoryPage from "@/pages/shared/HistoryPage";
import ProfilePage from "@/pages/shared/ProfilePage";
import ContactPage from "@/pages/shared/ContactPage";

interface Props {
  onLogout: () => void;
}

export default function AssemblerApp({ onLogout }: Props) {
  const [view, setView] = useState<AppView>("catalog");
  const store = useStore();

  const newCount = store.orders.filter((o) => o.status === "new").length;

  const renderView = () => {
    switch (view) {
      case "catalog":
        return (
          <CatalogPage
            products={store.products}
            onAdd={store.addProduct}
            onUpdate={store.updateProduct}
            onDelete={store.deleteProduct}
          />
        );
      case "orders":
        return <OrdersPage orders={store.orders} onUpdateStatus={store.updateOrderStatus} onDelete={store.deleteOrder} />;
      case "stats":
        return <StatsPage orders={store.orders} products={store.products} />;
      case "history":
        return <HistoryPage orders={store.orders} role="assembler" />;
      case "profile":
        return <ProfilePage role="assembler" />;
      case "contact":
        return <ContactPage />;
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
      role="assembler"
      currentView={view}
      onViewChange={setView}
      onLogout={onLogout}
      notifications={newCount}
    >
      {renderView()}
    </Layout>
  );
}