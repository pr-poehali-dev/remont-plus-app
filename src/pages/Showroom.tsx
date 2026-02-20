import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import {
  showroomItems,
  roomFilters,
  styleFilters,
  type ShowroomItem,
} from "@/components/showroom/showroomData";
import ShowroomItemCard from "@/components/showroom/ShowroomItemCard";

const INITIAL_COUNT = 12;
const LOAD_MORE_COUNT = 8;

export default function Showroom() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState("Все");
  const [selectedStyle, setSelectedStyle] = useState("Все");
  const [lightbox, setLightbox] = useState<ShowroomItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const filtered = showroomItems.filter((item) => {
    if (selectedRoom !== "Все" && item.room !== selectedRoom) return false;
    if (selectedStyle !== "Все" && item.style !== selectedStyle) return false;
    return true;
  });

  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [selectedRoom, selectedStyle]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") {
        const idx = showroomItems.findIndex((i) => i.id === lightbox.id);
        const next = showroomItems[idx + 1];
        if (next) setLightbox(next);
      }
      if (e.key === "ArrowLeft") {
        const idx = showroomItems.findIndex((i) => i.id === lightbox.id);
        const prev = showroomItems[idx - 1];
        if (prev) setLightbox(prev);
      }
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const lightboxIdx = lightbox
    ? showroomItems.findIndex((i) => i.id === lightbox.id)
    : -1;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Icon name="ArrowLeft" size={20} />
              </button>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Шоурум</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Готовые дизайнерские решения
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/ai-chat")} size="sm">
              <Icon name="Sparkles" size={16} className="mr-2" />
              Создать проект
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4">
        <div className="mb-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Вдохновение
          </h2>
          <p className="text-gray-500 text-lg max-w-xl">
            Подборка интерьеров от наших дизайнеров. Найдите стиль — и мы воплотим его в вашем доме.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {roomFilters.map((room) => (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedRoom === room
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900"
              }`}
            >
              {room}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {styleFilters.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedStyle === style
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900"
              }`}
            >
              {style}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-6">
          {filtered.length}{" "}
          {filtered.length === 1
            ? "решение"
            : filtered.length < 5
              ? "решения"
              : "решений"}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="Image" size={28} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
            <p className="text-gray-500 mb-6">Попробуйте изменить фильтры</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRoom("Все");
                setSelectedStyle("Все");
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {visible.map((item) => (
                <div key={item.id} className="break-inside-avoid">
                  <ShowroomItemCard item={item} onClick={() => setLightbox(item)} />
                </div>
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
                  className="px-8 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:border-gray-900 hover:text-gray-900 transition-all text-sm"
                >
                  Показать ещё ({filtered.length - visibleCount})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightbox(null);
          }}
          ref={lightboxRef}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <Icon name="X" size={20} />
          </button>

          {lightboxIdx > 0 && (
            <button
              onClick={() => setLightbox(showroomItems[lightboxIdx - 1])}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <Icon name="ChevronLeft" size={22} />
            </button>
          )}

          {lightboxIdx < showroomItems.length - 1 && (
            <button
              onClick={() => setLightbox(showroomItems[lightboxIdx + 1])}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <Icon name="ChevronRight" size={22} />
            </button>
          )}

          <div className="flex flex-col lg:flex-row items-center gap-6 max-w-5xl w-full max-h-[90vh]">
            <div className="flex-1 flex items-center justify-center min-h-0">
              <img
                src={lightbox.image}
                alt={lightbox.title}
                className="max-w-full max-h-[70vh] lg:max-h-[85vh] object-contain rounded-xl"
              />
            </div>

            <div className="lg:w-72 bg-white rounded-2xl p-6 flex-shrink-0 w-full lg:self-center">
              <div className="flex gap-2 flex-wrap mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                  {lightbox.room}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                  {lightbox.style}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{lightbox.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{lightbox.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Площадь</span>
                  <span className="font-medium text-gray-900">{lightbox.area}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Дизайнер</span>
                  <span className="font-medium text-gray-900">{lightbox.designer}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {lightbox.features.map((f) => (
                  <span
                    key={f}
                    className="text-xs px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-600"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {lightbox.materials.map((m) => (
                  <span
                    key={m}
                    className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700"
                  >
                    {m}
                  </span>
                ))}
              </div>

              <Button className="w-full" onClick={() => navigate("/ai-chat")}>
                <Icon name="Sparkles" size={16} className="mr-2" />
                Хочу такой проект
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
