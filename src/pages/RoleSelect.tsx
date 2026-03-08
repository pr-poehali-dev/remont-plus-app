import { Role } from "@/App";
import Icon from "@/components/ui/icon";

interface Props {
  onSelect: (role: Role) => void;
}

export default function RoleSelect({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="animate-fade-in text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-6 text-muted-foreground text-sm tracking-widest uppercase">
          <span className="w-8 h-px bg-border inline-block" />
          Миксология
          <span className="w-8 h-px bg-border inline-block" />
        </div>
        <h1 className="text-4xl font-semibold text-foreground mb-3 leading-tight">
          Управление заказами
        </h1>
        <p className="text-muted-foreground text-lg">
          Выберите роль для входа в систему
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl animate-slide-up">
        <button
          onClick={() => onSelect("assembler")}
          className="group bg-primary text-primary-foreground rounded-xl p-8 text-left hover:bg-primary/90 transition-all duration-200 hover-scale"
        >
          <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center mb-5">
            <Icon name="Package" size={20} className="text-primary-foreground" />
          </div>
          <div className="text-xl font-semibold mb-1">Супервайзер</div>
          <div className="text-primary-foreground/60 text-sm leading-relaxed">
            Управление базой товаров и обработка заявок
          </div>
        </button>

        <button
          onClick={() => onSelect("customer")}
          className="group bg-card border border-border text-card-foreground rounded-xl p-8 text-left hover:border-primary/30 hover:shadow-sm transition-all duration-200 hover-scale"
        >
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mb-5">
            <Icon name="ShoppingCart" size={20} className="text-foreground" />
          </div>
          <div className="text-xl font-semibold mb-1">Заявка</div>
          <div className="text-muted-foreground text-sm leading-relaxed">
            Выбор товаров и оформление заявок
          </div>
        </button>
      </div>

      <p className="mt-10 text-xs text-muted-foreground animate-fade-in">
        Система управления складскими заказами
      </p>
    </div>
  );
}