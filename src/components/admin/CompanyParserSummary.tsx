interface CityStats {
  city: string;
  count: number;
  enriched: number;
  with_email: number;
}

interface Props {
  stats: CityStats[];
}

export default function CompanyParserSummary({ stats }: Props) {
  const totalAll = stats.reduce((s, c) => s + c.count, 0);
  const enrichedAll = stats.reduce((s, c) => s + c.enriched, 0);

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
        <p className="text-3xl font-extrabold text-gray-900">{totalAll.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1">Всего компаний</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
        <p className="text-3xl font-extrabold text-orange-500">{enrichedAll.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1">С ФИО директора</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
        <p className="text-3xl font-extrabold text-green-600">{stats.reduce((s, c) => s + (c.with_email || 0), 0).toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1">С email</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
        <p className="text-3xl font-extrabold text-blue-500">{stats.length}</p>
        <p className="text-sm text-gray-500 mt-1">Городов собрано</p>
      </div>
    </div>
  );
}
