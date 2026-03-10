import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta from "@/components/SEOMeta";

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

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  type: string;
  image_url: string | null;
  read_time: number;
  is_pinned: boolean;
  views: number;
  created_at: string;
}

export default function Blog() {
  const navigate = useNavigate();

  useMeta({
    title: "Блог — новости, статьи и акции",
    description: "Новости строительной отрасли, полезные статьи о ремонте, акции и специальные предложения от студии АВАНГАРД.",
    keywords: "новости ремонт, статьи о строительстве, акции на окна, советы по ремонту квартиры",
    canonical: "/blog",
  });

  useEffect(() => {
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Какие темы освещает блог АВАНГАРД?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Блог АВАНГАРД публикует статьи о ремонте квартир, дизайне интерьера, выборе материалов и отделки, советы по планировке, новости строительной отрасли и актуальные акции от партнёров."
          }
        },
        {
          "@type": "Question",
          "name": "Как выбрать стиль интерьера для квартиры?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Определитесь с предпочтениями: минимализм, скандинавский, лофт, классика или современный стиль. Учитывайте площадь, освещённость и бюджет. В блоге АВАНГАРД есть подробные гайды по каждому стилю с примерами и советами по выбору материалов."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько времени занимает ремонт квартиры?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Косметический ремонт однокомнатной квартиры занимает 2–4 недели, капитальный — 2–4 месяца. Сроки зависят от объёма работ, площади и количества мастеров. Подробнее — в наших статьях о планировании ремонта."
          }
        },
        {
          "@type": "Question",
          "name": "Как сэкономить на ремонте без потери качества?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Составьте подробную смету заранее, используйте калькулятор ремонта онлайн, выбирайте материалы средней ценовой категории, не экономьте на черновых работах. Читайте советы по экономии в нашем блоге."
          }
        }
      ]
    };

    const id = "faq-jsonld-blog";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(faq);

    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    loadPosts();
  }, [category, search]);

  const loadPosts = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "30" });
    if (category) params.set("category", category);
    if (search) params.set("q", search);
    const res = await fetch(`${POSTS_URL}?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts || []);
      setCategories(data.categories || []);
    }
    setLoading(false);
  };

  const openPost = (post: Post) => navigate(`/blog/${post.slug}`);

  const handleSearch = () => setSearch(searchInput);

  const pinned = posts.filter(p => p.is_pinned);
  const regular = posts.filter(p => !p.is_pinned);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOMeta
        title="Блог о ремонте и строительстве — советы и статьи"
        description="Статьи о ремонте квартир, домов и отделке: советы экспертов, обзоры материалов, пошаговые инструкции. Всё о ремонте в одном блоге."
        keywords="блог о ремонте, статьи о ремонте квартиры, советы по ремонту, отделочные материалы"
        path="/blog"
        type="article"
      />
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Блог</h1>
              <p className="text-sm text-gray-500">Новости, статьи и акции</p>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Всё о ремонте и строительстве</h2>
          <p className="text-lg mb-6 opacity-90">Статьи, новости отрасли и акции</p>
          <div className="max-w-xl mx-auto flex gap-2">
            <Input
              placeholder="Поиск публикаций..."
              className="bg-white text-gray-900"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <Button variant="secondary" size="lg" onClick={handleSearch}>
              <Icon name="Search" className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Фильтр по категориям */}
        {categories.length > 0 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <Button
              size="sm"
              variant={category === "" ? "default" : "outline"}
              onClick={() => setCategory("")}
              className="whitespace-nowrap"
            >
              Все статьи
            </Button>
            {categories.map(c => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "outline"}
                onClick={() => setCategory(c === category ? "" : c)}
                className="whitespace-nowrap"
              >
                {c}
              </Button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Icon name="FileSearch" size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Публикаций не найдено</p>
            {(search || category) && (
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setSearchInput(""); setCategory(""); }}>
                Сбросить фильтры
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Закреплённые посты */}
            {pinned.length > 0 && !search && !category && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Icon name="Pin" size={14} />
                  Закреплённые
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {pinned.map(post => (
                    <PostCard key={post.id} post={post} onClick={() => openPost(post)} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Остальные посты */}
            {regular.length > 0 && (
              <>
                {pinned.length > 0 && !search && !category && (
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Все публикации</h3>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regular.map(post => (
                    <PostCard key={post.id} post={post} onClick={() => openPost(post)} />
                  ))}
                </div>
              </>
            )}

            {pinned.length > 0 && regular.length === 0 && (search || category) && (
              <div className="grid md:grid-cols-2 gap-6">
                {pinned.map(post => (
                  <PostCard key={post.id} post={post} onClick={() => openPost(post)} featured />
                ))}
              </div>
            )}
          </>
        )}

        {/* Блок CTA */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
              <Icon name="Lightbulb" className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Нужна консультация?</h3>
            <p className="text-sm text-gray-600 mb-3">Задайте вопрос ИИ-консультанту</p>
            <Button className="w-full" size="sm" onClick={() => navigate("/ai-chat")}>Начать чат</Button>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
              <Icon name="Calculator" className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Рассчитать смету</h3>
            <p className="text-sm text-gray-600 mb-3">Детальный расчёт стоимости</p>
            <Button className="w-full" size="sm" onClick={() => navigate("/calculator")}>Калькулятор</Button>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-3">
              <Icon name="AppWindow" className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Расчёт окон</h3>
            <p className="text-sm text-gray-600 mb-3">ПВХ и алюминиевые конструкции</p>
            <Button className="w-full" size="sm" onClick={() => navigate("/windows")}>Рассчитать</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onClick, featured }: { post: Post; onClick: () => void; featured?: boolean }) {
  return (
    <Card
      className={`overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow ${featured ? "border-purple-200" : ""}`}
      onClick={onClick}
    >
      {post.image_url ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <Icon name="FileText" size={32} className="text-gray-300" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${TYPE_COLORS[post.type] || TYPE_COLORS.article}`}>
            {TYPE_LABELS[post.type] || post.type}
          </span>
          <Badge variant="secondary" className="text-xs">{post.category}</Badge>
          {post.is_pinned && (
            <Icon name="Pin" size={12} className="text-yellow-500" />
          )}
        </div>
        <h3 className="font-semibold text-base mb-1.5 group-hover:text-purple-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{new Date(post.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={11} />
              {post.read_time} мин
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Eye" size={11} />
              {post.views}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}