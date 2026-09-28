import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import funcUrls from "@/../backend/func2url.json";

const REVIEWS_URL = (funcUrls as Record<string, string>)["client-reviews"];

interface Review {
  id: number;
  name: string;
  text: string;
  rating: number;
  date_label: string;
  emoji: string;
}

export default function HomeReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!REVIEWS_URL) return;
    fetch(`${REVIEWS_URL}?limit=4`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (Array.isArray(d?.reviews)) setReviews(d.reviews); })
      .catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-[#fafaf8] py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight text-center mb-9">
          Что говорят те, кто уже считал
        </h2>

        <div className="grid sm:grid-cols-2 gap-5">
          {reviews.map((r) => (
            <figure key={r.id} className="rounded-2xl bg-white border border-gray-200 p-6 flex flex-col">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={15}
                    className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}
                  />
                ))}
              </div>
              <blockquote className="text-[15px] text-gray-700 leading-relaxed flex-1">
                {r.text}
              </blockquote>
              <figcaption className="flex items-center gap-2.5 mt-4 pt-4 border-t border-gray-100">
                <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">
                  {r.emoji || "🙂"}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900 truncate">{r.name}</span>
                  <span className="block text-xs text-gray-400">{r.date_label}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
