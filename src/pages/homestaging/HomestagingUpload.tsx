import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  previewUrl: string;
  imageBase64: string;
  note: string;
  loading: boolean;
  error: string;
  userId: number | null;
  onSetNote: (v: string) => void;
  onFile: (file: File) => void;
  onReset: () => void;
  onAnalyze: () => void;
}

export default function HomestagingUpload({
  previewUrl,
  imageBase64,
  note,
  loading,
  error,
  userId,
  onSetNote,
  onFile,
  onReset,
  onAnalyze,
}: Props) {
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold mb-4">
                <Icon name="Home" size={14} />
                ХОУМСТЕЙДЖИНГ С ИИ
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
                Хоумстейджинг&nbsp;—<br />продай квартиру дороже
              </h1>
              <p className="text-white/90 text-base sm:text-lg max-w-xl">
                Загрузите фото комнаты — искусственный интеллект проанализирует помещение
                по 7 критериям и даст 5–10 конкретных рекомендаций перед съёмкой объявления
                или показом покупателю.
              </p>
            </div>
            <div className="w-40 h-40 sm:w-56 sm:h-56 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center flex-shrink-0">
              <Icon name="Sparkles" size={96} className="text-white/90" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Upload area */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Icon name="Upload" size={20} className="text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">1. Загрузите фото помещения</h3>
              <p className="text-xs text-gray-500">Гостиная, кухня, спальня, ванная — любая комната</p>
            </div>
          </div>

          {!previewUrl ? (
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInput.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50/50 rounded-2xl p-10 text-center cursor-pointer transition-colors"
            >
              <Icon name="ImagePlus" size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="font-semibold text-gray-700 mb-1">Нажмите или перетащите фото сюда</p>
              <p className="text-xs text-gray-500">JPG, PNG до 8 МБ</p>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={previewUrl} alt="Фото комнаты" className="w-full max-h-[400px] object-contain" />
                <button
                  onClick={onReset}
                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  aria-label="Удалить фото"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>
              <button
                onClick={() => fileInput.current?.click()}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5"
              >
                <Icon name="RefreshCw" size={14} />
                Выбрать другое фото
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </div>
          )}

          {/* Optional note */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Комментарий (необязательно)
            </label>
            <Textarea
              value={note}
              onChange={(e) => onSetNote(e.target.value)}
              placeholder="Например: планирую продать квартиру в ближайший месяц, бюджет на подготовку до 20 000 ₽"
              rows={2}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-sm text-red-700">
              <Icon name="AlertCircle" size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!userId && imageBase64 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 flex items-start gap-2">
              <Icon name="Info" size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                <button onClick={() => navigate("/login")} className="font-bold underline">Войдите</button>
                {" "}— и отчёт сохранится в вашем личном кабинете.
              </span>
            </div>
          )}

          <Button
            onClick={onAnalyze}
            disabled={loading || !imageBase64}
            className="w-full mt-6 h-12 bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white font-bold text-base"
          >
            {loading ? (
              <><Icon name="Loader2" size={20} className="animate-spin mr-2" />ИИ анализирует фото...</>
            ) : (
              <><Icon name="Sparkles" size={20} className="mr-2" />Получить рекомендации</>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
