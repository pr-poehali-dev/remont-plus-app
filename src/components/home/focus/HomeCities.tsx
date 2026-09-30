import { Link } from "react-router-dom";
import { CITIES } from "@/data/cities";
import { getCityPrices, fmtRub } from "@/data/cityPrices";

export default function HomeCities() {
  return (
    <section className="bg-white py-14 sm:py-16 border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-center">
          Цены на ремонт по городам
        </h2>
        <p className="mt-2.5 text-center text-gray-500">
          Расценки работ отличаются по регионам — выберите свой город
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-8">
          {CITIES.map((c) => {
            const p = getCityPrices(c.calcRegion);
            return (
              <Link
                key={c.slug}
                to={`/city/${c.slug}`}
                className="group rounded-xl border border-gray-200 px-3.5 py-3 hover:border-amber-300 hover:bg-amber-50/40 transition"
              >
                <span className="block text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors truncate">
                  {c.name}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5 tabular-nums">
                  от {fmtRub(p.economy)} ₽/м²
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
