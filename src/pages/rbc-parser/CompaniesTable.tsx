import { useState, Fragment } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Company } from "./types";
import { EgrulBadge } from "./EgrulEnrichCard";

interface Props {
  companies: Company[];
  doneCount: number;
}

export default function CompaniesTable({ companies, doneCount }: Props) {
  const [filterPhone, setFilterPhone] = useState(false);
  const [filterEmail, setFilterEmail] = useState(false);
  const [filterSite, setFilterSite] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const visibleCompanies = companies.filter(c => {
    if (c.status !== "done") return true;
    if (filterPhone && !c.phone) return false;
    if (filterEmail && !c.email) return false;
    if (filterSite && !c.site) return false;
    if (filterActive && c.egrul?.status !== "Действующая") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.egrul?.full_name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.inn?.includes(q)
      );
    }
    return true;
  });

  const filteredDone = visibleCompanies.filter(c => c.status === "done");

  return (
    <>
      {/* Фильтры */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
            <Icon name="Filter" size={14} />
            Фильтры:
          </span>
          {[
            { label: "Есть телефон", value: filterPhone, set: setFilterPhone },
            { label: "Есть email", value: filterEmail, set: setFilterEmail },
            { label: "Есть сайт", value: filterSite, set: setFilterSite },
            { label: "Действующая (ЕГРЮЛ)", value: filterActive, set: setFilterActive },
          ].map(f => (
            <button
              key={f.label} type="button" onClick={() => f.set(!f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                f.value ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-400 bg-white"
              }`}
            >
              {f.value && "✓ "}{f.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, ИНН..."
              className="h-8 text-sm w-52"
            />
            <span className="text-xs text-gray-400 whitespace-nowrap">{filteredDone.length} из {doneCount}</span>
          </div>
        </div>
      </Card>

      {/* Таблица */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-2 text-left w-6">#</th>
                <th className="px-3 py-2 text-left">Компания</th>
                <th className="px-3 py-2 text-left">ЕГРЮЛ</th>
                <th className="px-3 py-2 text-left">Руководитель</th>
                <th className="px-3 py-2 text-left">Телефон</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">ИНН</th>
                <th className="px-3 py-2 text-left">Сайт</th>
                <th className="px-3 py-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {visibleCompanies.map((c, i) => (
                <Fragment key={c.url}>
                  <tr
                    className={`border-t hover:bg-gray-50 cursor-pointer ${expandedRow === c.url ? "bg-indigo-50/50" : ""}`}
                    onClick={() => setExpandedRow(expandedRow === c.url ? null : c.url)}
                  >
                    <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-2 max-w-[180px]">
                      <div className="font-medium text-gray-900 truncate">{c.egrul?.full_name || c.name}</div>
                    </td>
                    <td className="px-3 py-2">
                      {c.egrul_status === "loading" ? (
                        <Icon name="Loader2" size={13} className="animate-spin text-indigo-400" />
                      ) : (
                        <EgrulBadge data={c.egrul} />
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-600 max-w-[160px]">
                      <div className="truncate text-xs">{c.egrul?.manager_name || ""}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      {c.status === "loading" ? (
                        <Icon name="Loader2" size={14} className="animate-spin text-gray-300" />
                      ) : c.phone || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-gray-600 max-w-[160px] truncate text-xs">
                      {c.status !== "loading" && (c.email || <span className="text-gray-300">—</span>)}
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{c.inn || ""}</td>
                    <td className="px-3 py-2 text-xs">
                      {c.site ? (
                        <a href={c.site} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-blue-500 hover:underline truncate block max-w-[100px]">
                          {c.site.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      <a href={c.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-gray-400 hover:text-blue-500">
                        <Icon name="ExternalLink" size={13} />
                      </a>
                    </td>
                  </tr>
                  {expandedRow === c.url && (
                    <tr className="bg-indigo-50/60 border-t border-indigo-100">
                      <td colSpan={9} className="px-4 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
                          {c.phone && <div><span className="text-gray-400">Телефон:</span> <span className="font-medium">{c.phone}</span></div>}
                          {c.email && <div><span className="text-gray-400">Email:</span> <span className="font-medium">{c.email}</span></div>}
                          {c.address && <div className="col-span-2"><span className="text-gray-400">Адрес:</span> <span className="font-medium">{c.address}</span></div>}
                          {c.egrul && !c.egrul.error && <>
                            {c.egrul.full_name && <div><span className="text-gray-400">Полное название:</span> <span className="font-medium">{c.egrul.full_name}</span></div>}
                            {c.egrul.ogrn && <div><span className="text-gray-400">ОГРН:</span> <span className="font-medium">{c.egrul.ogrn}</span></div>}
                            {c.egrul.kpp && <div><span className="text-gray-400">КПП:</span> <span className="font-medium">{c.egrul.kpp}</span></div>}
                            {c.egrul.type && <div><span className="text-gray-400">Форма:</span> <span className="font-medium">{c.egrul.type}</span></div>}
                            {c.egrul.manager_post && <div><span className="text-gray-400">Должность:</span> <span className="font-medium">{c.egrul.manager_post}</span></div>}
                            {c.egrul.reg_date && <div><span className="text-gray-400">Зарегистрирована:</span> <span className="font-medium">{c.egrul.reg_date}</span></div>}
                            {c.egrul.okved && <div><span className="text-gray-400">ОКВЭД:</span> <span className="font-medium">{c.egrul.okved}</span></div>}
                            {c.egrul.address_full && <div className="col-span-2"><span className="text-gray-400">Юридический адрес:</span> <span className="font-medium">{c.egrul.address_full}</span></div>}
                          </>}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}