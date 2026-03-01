export const SHOWROOM_URL = "https://functions.poehali.dev/00d5617d-4889-4550-bc82-d94492e380ba";
export const UPLOAD_URL = "https://functions.poehali.dev/29f4288b-c5a9-4e2f-b67d-b2074d2aa983";

export interface ShowroomItemDB {
  id: number;
  title: string;
  description: string;
  room: string;
  style: string;
  area: string;
  materials: string[];
  image: string;
  video_url: string;
  designer: string;
  features: string[];
  aspect_ratio: string;
  color: string;
  sort_order: number;
}

export const EMPTY_ITEM: Omit<ShowroomItemDB, "id"> = {
  title: "",
  description: "",
  room: "Гостиная",
  style: "Современный",
  area: "",
  materials: [],
  image: "",
  video_url: "",
  designer: "Студия АВАНГАРД",
  features: [],
  aspect_ratio: "square",
  color: "#ffffff",
  sort_order: 0,
};

export const ROOMS = ["Гостиная", "Спальня", "Ванная", "Кухня", "Детская", "Кабинет", "Прихожая", "Офис"];
export const STYLES = ["Минимализм", "Современный", "Современная классика", "Скандинавский", "Лофт", "Japandi", "Эко"];
export const RATIOS = ["square", "tall", "wide"];

export const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp,image/gif";
export const ACCEPT_VIDEO = "video/mp4,video/webm,video/quicktime";

export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function captureVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    video.onloadeddata = () => {
      video.currentTime = 1;
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      resolve(dataUrl.split(",")[1]);
    };
    video.onerror = reject;
  });
}
