import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { FURNITURE_CATALOG, FURNITURE_CATEGORIES } from "./furnitureCatalog";

const API_URL = "https://functions.poehali.dev/2b8fe00a-cd5a-4290-91f2-ecce05ba4481";

interface UploadedModel {
  key: string;
  name: string;
  category: string;
  url: string;
  size: number;
}

interface ModelManagerProps {
  selectedCatalogId?: string;
  onModelAttached: (catalogId: string, modelUrl: string | null) => void;
  modelMap: Record<string, string>;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop() || "";
    return filename.replace(/\.glb$/i, "").replace(/[^a-zA-Z0-9_-]/g, "-");
  } catch {
    return "";
  }
}

export default function ModelManager({
  selectedCatalogId,
  onModelAttached,
  modelMap,
}: ModelManagerProps) {
  const [models, setModels] = useState<UploadedModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("living");
  const [uploading, setUploading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [error, setError] = useState("");

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setModels(data.models || []);
    } catch {
      setError("Ошибка загрузки списка");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleUpload = async () => {
    if (!uploadUrl || !uploadName) return;
    setUploading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: uploadUrl,
          name: uploadName,
          category: uploadCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка загрузки");
        return;
      }
      setModels(prev => [{
        key: data.key,
        name: data.name,
        category: data.category,
        url: data.url,
        size: data.size,
      }, ...prev]);
      setUploadUrl("");
      setUploadName("");
      setShowUpload(false);
    } catch {
      setError("Ошибка сети");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await fetch(`${API_URL}?key=${encodeURIComponent(key)}`, { method: "DELETE" });
      setModels(prev => prev.filter(m => m.key !== key));
      const attachedEntries = Object.entries(modelMap);
      for (const [catalogId, url] of attachedEntries) {
        const model = models.find(m => m.key === key);
        if (model && url === model.url) {
          onModelAttached(catalogId, null);
        }
      }
    } catch {
      setError("Ошибка удаления");
    }
  };

  const handleUrlChange = (url: string) => {
    setUploadUrl(url);
    if (!uploadName || uploadName === extractNameFromUrl(uploadUrl)) {
      setUploadName(extractNameFromUrl(url));
    }
  };

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}?action=demo`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        for (const item of data.results) {
          setModels(prev => {
            const exists = prev.some(m => m.key === item.key);
            if (exists) return prev;
            return [...prev, {
              key: item.key,
              name: item.name,
              category: item.category,
              url: item.url,
              size: item.size,
            }];
          });
          if (item.catalogId) {
            onModelAttached(item.catalogId, item.url);
          }
        }
      }
      if (data.errors && data.errors.length > 0) {
        setError(`Не удалось загрузить: ${data.errors.map((e: { name: string }) => e.name).join(", ")}`);
      }
    } catch {
      setError("Ошибка загрузки демо-моделей");
    } finally {
      setLoadingDemo(false);
    }
  };

  const selectedCatalogItem = selectedCatalogId
    ? FURNITURE_CATALOG.find(f => f.id === selectedCatalogId)
    : null;

  const currentModelUrl = selectedCatalogId ? modelMap[selectedCatalogId] : undefined;

  const attachedCount = Object.keys(modelMap).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase">3D-модели</p>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] px-2"
          onClick={() => setShowUpload(!showUpload)}
        >
          <Icon name={showUpload ? "X" : "Upload"} size={11} className="mr-1" />
          {showUpload ? "Отмена" : "Загрузить"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-2 py-1.5 flex items-center gap-1.5">
          <Icon name="AlertCircle" size={12} className="text-red-500 shrink-0" />
          <span className="text-[11px] text-red-600">{error}</span>
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">
            <Icon name="X" size={10} />
          </button>
        </div>
      )}

      {showUpload && (
        <Card className="p-3 space-y-2 border-blue-200 bg-blue-50/30">
          <p className="text-[11px] font-medium text-blue-700">Загрузка GLB из URL</p>
          <div className="space-y-1">
            <Label className="text-[11px]">URL файла .glb</Label>
            <Input
              value={uploadUrl}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="https://example.com/model.glb"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Название</Label>
            <Input
              value={uploadName}
              onChange={e => setUploadName(e.target.value)}
              placeholder="sofa"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Категория</Label>
            <Select value={uploadCategory} onValueChange={setUploadCategory}>
              <SelectTrigger className="h-7 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FURNITURE_CATEGORIES.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">{c.label}</SelectItem>
                ))}
                <SelectItem value="other" className="text-xs">Другое</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            className="h-7 text-xs w-full"
            disabled={!uploadUrl || !uploadName || uploading}
            onClick={handleUpload}
          >
            {uploading ? (
              <>
                <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Icon name="CloudUpload" size={12} className="mr-1" />
                Загрузить на сервер
              </>
            )}
          </Button>
        </Card>
      )}

      {selectedCatalogItem && (
        <Card className="p-3 space-y-2 border-violet-200 bg-violet-50/30">
          <div className="flex items-center gap-1.5">
            <Icon name="Link" size={12} className="text-violet-500" />
            <p className="text-[11px] font-medium text-violet-700">
              Привязка к: {selectedCatalogItem.name}
            </p>
          </div>
          {currentModelUrl ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 bg-white rounded px-2 py-1 border">
                <Icon name="Box" size={11} className="text-green-500 shrink-0" />
                <span className="text-[10px] text-gray-600 truncate flex-1">{currentModelUrl.split("/").pop()}</span>
                <button
                  onClick={() => onModelAttached(selectedCatalogId!, null)}
                  className="text-gray-400 hover:text-red-500 shrink-0"
                >
                  <Icon name="Unlink" size={11} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400">3D-модель привязана</p>
            </div>
          ) : (
            <div>
              {models.length > 0 ? (
                <Select
                  value=""
                  onValueChange={url => onModelAttached(selectedCatalogId!, url)}
                >
                  <SelectTrigger className="h-7 text-[11px]">
                    <SelectValue placeholder="Выберите модель..." />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(m => (
                      <SelectItem key={m.key} value={m.url} className="text-xs">
                        {m.name} ({m.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-[10px] text-gray-400">Нет загруженных моделей</p>
              )}
            </div>
          )}
        </Card>
      )}

      {attachedCount > 0 && (
        <Card className="p-2">
          <p className="text-[10px] font-medium text-gray-500 mb-1.5">
            Привязки ({attachedCount})
          </p>
          {Object.entries(modelMap).map(([catalogId, url]) => {
            const catItem = FURNITURE_CATALOG.find(f => f.id === catalogId);
            return (
              <div key={catalogId} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Badge variant="secondary" className="px-1 py-0 text-[8px] bg-violet-100 text-violet-600 shrink-0">3D</Badge>
                  <span className="text-[10px] text-gray-700 truncate">{catItem?.name || catalogId}</span>
                </div>
                <button
                  onClick={() => onModelAttached(catalogId, null)}
                  className="text-gray-300 hover:text-red-400 shrink-0 ml-1"
                >
                  <Icon name="Unlink" size={10} />
                </button>
              </div>
            );
          })}
        </Card>
      )}

      <div className="border-t pt-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-medium text-gray-500">
            Загруженные модели ({models.length})
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={handleLoadDemo}
              className="text-gray-400 hover:text-emerald-500 disabled:opacity-50"
              disabled={loadingDemo}
              title="Загрузить демо-модели"
            >
              <Icon name={loadingDemo ? "Loader2" : "Sparkles"} size={11} className={loadingDemo ? "animate-spin" : ""} />
            </button>
            <button onClick={fetchModels} className="text-gray-400 hover:text-gray-600" disabled={loading}>
              <Icon name={loading ? "Loader2" : "RefreshCw"} size={11} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {loading && models.length === 0 && (
          <div className="flex items-center justify-center py-4">
            <Icon name="Loader2" size={16} className="animate-spin text-gray-400" />
          </div>
        )}

        {!loading && models.length === 0 && (
          <div className="text-center py-4 space-y-2">
            <Icon name="Package" size={20} className="text-gray-300 mx-auto mb-1.5" />
            <p className="text-[11px] text-gray-400">Нет загруженных моделей</p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[11px] border-emerald-300 text-emerald-600 hover:bg-emerald-50"
              onClick={handleLoadDemo}
              disabled={loadingDemo}
            >
              {loadingDemo ? (
                <>
                  <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
                  Загрузка демо...
                </>
              ) : (
                <>
                  <Icon name="Sparkles" size={12} className="mr-1" />
                  Загрузить демо-модели
                </>
              )}
            </Button>
            <p className="text-[10px] text-gray-300">или загрузите свою GLB по URL</p>
          </div>
        )}

        <div className="space-y-1">
          {models.map(model => {
            const categoryLabel = FURNITURE_CATEGORIES.find(c => c.id === model.category)?.label || model.category;
            const isAttached = Object.values(modelMap).includes(model.url);
            return (
              <div
                key={model.key}
                className="flex items-start gap-2 p-2 rounded border border-gray-100 hover:border-gray-200 transition-all"
              >
                <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon name="Box" size={13} className={isAttached ? "text-violet-500" : "text-gray-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium text-gray-700 truncate">{model.name}</span>
                    {isAttached && (
                      <Badge variant="secondary" className="px-1 py-0 text-[7px] bg-violet-100 text-violet-600 shrink-0">Привязана</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-gray-400">{categoryLabel}</span>
                    <span className="text-[9px] text-gray-300">|</span>
                    <span className="text-[9px] text-gray-400">{formatSize(model.size)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => navigator.clipboard.writeText(model.url)}
                    className="text-gray-300 hover:text-blue-500 p-0.5"
                    title="Копировать URL"
                  >
                    <Icon name="Copy" size={11} />
                  </button>
                  <button
                    onClick={() => handleDelete(model.key)}
                    className="text-gray-300 hover:text-red-400 p-0.5"
                    title="Удалить"
                  >
                    <Icon name="Trash2" size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}