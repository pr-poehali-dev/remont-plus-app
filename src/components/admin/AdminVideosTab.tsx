import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Video, EMPTY, API_URL, ADMIN_TOKEN, uploadThumb, parseEmbedUrl } from "./videos/videoTypes";
import VideoEditForm from "./videos/VideoEditForm";
import VideoCard from "./videos/VideoCard";

export default function AdminVideosTab() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(Partial<Video> & { id?: number }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [quickThumbId, setQuickThumbId] = useState<number | null>(null);
  const quickThumbRef = useRef<HTMLInputElement>(null);

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

  const handleChangeField = (field: keyof Video, value: unknown) => {
    setEditing(p => ({ ...p!, [field]: value }));
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

  const handleQuickThumb = useCallback(async (file: File) => {
    if (!quickThumbId) return;
    const video = videos.find(v => v.id === quickThumbId);
    if (!video) return;
    try {
      setUploadProgress("Загружаю обложку...");
      const thumbUrl = await uploadThumb(file, API_URL, ADMIN_TOKEN);
      await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN },
        body: JSON.stringify({ ...video, thumbnail_url: thumbUrl, video_url: "" }),
      });
      load();
    } catch (e) { void e; } finally {
      setUploadProgress("");
      setQuickThumbId(null);
    }
  }, [quickThumbId, videos]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Видеоролики</h2>
        <Button onClick={openNew} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить видео
        </Button>
      </div>

      {editing && (
        <VideoEditForm
          editing={editing}
          thumbFile={thumbFile}
          saving={saving}
          saveError={saveError}
          uploadProgress={uploadProgress}
          onChangeField={handleChangeField}
          onThumbFile={setThumbFile}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

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
            <VideoCard
              key={v.id}
              video={v}
              onEdit={openEdit}
              onToggleActive={toggleActive}
              onRemove={remove}
              onQuickThumb={(id) => { setQuickThumbId(id); setTimeout(() => quickThumbRef.current?.click(), 50); }}
            />
          ))}
        </div>
      )}

      <input
        ref={quickThumbRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleQuickThumb(f); e.target.value = ""; }}
      />
      {uploadProgress && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
          <Icon name="Loader2" size={14} className="animate-spin" />
          {uploadProgress}
        </div>
      )}
    </div>
  );
}
