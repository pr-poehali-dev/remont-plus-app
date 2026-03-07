import Icon from "@/components/ui/icon";

interface CityStats {
  city: string;
  count: number;
  enriched: number;
  with_email: number;
}

interface Props {
  stats: CityStats[];
  onCitySelect: (city: string) => void;
  onDelete: (city: string) => void;
}

export default function CompanyParserCityTable({ stats, onCitySelect, onDelete }: Props) {
  if (stats.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="text-center py-16 text-gray-400">
          <Icon name="DatabaseZap" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">База пустая</p>
          <p className="text-sm mt-1">Выбери город и нажми «Собрать из 2ГИС»</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Город</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Компаний</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">С email</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">С директором</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">% обогащено</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s, i) => (
            <tr key={s.city} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
              <td className="px-4 py-3">
                <button
                  onClick={() => onCitySelect(s.city)}
                  className="font-medium text-orange-600 hover:underline"
                >
                  {s.city}
                </button>
              </td>
              <td className="px-4 py-3 text-right font-semibold">{s.count}</td>
              <td className="px-4 py-3 text-right text-green-600">{s.with_email || 0}</td>
              <td className="px-4 py-3 text-right text-orange-500">{s.enriched}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${s.count > 0 ? Math.round(s.enriched / s.count * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-gray-500 text-xs w-8 text-right">
                    {s.count > 0 ? Math.round(s.enriched / s.count * 100) : 0}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onDelete(s.city)}
                  className="text-gray-400 hover:text-red-500 transition"
                  title="Удалить данные по городу"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
