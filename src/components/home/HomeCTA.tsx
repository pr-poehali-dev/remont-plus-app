import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import reachGoal from "@/lib/metrika";

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
              <Button size="lg" onClick={() => { reachGoal("home_cta_expert"); navigate("/expert"); }} className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-8 shadow-xl text-base font-semibold">
                ✨ Спросить ИИ‑эксперта
              </Button>
              <Button size="lg" variant="outline" onClick={() => { reachGoal("home_cta_calculator"); navigate("/calculator"); }} className="border-2 border-white/50 text-white hover:bg-white/20 rounded-full px-8 text-base font-semibold bg-transparent">
                📋 Рассчитать смету
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#fafaf8] py-8 text-center text-xs text-gray-400 border-t border-gray-100">
        {/* Contact row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
          <a
            href="tel:+79277486868"
            onClick={() => reachGoal("contact_phone")}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <Icon name="Phone" className="h-4 w-4" />
            8 (927) 748-68-68
          </a>
          <a
            href="https://wa.me/79277486868?text=Здравствуйте!%20Хочу%20рассчитать%20стоимость%20ремонта"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => reachGoal("contact_whatsapp")}
            className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 transition-colors font-medium"
          >
            <Icon name="MessageCircle" className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href="mailto:info@avangard-ai.ru"
            onClick={() => reachGoal("contact_email")}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <Icon name="Mail" className="h-4 w-4" />
            info@avangard-ai.ru
          </a>
        </div>

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