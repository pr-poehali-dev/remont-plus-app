import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";

const DEMO_PROJECTS = [
  {
    id: "demo1",
    title: "Однокомнатная квартира 38 м²",
    description: "Студия в современном стиле с функциональным зонированием",
    uid: "",
    area: "38 м²",
    rooms: "1",
    style: "Современный",
  },
  {
    id: "demo2",
    title: "Двухкомнатная квартира 62 м²",
    description: "Скандинавский интерьер с открытой планировкой кухни-гостиной",
    uid: "",
    area: "62 м²",
    rooms: "2",
    style: "Скандинавский",
  },
  {
    id: "demo3",
    title: "Трёхкомнатная квартира 85 м²",
    description: "Классический интерьер с гардеробной и кабинетом",
    uid: "",
    area: "85 м²",
    rooms: "3",
    style: "Классический",
  },
];

const FEATURES = [
  {
    icon: "LayoutDashboard",
    title: "2D планировка",
    desc: "Точный план помещения с размерами и зонированием",
  },
  {
    icon: "Box",
    title: "3D визуализация",
    desc: "Объёмный вид интерьера с реалистичными материалами",
  },
  {
    icon: "RotateCw",
    title: "Обзор 360°",
    desc: "Свободное вращение камеры для полного осмотра",
  },
  {
    icon: "Navigation",
    title: "Виртуальный тур",
    desc: "Панорамная прогулка по интерьеру как в реальности",
  },
];

interface PlanoplanWidgetProps {
  uid: string;
  width?: number;
  height?: number;
}

function PlanoplanWidget({ uid, width = 800, height = 600 }: PlanoplanWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!uid || !containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://widget.planoplan.com/etc/widget/widget.js";
    script.async = true;
    script.onload = () => {
      try {
        const W = (window as unknown as Record<string, unknown>)["Planoplan"] as { init: (opts: Record<string, unknown>) => void } | undefined;
        if (W && containerRef.current) {
          W.init({
            el: containerRef.current,
            uid,
            width,
            height,
            activeTab: "2d",
          });
          setLoaded(true);
        }
      } catch {
        setError(true);
      }
    };
    script.onerror = () => setError(true);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [uid, width, height]);

  if (!uid) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-12 text-center"
        style={{ minHeight: height }}
      >
        <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center mb-6">
          <Icon name="Box" size={36} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">3D-планировка будет здесь</h3>
        <p className="text-gray-500 max-w-md mb-6">
          Для отображения интерактивной 3D-планировки укажите UID проекта из аккаунта Planoplan
        </p>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-400">
          <Icon name="Key" size={16} />
          <span>UID проекта не указан</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center" style={{ minHeight: 300 }}>
        <Icon name="AlertTriangle" size={32} className="text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Не удалось загрузить виджет</p>
        <p className="text-red-500 text-sm mt-1">Проверьте UID проекта и попробуйте обновить страницу</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Загружаю 3D-планировку...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} style={{ width: "100%", height }} />
    </div>
  );
}

export default function Planoplan() {
  useMeta({
    title: "3D-планировщик интерьера — интерактивные планировки онлайн",
    description: "Интерактивный 3D-планировщик интерьера с виртуальными турами. Просматривайте планировки квартир в 2D и 3D, совершайте панорамные прогулки по будущему интерьеру.",
    keywords: "3D планировщик интерьера, виртуальный тур квартира, интерактивная планировка, Planoplan виджет",
    canonical: "/planoplan",
  });

  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(DEMO_PROJECTS[0]);
  const [customUid, setCustomUid] = useState("");
  const [showUidInput, setShowUidInput] = useState(false);

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
                <h1 className="text-lg font-bold tracking-tight">3D-Планировщик</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Интерактивные планировки интерьеров
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUidInput(!showUidInput)}
              >
                <Icon name="Key" size={16} className="mr-2" />
                <span className="hidden sm:inline">Свой UID</span>
              </Button>
              <Button onClick={() => navigate("/designer")} size="sm">
                <Icon name="Sparkles" size={16} className="mr-2" />
                Дизайнер
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showUidInput && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3 max-w-lg">
              <input
                type="text"
                value={customUid}
                onChange={(e) => setCustomUid(e.target.value)}
                placeholder="Вставьте UID проекта из Planoplan"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (customUid.trim()) {
                    setSelectedProject({
                      id: "custom",
                      title: "Пользовательский проект",
                      description: "Загружено по UID",
                      uid: customUid.trim(),
                      area: "—",
                      rooms: "—",
                      style: "—",
                    });
                  }
                }}
                disabled={!customUid.trim()}
              >
                Загрузить
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              UID можно найти в личном кабинете Planoplan → Проекты → Поделиться → Виджет
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Виртуальные планировки
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl">
            Изучайте планировки квартир в интерактивном режиме — переключайтесь между 2D-планом, 
            3D-видом и панорамным туром прямо в браузере.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Icon name={f.icon} size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {DEMO_PROJECTS.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setSelectedProject(proj)}
              className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                selectedProject.id === proj.id
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900"
              }`}
            >
              <div className="text-left">
                <div className="font-semibold">{proj.title}</div>
                <div className={`text-xs mt-0.5 ${selectedProject.id === proj.id ? "text-gray-300" : "text-gray-400"}`}>
                  {proj.style} · {proj.area}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{selectedProject.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{selectedProject.description}</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Icon name="Maximize2" size={14} />
                {selectedProject.area}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="DoorOpen" size={14} />
                {selectedProject.rooms} комн.
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Palette" size={14} />
                {selectedProject.style}
              </span>
            </div>
          </div>

          <PlanoplanWidget
            uid={selectedProject.uid}
            height={500}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 sm:p-12 text-center border border-green-100">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Icon name="Rocket" size={32} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Хотите 3D-планировку для вашего объекта?
          </h3>
          <p className="text-gray-600 max-w-lg mx-auto mb-6">
            Мы создадим интерактивную 3D-планировку вашей квартиры или дома 
            с виртуальным туром и реалистичной визуализацией интерьера
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/ai-chat")}
            >
              <Icon name="MessageSquare" size={18} className="mr-2" />
              Обсудить проект
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/showroom")}
            >
              <Icon name="Image" size={18} className="mr-2" />
              Смотреть шоурум
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}