import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/SEOMeta";
import Icon from "@/components/ui/icon";

interface CityData {
  name: string;
  nameIn: string;
  nameOf: string;
  population: string;
  region: string;
  priceMin: number;
  priceMax: number;
  priceEconomy: number;
  pricePremium: number;
  districts: string[];
  features: string[];
}

const CITIES: Record<string, CityData> = {
  moskva: {
    name: "Москва",
    nameIn: "Москве",
    nameOf: "Москвы",
    population: "12,7 млн",
    region: "Москва и МО",
    priceMin: 12000,
    priceMax: 60000,
    priceEconomy: 18000,
    pricePremium: 45000,
    districts: ["Хамовники", "Митино", "Бутово", "Тропарёво", "Марьино", "Выхино"],
    features: ["Высокий уровень отделки", "Лучшие материалы", "Быстрые сроки"],
  },
  sankt_peterburg: {
    name: "Санкт-Петербург",
    nameIn: "Санкт-Петербурге",
    nameOf: "Санкт-Петербурга",
    population: "5,6 млн",
    region: "Санкт-Петербург и ЛО",
    priceMin: 10000,
    priceMax: 50000,
    priceEconomy: 15000,
    pricePremium: 38000,
    districts: ["Петроградский", "Василеостровский", "Приморский", "Калининский", "Выборгский", "Кировский"],
    features: ["Опыт в старом фонде", "Реставрация лепнины", "Влажный климат — знаем решения"],
  },
  novosibirsk: {
    name: "Новосибирск",
    nameIn: "Новосибирске",
    nameOf: "Новосибирска",
    population: "1,6 млн",
    region: "Новосибирская область",
    priceMin: 7000,
    priceMax: 35000,
    priceEconomy: 10000,
    pricePremium: 28000,
    districts: ["Центральный", "Октябрьский", "Ленинский", "Кировский", "Советский", "Дзержинский"],
    features: ["Суровый климат — надёжная отделка", "Быстрые бригады", "Честные цены"],
  },
  ekaterinburg: {
    name: "Екатеринбург",
    nameIn: "Екатеринбурге",
    nameOf: "Екатеринбурга",
    population: "1,5 млн",
    region: "Свердловская область",
    priceMin: 8000,
    priceMax: 38000,
    priceEconomy: 11000,
    pricePremium: 30000,
    districts: ["Центр", "Академический", "Ботанический", "Уралмаш", "ВИЗ", "Юго-Западный"],
    features: ["Опыт в новостройках", "Работа с панельными домами", "Контроль сроков"],
  },
  kazan: {
    name: "Казань",
    nameIn: "Казани",
    nameOf: "Казани",
    population: "1,3 млн",
    region: "Республика Татарстан",
    priceMin: 8000,
    priceMax: 36000,
    priceEconomy: 11000,
    pricePremium: 28000,
    districts: ["Вахитовский", "Ново-Савиновский", "Советский", "Приволжский", "Авиастроительный", "Кировский"],
    features: ["Активный рынок новостроек", "Опыт в ЖК бизнес-класса", "Многоквартирные дома"],
  },
  nizhniy_novgorod: {
    name: "Нижний Новгород",
    nameIn: "Нижнем Новгороде",
    nameOf: "Нижнего Новгорода",
    population: "1,2 млн",
    region: "Нижегородская область",
    priceMin: 7500,
    priceMax: 34000,
    priceEconomy: 10500,
    pricePremium: 27000,
    districts: ["Нижегородский", "Советский", "Приокский", "Канавинский", "Автозаводский", "Ленинский"],
    features: ["Опыт в исторических домах", "Современные ЖК", "Выгодные цены"],
  },
  chelyabinsk: {
    name: "Челябинск",
    nameIn: "Челябинске",
    nameOf: "Челябинска",
    population: "1,2 млн",
    region: "Челябинская область",
    priceMin: 6500,
    priceMax: 30000,
    priceEconomy: 9000,
    pricePremium: 24000,
    districts: ["Центральный", "Курчатовский", "Калининский", "Ленинский", "Металлургический", "Советский"],
    features: ["Доступные цены", "Широкий выбор мастеров", "Работа под ключ"],
  },
  samara: {
    name: "Самара",
    nameIn: "Самаре",
    nameOf: "Самары",
    population: "1,15 млн",
    region: "Самарская область",
    priceMin: 7000,
    priceMax: 32000,
    priceEconomy: 9500,
    pricePremium: 25000,
    districts: ["Октябрьский", "Ленинский", "Кировский", "Самарский", "Железнодорожный", "Куйбышевский"],
    features: ["Волжское побережье — знаем влажность", "Опыт в хрущёвках и сталинках", "Чёткие сроки"],
  },
  omsk: {
    name: "Омск",
    nameIn: "Омске",
    nameOf: "Омска",
    population: "1,14 млн",
    region: "Омская область",
    priceMin: 6000,
    priceMax: 28000,
    priceEconomy: 8500,
    pricePremium: 22000,
    districts: ["Центральный", "Советский", "Ленинский", "Октябрьский", "Кировский", "Амурский"],
    features: ["Честные цены без наценок", "Проверенные бригады", "Гарантия на работы"],
  },
  rostov_na_donu: {
    name: "Ростов-на-Дону",
    nameIn: "Ростове-на-Дону",
    nameOf: "Ростова-на-Дону",
    population: "1,14 млн",
    region: "Ростовская область",
    priceMin: 7500,
    priceMax: 34000,
    priceEconomy: 10000,
    pricePremium: 26000,
    districts: ["Ворошиловский", "Кировский", "Советский", "Ленинский", "Первомайский", "Октябрьский"],
    features: ["Жаркий климат — правильные материалы", "Балконы и лоджии", "Современные ЖК"],
  },
  ufa: {
    name: "Уфа",
    nameIn: "Уфе",
    nameOf: "Уфы",
    population: "1,12 млн",
    region: "Республика Башкортостан",
    priceMin: 7000,
    priceMax: 32000,
    priceEconomy: 9500,
    pricePremium: 25000,
    districts: ["Демский", "Кировский", "Ленинский", "Октябрьский", "Орджоникидзевский", "Советский"],
    features: ["Растущий рынок недвижимости", "Опыт в новых ЖК", "Комплексный подход"],
  },
  krasnoyarsk: {
    name: "Красноярск",
    nameIn: "Красноярске",
    nameOf: "Красноярска",
    population: "1,09 млн",
    region: "Красноярский край",
    priceMin: 7500,
    priceMax: 34000,
    priceEconomy: 10000,
    pricePremium: 27000,
    districts: ["Центральный", "Советский", "Октябрьский", "Свердловский", "Кировский", "Железнодорожный"],
    features: ["Сибирский климат — надёжная отделка", "Энергоэффективные решения", "Опыт в панельках"],
  },
  perm: {
    name: "Пермь",
    nameIn: "Перми",
    nameOf: "Перми",
    population: "1,05 млн",
    region: "Пермский край",
    priceMin: 7000,
    priceMax: 31000,
    priceEconomy: 9500,
    pricePremium: 24000,
    districts: ["Дзержинский", "Индустриальный", "Кировский", "Ленинский", "Мотовилихинский", "Орджоникидзевский"],
    features: ["Горный Урал — знаем влажность", "Работа с кирпичными домами", "Прозрачные сметы"],
  },
  voronezh: {
    name: "Воронеж",
    nameIn: "Воронеже",
    nameOf: "Воронежа",
    population: "1,04 млн",
    region: "Воронежская область",
    priceMin: 6500,
    priceMax: 29000,
    priceEconomy: 9000,
    pricePremium: 22000,
    districts: ["Центральный", "Коминтерновский", "Левобережный", "Советский", "Железнодорожный", "Ленинский"],
    features: ["Хорошая логистика материалов", "Опыт в новостройках", "Выгодные условия"],
  },
  volgograd: {
    name: "Волгоград",
    nameIn: "Волгограде",
    nameOf: "Волгограда",
    population: "1,01 млн",
    region: "Волгоградская область",
    priceMin: 6500,
    priceMax: 28000,
    priceEconomy: 8500,
    pricePremium: 21000,
    districts: ["Центральный", "Советский", "Тракторозаводский", "Кировский", "Краснооктябрьский", "Дзержинский"],
    features: ["Южный климат — правильные технологии", "Доступные цены", "Широкая база мастеров"],
  },
};

