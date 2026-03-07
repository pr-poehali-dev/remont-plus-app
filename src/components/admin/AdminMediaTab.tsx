import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const UPLOAD_URL = (func2url as Record<string, string>)["upload-media"];
const LIBRARY_URL = (func2url as Record<string, string>)["media-library"];
const ADMIN_TOKEN = "admin2025";

interface MediaItem {
  id: number;
  url: string;
  media_type: "photo" | "video";
  filename: string;
  title: string;
  created_at: string;
}

type FilterType = "all" | "photo" | "video";

export default function AdminMediaTab() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlAdding, setUrlAdding] = useState(false);
  const [urlError, setUrlError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(LIBRARY_URL, {
        headers: { "X-Admin-Token": ADMIN_TOKEN },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleFiles = async (files: FileList) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"];
    const toUpload = Array.from(files).filter(f => allowed.includes(f.type));
    if (!toUpload.length) return;

    setUploading(true);
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      setUploadProgress(`Загружаю ${i + 1} из ${toUpload.length}: ${file.name}`);
      try {
        const base64 = await fileToBase64(file);
        const media_type = file.type.startsWith("video/") ? "video" : "photo";

        const uploadRes = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN },
          body: JSON.stringify({ file: base64, filename: file.name, media_type }),
        });
        if (!uploadRes.ok) continue;
        const { url } = await uploadRes.json();

        await fetch(LIBRARY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN },
          body: JSON.stringify({ url, media_type, filename: file.name, title: "" }),
        });
      } catch {
        // skip failed file
      }
    }
    setUploading(false);
    setUploadProgress("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    loadItems();
  };

  const addByUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setUrlError("");
    setUrlAdding(true);
    try {
      const lower = url.toLowerCase();
      const isVideo = lower.includes(".mp4") || lower.includes(".webm") || lower.includes(".mov") || lower.includes("video");
      const media_type: "photo" | "video" = isVideo ? "video" : "photo";
      const filename = url.split("/").pop()?.split("?")[0] || "file";

      const res = await fetch(LIBRARY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN },
        body: JSON.stringify({ url, media_type, filename, title: "" }),
      });
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      setUrlInput("");
      loadItems();
    } catch (e) {
      setUrlError(e instanceof Error ? e.message : "Не удалось добавить");
    } finally {
      setUrlAdding(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить этот файл?")) return;
    await fetch(`${LIBRARY_URL}?id=${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": ADMIN_TOKEN },
    });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const filteredItems = filter === "all" ? items : items.filter(i => i.media_type === filter);

  const photoCount = items.filter(i => i.media_type === "photo").length;
  const videoCount = items.filter(i => i.media_type === "video").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Медиатека</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {photoCount} фото · {videoCount} видео
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
          <Icon name="Upload" className="h-4 w-4" />
          Загрузить файлы
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin mx-auto w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-600">{uploadProgress}</p>
          </div>
        ) : (
          <>
            <Icon name="ImagePlus" className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">Перетащите фото или видео сюда</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, GIF, MP4, WebM, MOV</p>
          </>
        )}
      </div>

      {/* Add by URL */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
          <Icon name="Link" className="h-3.5 w-3.5" />
          Добавить по ссылке (из Telegram, облака и др.)
        </p>
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setUrlError(""); }}
            onKeyDown={e => e.key === "Enter" && addByUrl()}
            placeholder="https://... (прямая ссылка на фото или видео)"
            className="flex-1 text-sm"
          />
          <Button
            type="button"
            onClick={addByUrl}
            disabled={urlAdding || !urlInput.trim()}
            className="shrink-0"
          >
            {urlAdding ? "..." : "Добавить"}
          </Button>
        </div>
        {urlError && <p className="text-xs text-red-500 mt-1.5">{urlError}</p>}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([["all", "Все"], ["photo", "Фото"], ["video", "Видео"]] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === val
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Загружаю...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Icon name="FolderOpen" className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>Нет файлов</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredItems.map(item => (
            <MediaCard
              key={item.id}
              item={item}
              editingId={editingId}
              editTitle={editTitle}
              onEdit={() => { setEditingId(item.id); setEditTitle(item.title); }}
              onEditChange={setEditTitle}
              onEditSave={() => setEditingId(null)}
              onDelete={() => handleDelete(item.id)}
              onOpen={() => setLightbox(item)}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <Lightbox item={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

interface MediaCardProps {
  item: MediaItem;
  editingId: number | null;
  editTitle: string;
  onEdit: () => void;
  onEditChange: (v: string) => void;
  onEditSave: () => void;
  onDelete: () => void;
  onOpen: () => void;
}

function MediaCard({ item, editingId, editTitle, onEdit, onEditChange, onEditSave, onDelete, onOpen }: MediaCardProps) {
  return (
    <div className="group relative bg-gray-100 rounded-xl overflow-hidden aspect-square">
      {/* Media preview — copy protection */}
      <div
        className="w-full h-full select-none"
        onContextMenu={e => e.preventDefault()}
        onDragStart={e => e.preventDefault()}
      >
        {item.media_type === "video" ? (
          <video
            src={item.url}
            className="w-full h-full object-cover pointer-events-none"
            muted
            playsInline
            onContextMenu={e => e.preventDefault()}
          />
        ) : (
          <img
            src={item.url}
            alt={item.title || item.filename}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
            onContextMenu={e => e.preventDefault()}
          />
        )}
      </div>

      {/* Overlay — copy guard layer */}
      <div
        className="absolute inset-0 bg-transparent"
        onContextMenu={e => e.preventDefault()}
        onDragStart={e => e.preventDefault()}
      />

      {/* Badge */}
      {item.media_type === "video" && (
        <Badge className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5">
          <Icon name="Play" className="h-2.5 w-2.5 mr-1" />
          Видео
        </Badge>
      )}

      {/* Actions overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
        <button
          onClick={onOpen}
          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          title="Просмотр"
        >
          <Icon name="Expand" className="h-4 w-4 text-gray-700" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-500/90 rounded-full hover:bg-red-600 transition-colors"
          title="Удалить"
        >
          <Icon name="Trash2" className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Title edit */}
      {editingId === item.id ? (
        <div className="absolute bottom-0 left-0 right-0 bg-white p-1.5" onClick={e => e.stopPropagation()}>
          <Input
            value={editTitle}
            onChange={e => onEditChange(e.target.value)}
            onBlur={onEditSave}
            onKeyDown={e => e.key === "Enter" && onEditSave()}
            className="text-xs h-7"
            autoFocus
          />
        </div>
      ) : (
        item.title && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-white text-xs truncate cursor-text select-none"
            onClick={onEdit}
          >
            {item.title}
          </div>
        )
      )}
    </div>
  );
}

function Lightbox({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onContextMenu={e => e.preventDefault()}
    >
      <button
        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
        onClick={onClose}
      >
        <Icon name="X" className="h-6 w-6 text-white" />
      </button>

      <div
        className="max-w-4xl max-h-[90vh] select-none"
        onClick={e => e.stopPropagation()}
        onContextMenu={e => e.preventDefault()}
        onDragStart={e => e.preventDefault()}
      >
        {item.media_type === "video" ? (
          <video
            src={item.url}
            controls
            autoPlay
            className="max-h-[85vh] max-w-full rounded-lg pointer-events-auto"
            controlsList="nodownload"
            onContextMenu={e => e.preventDefault()}
          />
        ) : (
          <img
            src={item.url}
            alt={item.title || item.filename}
            className="max-h-[85vh] max-w-full rounded-lg pointer-events-none"
            draggable={false}
            onContextMenu={e => e.preventDefault()}
          />
        )}
      </div>

      {item.title && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-1.5 rounded-full select-none">
          {item.title}
        </div>
      )}
    </div>
  );
}