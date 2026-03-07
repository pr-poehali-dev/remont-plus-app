import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface Company {
  id: number;
  city: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  director_name: string;
  inn: string;
}

interface Props {
  companies: Company[];
  total: number;
  offset: number;
  page: number;
  selectedCity: string;
  loading: boolean;
  onPageChange: (newOffset: number) => void;
}

export default function CompanyParserCompanyList({ companies, total, offset, page, selectedCity, loading, onPageChange }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {selectedCity ? `${selectedCity} — ` : ""}
          {total.toLocaleString()} компаний
        </span>
        <div className="flex gap-2">
          <Button
            size="sm" variant="outline"
            disabled={offset === 0}
            onClick={() => onPageChange(offset - page)}
            className="h-8 text-xs"
          >
            <Icon name="ChevronLeft" size={14} />
          </Button>
          <span className="text-xs text-gray-500 self-center px-1">
            {offset + 1}–{Math.min(offset + page, total)} из {total}
          </span>
          <Button
            size="sm" variant="outline"
            disabled={offset + page >= total}
            onClick={() => onPageChange(offset + page)}
            className="h-8 text-xs"
          >
            <Icon name="ChevronRight" size={14} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Icon name="Loader2" size={24} className="animate-spin text-gray-400" />
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>Нет данных. Выберите город и запустите сбор.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[200px]">Название</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Город</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Телефон</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Директор</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ИНН</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Сайт</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c, i) => (
                <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[250px] truncate">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{c.city}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {c.phone ? (
                      <a href={`tel:${c.phone}`} className="hover:text-orange-500">{c.phone}</a>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {c.email ? (
                      <a href={`mailto:${c.email}`} className="hover:text-orange-500">{c.email}</a>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {c.director_name || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.inn || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs truncate max-w-[120px] block">
                        {c.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
