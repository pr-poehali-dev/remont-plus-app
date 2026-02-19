import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { type ExampleProject } from "./showroomData";

interface ExampleProjectCardProps {
  project: ExampleProject;
  navigate: (path: string) => void;
}

export default function ExampleProjectCard({ project, navigate }: ExampleProjectCardProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showSpec, setShowSpec] = useState(false);
  const images = project.images;
  const currentSpec = images[activeImg]?.spec;
  const lightboxSpec = lightbox !== null ? images[lightbox]?.spec : null;

  return (
    <>
      <Card className="overflow-hidden border-primary/20 hover:shadow-lg transition-shadow">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 relative">
            <div className="aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => setLightbox(activeImg)}>
              <img
                src={images[activeImg].src}
                alt={images[activeImg].label}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-primary text-white border-0">{images[activeImg].label}</Badge>
              {currentSpec && (
                <Badge
                  className="bg-white/90 text-gray-700 border-0 backdrop-blur-sm cursor-pointer hover:bg-white"
                  onClick={(e) => { e.stopPropagation(); setShowSpec(!showSpec); }}
                >
                  <Icon name="Info" className="h-3 w-3 mr-1" />
                  Спецификация
                </Badge>
              )}
            </div>
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm cursor-pointer" onClick={() => setLightbox(activeImg)}>
                <Icon name="ZoomIn" className="h-3 w-3 mr-1" />
                Увеличить
              </Badge>
            </div>
            {showSpec && currentSpec && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowSpec(false)}>
                <div className="bg-white rounded-xl p-5 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Icon name="FileText" className="h-4 w-4 text-primary" />
                      {currentSpec.title}
                    </h4>
                    <button onClick={() => setShowSpec(false)} className="text-gray-400 hover:text-gray-600">
                      <Icon name="X" className="h-4 w-4" />
                    </button>
                  </div>
                  <ul className="space-y-1.5">
                    {currentSpec.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <Icon name="ChevronRight" className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="flex gap-1.5 p-3 overflow-x-auto bg-white">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveImg(idx); setShowSpec(false); }}
                  className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all relative ${activeImg === idx ? "border-primary ring-1 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                  {img.spec && (
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="Info" className="h-2 w-2 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className={`p-6 lg:w-1/2 flex flex-col justify-center bg-gradient-to-r ${project.gradient}`}>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/10 text-primary border-0 font-medium">Пример проекта</Badge>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">{project.stagesCompleted} этапов</Badge>
            </div>
            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{project.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1"><Icon name="Ruler" className="h-3.5 w-3.5" /> {project.area}</span>
              <span className="flex items-center gap-1"><Icon name="DoorOpen" className="h-3.5 w-3.5" /> {project.rooms}</span>
              <span className="flex items-center gap-1"><Icon name="Palette" className="h-3.5 w-3.5" /> {project.style}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5 text-center">
              <div className="p-2.5 bg-white rounded-lg border">
                <Icon name="LayoutDashboard" className="h-5 w-5 text-primary mx-auto mb-1" />
                <span className="text-xs text-gray-600">Планировка</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border">
                <Icon name="Ruler" className="h-5 w-5 text-primary mx-auto mb-1" />
                <span className="text-xs text-gray-600">Чертежи</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border">
                <Icon name="Eye" className="h-5 w-5 text-primary mx-auto mb-1" />
                <span className="text-xs text-gray-600">Визуализации</span>
              </div>
            </div>
            <Button className="w-fit" onClick={() => navigate(project.link)}>
              <Icon name="Eye" className="mr-2 h-4 w-4" />
              Открыть проект
            </Button>
          </div>
        </div>
      </Card>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10" onClick={() => setLightbox(null)}>
            <Icon name="X" className="h-8 w-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length); }}
          >
            <Icon name="ChevronLeft" className="h-10 w-10" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length); }}
          >
            <Icon name="ChevronRight" className="h-10 w-10" />
          </button>
          <div className="flex gap-6 max-w-6xl max-h-[90vh] px-12 items-start" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 min-w-0">
              <img src={images[lightbox].src} alt={images[lightbox].label} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
              <p className="text-white text-center mt-3 text-sm">{images[lightbox].label} — {lightbox + 1} / {images.length}</p>
            </div>
            {lightboxSpec && (
              <div className="w-72 flex-shrink-0 bg-white/95 backdrop-blur rounded-xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Icon name="FileText" className="h-4 w-4 text-primary" />
                  {lightboxSpec.title}
                </h4>
                <ul className="space-y-2">
                  {lightboxSpec.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <Icon name="ChevronRight" className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
