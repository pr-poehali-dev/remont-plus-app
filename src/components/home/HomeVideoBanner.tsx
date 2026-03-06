import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/241aa2b2-a69f-4f48-a343-59a4da14d0b4";

interface PartnerVideo {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  embed_url: string;
  partner_name: string;
  is_own: boolean;
}

export default function HomeVideoBanner() {
  const [videos, setVideos] = useState<PartnerVideo[]>([]);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.videos?.length) setVideos(d.videos);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [active]);

  if (loading || videos.length === 0) return null;

  const current = videos[active];
  const isEmbed = !!current.embed_url;

  const handlePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
        setPlaying(false);
      } else {
        videoRef.current.play();
        setPlaying(true);
      }
    }
  };

  const prev = () => { setActive(i => (i - 1 + videos.length) % videos.length); };
  const next = () => { setActive(i => (i + 1) % videos.length); };

  return (
    <section className="mt-16">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
        <div>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">
            Видео
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Информационные ролики
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Полезные материалы от наших партнёров и команды сервиса
          </p>
        </div>
        {videos.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition"
            >
              <Icon name="ChevronLeft" size={18} className="text-gray-600" />
            </button>
            <span className="text-sm text-gray-500 min-w-[3rem] text-center">
              {active + 1} / {videos.length}
            </span>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition"
            >
              <Icon name="ChevronRight" size={18} className="text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <div className="rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm">
        {/* Плеер */}
        <div className="relative bg-black aspect-video">
          {isEmbed ? (
            <iframe
              key={current.id}
              src={current.embed_url}
              className="w-full h-full"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={current.video_url}
                poster={current.thumbnail_url || undefined}
                className="w-full h-full object-contain"
                onEnded={() => setPlaying(false)}
                playsInline
              />
              {!playing && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={handlePlay}
                >
                  {current.thumbnail_url && (
                    <img
                      src={current.thumbnail_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="relative w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition">
                    <Icon name="Play" size={28} className="text-white ml-1" />
                  </div>
                </div>
              )}
              {playing && (
                <button
                  onClick={handlePlay}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition"
                >
                  <Icon name="Pause" size={16} className="text-white" />
                </button>
              )}
            </>
          )}

          {/* Бейдж */}
          <div className="absolute top-3 left-3 pointer-events-none">
            {current.is_own ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500 text-white">
                Наш ролик
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/80 text-white backdrop-blur-sm">
                Партнёр
              </span>
            )}
          </div>
        </div>

        {/* Инфо */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base leading-snug">{current.title}</h3>
              {current.description && (
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{current.description}</p>
              )}
              {current.partner_name && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Icon name="Building2" size={12} />
                  {current.partner_name}
                </p>
              )}
            </div>

            {/* Мини-превью */}
            {videos.length > 1 && (
              <div className="flex gap-2 shrink-0">
                {videos.slice(0, 4).map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setActive(i)}
                    className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                      i === active ? "border-orange-500" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Icon name="Play" size={12} className="text-gray-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
