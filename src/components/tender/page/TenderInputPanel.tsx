import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";

interface Props {
  mode: "estimate" | "analyze";
  onModeChange: (mode: "estimate" | "analyze") => void;
  onFiles: (files: FileList | null) => void;
  parsing: boolean;
  fileNames: string[];
  extracted: { text: string; images: string[] } | null;
  text: string;
  onTextChange: (text: string) => void;
}

export default function TenderInputPanel({
  mode,
  onModeChange,
  onFiles,
  parsing,
  fileNames,
  extracted,
  text,
  onTextChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Card className="p-2">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => onModeChange("estimate")}
            className={`rounded-lg py-2.5 px-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
              mode === "estimate" ? "bg-teal-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon name="Calculator" size={16} /> Посчитать по ТЗ
          </button>
          <button
            onClick={() => onModeChange("analyze")}
            className={`rounded-lg py-2.5 px-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
              mode === "analyze" ? "bg-indigo-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon name="ChartLine" size={16} /> Анализ сметы
          </button>
        </div>
        <p className="text-xs text-gray-400 px-2 py-1.5">
          {mode === "estimate"
            ? "Загрузите ТЗ — рассчитаем стоимость работ и материалов."
            : "Загрузите готовую смету заказчика — покажем вашу прибыль и риски."}
        </p>
      </Card>

      <Card className="p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">1. Загрузите документы</p>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/40 transition"
        >
          <Icon name="Upload" size={28} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Excel, PDF, JPG, PNG — ТЗ, смета Estimate, фото документа</p>
          <p className="text-xs text-gray-400 mt-1">Нажмите или перетащите файлы</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xlsx,.xls,.csv,image/*"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        {parsing && (
          <p className="text-xs text-teal-600 mt-2 flex items-center gap-1">
            <Icon name="LoaderCircle" size={13} className="animate-spin" /> Читаем документы…
          </p>
        )}
        {fileNames.length > 0 && !parsing && (
          <div className="mt-3 space-y-1">
            {fileNames.map((n, i) => (
              <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                <Icon name="File" size={12} /> {n}
              </div>
            ))}
            {extracted?.images.length ? (
              <p className="text-xs text-gray-400">{extracted.images.length} стр. будут распознаны через ИИ (OCR)</p>
            ) : null}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">2. Или вставьте текст ТЗ</p>
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Например: Штукатурка стен 45 м². Стяжка пола 30 м². Укладка плитки на пол 30 м². Установка унитаза и раковины…"
          className="min-h-[140px] text-sm"
        />
      </Card>
    </>
  );
}
