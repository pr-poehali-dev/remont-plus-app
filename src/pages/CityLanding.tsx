import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import SEOMeta, {
  breadcrumbJsonLd,
  faqJsonLd,
  localServiceJsonLd,
  itemListJsonLd,
} from "@/components/SEOMeta";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Icon from "@/components/ui/icon";
import SiteFooter from "@/components/SiteFooter";
import { getCity, otherCities } from "@/data/cities";
import { REGIONAL_CALCULATORS } from "@/data/calcCatalog";
import { getCityPrices, fmtRub } from "@/data/cityPrices";

const LEVELS = [
  { label: "Косметический ремонт", key: "economy", mult: 0.82 },
  { label: "Эконом-ремонт", key: "economy", mult: 1 },
  { label: "Стандарт", key: "standard", mult: 1 },
  { label: "Комфорт", key: "standard", mult: 1.28 },
  { label: "Премиум / дизайнерский", key: "premium", mult: 1 },
] as const;

export default function CityLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const city = getCity(slug);
  if (!city) return <Navigate to="/" replace />;

  const prices = getCityPrices(city.calcRegion);
  const others = otherCities(city.slug, 10);
  const url = `/city/${city.slug}`;

  const description =
    `Стоимость ремонта квартиры в ${city.nameIn} в 2026 году: от ${fmtRub(prices.economy)} ` +
    `до ${fmtRub(prices.premium)} ₽/м². Рассчитайте смету онлайн бесплатно — работы и материалы ` +
    `с ценами ${city.nameOf}, результат сразу на экране.`;

  const faq = [
    {
      q: `Сколько стоит ремонт квартиры в ${city.nameIn}?`,
      a: `Эконом-ремонт в ${city.nameIn} — от ${fmtRub(prices.economy)} ₽/м², стандарт — ` +
         `от ${fmtRub(prices.standard)} ₽/м², премиум — от ${fmtRub(prices.premium)} ₽/м². ` +
         `Двухкомнатная квартира ${prices.exampleArea} м² под ключ — около ${fmtRub(prices.exampleTotal)} ₽.`,
    },
    {
      q: `Как быстро рассчитать смету на ремонт в ${city.nameIn}?`,
      a: `Укажите площадь квартиры, тип ремонта и город — смета формируется за пару минут, ` +
         `бесплатно и без регистрации. Результат можно скачать в PDF и показать подрядчику.`,
    },
    {
      q: `Что входит в ремонт под ключ?`,
      a: `Демонтаж, черновые работы (стяжка, штукатурка), электрика и сантехника, чистовая отделка, ` +
         `санузел, двери и откосы, финальная уборка. Каждая статья в смете указана отдельной строкой.`,
    },
    {
      q: `Работаете ли вы по всем районам ${city.nameOf}?`,
      a: `Да, расчёт действует для любого района: ${city.districts.slice(0, 4).join(", ")} и других. ` +
         `Цены по городу единые.`,
    },
  ];

  const crumbs = [
    { name: "Главная", url: "/" },
    { name: "Цены по городам", url: "/prices" },
    { name: city.name },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOMeta
        title={`Ремонт квартиры в ${city.nameIn} — цены 2026 и расчёт сметы`}
        description={description}
        keywords={`ремонт квартиры ${city.name}, стоимость ремонта в ${city.nameIn}, цены на ремонт ${city.nameOf}, калькулятор ремонта ${city.name}, смета на ремонт ${city.name}`}
        path={url}
        geo={{ city: city.name, region: city.region, lat: city.lat, lon: city.lon }}
        jsonLd={[
          localServiceJsonLd({
            name: `Ремонт квартиры в ${city.nameIn}`,
            description,
            url,
            city: city.name,
            region: city.region,
            lat: city.lat,
            lon: city.lon,
            priceMin: prices.economy,
            priceMax: prices.premium,
          }),
          breadcrumbJsonLd(crumbs),
          faqJsonLd(faq),
          itemListJsonLd(
            `Расчёты для ${city.nameOf}`,
            REGIONAL_CALCULATORS.map((c) => ({
              name: `${c.short} в ${city.nameIn}`,
              url: `${c.path}/${city.slug}`,
            })),
          ),
        ]}
      />

      {/* Первый экран */}
      <section className="bg-[#0f0f13] text-white pt-6 pb-14 px-4">
        <div className="max-w-5xl mx-auto">
          <Breadcrumbs items={crumbs} dark className="mb-8" />

          <div className="flex flex-col md:flex-row md:items-end gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/25 text-amber-300 text-sm px-3 py-1.5 rounded-full mb-4">
                <Icon name="MapPin" size={14} />
                {city.region} · {city.population} жителей
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
                Ремонт квартиры
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                  в {city.nameIn}
                </span>
              </h1>
              <p className="text-gray-300 text-lg max-w-xl">
                Цены {city.nameOf} 2026 года. Смета с работами и материалами — за две минуты,
                без регистрации.
              </p>
            </div>

            <div className="bg-white/[0.06] backdrop-blur border border-white/15 rounded-2xl p-6 md:w-72 shrink-0">
              <p className="text-gray-400 text-sm mb-1">Средняя стоимость ремонта</p>
              <p className="text-3xl font-extrabold mb-4 tabular-nums">
                {fmtRub(prices.standard)} ₽/м²
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Эконом</span>
                  <span className="tabular-nums">{fmtRub(prices.economy)} ₽/м²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Премиум</span>
                  <span className="tabular-nums">{fmtRub(prices.premium)} ₽/м²</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/turnkey?region=${city.calcRegion}`)}
            className="mt-8 px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition inline-flex items-center gap-2"
          >
            <Icon name="Calculator" size={18} />
            Рассчитать смету
          </button>
          <p className="text-xs text-gray-500 mt-2.5">Бесплатно · Без регистрации · Результат сразу</p>
        </div>
      </section>

      {/* Калькуляторы города */}
      <section className="bg-[#fafaf8] py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            Расчёты для {city.nameOf}
          </h2>
          <p className="text-gray-500 mb-7">
            Выберите тип работ — получите смету с ценами {city.nameOf}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REGIONAL_CALCULATORS.map((c) => (
              <Link
                key={c.path}
                to={`${c.path}/${city.slug}`}
                className="group bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md p-5 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors">
                    <Icon name={c.icon} size={20} className="text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                      {c.short}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">в {city.nameIn}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>Цены {city.nameOf}</span>
                  <Icon name="ArrowRight" size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Таблица цен */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            Цены на ремонт в {city.nameIn} в 2026 году
          </h2>
          <p className="text-gray-500 mb-7">Расчёт по тем же расценкам, что и в калькуляторе</p>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-700">Тип ремонта</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-700">Цена за м²</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-700">Квартира 50 м²</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-700">Квартира 80 м²</th>
                </tr>
              </thead>
              <tbody>
                {LEVELS.map(({ label, key, mult }, i) => {
                  const price = Math.round(prices[key] * mult);
                  return (
                    <tr key={label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/70"}>
                      <td className="px-5 py-3.5 text-gray-800 font-medium">{label}</td>
                      <td className="px-5 py-3.5 text-right text-gray-700 tabular-nums">{fmtRub(price)} ₽</td>
                      <td className="px-5 py-3.5 text-right text-gray-700 tabular-nums">{fmtRub(price * 50)} ₽</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-gray-900 tabular-nums">{fmtRub(price * 80)} ₽</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            * Ориентир для планирования. Точная сумма — в калькуляторе, с учётом состояния квартиры и материалов.
          </p>
        </div>
      </section>

      {/* Районы */}
      <section className="bg-[#fafaf8] py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Районы {city.nameOf}</h2>
          <p className="text-gray-500 mb-5">Работаем во всех районах города</p>
          <div className="flex flex-wrap gap-2.5">
            {city.districts.map((d) => (
              <span key={d} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700">
                <Icon name="MapPin" size={14} className="text-amber-500" />
                {d}
              </span>
            ))}
            <span className="flex items-center gap-2 bg-white border border-dashed border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-400">
              и другие районы
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-7">
            {city.features.map((f) => (
              <div key={f} className="rounded-xl bg-white border border-gray-200 p-5">
                <Icon name="CircleCheck" size={18} className="text-emerald-500 mb-2" />
                <p className="text-sm text-gray-700">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
            Частые вопросы о ремонте в {city.nameIn}
          </h2>
          <div className="space-y-2.5">
            {faq.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-gray-200 p-4">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-gray-900">
                  {q}
                  <Icon name="ChevronDown" size={18} className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-3" />
                </summary>
                <p className="mt-2.5 text-[15px] text-gray-600 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Перелинковка городов */}
      <section className="bg-[#fafaf8] py-14 px-4 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Ремонт в других городах</h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {others.map((c) => (
              <Link
                key={c.slug}
                to={`/city/${c.slug}`}
                className="text-[15px] text-gray-600 hover:text-amber-600 transition-colors"
              >
                Ремонт в {c.nameIn}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Финальный призыв */}
      <section className="bg-[#0f0f13] py-14 px-4 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Рассчитайте ремонт в {city.nameIn}
          </h2>
          <p className="text-gray-400 mb-7">
            Бесплатно и без регистрации. Смета с ценами {city.nameOf} 2026 года.
          </p>
          <button
            onClick={() => navigate(`/turnkey?region=${city.calcRegion}`)}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-4 rounded-xl transition text-lg"
          >
            <Icon name="Calculator" size={20} />
            Открыть калькулятор
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
