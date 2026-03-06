import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";


const API_URL = "https://functions.poehali.dev/241aa2b2-a69f-4f48-a343-59a4da14d0b4";
const ADMIN_TOKEN = "admin2025";

interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  embed_url: string;
  partner_name: string;
  is_own: boolean;
  is_active: boolean;
  sort_order: number;
}

const EMPTY: Omit<Video, "id"> = {
  title: "",
  description: "",
  video_url: "",
  thumbnail_url: "",
  embed_url: "",
  partner_name: "",
  is_own: false,
  is_active: true,
  sort_order: 0,
};

async function uploadThumb(file: File, apiUrl: string, token: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const contentType = file.type || "image/jpeg";
  const presignRes = await fetch(
    `${apiUrl}?action=presign&type=thumb&ext=${ext}&content_type=${encodeURIComponent(contentType)}`,
    { headers: { "X-Admin-Token": token } }
  );
  if (!presignRes.ok) throw new Error("Не удалось получить URL для загрузки");
  const { upload_url, cdn_url } = await presignRes.json();
  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!uploadRes.ok) throw new Error(`Ошибка загрузки обложки: ${uploadRes.status}`);
  return cdn_url;
}

function parseEmbedUrl(raw: string): string {
  if (!raw) return "";
  const vkMatch = raw.match(/src="([^"]+vk\.com[^"]+)"/);
  if (vkMatch) return vkMatch[1];
  const ytMatch = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return raw;
}

export default function AdminVideosTab() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(Partial<Video> & { id?: number }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch(`${API_URL}?admin=1`, { headers: { "X-Admin-Token": ADMIN_TOKEN } })
      .then(r => r.json())
      .then(d => setVideos(d.videos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setThumbFile(null);
    setEditing({ ...EMPTY });
  };

  const openEdit = (v: Video) => {
    setThumbFile(null);
    setEditing({ ...v });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setSaveError("");
    try {
      const payload: Record<string, unknown> = {
        ...editing,
        embed_url: parseEmbedUrl(editing.embed_url || ""),
        video_url: "",
      };

      if (thumbFile) {
        setUploadProgress("Загружаю обложку...");
        payload.thumbnail_url = await uploadThumb(thumbFile, API_URL, ADMIN_TOKEN);
      }

      setUploadProgress("Сохраняю...");
      const method = editing.id ? "PUT" : "POST";
      const res = await fetch(API_URL, {
        method,
        headers: { "Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        setSaveError(`Ошибка сервера ${res.status}: ${txt}`);
        return;
      }
      setEditing(null);
      load();
    } catch (e) {
      setSaveError(`Ошибка: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
      setUploadProgress("");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить видео?")) return;
    await fetch(`${API_URL}?id=${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": ADMIN_TOKEN },
    });
    load();
  };

  const toggleActive = async (v: Video) => {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN },
      body: JSON.stringify({ ...v, is_active: !v.is_active }),
    });
    load();
  };

  const sourceLabel = (v: Video) => {
    if (v.embed_url) return "Ссылка";
    if (v.video_url) return "Файл";
    return "—";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Видеоролики</h2>
        <Button onClick={openNew} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить видео
        </Button>
      </div>

      {/* Форма редактирования */}
      {editing && (
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
                  onChange={e => setEditing(p => ({ ...p!, title: e.target.value }))}
                  placeholder="Название ролика"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Описание</label>
                <Textarea
                  value={editing.description || ""}
                  onChange={e => setEditing(p => ({ ...p!, description: e.target.value }))}
                  placeholder="Краткое описание видео"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Партнёр / Автор</label>
                <Input
                  value={editing.partner_name || ""}
                  onChange={e => setEditing(p => ({ ...p!, partner_name: e.target.value }))}
                  placeholder="Название компании или автора"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.is_own || false}
                    onChange={e => setEditing(p => ({ ...p!, is_own: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Наш ролик</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.is_active !== false}
                    onChange={e => setEditing(p => ({ ...p!, is_active: e.target.checked }))}
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
                  onChange={e => setEditing(p => ({ ...p!, sort_order: parseInt(e.target.value) || 0 }))}
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
                  onChange={e => setEditing(p => ({ ...p!, embed_url: e.target.value }))}
                  placeholder="Вставьте ссылку или код iframe..."
                  rows={3}
                />
                <div className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 space-y-1">
                  <p><strong>VK:</strong> открой видео → «Поделиться» → «Код для вставки» → вставь весь код или только src из iframe</p>
                  <p><strong>YouTube:</strong> вставь обычную ссылку типа youtube.com/watch?v=... — преобразуем автоматически</p>
                </div>
              </div>

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
                  onChange={e => setThumbFile(e.target.files?.[0] || null)}
                />
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
              onClick={save}
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
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Отмена
            </Button>
          </div>
        </div>
      )}

      {/* Список */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={24} className="animate-spin text-gray-400" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Icon name="Video" size={40} className="mx-auto mb-3 opacity-30" />
          <p>Видео ещё не добавлены</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(v => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-gray-100">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="Play" size={32} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                  {v.is_own ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-orange-500 text-white">Наш</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500 text-white">Партнёр</span>
                  )}
                  <span className="px-2 py-0.5 rounded text-xs bg-black/40 text-white backdrop-blur-sm">
                    {sourceLabel(v)}
                  </span>
                  {!v.is_active && (
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-400 text-white">Скрыт</span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-1">{v.title}</h4>
                {v.partner_name && (
                  <p className="text-xs text-gray-400 mb-3">{v.partner_name}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(v)}
                    className="flex-1 text-xs h-8"
                  >
                    <Icon name="Pencil" size={12} className="mr-1" />
                    Изменить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(v)}
                    className="text-xs h-8"
                  >
                    <Icon name={v.is_active ? "EyeOff" : "Eye"} size={12} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => remove(v.id)}
                    className="text-xs h-8 text-red-500 border-red-200 hover:bg-red-50"
                  >
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}