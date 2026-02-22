import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const POST_TYPE_COLORS: Record<string, string> = {
  article: "bg-blue-100 text-blue-700",
  news: "bg-green-100 text-green-700",
  promo: "bg-orange-100 text-orange-700",
  tip: "bg-purple-100 text-purple-700",
};

const POST_TYPE_LABELS: Record<string, string> = {
  article: "Статья", news: "Новость", promo: "Акция", tip: "Совет",
};

export interface LatestPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  type: string;
  image_url: string | null;
  read_time: number;
  is_pinned: boolean;
  created_at: string;
}

interface Props {
  posts: LatestPost[];
}

export default function HomeLatestPosts({ posts }: Props) {
  const navigate = useNavigate();

  if (posts.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
          <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Последние публикации</span>
        </h2>
        <p className="text-gray-500 text-lg">Новости, советы и акции от нашей команды</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map(post => (
          <div
            key={post.id}
            onClick={() => navigate("/blog")}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
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
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <Icon name="FileText" size={36} className="text-gray-200" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${POST_TYPE_COLORS[post.type] || POST_TYPE_COLORS.article}`}>
                  {POST_TYPE_LABELS[post.type] || post.type}
                </span>
                <span className="text-xs text-gray-400">{post.category}</span>
                {post.is_pinned && <Icon name="Pin" size={11} className="text-yellow-400" />}
              </div>
              <h3 className="font-semibold text-base mb-2 group-hover:text-orange-500 transition-colors line-clamp-2 text-gray-900">
                {post.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{new Date(post.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</span>
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={11} />
                  {post.read_time} мин
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <Button
          variant="outline"
          onClick={() => navigate("/blog")}
          className="rounded-full px-8 border-gray-200 hover:border-orange-300 hover:text-orange-600"
        >
          Все публикации
          <Icon name="ArrowRight" size={15} className="ml-2" />
        </Button>
      </div>
    </section>
  );
}
