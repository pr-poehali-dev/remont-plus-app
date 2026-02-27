import { useState, useEffect } from "react";
import type { HouseStyle } from "@/components/calculator/framehouse/FrameHouseTypes";

const STYLE_IMAGES: Record<HouseStyle, string> = {
  modern:
    "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/b8b34e68-e9f1-4252-bd6e-bf8b597b0c90.jpg",
  barnhouse:
    "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/4096d93d-4965-4570-93ed-886864662e18.jpg",
  scandinavian:
    "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/24544f86-d15c-4ca6-8b87-fe60dfac2093.jpg",
  classic:
    "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/1d021a28-cbd1-4cab-94b3-7019e98fbc6b.jpg",
  eco_wood:
    "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/71a52d27-b71e-4f8c-bc4b-c2833b6eb71a.jpg",
  hi_tech:
    "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/bd1ec298-56ac-40ce-a825-e975579d692d.jpg",
  a_frame:
    "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/eb546ba2-538b-4684-9e90-39f1a4b3725f.jpg",
};

interface Props {
  style: HouseStyle;
  label: string;
}

export default function HouseStylePreview({ style, label }: Props) {
  const [displayed, setDisplayed] = useState<{ src: string; label: string }>({
    src: STYLE_IMAGES[style],
    label,
  });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setDisplayed({ src: STYLE_IMAGES[style], label });
      setVisible(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [style, label]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-[16/9] bg-gray-100">
      <img
        src={displayed.src}
        alt={displayed.label}
        className="w-full h-full object-cover"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease-in-out",
        }}
        loading="lazy"
      />
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease-in-out",
        }}
      >
        <span className="text-white text-xs font-semibold">{displayed.label}</span>
      </div>
    </div>
  );
}
