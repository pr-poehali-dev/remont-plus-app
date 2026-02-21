import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { type StageConfig, formatAiContent } from "./stageConfig";

interface StageInputFormProps {
  config: StageConfig;
  userDescription: string;
  notes: string;
  photos: Array<{ data: string; type: string; preview: string }>;
  isGenerating: boolean;
  aiResult: string | null;
  aiProvider: string | null;
  generationHistory: Array<{ content: string; timestamp: string }>;
  resultRef: React.RefObject<HTMLDivElement | null>;
  onDescChange: (val: string) => void;
  onNotesChange: (val: string) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
  onGenerate: () => void;
  onSetAiResult: (content: string) => void;
}

export default function StageInputForm({
  config,
  userDescription,
  notes,
  photos,
  isGenerating,
  aiResult,
  aiProvider,
  generationHistory,
  resultRef,
  onDescChange,
  onNotesChange,
  onPhotoUpload,
  onRemovePhoto,
  onGenerate,
  onSetAiResult,
}: StageInputFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="lg:col-span-2 space-y-6">
      <Card className="p-6">
        <p className="text-gray-700 leading-relaxed mb-5">{config.description}</p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
              <Icon name="FileText" className="h-4 w-4 text-primary" />Опишите ваше помещение
            </label>
            <p className="text-xs text-gray-500 mb-2">{config.aiPromptHint}</p>
            <textarea className="w-full min-h-[100px] px-3 py-2 border rounded-lg text-sm resize-y focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="Например: Квартира 60 м2, 2 комнаты, для семьи из 3 человек..." value={userDescription} onChange={(e) => onDescChange(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Icon name="StickyNote" className="h-4 w-4 text-gray-400" />Дополнительные заметки <span className="text-xs text-gray-400">(необязательно)</span>
            </label>
            <textarea className="w-full min-h-[60px] px-3 py-2 border rounded-lg text-sm resize-y" placeholder="Размеры, особенности, пожелания..." value={notes} onChange={(e) => onNotesChange(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Icon name="Camera" className="h-4 w-4 text-gray-400" />Фото помещения <span className="text-xs text-gray-400">(до 5 фото, необязательно)</span>
            </label>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onPhotoUpload} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhotoUpload} />
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border group">
                  <img src={photo.preview} alt={`Фото ${idx + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => onRemovePhoto(idx)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="X" className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <div className="flex gap-2">
                  <button onClick={() => cameraInputRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 flex flex-col items-center justify-center gap-1 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <Icon name="Camera" className="h-5 w-5 text-blue-400" />
                    <span className="text-[10px] text-blue-400 font-medium">Камера</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors">
                    <Icon name="ImagePlus" className="h-5 w-5 text-gray-400" />
                    <span className="text-[10px] text-gray-400">Галерея</span>
                  </button>
                </div>
              )}
            </div>
            {photos.length > 0 && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <Icon name="CheckCircle2" className="h-3 w-3" />
                {photos.length} фото — ИИ проанализирует их при генерации
              </p>
            )}
          </div>
          <Button className="w-full h-12 text-base" onClick={onGenerate} disabled={isGenerating || !userDescription.trim()}>
            {isGenerating ? (<><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />ИИ генерирует рекомендации...</>) : (<><Icon name="Sparkles" className="mr-2 h-5 w-5" />{aiResult ? "Перегенерировать" : "Сгенерировать рекомендации ИИ"}</>)}
          </Button>
        </div>
      </Card>

      {isGenerating && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
              <Icon name="Sparkles" className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="font-semibold mb-1">ИИ анализирует ваше помещение</h3>
            <p className="text-sm text-gray-500">Создаём рекомендации для этапа "{config.title}"...</p>
          </div>
        </Card>
      )}

      {aiResult && !isGenerating && (
        <Card className="p-6 border-2 border-primary/20" ref={resultRef}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><Icon name="Sparkles" className="h-5 w-5 text-primary" />Рекомендации ИИ</h3>
            <div className="flex items-center gap-2">
              {aiProvider && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{aiProvider === "yandexgpt" ? "YandexGPT" : "ChatGPT"}</span>}
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(aiResult)}><Icon name="Copy" className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-5 space-y-1">{formatAiContent(aiResult)}</div>
        </Card>
      )}

      {generationHistory.length > 1 && (
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Icon name="History" className="h-4 w-4 text-gray-400" />История генераций ({generationHistory.length})</h3>
          <div className="space-y-2">
            {generationHistory.map((item, idx) => (
              <button key={idx} className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${item.content === aiResult ? "border-primary bg-primary/5" : "border-gray-200 hover:bg-gray-50"}`} onClick={() => { onSetAiResult(item.content); resultRef.current?.scrollIntoView({ behavior: "smooth" }); }}>
                <div className="flex items-center justify-between"><span className="font-medium">Вариант {idx + 1}</span><span className="text-xs text-gray-400">{item.timestamp}</span></div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.content.slice(0, 120)}...</p>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}