import Icon from "@/components/ui/icon";
import RoomScanCrossLink from "@/components/RoomScanCrossLink";
import { ReportListItem, BENEFITS, HOMESTAGING_FAQ } from "./HomestagingTypes";

interface Props {
  userId: number | null;
  history: ReportListItem[];
  historyLoading: boolean;
  hasResult: boolean;
  onOpenReport: (id: number) => void;
  onDeleteReport: (id: number, e: React.MouseEvent) => void;
}

export default function HomestagingInfo({
  userId,
  history,
  historyLoading,
  hasResult,
  onOpenReport,
  onDeleteReport,
}: Props) {
  return (
    <>
      {/* История отчётов — показываем если юзер авторизован и есть отчёты */}
      {userId && history.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="History" size={22} className="text-rose-500" />
              <h3 className="text-xl font-bold text-gray-900">Мои отчёты</h3>
              <span className="text-sm text-gray-400">({history.length})</span>
            </div>
            {historyLoading && <Icon name="Loader2" size={16} className="animate-spin text-gray-400" />}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((r) => (
              <div
                key={r.id}
                onClick={() => onOpenReport(r.id)}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-rose-300 cursor-pointer overflow-hidden transition-all"
              >
                {r.image_url ? (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img src={r.image_url} alt={r.room_type} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-rose-100 to-fuchsia-100 flex items-center justify-center">
                    <Icon name="Home" size={40} className="text-rose-400" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 capitalize truncate">{r.room_type || "Помещение"}</h4>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 flex-shrink-0">
                      <Icon name="Star" size={12} className="fill-amber-500 text-amber-500" />
                      {r.overall_score}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{r.short_summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <button
                      onClick={(e) => onDeleteReport(r.id, e)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      aria-label="Удалить"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Benefits — показываем до первого результата */}
      {!hasResult && (
        <section className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Зачем это нужно</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <Icon name={b.icon} size={28} className="text-rose-500 mb-3" />
                <h4 className="font-bold text-gray-900 mb-1.5 text-sm">{b.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      {!hasResult && (
        <section className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Как это работает</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: "1", icon: "Upload", title: "Загрузи фото", text: "Сфотографируй помещение с хорошего ракурса и загрузи в сервис" },
              { num: "2", icon: "Bot", title: "ИИ анализирует", text: "Искусственный интеллект оценивает комнату по 7 критериям хоумстейджинга" },
              { num: "3", icon: "ListChecks", title: "Получи рекомендации", text: "Конкретные пункты со стоимостью и приоритетом — что делать в первую очередь" },
            ].map((s) => (
              <div key={s.num} className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white font-bold text-lg flex items-center justify-center mb-3">
                  {s.num}
                </div>
                <Icon name={s.icon} size={20} className="text-rose-500 mb-2" />
                <h4 className="font-bold text-gray-900 mb-1">{s.title}</h4>
                <p className="text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RoomScan AI — экосистема Авангард */}
      <section className="mt-12">
        <RoomScanCrossLink />
      </section>

      {/* FAQ — важно для SEO и Schema.org FAQPage */}
      <section className="mt-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Частые вопросы о хоумстейджинге
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {HOMESTAGING_FAQ.map((item, i) => (
            <details
              key={i}
              className="group bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 open:shadow-md transition-shadow"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg flex-1">{item.q}</h3>
                <Icon
                  name="ChevronDown"
                  size={20}
                  className="text-rose-500 flex-shrink-0 mt-0.5 group-open:rotate-180 transition-transform"
                />
              </summary>
              <p className="mt-3 text-gray-600 leading-relaxed text-sm sm:text-base">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* SEO-описание направления */}
      <section className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 prose prose-sm sm:prose-base max-w-none">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-4">
          Что такое хоумстейджинг и почему он работает
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          <strong>Хоумстейджинг</strong> (от англ. <em>home staging</em> — «подготовка дома») —
          это профессиональная предпродажная подготовка жилья, которая делает квартиру
          привлекательной для максимально широкого круга покупателей. По данным американской
          Национальной ассоциации риэлторов, квартиры после хоумстейджинга продаются
          в среднем на 5–15% дороже и в 2–3 раза быстрее, чем аналогичные без подготовки.
        </p>
        <h3 className="text-lg font-bold text-gray-900 mt-5 mb-2">Ключевые принципы</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-1.5">
          <li><strong>Обезличивание</strong> — уберите семейные фото, магниты, личные вещи, чтобы покупатель представил там свою жизнь.</li>
          <li><strong>Свет и чистота</strong> — максимальная яркость, чистые окна, свежий воздух.</li>
          <li><strong>Нейтральная палитра</strong> — бежевые, серые, белые тона расширяют аудиторию покупателей.</li>
          <li><strong>Визуальный простор</strong> — уберите лишнюю мебель, откройте проходы, освободите поверхности.</li>
          <li><strong>Акценты</strong> — живые растения, свежий текстиль, новые шторы за небольшие деньги преображают кадр.</li>
          <li><strong>Мелкий ремонт</strong> — отремонтируйте мелкие дефекты: плинтусы, сколы краски, подтёки.</li>
        </ul>
        <h3 className="text-lg font-bold text-gray-900 mt-5 mb-2">Чем полезен ИИ-анализ</h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          Хоумстейджер в Москве берёт 15–40 тыс. ₽ за выезд и подготовку технического задания.
          Наш онлайн-сервис выполняет ту же задачу бесплатно: искусственный интеллект на базе
          GPT-4 с компьютерным зрением оценивает вашу комнату за 10–20 секунд и выдаёт
          персональный список улучшений с приоритетом «важно / средне / опция» и ориентировочной
          стоимостью по каждому пункту. Вы получаете те же рекомендации, что и у профессионала,
          но без расходов и ожидания.
        </p>
        <h3 className="text-lg font-bold text-gray-900 mt-5 mb-2">Когда это особенно актуально</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-1.5">
          <li>Продажа квартиры на вторичном рынке — выделиться среди похожих объявлений.</li>
          <li>Сдача квартиры в долгосрочную или посуточную аренду — повысить ставку.</li>
          <li>Подготовка к фотосъёмке объявления на Авито, Циан, ДомКлик.</li>
          <li>Организация виртуальных туров и видеообзоров.</li>
        </ul>
        <h3 className="text-lg font-bold text-gray-900 mt-5 mb-2">Полезные сервисы АВАНГАРД</h3>
        <p className="text-gray-700 leading-relaxed">
          После получения рекомендаций вы можете:
          найти исполнителей в разделе <a href="/masters" className="text-rose-600 hover:underline font-medium">«Мастера»</a>,
          рассчитать бюджет косметического ремонта
          через <a href="/turnkey" className="text-rose-600 hover:underline font-medium">калькулятор ремонта под ключ</a>,
          подобрать <a href="/furniture" className="text-rose-600 hover:underline font-medium">мебель и декор</a>,
          создать полноценный <a href="/designer" className="text-rose-600 hover:underline font-medium">дизайн-проект интерьера</a>
          или отсканировать комнату и получить точный план помещения
          на <a href="https://roomscan-ai.ru/" target="_blank" rel="noopener" className="text-sky-600 hover:underline font-medium">RoomScan AI</a>.
        </p>
      </section>
    </>
  );
}
