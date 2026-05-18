import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "loading"> {
  src: string;
  alt: string;
  /** Эксплицитный WebP-src (если знаем заранее). Если не указан — попробуем подставить .webp вместо расширения */
  webpSrc?: string;
  /** Eager-загрузка для above-the-fold (LCP-картинок). По умолчанию — lazy. */
  eager?: boolean;
  /** Soft fade-in при загрузке */
  fadeIn?: boolean;
  /** Aspect-ratio контейнера (например "16/9"). Если задан — выводит обёртку для CLS=0 */
  aspectRatio?: string;
  /** Класс на обёртку (когда есть aspectRatio) */
  wrapperClassName?: string;
}

/** Пробуем автоматически получить .webp-вариант из обычной ссылки */
function deriveWebp(src: string): string | undefined {
  if (!src) return undefined;
  if (src.endsWith(".webp")) return src;
  // Только для типичных растровых форматов
  if (/\.(jpe?g|png)(\?|$)/i.test(src)) {
    return src.replace(/\.(jpe?g|png)(\?|$)/i, ".webp$2");
  }
  return undefined;
}

export default function LazyImage({
  src,
  alt,
  webpSrc,
  eager = false,
  fadeIn = true,
  aspectRatio,
  wrapperClassName,
  className,
  onLoad,
  ...rest
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const webp = webpSrc ?? deriveWebp(src);

  const img = (
    <picture>
      {webp && webp !== src && <source srcSet={webp} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        onLoad={e => { setLoaded(true); onLoad?.(e); }}
        className={cn(
          fadeIn && "transition-opacity duration-500",
          fadeIn && !loaded && "opacity-0",
          fadeIn && loaded && "opacity-100",
          className,
        )}
        {...rest}
      />
    </picture>
  );

  if (aspectRatio) {
    return (
      <div
        className={cn("relative overflow-hidden bg-gray-100", wrapperClassName)}
        style={{ aspectRatio }}
      >
        {!loaded && fadeIn && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
        )}
        {img}
      </div>
    );
  }

  return img;
}
