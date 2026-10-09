import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface Props {
  master: boolean;
  onOpenMyEstimates: () => void;
}

export default function TenderHeader({ master, onOpenMyEstimates }: Props) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Icon name="FileText" size={20} className="text-teal-600" /> Смета по ТЗ
          </h1>
          <p className="text-xs text-gray-500">Загрузите PDF, скан или фото задания — получите смету для тендера</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {master && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Icon name="ShieldCheck" size={13} /> Автономный доступ
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate("/contract-audit")} title="Проверить договор заказчика">
            <Icon name="ShieldCheck" size={15} className="mr-1.5" /> Проверка договора
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenMyEstimates}>
            <Icon name="FolderOpen" size={15} className="mr-1.5" /> Мои сметы
          </Button>
        </div>
      </div>
    </div>
  );
}
