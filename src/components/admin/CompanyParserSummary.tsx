interface CityStats {
  city: string;
  count: number;
  enriched: number;
  with_email: number;
  with_phone?: number;
  with_website?: number;
}

interface Props {
  stats: CityStats[];
}

export default function CompanyParserSummary({ stats }: Props) {
  const totalAll = stats.reduce((s, c) => s + c.count, 0);
  const withEmail = stats.reduce((s, c) => s + (c.with_email || 0), 0);
  const withPhone = stats.reduce((s, c) => s + (c.with_phone || 0), 0);
  const withWebsite = stats.reduce((s, c) => s + (c.with_website || 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
        <p className="text-3xl font-extrabold text-gray-900">{totalAll.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1">Всего компаний</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
        <p className="text-3xl font-extrabold text-green-600">{withEmail.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1">С email</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
        <p className="text-3xl font-extrabold text-blue-500">{withPhone.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1">С телефоном</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
        <p className="text-3xl font-extrabold text-orange-500">{withWebsite.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1">С сайтом</p>
      </div>
    </div>
  );
}
