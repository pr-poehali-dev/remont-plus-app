import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";

const POSTS_URL = "https://functions.poehali.dev/60baa083-841b-461e-9edb-8460b28e7076";
const UPLOAD_URL = "https://functions.poehali.dev/dce2721d-b4ab-4c71-a4e9-236837177576";

const POST_TYPES = [
  { value: "article", label: "Статья", color: "bg-blue-100 text-blue-700" },
  { value: "news", label: "Новость", color: "bg-green-100 text-green-700" },
  { value: "promo", label: "Акция", color: "bg-orange-100 text-orange-700" },
  { value: "tip", label: "Совет", color: "bg-purple-100 text-purple-700" },
];

const CATEGORIES = ["Советы", "Дизайн", "Финансы", "Материалы", "Технологии", "Акции", "Новости отрасли", "Кейсы"];

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  type: string;
  image_url: string | null;
  read_time: number;
  is_published: boolean;
  is_pinned: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

const EMPTY: Omit<Post, "id" | "views" | "created_at" | "updated_at"> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Статьи",
  type: "article",
  image_url: null,
  read_time: 5,
  is_published: false,
  is_pinned: false,
};

interface Props {
  onReload?: () => void;
}

export default function AdminBlogTab({ onReload }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`${POSTS_URL}?admin=1&limit=100`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts || []);
    }
    setLoading(false);
  };

  const openNew = () => {
    setForm({ ...EMPTY });
    setEditing(null);
    setIsNew(true);
  };

  const openEdit = (p: Post) => {
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      type: p.type,
      image_url: p.image_url,
      read_time: p.read_time,
      is_published: p.is_published,
      is_pinned: p.is_pinned,
    });
    setEditing(p);
    setIsNew(false);
  };

  const close = () => {
    setEditing(null);
    setIsNew(false);
  };

  const upd = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: reader.result,
          content_type: file.type,
          filename: file.name,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        upd({ image_url: data.url });
      }
      setUploading(false);
      void base64;
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    if (isNew) {
      await fetch(POSTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else if (editing) {
      await fetch(`${POSTS_URL}?id=${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    close();
    load();
    onReload?.();
  };

  const togglePublish = async (p: Post) => {
    await fetch(`${POSTS_URL}?id=${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !p.is_published }),
    });
    load();
  };

  const togglePin = async (p: Post) => {
    await fetch(`${POSTS_URL}?id=${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_pinned: !p.is_pinned }),
    });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить пост?")) return;
    await fetch(`${POSTS_URL}?id=${id}`, { method: "DELETE" });
    load();
  };

  const typeInfo = (type: string) => POST_TYPES.find(t => t.value === type) || POST_TYPES[0];

  const filtered = filterType === "all" ? posts : posts.filter(p => p.type === filterType);

  if (editing !== null || isNew) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={close}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <h2 className="font-semibold text-lg">{isNew ? "Новый пост" : "Редактировать пост"}</h2>
        </div>

        <div className="grid gap-4">
          <div>
            <Label>Заголовок *</Label>
            <Input
              value={form.title}
              onChange={e => upd({ title: e.target.value })}
              placeholder="Заголовок поста"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Тип публикации</Label>
              <Select value={form.type} onValueChange={v => upd({ type: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Категория</Label>
              <Select value={form.category} onValueChange={v => upd({ category: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Краткое описание (анонс)</Label>
            <Textarea
              value={form.excerpt}
              onChange={e => upd({ excerpt: e.target.value })}
              placeholder="2-3 предложения для превью"
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Содержание (HTML или текст)</Label>
            <Textarea
              value={form.content}
              onChange={e => upd({ content: e.target.value })}
              placeholder="<p>Текст статьи...</p>"
              rows={8}
              className="mt-1 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Изображение</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="mt-1 space-y-2">
                {form.image_url ? (
                  <div className="relative rounded-lg overflow-hidden border aspect-video bg-muted">
                    <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => upd({ image_url: null })}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-muted-foreground/30 rounded-lg py-6 flex flex-col items-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {uploading ? (
                      <Icon name="Loader2" size={22} className="animate-spin" />
                    ) : (
                      <Icon name="ImagePlus" size={22} />
                    )}
                    <span className="text-xs">{uploading ? "Загружаю..." : "Выбрать фото"}</span>
                  </button>
                )}
                {form.image_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Icon name="RefreshCw" size={14} className="mr-1" />
                    Заменить фото
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label>Время чтения (мин)</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={form.read_time}
                onChange={e => upd({ read_time: parseInt(e.target.value) || 5 })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_published}
                onCheckedChange={v => upd({ is_published: v })}
              />
              <Label>Опубликовать</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_pinned}
                onCheckedChange={v => upd({ is_pinned: v })}
              />
              <Label>Закрепить</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={save} disabled={saving || !form.title.trim()} className="flex-1">
              {saving ? "Сохраняю..." : "Сохранить"}
            </Button>
            <Button variant="outline" onClick={close}>Отмена</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Блог и публикации</h2>
          <p className="text-sm text-gray-500">Статьи, новости, акции</p>
        </div>
        <Button onClick={openNew} className="gap-1.5">
          <Icon name="Plus" size={16} />
          Новый пост
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={filterType === "all" ? "default" : "outline"}
          onClick={() => setFilterType("all")}
        >
          Все ({posts.length})
        </Button>
        {POST_TYPES.map(t => {
          const cnt = posts.filter(p => p.type === t.value).length;
          if (!cnt) return null;
          return (
            <Button
              key={t.value}
              size="sm"
              variant={filterType === t.value ? "default" : "outline"}
              onClick={() => setFilterType(t.value)}
            >
              {t.label} ({cnt})
            </Button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-gray-400">
          <Icon name="FileText" size={32} className="mx-auto mb-3 opacity-30" />
          <p>Постов пока нет</p>
          <Button className="mt-4" onClick={openNew}>Создать первый</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <Card key={p.id} className="p-4">
              <div className="flex items-start gap-4">
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo(p.type).color}`}>
                      {typeInfo(p.type).label}
                    </span>
                    <Badge variant="outline" className="text-xs">{p.category}</Badge>
                    {p.is_pinned && (
                      <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Icon name="Pin" size={10} className="mr-1" />
                        Закреплён
                      </Badge>
                    )}
                    {!p.is_published && (
                      <Badge variant="outline" className="text-xs text-gray-400">Черновик</Badge>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-1">{p.excerpt}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{new Date(p.created_at).toLocaleDateString("ru-RU")}</span>
                    <span>{p.read_time} мин</span>
                    <span className="flex items-center gap-1">
                      <Icon name="Eye" size={11} />
                      {p.views}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    title={p.is_pinned ? "Открепить" : "Закрепить"}
                    onClick={() => togglePin(p)}
                  >
                    <Icon name="Pin" size={14} className={p.is_pinned ? "text-yellow-500" : "text-gray-400"} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    title={p.is_published ? "Снять с публикации" : "Опубликовать"}
                    onClick={() => togglePublish(p)}
                  >
                    <Icon name={p.is_published ? "EyeOff" : "Eye"} size={14} className={p.is_published ? "text-green-500" : "text-gray-400"} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openEdit(p)}
                  >
                    <Icon name="Pencil" size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-400 hover:text-red-600"
                    onClick={() => remove(p.id)}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}