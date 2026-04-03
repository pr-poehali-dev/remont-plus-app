import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import HomeFurnitureCalculator from "@/components/home/HomeFurnitureCalculator";
import HomePromoBanner from "@/components/home/HomePromoBanner";

export default function Furniture() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <HomePromoBanner />
      <header className="bg-[#0f0f13] px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={18} />
            На главную
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Icon name="Sofa" size={16} className="text-white" />
            </div>
            <span className="text-white font-semibold">Мебель</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4">
        <HomeFurnitureCalculator />
      </div>
    </div>
  );
}