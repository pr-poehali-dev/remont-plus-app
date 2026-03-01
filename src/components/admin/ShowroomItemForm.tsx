import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import {
  type ShowroomItemDB,
  ROOMS,
  STYLES,
  RATIOS,
  ACCEPT_IMAGE,
  ACCEPT_VIDEO,
  UPLOAD_URL,
  toBase64,
  captureVideoThumbnail,
} from "./showroomHelpers";

interface Props {
  form: Omit<ShowroomItemDB, "id">;
  isNew: boolean;
  saving: boolean;
  onFieldChange: <K extends keyof Omit<ShowroomItemDB, "id">>(k: K, v: Omit<ShowroomItemDB, "id">[K]) => void;
  onFormChange: (updater: (f: Omit<ShowroomItemDB, "id">) => Omit<ShowroomItemDB, "id">) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function ShowroomItemForm({
  form,
  isNew,
  saving,
  onFieldChange,
  onFormChange,
  onSave,
  onClose,
}: Props) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const setArrayField = (k: "materials" | "features", val: string) =>
    onFieldChange(k, val.split("\n").filter(Boolean));

  const uploadFile = async (file: File, type: "photo" | "video") => {
    setUploadError("");
    const setUploading = type === "photo" ? setUploadingPhoto : setUploadingVideo;
    setUploading(true);
    try {
      const base64 = await toBase64(file);
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: file.type, file_data: base64 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Ошибка загрузки");
        return;
      }
      if (type === "photo") {
        onFieldChange("image", data.url);
      } else {
        onFieldChange("video_url", data.url);
        try {
          const thumbBase64 = await captureVideoThumbnail(file);
          const thumbRes = await fetch(UPLOAD_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content_type: "image/jpeg", file_data: thumbBase64 }),
          });
          if (thumbRes.ok) {
            const thumbData = await thumbRes.json();
            onFormChange((f) => ({ ...f, video_url: data.url, image: f.image || thumbData.url }));
          }
        } catch {
          // превью не критично
        }
      }
    } catch {
      setUploadError("Ошибка при загрузке файла");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold">{isNew ? "Новая карточка" : "Редактирование"}</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
          <Icon name="X" size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Название</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.title}
            onChange={(e) => onFieldChange("title", e.target.value)}
            placeholder="Название интерьера"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Площадь</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.area}
            onChange={(e) => onFieldChange("area", e.target.value)}
            placeholder="25 м²"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Комната</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.room}
            onChange={(e) => onFieldChange("room", e.target.value)}
          >
            {ROOMS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Стиль</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.style}
            onChange={(e) => onFieldChange("style", e.target.value)}
          >
            {STYLES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Пропорции карточки</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.aspect_ratio}
            onChange={(e) => onFieldChange("aspect_ratio", e.target.value)}
          >
            {RATIOS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Цвет акцента</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-10 h-9 border rounded-lg cursor-pointer"
              value={form.color}
              onChange={(e) => onFieldChange("color", e.target.value)}
            />
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={form.color}
              onChange={(e) => onFieldChange("color", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Дизайнер</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.designer}
            onChange={(e) => onFieldChange("designer", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Порядок сортировки</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.sort_order}
            onChange={(e) => onFieldChange("sort_order", Number(e.target.value))}
          />
        </div>
      </div>

      {/* Фото */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Фотография</label>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.image}
            onChange={(e) => onFieldChange("image", e.target.value)}
            placeholder="Вставьте URL или загрузите файл →"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={uploadingPhoto}
            onClick={() => photoRef.current?.click()}
          >
            {uploadingPhoto ? (
              <Icon name="Loader2" size={16} className="animate-spin" />
            ) : (
              <Icon name="Upload" size={16} />
            )}
            <span className="ml-1.5">Загрузить</span>
          </Button>
          <input
            ref={photoRef}
            type="file"
            accept={ACCEPT_IMAGE}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file, "photo");
              e.target.value = "";
            }}
          />
        </div>
        {form.image && (
          <div className="relative inline-block">
            <img src={form.image} alt="" className="h-28 rounded-lg object-cover border" />
            <button
              onClick={() => onFieldChange("image", "")}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <Icon name="X" size={10} />
            </button>
          </div>
        )}
      </div>

      {/* Видео */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Видео (необязательно)</label>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.video_url}
            onChange={(e) => onFieldChange("video_url", e.target.value)}
            placeholder="Вставьте URL или загрузите файл →"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={uploadingVideo}
            onClick={() => videoRef.current?.click()}
          >
            {uploadingVideo ? (
              <Icon name="Loader2" size={16} className="animate-spin" />
            ) : (
              <Icon name="Video" size={16} />
            )}
            <span className="ml-1.5">Загрузить</span>
          </Button>
          <input
            ref={videoRef}
            type="file"
            accept={ACCEPT_VIDEO}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file, "video");
              e.target.value = "";
            }}
          />
        </div>
        {form.video_url && (
          <div className="relative inline-block">
            <video
              src={form.video_url}
              className="h-28 rounded-lg border bg-black"
              controls
              muted
            />
            <button
              onClick={() => onFieldChange("video_url", "")}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <Icon name="X" size={10} />
            </button>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-sm text-red-500 flex items-center gap-1.5">
          <Icon name="AlertCircle" size={14} />
          {uploadError}
        </p>
      )}

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Описание</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          rows={3}
          value={form.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          placeholder="Описание проекта"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Материалы (каждый с новой строки)</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            rows={4}
            value={form.materials.join("\n")}
            onChange={(e) => setArrayField("materials", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Особенности (каждая с новой строки)</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            rows={4}
            value={form.features.join("\n")}
            onChange={(e) => setArrayField("features", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button onClick={onSave} disabled={saving || uploadingPhoto || uploadingVideo}>
          {saving ? "Сохраняю..." : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}
