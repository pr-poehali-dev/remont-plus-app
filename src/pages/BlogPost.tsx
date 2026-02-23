import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";

const POSTS_URL = "https://functions.poehali.dev/60baa083-841b-461e-9edb-8460b28e7076";

const TYPE_LABELS: Record<string, string> = {
  article: "Статья",
  news: "Новость",
  promo: "Акция",
  tip: "Совет",
};

const TYPE_COLORS: Record<string, string> = {
  article: "bg-blue-100 text-blue-700 border-blue-200",
  news: "bg-green-100 text-green-700 border-green-200",
  promo: "bg-orange-100 text-orange-700 border-orange-200",
  tip: "bg-purple-100 text-purple-700 border-purple-200",
};

interface PostDetail {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  type: string;
  image_url: string | null;
  read_time: number;
  is_pinned: boolean;
  views: number;
  created_at: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useMeta({
    title: post ? `${post.title} — Блог АВАНГАРД` : "Статья — Блог АВАНГАРД",
    description: post?.excerpt ?? "",
    canonical: `/blog/${slug}`,
  });

  useEffect(() => {
    if (!slug) return;
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    setLoading(true);
    setNotFound(false);
    const res = await fetch(`${POSTS_URL}?slug=${slug}`);
    if (res.ok) {
      const data = await res.json();
      if (data.id) {
        setPost(data);
        fetch(`${POSTS_URL}/view?id=${data.id}`, { method: "POST" }).catch(() => {});
      } else {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <Icon name="FileSearch" size={48} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Статья не найдена</h1>
        <p className="text-gray-500 mb-6">Возможно, она была удалена или ссылка устарела</p>
        <Button onClick={() => navigate("/blog")}>
          <Icon name="ArrowLeft" size={15} className="mr-2" />
          Вернуться в блог
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/blog")}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
              <button onClick={() => navigate("/blog")} className="hover:text-gray-900 transition-colors shrink-0">
                Блог
              </button>
              <Icon name="ChevronRight" size={14} className="shrink-0" />
              {loading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                <span className="text-gray-900 font-medium truncate">{post?.title}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="aspect-video rounded-xl w-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-4/5" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="pt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : post ? (
          <>
            {post.image_url && (
              <div className="aspect-video overflow-hidden rounded-xl mb-6">
                <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${TYPE_COLORS[post.type] || TYPE_COLORS.article}`}>
                {TYPE_LABELS[post.type] || post.type}
              </span>
              <Badge variant="secondary">{post.category}</Badge>
              {post.is_pinned && (
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  <Icon name="Pin" size={10} className="mr-1" />
                  Закреплено
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b flex-wrap">
              <span>{new Date(post.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={13} />
                {post.read_time} мин чтения
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Eye" size={13} />
                {post.views} просмотров
              </span>
            </div>

            {post.content ? (
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="text-gray-600 text-lg leading-relaxed">{post.excerpt}</p>
            )}

            <div className="mt-10 pt-6 border-t grid md:grid-cols-3 gap-4">
              <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                  <Icon name="Lightbulb" className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Нужна консультация?</h3>
                <p className="text-xs text-gray-600 mb-3">Задайте вопрос ИИ-консультанту</p>
                <Button className="w-full" size="sm" onClick={() => navigate("/ai-chat")}>Начать чат</Button>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                  <Icon name="Calculator" className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Рассчитать смету</h3>
                <p className="text-xs text-gray-600 mb-3">Детальный расчёт стоимости</p>
                <Button className="w-full" size="sm" onClick={() => navigate("/calculator")}>Калькулятор</Button>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100">
                <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                  <Icon name="AppWindow" className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Расчёт окон</h3>
                <p className="text-xs text-gray-600 mb-3">ПВХ и алюминиевые конструкции</p>
                <Button className="w-full" size="sm" onClick={() => navigate("/windows")}>Рассчитать</Button>
              </Card>
            </div>

            <div className="mt-6">
              <Button onClick={() => navigate("/blog")} variant="outline">
                <Icon name="ArrowLeft" size={15} className="mr-2" />
                Назад к блогу
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
