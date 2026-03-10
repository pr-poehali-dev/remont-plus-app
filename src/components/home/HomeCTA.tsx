import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

interface Props {
  user: User | null;
}

export default function HomeCTA({ user }: Props) {
  const navigate = useNavigate();

  return (
    <>
      <section className="mt-20 mb-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-10 md:p-14">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Начните с консультации ИИ‑эксперта</h2>
            <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">Спросите ИИ‑эксперта по дизайну и ремонту — он ответит на вопросы, поможет с выбором стиля и сформирует ТЗ для дизайнера. Без регистрации.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/expert")} className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-8 shadow-xl text-base font-semibold">
                ✨ Спросить ИИ‑эксперта
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/calculator")} className="border-2 border-white/50 text-white hover:bg-white/20 rounded-full px-8 text-base font-semibold bg-transparent">
                📋 Рассчитать смету
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#fafaf8] py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        <div>АВАНГАРД &copy; {new Date().getFullYear()}</div>
        <div className="mt-1">ООО «МАТ-Лабс» &nbsp;|&nbsp; ИНН/КПП 6312223437/631201001 &nbsp;|&nbsp; ОГРН 1266300004288</div>
        <div className="flex justify-center gap-4 mt-2">
          <a href="/terms" className="hover:text-gray-600 transition-colors">Пользовательское соглашение</a>
          <a href="/privacy" className="hover:text-gray-600 transition-colors">Политика конфиденциальности</a>
        </div>
      </footer>
    </>
  );
}