import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MasterQuestionnaire from "@/components/master/MasterQuestionnaire";
import Icon from "@/components/ui/icon";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  user_type: string;
}

export default function MasterProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("avangard_user");
    if (!stored) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.user_type !== "contractor") {
      navigate("/dashboard");
      return;
    }
    setUser(parsed);
  }, [navigate]);

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle" size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Анкета заполнена!</h2>
          <p className="text-gray-500 mb-6">
            Ваш профиль мастера сохранён. Теперь вы сможете получать заказы от клиентов.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            Перейти в личный кабинет
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm">
            <Icon name="ArrowLeft" size={16} /> Назад
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Анкета мастера</h1>
          <p className="text-gray-500 mt-1">Заполните данные, чтобы начать получать заказы</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <MasterQuestionnaire
          userId={user.id}
          userName={user.name}
          userPhone={user.phone}
          userEmail={user.email}
          onComplete={() => setCompleted(true)}
        />
      </div>
    </div>
  );
}