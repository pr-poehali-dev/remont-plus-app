export const API_URL = "https://functions.poehali.dev/241aa2b2-a69f-4f48-a343-59a4da14d0b4";
export const ADMIN_TOKEN = "admin2025";

export interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  embed_url: string;
  partner_name: string;
  is_own: boolean;
  is_active: boolean;
  sort_order: number;
}

export const EMPTY: Omit<Video, "id"> = {
  title: "",
  description: "",
  video_url: "",
  thumbnail_url: "",
  embed_url: "",
  partner_name: "",
  is_own: false,
  is_active: true,
  sort_order: 0,
};

export async function uploadThumb(file: File, apiUrl: string, token: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const res = await fetch(`${apiUrl}?action=upload_thumb`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Admin-Token": token },
          body: JSON.stringify({ thumb_data: base64, thumb_ext: ext }),
        });
        if (!res.ok) throw new Error(`Ошибка загрузки обложки: ${res.status}`);
        const { thumbnail_url } = await res.json();
        resolve(thumbnail_url);
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsDataURL(file);
  });
}

export function parseEmbedUrl(raw: string): string {
  if (!raw) return "";
  const vkMatch = raw.match(/src="([^"]+vk\.com[^"]+)"/);
  if (vkMatch) return vkMatch[1];
  const ytMatch = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return raw;
}

export function getYoutubeId(raw: string): string | null {
  const m = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([\w-]+)/);
  return m ? m[1] : null;
}

export function getPreviewInfo(raw: string): { label: string; thumb: string | null; href: string } {
  const parsed = parseEmbedUrl(raw);
  const ytId = getYoutubeId(raw);
  if (ytId) {
    return {
      label: "YouTube",
      thumb: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      href: `https://www.youtube.com/watch?v=${ytId}`,
    };
  }
  const vkMatch = raw.match(/oid=(-?\d+)&id=(\d+)/);
  if (vkMatch) {
    return { label: "VK Видео", thumb: null, href: `https://vk.com/video${vkMatch[1]}_${vkMatch[2]}` };
  }
  return { label: "Видео", thumb: null, href: parsed };
}
