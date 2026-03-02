import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { ZoneConfig, REGIONS } from "./officeCalcTypes";
import { DocFormat, OfficeExportState, DOC_TABS } from "./officeExportTypes";
import { buildSmeta, buildKS2, buildKS3, buildAct } from "./officeExportHtml";
import OfficeExportForm from "./OfficeExportForm";
import OfficeMatEditor from "./OfficeMatEditor";

export type { DocFormat };
export type { OfficeExportState };
export { makeExportState } from "./officeExportTypes";

interface Props {
  exportState: OfficeExportState;
  onChange: (patch: Partial<OfficeExportState>) => void;
  zones: ZoneConfig[];
  totalAll: number;
  regionId: string;
  markupPct: number;
}

export default function OfficeExportPanel({ exportState, onChange, zones, totalAll, regionId, markupPct }: Props) {
  const [printing, setPrinting] = useState(false);
  const [matEditorOpen, setMatEditorOpen] = useState(false);
  const { docType, showForm } = exportState;

  const regionLabel = REGIONS.find(r => r.id === regionId)?.label ?? regionId;

  const handlePrint = () => {
    setPrinting(true);
    const dateStr = new Date().toLocaleDateString("ru-RU");

    let html = "";
    if (docType === "smeta" || docType === "kp") {
      html = buildSmeta(exportState, zones, totalAll, regionId, markupPct, regionLabel, dateStr);
    } else if (docType === "ks2") {
      html = buildKS2(exportState, zones, totalAll, regionId, markupPct, regionLabel, dateStr);
    } else if (docType === "ks3") {
      html = buildKS3(exportState, zones, totalAll, regionId, markupPct, regionLabel, dateStr);
    } else if (docType === "act") {
      html = buildAct(exportState, zones, totalAll, regionId, markupPct, regionLabel, dateStr);
    }

    openWindow(html, () => setPrinting(false));
  };

  const openWindow = (html: string, cb: () => void) => {
    const win = window.open("", "_blank", "width=960,height=720");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); cb(); }, 350);
    } else {
      cb();
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Шапка */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b">
        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
          <Icon name="Printer" size={14} className="text-blue-600" />
          Сформировать документ
        </h3>
        <button
          onClick={() => onChange({ showForm: !showForm })}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {showForm ? "Скрыть" : "Реквизиты"}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Тип документа */}
        <div className="grid grid-cols-5 gap-1">
          {DOC_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => onChange({ docType: t.id })}
              className={`py-2 px-1 rounded-xl text-xs font-medium border-2 transition-all text-center ${
                docType === t.id
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 text-gray-600 hover:border-blue-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Форма реквизитов */}
        {showForm && (
          <OfficeExportForm exportState={exportState} onChange={onChange} />
        )}

        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePrint} disabled={printing || printingMat}>
          {printing
            ? <Icon name="Loader2" size={15} className="animate-spin mr-2" />
            : <Icon name="Printer" size={15} className="mr-2" />
          }
          Печать / Сохранить PDF
        </Button>

        <Button
          variant="outline"
          className="w-full border-green-500 text-green-700 hover:bg-green-50"
          onClick={() => setMatEditorOpen(true)}
          disabled={printing}
        >
          <Icon name="Package" size={15} className="mr-2" />
          Ведомость материалов
        </Button>
      </div>

      <OfficeMatEditor
        open={matEditorOpen}
        onClose={() => setMatEditorOpen(false)}
        exportState={exportState}
        zones={zones}
        regionId={regionId}
        markupPct={markupPct}
      />
    </Card>
  );
}