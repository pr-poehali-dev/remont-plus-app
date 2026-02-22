import Icon from "@/components/ui/icon";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

interface RegionData {
  label: string;
  city: string;
  prices: [string, string, string];
  districts: [string, string, string];
}

interface Props {
  region: RegionData;
}

export default function HomeProjects({ region }: Props) {
  const projects = [
    {
      before: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/d1145c26-c0f3-473a-870a-652d6c28a68c.jpg",
      after: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/c50e56a4-0403-4a15-9304-377f1e623dcd.jpg",
      title: "Ванная комната", area: "8 м²", time: "14 дней", price: region.prices[0], district: region.districts[0],
    },
    {
      before: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/88872eca-f623-4351-8d0f-b9961cc1509b.jpg",
      after: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e8794aeb-95cc-471b-af60-ac670e68e682.jpg",
      title: "Кухня-гостиная", area: "25 м²", time: "21 день", price: region.prices[1], district: region.districts[1],
    },
    {
      before: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/f206b6d0-2b52-40ab-88bb-a249dcf1519d.jpg",
      after: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3c16649d-8e76-43b4-9b6f-0ed4f4f2ff25.jpg",
      title: "Гостиная", area: "18 м²", time: "12 дней", price: region.prices[2], district: region.districts[2],
    },
  ];

  const features = [
    { icon: "Bot", title: "ИИ-дизайнер бесплатно", text: "Создайте трёхмерную визуализацию квартиры за несколько минут. Подберите стиль, цветовую гамму и расстановку мебели ещё до начала отделки.", color: "text-amber-500" },
    { icon: "ShieldCheck", title: "Только проверенные мастера", text: "Все специалисты в базе прошли верификацию: портфолио, отзывы прошлых заказчиков и оценка по завершении каждого объекта.", color: "text-blue-500" },
    { icon: "Calculator", title: "Смета онлайн за 2 минуты", text: "Укажите площадь и вид работ — калькулятор рассчитает ориентировочную стоимость с учётом актуальных цен на материалы.", color: "text-emerald-500" },
    { icon: "ClipboardCheck", title: "Контроль на каждом шаге", text: "Следите за ходом ремонта через личный кабинет: фотоотчёты, этапы сдачи-приёмки и история платежей в одном месте.", color: "text-violet-500" },
  ];

  const reviews = [
    { name: "Анна К.", text: "Обновили ванную всего за две недели. Плитка уложена безупречно, швы ровные, затирка аккуратная. Бригада убрала за собой весь строительный мусор. Однозначно советую!", rating: 5, date: "Январь 2026", emoji: "👩" },
    { name: "Дмитрий П.", text: "Заказывал комплексную отделку кухни-гостиной. Трёхмерная визуализация интерьера помогла заранее увидеть итог и избежать лишних правок. В итоге — точно в смете и графике.", rating: 5, date: "Декабрь 2025", emoji: "👨" },
    { name: "Елена М.", text: "Онлайн-калькулятор сразу показал приблизительную стоимость по видам работ — никаких неожиданностей. Специалист явился в условленное время, сделал всё аккуратно и чисто.", rating: 5, date: "Февраль 2026", emoji: "👩" },
  ];

  return (
    <>
      {/* Реализованные объекты */}
      <section className="mt-0">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Реализованные объекты</span>
          </h2>
          <p className="text-gray-500 text-lg">Завершённые проекты отделки в {region.city}</p>
          <p className="text-gray-400 text-sm mt-1">Потяните ползунок, чтобы сравнить «до» и «после»</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
              <BeforeAfterSlider
                beforeImg={project.before}
                afterImg={project.after}
                className="aspect-[4/3]"
              />
              <div className="p-5">
                <h3 className="font-bold text-gray-900">{project.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Icon name="MapPin" size={12} />{project.district}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Icon name="Ruler" size={14} />{project.area}</span>
                  <span className="flex items-center gap-1"><Icon name="Clock" size={14} />{project.time}</span>
                </div>
                <p className="mt-2 font-semibold text-orange-500">{project.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Почему выбирают */}
      <section className="mt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Почему выбирают АВАНГАРД</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Мы объединяем технологии искусственного интеллекта и опыт живых специалистов, чтобы ваш ремонт прошёл без стресса и непредвиденных расходов.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
              <Icon name={item.icon} size={32} className={`${item.color} mb-4`} />
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Отзывы */}
      <section className="mt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Мнения наших заказчиков</span>
          </h2>
          <p className="text-gray-500 text-lg">Реальные истории людей, которые уже обновили своё жильё</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">«{review.text}»</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-lg">
                    {review.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                </div>
                <Icon name="Quote" size={20} className="text-orange-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
