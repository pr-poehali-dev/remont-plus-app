import Icon from "@/components/ui/icon";
import { User } from "@/components/master/masterTypes";
import MasterQuestionnaire from "@/components/master/MasterQuestionnaire";
import PaymentHistoryPanel from "@/components/master/PaymentHistoryPanel";

interface MasterCabinetProps {
  user: User;
  contractorId: number | null;
  onBack: () => void;
  onComplete: () => void;
}

export default function MasterCabinet({ user, contractorId, onBack, onComplete }: MasterCabinetProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm"
          >
            <Icon name="ArrowLeft" size={16} /> Назад к каталогу
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Личный кабинет мастера</h1>
          <p className="text-gray-500 mt-1">Заполните анкету для начала работы</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {contractorId && (
          <PaymentHistoryPanel
            contractorId={contractorId}
            masterName={user.name}
            masterEmail={user.email}
          />
        )}
        <MasterQuestionnaire
          userId={user.id}
          userName={user.name}
          userPhone={user.phone}
          userEmail={user.email}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}