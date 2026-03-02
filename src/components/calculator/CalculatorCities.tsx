const CITIES = [
  { slug: "moskva", name: "Москва" },
  { slug: "sankt_peterburg", name: "Санкт-Петербург" },
  { slug: "novosibirsk", name: "Новосибирск" },
  { slug: "ekaterinburg", name: "Екатеринбург" },
  { slug: "kazan", name: "Казань" },
  { slug: "nizhniy_novgorod", name: "Нижний Новгород" },
  { slug: "chelyabinsk", name: "Челябинск" },
  { slug: "samara", name: "Самара" },
  { slug: "omsk", name: "Омск" },
  { slug: "rostov_na_donu", name: "Ростов-на-Дону" },
  { slug: "ufa", name: "Уфа" },
  { slug: "krasnoyarsk", name: "Красноярск" },
  { slug: "perm", name: "Пермь" },
  { slug: "voronezh", name: "Воронеж" },
  { slug: "volgograd", name: "Волгоград" },
];

export default function CalculatorCities() {
  return (
    <div className="bg-white border-t mt-10 py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Калькулятор ремонта по городам</h2>
        <p className="text-sm text-gray-500 mb-5">Цены на ремонт с учётом региональных особенностей</p>
        <div className="flex flex-wrap gap-2">
          {CITIES.map(city => (
            <a
              key={city.slug}
              href={`/city/${city.slug}`}
              className="inline-block px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              {city.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
