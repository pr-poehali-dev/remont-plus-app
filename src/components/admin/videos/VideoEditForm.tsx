import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { Video, getPreviewInfo } from "./videoTypes";

interface Props {
  editing: Partial<Video> & { id?: number };
  thumbFile: File | null;
  saving: boolean;
  saveError: string;
  uploadProgress: string;
  onChangeField: (field: keyof Video, value: unknown) => void;
  onThumbFile: (file: File | null) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function VideoEditForm({
  editing,
  thumbFile,
  saving,
  saveError,
  uploadProgress,
  onChangeField,
  onThumbFile,
  onSave,
  onCancel,
}: Props) {
  const thumbInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4">
        {editing.id ? "Редактировать видео" : "Новое видео"}
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Название *</label>
            <Input
              value={editing.title || ""}
              onChange={e => onChangeField("title", e.target.value)}
              placeholder="Название ролика"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Описание</label>
            <Textarea
              value={editing.description || ""}
              onChange={e => onChangeField("description", e.target.value)}
              placeholder="Краткое описание видео"
              rows={3}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Партнёр / Автор</label>
            <Input
              value={editing.partner_name || ""}
              onChange={e => onChangeField("partner_name", e.target.value)}
              placeholder="Название компании или автора"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.is_own || false}
                onChange={e => onChangeField("is_own", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Наш ролик</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.is_active !== false}
                onChange={e => onChangeField("is_active", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Активный</span>
            </label>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Порядок сортировки</label>
            <Input
              type="number"
              value={editing.sort_order ?? 0}
              onChange={e => onChangeField("sort_order", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Ссылка на видео */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              <Icon name="Link" size={12} className="inline mr-1" />
              Ссылка на видео (VK или YouTube) *
            </label>
            <Textarea
              value={editing.embed_url || ""}
              onChange={e => onChangeField("embed_url", e.target.value)}
              placeholder="Вставьте ссылку или код iframe..."
              rows={3}
            />
            <div className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 space-y-1.5">
              <p className="font-semibold text-blue-800">Поддерживаемые форматы:</p>
              <p><strong>YouTube:</strong> любая ссылка — youtube.com/watch?v=ABC или youtu.be/ABC</p>
              <p><strong>VK Видео:</strong> vk.com/video-123_456 или vk.com/clip-123_456</p>
              <p><strong>VK (iframe-код):</strong> вставь весь код со страницы «Поделиться → Код для вставки»</p>
              <p className="text-blue-500 pt-0.5">Telegram-ссылки не поддерживают встраивание — загрузи видео напрямую или используйте VK/YouTube.</p>
            </div>
          </div>

          {/* Превью */}
          {editing.embed_url && (() => {
            const { label, thumb, href } = getPreviewInfo(editing.embed_url);
            return (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  <Icon name="Play" size={12} className="inline mr-1" />
                  Превью
                </label>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-900 relative group"
                >
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="Video" size={40} className="text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/70 transition">
                      <Icon name="Play" size={28} className="text-white ml-1" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
                      Открыть {label}
                    </span>
                  </div>
                </a>
              </div>
            );
          })()}

          {/* Обложка */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Обложка (картинка)</label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-orange-300 transition"
              onClick={() => thumbInputRef.current?.click()}
            >
              {thumbFile ? (
                <p className="text-sm text-orange-600 font-medium">{thumbFile.name}</p>
              ) : editing.thumbnail_url ? (
                <img src={editing.thumbnail_url} alt="" className="w-full h-20 object-cover rounded-lg" />
              ) : (
                <div>
                  <Icon name="Image" size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Загрузить обложку</p>
                </div>
              )}
            </div>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={e => onThumbFile(e.target.files?.[0] || null)}
            />
            {(editing.thumbnail_url || thumbFile) && (
              <button
                type="button"
                className="mt-2 text-xs text-gray-400 hover:text-red-500 transition"
                onClick={() => {
                  onThumbFile(null);
                  onChangeField("thumbnail_url", "");
                }}
              >
                Сбросить обложку (сгенерируется автоматически при следующем открытии)
              </button>
            )}
          </div>
        </div>
      </div>

      {saveError && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
        <Button
          onClick={onSave}
          disabled={saving || !editing.title}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Icon name="Loader2" size={16} className="animate-spin" />
              {uploadProgress}
            </span>
          ) : "Сохранить"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Отмена
        </Button>
      </div>
    </div>
  );
}
