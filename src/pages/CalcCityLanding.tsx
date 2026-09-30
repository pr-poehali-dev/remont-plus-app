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
import { getCity, otherCities, CITIES } from "@/data/cities";
import { getCalcBySegment, REGIONAL_CALCULATORS } from "@/data/calcCatalog";
import { getCityPrices, fmtRub } from "@/data/cityPrices";

export default function CalcCityLanding() {
  const { calc, citySlug } = useParams<{ calc: string; citySlug: string }>();
  const navigate = useNavigate();

  const entry = getCalcBySegment(calc);
  const city = getCity(citySlug);

  // Неизвестный город — уводим на сам калькулятор, чтобы не плодить пустые страницы
  if (!entry) return <Navigate to="/" replace />;
  if (!city) return <Navigate to={entry.path} replace />;

  const prices = getCityPrices(city.calcRegion);
  const url = `${entry.path}/${city.slug}`;
  const others = otherCities(city.slug, 8);

  const title = `${entry.title} в ${city.nameIn} — расчёт стоимости онлайн`;
  const description =
    `Рассчитайте ${entry.accusative} в ${city.nameIn} онлайн бесплатно. ` +
    `Цены ${city.nameOf} 2026: от ${fmtRub(prices.economy)} до ${fmtRub(prices.premium)} ₽/м². ` +
    `Смета с работами и материалами за 2 минуты, без регистрации.`;

  const faq = [
    {
      q: `Сколько стоит ${entry.accusative} в ${city.nameIn}?`,
      a: `В ${city.nameIn} ${entry.accusative} обходится от ${fmtRub(prices.economy)} ₽/м² в эконом-варианте ` +
         `до ${fmtRub(prices.premium)} ₽/м² в премиум-отделке. Средний ориентир — ${fmtRub(prices.standard)} ₽/м². ` +
         `Типовая двухкомнатная квартира ${prices.exampleArea} м² — около ${fmtRub(prices.exampleTotal)} ₽.`,
    },
    {
      q: `Почему цены в ${city.nameIn} отличаются от других городов?`,
      a: `Стоимость работ зависит от региона: в ${city.region} свой уровень расценок бригад и логистики материалов. ` +
         `Калькулятор применяет региональный коэффициент, поэтому смета отражает цены ${city.nameOf}, а не среднюю по стране.`,
    },
    {
      q: `В каких районах ${city.nameOf} работают мастера?`,
      a: `Мы работаем по всему городу: ${city.districts.join(", ")} и другие районы. ` +
         `После расчёта смету можно отправить проверенным бригадам ${city.nameOf}.`,
    },
    {
      q: `Расчёт платный?`,
      a: `Нет. Смета считается бесплатно и без регистрации — результат сразу на экране, можно скачать в PDF.`,
    },
  ];

  const crumbs = [
    { name: "Главная", url: "/" },
    { name: entry.short, url: entry.path },
    { name: city.name },
  ];

  const go = () => navigate(`${entry.path}?region=${city.calcRegion}`);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOMeta
        title={title}
        description={description}
        keywords={`${entry.keyword} ${city.name}, ${entry.keyword} в ${city.nameIn}, цена ${entry.accusative} ${city.nameOf}, смета ${city.name}`}
        path={url}
        geo={{ city: city.name, region: city.region, lat: city.lat, lon: city.lon }}
        jsonLd={[
          localServiceJsonLd({
            name: `${entry.title} в ${city.nameIn}`,
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
            `${entry.title} в других городах`,
            others.map((c) => ({ name: c.name, url: `${entry.path}/${c.slug}` })),
          ),
        ]}
      />

      <section className="bg-[#0f0f13] text-white pt-6 pb-14 px-4">
        <div className="max-w-5xl mx-auto">
          <Breadcrumbs items={crumbs} dark className="mb-8" />

          <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/25 text-amber-300 text-sm px-3 py-1.5 rounded-full mb-4">
            <Icon name="MapPin" size={14} />
            {city.region} · {city.population} жителей
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
            {entry.title}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
              в {city.nameIn}
            </span>
          </h1>

          <p className="text-gray-300 text-lg max-w-2xl">
            Онлайн-расчёт с ценами {city.nameOf} 2026 года. Работы и материалы —
            отдельными строками, результат сразу на экране.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mt-8 max-w-2xl">
            {[
              { label: "Эконом", value: prices.economy },
              { label: "Стандарт", value: prices.standard, accent: true },
              { label: "Премиум", value: prices.premium },
            ].map((p) => (
              <div
                key={p.label}
                className={`rounded-xl border p-4 ${
                  p.accent ? "border-amber-400/40 bg-amber-400/10" : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <p className="text-xs text-gray-400 mb-1">{p.label}</p>
                <p className="text-xl font-bold tabular-nums">{fmtRub(p.value)} ₽/м²</p>
              </div>
            ))}
          </div>

          <button
            onClick={go}
            className="mt-7 h-13 px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition inline-flex items-center gap-2"
          >
            <Icon name="Calculator" size={18} />
            Рассчитать для {city.nameOf}
          </button>
          <p className="text-xs text-gray-500 mt-2.5">Бесплатно · Без регистрации · Результат сразу</p>
        </div>
      </section>

      <section className="bg-[#fafaf8] py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            Сколько стоит {entry.accusative} в {city.nameIn}
          </h2>
          <p className="text-gray-500 mb-6 max-w-2xl">
            Ориентир по типовой двухкомнатной квартире {prices.exampleArea} м² — около{" "}
            <span className="font-semibold text-gray-900">{fmtRub(prices.exampleTotal)} ₽</span>.
            Точная сумма зависит от состояния квартиры и выбранных материалов.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {city.features.map((f) => (
              <div key={f} className="rounded-xl bg-white border border-gray-200 p-5">
                <Icon name="CircleCheck" size={18} className="text-emerald-500 mb-2" />
                <p className="text-sm text-gray-700">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Районы {city.nameOf}</h2>
          <p className="text-gray-500 mb-5">Мастера работают по всему городу</p>
          <div className="flex flex-wrap gap-2">
            {city.districts.map((d) => (
              <span key={d} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-sm text-gray-700">
                <Icon name="MapPin" size={13} className="text-amber-500" />
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fafaf8] py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
            Частые вопросы о ремонте в {city.nameIn}
          </h2>
          <div className="space-y-2.5">
            {faq.map((f) => (
              <details key={f.q} className="group rounded-xl bg-white border border-gray-200 p-4">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-gray-900">
                  {f.q}
                  <Icon name="ChevronDown" size={18} className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-3" />
                </summary>
                <p className="mt-2.5 text-[15px] text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">
            {entry.title} в других городах
          </h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-9">
            {others.map((c) => (
              <Link
                key={c.slug}
                to={`${entry.path}/${c.slug}`}
                className="text-[15px] text-gray-600 hover:text-amber-600 transition-colors"
              >
                {entry.short} в {c.nameIn}
              </Link>
            ))}
          </div>

          <h2 className="text-xl font-extrabold text-gray-900 mb-4">
            Другие расчёты в {city.nameIn}
          </h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {REGIONAL_CALCULATORS.filter((c) => c.path !== entry.path).map((c) => (
              <Link
                key={c.path}
                to={`${c.path}/${city.slug}`}
                className="text-[15px] text-gray-600 hover:text-amber-600 transition-colors"
              >
                {c.short} в {city.nameIn}
              </Link>
            ))}
          </div>

          <p className="mt-8 text-sm text-gray-400">
            Всего городов в расчёте: {CITIES.length}.{" "}
            <Link to="/city/moskva" className="text-amber-600 hover:underline">
              Смотреть цены по регионам
            </Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
