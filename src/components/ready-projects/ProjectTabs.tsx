import Icon from "@/components/ui/icon";
import { fmt, calcWorkTotal, calcMaterialsTotal, calcInteriorTotal } from "@/types/readyProjects";
import type { WorkSection, Material, InteriorElement, Project } from "@/types/readyProjects";

// ─────────────────────────────────────────────
// ВКЛАДКА: РАБОТЫ
// ─────────────────────────────────────────────
export function WorkTab({ sections }: { sections: WorkSection[] }) {
  const total = sections.reduce(
    (s, sec) => s + sec.items.reduce((ss, i) => ss + i.qty * i.pricePerUnit, 0),
    0
  );
  return (
    <div className="space-y-6">
      {sections.map((sec) => {
        const secTotal = sec.items.reduce((s, i) => s + i.qty * i.pricePerUnit, 0);
        return (
          <div key={sec.title}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name={sec.icon as never} size={16} className="text-gray-400" />
                <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  {sec.title}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-700">{fmt(secTotal)}</span>
            </div>
            <div className="rounded-2xl border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm min-w-[540px]">
                <thead className="bg-gray-50 text-gray-400 text-xs font-semibold">
                  <tr>
                    <th className="text-left px-4 py-3">Наименование работы</th>
                    <th className="text-right px-3 py-3">Кол-во</th>
                    <th className="text-right px-3 py-3">Ед.</th>
                    <th className="text-right px-3 py-3">Цена/ед.</th>
                    <th className="text-right px-4 py-3">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.items.map((item, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-700 leading-snug">{item.name}</td>
                      <td className="px-3 py-3 text-right text-gray-600 tabular-nums">{item.qty}</td>
                      <td className="px-3 py-3 text-right text-gray-400 text-xs">{item.unit}</td>
                      <td className="px-3 py-3 text-right text-gray-500 tabular-nums">{fmt(item.pricePerUnit)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
                        {fmt(item.qty * item.pricePerUnit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between bg-gray-900 text-white rounded-2xl px-6 py-5">
        <div>
          <div className="text-white/60 text-xs mb-0.5">Стоимость всех работ</div>
          <span className="font-bold text-lg">Итого работы</span>
        </div>
        <span className="text-2xl font-black">{fmt(total)}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ВКЛАДКА: МАТЕРИАЛЫ
// ─────────────────────────────────────────────
export function MaterialsTab({ materials }: { materials: Material[] }) {
  const categories = [...new Set(materials.map((m) => m.category))];
  const total = materials.reduce((s, m) => s + m.qty * m.pricePerUnit, 0);
  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const items = materials.filter((m) => m.category === cat);
        const catTotal = items.reduce((s, m) => s + m.qty * m.pricePerUnit, 0);
        return (
          <div key={cat}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{cat}</span>
              <span className="text-sm font-bold text-gray-700">{fmt(catTotal)}</span>
            </div>
            <div className="rounded-2xl border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm min-w-[580px]">
                <thead className="bg-gray-50 text-gray-400 text-xs font-semibold">
                  <tr>
                    <th className="text-left px-4 py-3">Наименование</th>
                    <th className="text-left px-3 py-3">Бренд / Модель</th>
                    <th className="text-right px-3 py-3">Кол-во</th>
                    <th className="text-right px-3 py-3">Ед.</th>
                    <th className="text-right px-3 py-3">Цена/ед.</th>
                    <th className="text-right px-4 py-3">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-700 leading-snug">{m.name}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs leading-snug">{m.brand}</td>
                      <td className="px-3 py-3 text-right text-gray-600 tabular-nums">{m.qty}</td>
                      <td className="px-3 py-3 text-right text-gray-400 text-xs">{m.unit}</td>
                      <td className="px-3 py-3 text-right text-gray-500 tabular-nums">{fmt(m.pricePerUnit)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
                        {fmt(m.qty * m.pricePerUnit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between bg-gray-100 rounded-2xl px-6 py-5">
        <div>
          <div className="text-gray-500 text-xs mb-0.5">Строительные и отделочные материалы</div>
          <span className="font-bold text-gray-900 text-lg">Итого материалы</span>
        </div>
        <span className="text-2xl font-black text-gray-900">{fmt(total)}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ВКЛАДКА: ИНТЕРЬЕР И МЕБЕЛЬ
// ─────────────────────────────────────────────
export function InteriorTab({ elements }: { elements: InteriorElement[] }) {
  const zones = [...new Set(elements.map((e) => e.zone))];
  const total = elements.reduce((s, e) => s + e.qty * e.price, 0);
  return (
    <div className="space-y-6">
      {zones.map((zone) => {
        const items = elements.filter((e) => e.zone === zone);
        const zoneTotal = items.reduce((s, e) => s + e.qty * e.price, 0);
        return (
          <div key={zone}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{zone}</span>
              <span className="text-sm font-bold text-gray-700">{fmt(zoneTotal)}</span>
            </div>
            <div className="rounded-2xl border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-gray-50 text-gray-400 text-xs font-semibold">
                  <tr>
                    <th className="text-left px-4 py-3">Элемент</th>
                    <th className="text-left px-3 py-3">Бренд / Модель</th>
                    <th className="text-right px-3 py-3">Кол-во</th>
                    <th className="text-right px-4 py-3">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-700 leading-snug">{e.name}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs">{e.brand} {e.model}</td>
                      <td className="px-3 py-3 text-right text-gray-600 tabular-nums">{e.qty}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
                        {fmt(e.qty * e.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl px-6 py-5">
        <div>
          <div className="text-amber-600 text-xs mb-0.5">Мебель, техника и декор</div>
          <span className="font-bold text-gray-900 text-lg">Итого интерьер</span>
        </div>
        <span className="text-2xl font-black text-gray-900">{fmt(total)}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ВКЛАДКА: ОБЗОР
// ─────────────────────────────────────────────
export function OverviewTab({ project }: { project: Project }) {
  const workTotal = calcWorkTotal(project);
  const matTotal = calcMaterialsTotal(project);
  const intTotal = calcInteriorTotal(project);
  const grand = workTotal + matTotal + intTotal;

  const totalPositions =
    project.workSections.reduce((s, sec) => s + sec.items.length, 0) +
    project.materials.length +
    project.interiorElements.length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: "Ruler", label: "Площадь", value: `${project.area} м²` },
          { icon: "Palette", label: "Стиль", value: project.style },
          { icon: "DoorOpen", label: "Планировка", value: project.rooms },
          { icon: "ListChecks", label: "Позиций в смете", value: String(totalPositions) },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
            <Icon name={item.icon as never} size={20} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
              <div className="font-bold text-gray-900 text-sm leading-snug">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-5">
        <h4 className="font-semibold text-gray-700 text-xs mb-3 uppercase tracking-wider">
          Ключевые особенности проекта
        </h4>
        <ul className="space-y-2.5">
          {project.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
              <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-3">Итоговый бюджет</h4>
        <div className="space-y-0">
          {[
            { label: "Стоимость работ", value: workTotal, sub: `${project.workSections.reduce((s, sec) => s + sec.items.length, 0)} позиций` },
            { label: "Строительные материалы", value: matTotal, sub: `${project.materials.length} позиций` },
            { label: "Мебель, техника и декор", value: intTotal, sub: `${project.interiorElements.length} позиций` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <div className="text-gray-700 text-sm font-medium">{row.label}</div>
                <div className="text-gray-400 text-xs">{row.sub}</div>
              </div>
              <span className="font-semibold text-gray-900 tabular-nums">{fmt(row.value)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4">
          <div>
            <div className="font-black text-gray-900 text-xl">Всего</div>
            <div className="text-gray-400 text-xs">Москва и МО, март 2026</div>
          </div>
          <span className="font-black text-3xl text-gray-900 tabular-nums">{fmt(grand)}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 leading-relaxed">
        <span className="font-semibold">Примечание:</span> цены указаны для Москвы и МО (март 2026). В регионах стоимость работ ниже на 15–30%. Мебель и материалы — средние рыночные цены на март 2026.
      </div>
    </div>
  );
}