const CALCS = [
  { slug: "newbuild", name: "Ремонт новостройки", icon: "Building2", desc: "Черновой и чистовой ремонт" },
  { slug: "turnkey", name: "Ремонт под ключ", icon: "Key", desc: "Полный цикл от А до Я" },
  { slug: "bathroom", name: "Ванная комната", icon: "Bath", desc: "Плитка, сантехника, отделка" },
  { slug: "ceilings", name: "Натяжные потолки", icon: "LayoutTemplate", desc: "Расчёт по площади" },
  { slug: "flooring", name: "Напольные покрытия", icon: "Grid3x3", desc: "Ламинат, плитка, паркет" },
  { slug: "electrics", name: "Электрика", icon: "Zap", desc: "Проводка, щиток, розетки" },
  { slug: "windows", name: "Окна ПВХ", icon: "AppWindow", desc: "Расчёт по размерам" },
];

export default function CityLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const city = slug ? CITIES[slug] : null;

  useEffect(() => {
    if (slug && !CITIES[slug]) {
      navigate("/", { replace: true });
    }
  }, [slug, navigate]);

  if (!city) return null;

  const avgPrice = Math.round((city.priceMin + city.priceMax) / 2);

  return (
    <>
      <SEOMeta
        title={`Калькулятор ремонта квартиры в ${city.nameIn} онлайн 2026`}
        description={`Рассчитайте стоимость ремонта квартиры в ${city.nameIn} онлайн бесплатно. Цены от ${city.priceMin.toLocaleString()} до ${city.priceMax.toLocaleString()} ₽/м². Точная смета за 5 минут. Без посредников.`}
        keywords={`калькулятор ремонта ${city.name}, стоимость ремонта квартиры в ${city.nameIn}, цена ремонта ${city.nameOf}, смета на ремонт ${city.name}`}
        path={`/city/${slug}`}
        jsonLd={[
          calcJsonLd(
            `Калькулятор ремонта квартиры в ${city.nameIn}`,
            `Онлайн расчёт стоимости ремонта квартиры в ${city.nameIn}. Цены от ${city.priceMin.toLocaleString()} ₽/м².`,
            `/city/${slug}`
          ),
          breadcrumbJsonLd([
            { name: "Главная", url: "/" },
            { name: "Калькуляторы", url: "/calculator" },
            { name: city.name, url: `/city/${slug}` },
          ]),
          faqJsonLd([
            {
              q: `Сколько стоит ремонт квартиры в ${city.nameIn}?`,
              a: `Стоимость ремонта квартиры в ${city.nameIn} составляет от ${city.priceMin.toLocaleString()} до ${city.priceMax.toLocaleString()} ₽ за кв. метр. Эконом-ремонт — от ${city.priceEconomy.toLocaleString()} ₽/м², премиум — от ${city.pricePremium.toLocaleString()} ₽/м².`,
            },
            {
              q: `Как рассчитать стоимость ремонта в ${city.nameIn}?`,
              a: `Воспользуйтесь онлайн-калькулятором АВАНГАРД. Укажите площадь квартиры, тип ремонта и желаемый уровень отделки — получите точную смету за 5 минут.`,
            },
            {
              q: `Какие районы ${city.nameOf} охвачены?`,
              a: `Мы работаем по всей ${city.nameOf}: ${city.districts.join(", ")} и другим районам.`,
            },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-16 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link to="/" className="hover:text-white transition-colors">Главная</Link>
            <span>/</span>
            <Link to="/calculator" className="hover:text-white transition-colors">Калькуляторы</Link>
            <span>/</span>
            <span className="text-white">{city.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm px-3 py-1.5 rounded-full mb-4">
                <Icon name="MapPin" size={14} />
                {city.region} · {city.population} жителей
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                Калькулятор ремонта<br />
                <span className="text-blue-400">в {city.nameIn}</span>
              </h1>
              <p className="text-gray-300 text-lg max-w-xl">
                Точный расчёт стоимости ремонта квартиры онлайн. Актуальные цены {city.nameOf} 2026 года.
              </p>
            </div>

            {/* Price card */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 md:w-72 shrink-0">
              <p className="text-gray-400 text-sm mb-3">Средняя стоимость ремонта</p>
              <p className="text-3xl font-bold text-white mb-1">{avgPrice.toLocaleString()} ₽/м²</p>
              <div className="flex justify-between text-sm text-gray-400 mb-4">
                <span>от {city.priceMin.toLocaleString()} ₽</span>
                <span>до {city.priceMax.toLocaleString()} ₽</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full mb-4">
                <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
              </div>
              <Link
                to="/calculator"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Рассчитать бесплатно
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-3">
            {city.features.map((f) => (
              <span key={f} className="flex items-center gap-1.5 bg-white/10 text-gray-200 text-sm px-3 py-1.5 rounded-full">
                <Icon name="CheckCircle" size={14} className="text-green-400" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Calculators grid */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Калькуляторы для {city.nameOf}
          </h2>
          <p className="text-gray-500 mb-8">Выберите нужный тип работ — получите смету с ценами {city.nameOf}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CALCS.map((calc) => (
              <Link
                key={calc.slug}
                to={`/${calc.slug}`}
                className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md p-5 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                    <Icon name={calc.icon} size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{calc.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{calc.desc}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>Цены для {city.nameOf}</span>
                  <Icon name="ArrowRight" size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Prices table */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Цены на ремонт в {city.nameIn} в 2026 году
          </h2>
          <p className="text-gray-500 mb-8">Актуальные средние цены по данным рынка</p>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-4 font-semibold text-gray-700">Тип ремонта</th>
                  <th className="text-right px-5 py-4 font-semibold text-gray-700">Цена за м²</th>
                  <th className="text-right px-5 py-4 font-semibold text-gray-700">Квартира 50 м²</th>
                  <th className="text-right px-5 py-4 font-semibold text-gray-700">Квартира 80 м²</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Косметический ремонт", mult: 0.5 },
                  { label: "Эконом-ремонт", mult: 0.75 },
                  { label: "Стандарт", mult: 1 },
                  { label: "Комфорт", mult: 1.5 },
                  { label: "Премиум / дизайнерский", mult: 2.5 },
                ].map(({ label, mult }, i) => {
                  const price = Math.round(city.priceEconomy * mult);
                  return (
                    <tr key={label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-5 py-4 text-gray-800 font-medium">{label}</td>
                      <td className="px-5 py-4 text-right text-gray-700">{price.toLocaleString()} ₽</td>
                      <td className="px-5 py-4 text-right text-gray-700">{(price * 50).toLocaleString()} ₽</td>
                      <td className="px-5 py-4 text-right font-semibold text-gray-900">{(price * 80).toLocaleString()} ₽</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">* Цены ориентировочные, точный расчёт — в калькуляторе</p>
        </div>
      </section>

      {/* Districts */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Районы {city.nameOf}</h2>
          <p className="text-gray-500 mb-8">Работаем во всех районах города</p>
          <div className="flex flex-wrap gap-3">
            {city.districts.map((d) => (
              <div key={d} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 shadow-sm">
                <Icon name="MapPin" size={14} className="text-blue-500" />
                {d}
              </div>
            ))}
            <div className="flex items-center gap-2 bg-white border border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-400">
              и другие районы...
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Частые вопросы о ремонте в {city.nameIn}</h2>
          <div className="space-y-4">
            {[
              {
                q: `Сколько стоит ремонт квартиры в ${city.nameIn}?`,
                a: `Стоимость зависит от типа ремонта и площади. Эконом — от ${city.priceEconomy.toLocaleString()} ₽/м², стандарт — от ${Math.round(city.priceEconomy * 1.3).toLocaleString()} ₽/м², премиум — от ${city.pricePremium.toLocaleString()} ₽/м². Для квартиры 50 м² в эконом-варианте итого от ${(city.priceEconomy * 50).toLocaleString()} ₽.`,
              },
              {
                q: `Как быстро рассчитать смету на ремонт в ${city.nameIn}?`,
                a: `Воспользуйтесь нашим онлайн-калькулятором: укажите площадь, тип жилья и желаемый уровень отделки. Точная смета формируется за 5 минут, бесплатно и без регистрации.`,
              },
              {
                q: `Что входит в ремонт под ключ в ${city.nameIn}?`,
                a: `Ремонт под ключ включает: черновую отделку (выравнивание стен, стяжку), чистовую отделку (обои/покраска, плитка, напольное покрытие), электромонтаж, сантехнику и установку дверей/откосов.`,
              },
              {
                q: `Работаете ли вы по всем районам ${city.nameOf}?`,
                a: `Да, мы рассчитываем ремонт для квартир в любом районе: ${city.districts.slice(0, 4).join(", ")} и других. Цены одинаковы по всему городу.`,
              },
            ].map(({ q, a }) => (
              <details key={q} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-gray-800 hover:bg-gray-50 transition-colors list-none">
                  {q}
                  <Icon name="ChevronDown" size={18} className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-3" />
                </summary>
                <div className="px-5 pb-4 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 px-4 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Рассчитайте ремонт в {city.nameIn} прямо сейчас
          </h2>
          <p className="text-blue-100 mb-8">
            Бесплатно, без регистрации. Точная смета с учётом цен {city.nameOf} 2026 года.
          </p>
          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg"
          >
            <Icon name="Calculator" size={20} />
            Открыть калькулятор
          </Link>
        </div>
      </section>
    </>
  );
}