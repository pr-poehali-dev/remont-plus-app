import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([\w-]+)/);
  return m ? m[1] : null;
}

function getThumb(v: PartnerVideo, generated?: string | null): string | null {
  if (v.thumbnail_url) return v.thumbnail_url;
  if (generated) return generated;
  const ytId = getYoutubeId(v.embed_url || "");
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return null;
}

function generateCanvasThumb(title: string, partnerName: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d")!;
  // Градиентный фон
  const grad = ctx.createLinearGradient(0, 0, 1280, 720);
  grad.addColorStop(0, "#1a1a2e");
  grad.addColorStop(1, "#16213e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1280, 720);
  // Оранжевый акцент
  const accent = ctx.createLinearGradient(0, 0, 1280, 0);
  accent.addColorStop(0, "#f97316");
  accent.addColorStop(1, "#fb923c");
  ctx.fillStyle = accent;
  ctx.fillRect(0, 680, 1280, 40);
  // Круг Play
  ctx.beginPath();
  ctx.arc(640, 320, 80, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(249, 115, 22, 0.15)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(640, 320, 60, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(249, 115, 22, 0.9)";
  ctx.fill();
  // Треугольник Play
  ctx.beginPath();
  ctx.moveTo(625, 295);
  ctx.lineTo(625, 345);
  ctx.lineTo(672, 320);
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.fill();
  // Название
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title || "Видео", 640, 450);
  // Партнёр
  if (partnerName) {
    ctx.fillStyle = "#f97316";
    ctx.font = "28px Arial, sans-serif";
    ctx.fillText(partnerName, 640, 500);
  }
  return canvas.toDataURL("image/jpeg", 0.85);
}

function getEmbedSrc(v: PartnerVideo): string | null {
  const url = v.embed_url || "";
  const ytId = getYoutubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&enablejsapi=1`;
  if (url.includes("vk.com/video_ext.php")) return url;
  const vkClip = url.match(/(?:vk\.com|vkvideo\.ru)\/clip(-?\d+)_(\d+)/);
  if (vkClip) return `https://vk.com/video_ext.php?oid=${vkClip[1]}&id=${vkClip[2]}&hd=2&js_api=1`;
  const vkVideo = url.match(/(?:vk\.com|vkvideo\.ru)\/video(-?\d+)_(\d+)/);
  if (vkVideo) return `https://vk.com/video_ext.php?oid=${vkVideo[1]}&id=${vkVideo[2]}&hd=2&js_api=1`;
  return null;
}

function getWatchUrl(v: PartnerVideo): string {
  const url = v.embed_url || "";
  const ytId = getYoutubeId(url);
  if (ytId) return `https://www.youtube.com/watch?v=${ytId}`;
  const vkMatch = url.match(/oid=(-?\d+)&id=(\d+)/);
  if (vkMatch) return `https://vk.com/video${vkMatch[1]}_${vkMatch[2]}`;
  const vkDirect = url.match(/(?:vk\.com|vkvideo\.ru)\/(video|clip)(-?\d+)_(\d+)/);
  if (vkDirect) return `https://vk.com/video${vkDirect[2]}_${vkDirect[3]}`;
  return url || v.video_url || "#";
}

const API_URL = "https://functions.poehali.dev/241aa2b2-a69f-4f48-a343-59a4da14d0b4";
const COUNTDOWN = 5;
const ADMIN_HEADERS = { "Content-Type": "application/json", "X-Admin-Token": "admin2025" };

async function uploadAndSaveThumb(videoId: number, dataUrl: string, videoData: PartnerVideo) {
  try {
    const base64 = dataUrl.split(",")[1];
    const uploadRes = await fetch(`${API_URL}?action=upload_thumb`, {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ thumb_data: base64, thumb_ext: "jpg" }),
    });
    const { thumbnail_url } = await uploadRes.json();
    if (!thumbnail_url) return;
    await fetch(API_URL, {
      method: "PUT",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({
        id: videoId,
        title: videoData.title,
        description: videoData.description,
        partner_name: videoData.partner_name,
        is_own: videoData.is_own,
        is_active: true,
        sort_order: 0,
        embed_url: videoData.embed_url,
        thumbnail_url,
        video_url: "",
      }),
    });
    return thumbnail_url;
  } catch (e) { void e; }
}

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
  const [embedStarted, setEmbedStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [generatedThumbs, setGeneratedThumbs] = useState<Record<number, string>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbVideoRef = useRef<HTMLVideoElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    setEmbedStarted(false);
    setCountdown(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [active]);

  const next = useCallback(() => {
    setCountdown(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setActive(i => (i + 1) % videos.length);
  }, [videos.length]);

  const prev = () => {
    setCountdown(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setActive(i => (i - 1 + videos.length) % videos.length);
  };

  const startCountdown = useCallback(() => {
    if (videos.length <= 1) return;
    setCountdown(COUNTDOWN);
    let c = COUNTDOWN;
    countdownRef.current = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(countdownRef.current!);
        setActive(i => (i + 1) % videos.length);
        setCountdown(null);
      } else {
        setCountdown(c);
      }
    }, 1000);
  }, [videos.length]);

  // postMessage от VK и YouTube
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.type === "vid_end" || data?.event === "ended") startCountdown();
        if (data?.event === "infoDelivery" && data?.info?.playerState === 0) startCountdown();
      } catch (e) { void e; }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [startCountdown]);

  // Генерация и сохранение заставки для ролика
  const generateAndSaveThumb = useCallback(async (video: PartnerVideo) => {
    if (video.thumbnail_url || generatedThumbs[video.id]) return;

    let dataUrl: string;

    if (video.video_url) {
      // mp4 — берём кадр через canvas
      dataUrl = await new Promise<string>((resolve, reject) => {
        const vid = document.createElement("video");
        vid.crossOrigin = "anonymous";
        vid.src = video.video_url;
        vid.currentTime = 3;
        vid.muted = true;
        vid.addEventListener("seeked", () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = vid.videoWidth || 1280;
            canvas.height = vid.videoHeight || 720;
            canvas.getContext("2d")?.drawImage(vid, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
          } catch (e) { reject(e); }
        }, { once: true });
        vid.addEventListener("error", reject, { once: true });
        vid.load();
      });
    } else {
      // embed (VK/другие) — генерируем canvas-заставку
      dataUrl = generateCanvasThumb(video.title, video.partner_name);
    }

    // Показываем сразу
    setGeneratedThumbs(prev => ({ ...prev, [video.id]: dataUrl }));
    // Сохраняем в S3 + БД
    const savedUrl = await uploadAndSaveThumb(video.id, dataUrl, video);
    if (savedUrl) {
      setVideos(prev => prev.map(v => v.id === video.id ? { ...v, thumbnail_url: savedUrl } : v));
    }
  }, [generatedThumbs]);

  useEffect(() => {
    if (videos.length === 0) return;
    videos.forEach(v => {
      if (!v.thumbnail_url && !generatedThumbs[v.id]) {
        generateAndSaveThumb(v).catch(() => {});
      }
    });
  }, [videos, generateAndSaveThumb, generatedThumbs]);

  if (loading || videos.length === 0) return null;

  const current = videos[active];
  const embedSrc = getEmbedSrc(current);
  const hasDirectVideo = !!current.video_url;
  const thumb = getThumb(current, generatedThumbs[current.id]);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
        setPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setPlaying(true);
      }
    }
  };

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
            <button type="button" onClick={prev}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition">
              <Icon name="ChevronLeft" size={18} className="text-gray-600" />
            </button>
            <span className="text-sm text-gray-500 min-w-[3rem] text-center">
              {active + 1} / {videos.length}
            </span>
            <button type="button" onClick={next}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition">
              <Icon name="ChevronRight" size={18} className="text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <div className="rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm">
        {/* Плеер */}
        <div className="relative bg-black aspect-video">
          {embedSrc ? (
            embedStarted ? (
              <>
                <iframe
                  key={embedSrc}
                  src={embedSrc}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                  frameBorder="0"
                />
                {/* Таймер поверх iframe после окончания */}
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-5 text-center pointer-events-auto">
                      <p className="text-white text-sm mb-2">Следующее видео через</p>
                      <p className="text-white text-5xl font-extrabold leading-none">{countdown}</p>
                      <button
                        onClick={() => { setCountdown(null); if (countdownRef.current) clearInterval(countdownRef.current); }}
                        className="mt-3 text-white/60 hover:text-white text-xs underline"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full cursor-pointer group" onClick={() => setEmbedStarted(true)}>
                {thumb ? (
                  <img src={thumb} alt={current.title}
                    className="w-full h-full object-cover group-hover:brightness-75 transition" />
                ) : (
                  <div className="w-full h-full bg-gray-900" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/70 group-hover:scale-105 transition-all">
                    <Icon name="Play" size={36} className="text-white ml-1.5" />
                  </div>
                </div>
              </div>
            )
          ) : hasDirectVideo ? (
            <>
              <video
                ref={videoRef}
                src={current.video_url}
                poster={thumb || undefined}
                className="w-full h-full object-contain"
                onEnded={() => { setPlaying(false); startCountdown(); }}
                playsInline
              />
              {!playing && (
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={handlePlay}>
                  {thumb && (
                    <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="relative w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition">
                    <Icon name="Play" size={28} className="text-white ml-1" />
                  </div>
                </div>
              )}
              {playing && (
                <button type="button" onClick={handlePlay}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition">
                  <Icon name="Pause" size={16} className="text-white" />
                </button>
              )}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-5 text-center">
                    <p className="text-white text-sm mb-2">Следующее видео через</p>
                    <p className="text-white text-5xl font-extrabold leading-none">{countdown}</p>
                    <button
                      onClick={() => { setCountdown(null); if (countdownRef.current) clearInterval(countdownRef.current); }}
                      className="mt-3 text-white/60 hover:text-white text-xs underline"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <a href={getWatchUrl(current)} target="_blank" rel="noreferrer" className="block w-full h-full group">
              {thumb ? (
                <img src={thumb} alt={current.title}
                  className="w-full h-full object-cover group-hover:brightness-75 transition" />
              ) : (
                <div className="w-full h-full bg-gray-900" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/70 group-hover:scale-105 transition-all">
                  <Icon name="ExternalLink" size={28} className="text-white" />
                </div>
              </div>
            </a>
          )}
        </div>

        {/* Подпись */}
        <div className="px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">{current.title}</p>
            {current.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{current.description}</p>
            )}
            {current.partner_name && (
              <p className="text-xs text-orange-500 font-medium mt-1">{current.partner_name}</p>
            )}
          </div>
          {videos.length > 1 && (
            <div className="flex gap-1.5 shrink-0 mt-1">
              {videos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCountdown(null); if (countdownRef.current) clearInterval(countdownRef.current); setActive(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === active ? "bg-orange-500 w-5" : "bg-gray-200 hover:bg-gray-300"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Скрытое видео для генерации превью */}
      <video ref={thumbVideoRef} className="hidden" muted playsInline crossOrigin="anonymous" />
    </section>
  );
}