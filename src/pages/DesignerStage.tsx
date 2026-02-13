import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";

const GENERATE_URL = "https://functions.poehali.dev/746aa569-de80-47ab-978b-595df0f02c43";
const PROJECTS_URL = "https://functions.poehali.dev/638dfd86-50f0-4ec4-a850-6feb9fa7797e";

interface StageConfig {
  title: string;
  icon: string;
  description: string;
  tips: string[];
  checklistItems: string[];
  aiPromptHint: string;
}

const STAGE_CONFIG: Record<string, StageConfig> = {
  general: {
    title: "Общий вид помещения",
    icon: "LayoutDashboard",
    description: "Определите планировку, зонирование и общую концепцию интерьера. На этом этапе формируется \"скелет\" вашего проекта.",
    tips: ["Начните с обмерного плана - точные размеры всех помещений", "Определите функциональные зоны: отдых, работа, хранение", "Учитывайте естественное освещение и расположение окон", "Продумайте маршруты передвижения между зонами"],
    checklistItems: ["Обмерный план с размерами", "Схема зонирования", "Расположение дверей и окон", "Направление открывания дверей", "Высота потолков", "Несущие стены отмечены"],
    aiPromptHint: "Опишите квартиру: площадь, количество комнат, кто будет жить, пожелания по зонированию",
  },
  walls: {
    title: "Раскладка помещений по стенам",
    icon: "PanelLeft",
    description: "Детальная развертка каждой стены с указанием отделочных материалов, размеров и декоративных элементов.",
    tips: ["Разверните каждую стену отдельно с размерами", "Укажите материал отделки для каждого участка", "Отметьте ниши, короба и выступы", "Обозначьте высоту подрезки и стыков материалов"],
    checklistItems: ["Развертка стены A (северная)", "Развертка стены B (восточная)", "Развертка стены C (южная)", "Развертка стены D (западная)", "Материалы отделки указаны", "Декоративные элементы размещены"],
    aiPromptHint: "Опишите комнату, для которой нужна развертка стен, укажите материалы и пожелания по декору",
  },
  electrical: {
    title: "Электрика",
    icon: "Zap",
    description: "Схема расположения розеток, выключателей, светильников и электрощита.",
    tips: ["Планируйте розетки исходя из расстановки мебели", "Предусмотрите отдельные группы для кухни и ванной", "Проходные выключатели - для коридоров и спален", "Не забудьте USB-розетки у рабочих мест"],
    checklistItems: ["Розетки в каждой комнате", "Выключатели (проходные/обычные)", "Потолочное освещение", "Подсветка рабочих зон", "Электрощит - автоматы и УЗО", "Слаботочные сети (интернет, ТВ)"],
    aiPromptHint: "Опишите комнату и расположение мебели - ИИ предложит оптимальную схему электрики",
  },
  ventilation: {
    title: "Вентиляция",
    icon: "Wind",
    description: "Схема вентиляционных каналов, вытяжек и приточных клапанов.",
    tips: ["Не перекрывайте существующие вентканалы", "Кухонная вытяжка - отдельный канал или рециркуляция", "Приточные клапаны - в спальне и гостиной", "В ванной - принудительная вытяжка с таймером"],
    checklistItems: ["Существующие вентканалы отмечены", "Кухонная вытяжка", "Вытяжка в ванной", "Приточные клапаны", "Кондиционирование (если нужно)"],
    aiPromptHint: "Укажите тип дома (панельный, кирпичный), этаж и требования к вентиляции",
  },
  plumbing: {
    title: "Водопровод и сантехника",
    icon: "Droplets",
    description: "Расположение труб, стояков, точек подключения смесителей, унитаза, ванны и стиральной машины.",
    tips: ["Минимизируйте расстояние от стояков до точек подключения", "Учитывайте уклон канализационных труб", "Предусмотрите доступ к счётчикам и запорной арматуре", "Гидроизоляция - обязательна в мокрых зонах"],
    checklistItems: ["Стояки ХВС и ГВС", "Точки подключения смесителей", "Унитаз / инсталляция", "Ванна или душевая", "Стиральная машина", "Посудомоечная машина", "Полотенцесушитель"],
    aiPromptHint: "Опишите санузел: размеры, что хотите разместить (ванна/душ, стиралка и т.д.)",
  },
  tiles: {
    title: "Раскладка плитки",
    icon: "Grid3x3",
    description: "Схема укладки плитки на полах и стенах - с рисунком, подрезками и расчётом количества.",
    tips: ["Начинайте раскладку от видимых углов", "Подрезки - в невидимых зонах (за мебелью, дверью)", "Учитывайте ширину швов при расчёте", "Запас плитки - минимум 10% от расчётного количества"],
    checklistItems: ["Раскладка пола", "Раскладка стен (каждая стена)", "Декоративные вставки / бордюры", "Подрезки минимизированы", "Расчёт количества плитки", "Расчёт затирки и клея"],
    aiPromptHint: "Укажите размер плитки, размеры помещения и желаемый рисунок укладки",
  },
  furniture: {
    title: "Расположение мебели",
    icon: "Armchair",
    description: "Планировка расстановки мебели во всех помещениях с учётом эргономики и проходов.",
    tips: ["Минимальная ширина прохода - 60 см, оптимально 80 см", "Диван - не ближе 2,5 м от ТВ", "Рабочий стол - у окна для естественного света", "Не загораживайте радиаторы мебелью"],
    checklistItems: ["Гостиная: диван, столик, ТВ-зона", "Спальня: кровать, тумбы, шкаф", "Кухня: стол, стулья", "Прихожая: шкаф, обувница", "Детская: кровать, стол, шкаф", "Проходы проверены (мин. 60 см)"],
    aiPromptHint: "Опишите комнату и список мебели, которую нужно разместить",
  },
  kitchen: {
    title: "Кухонный гарнитур",
    icon: "CookingPot",
    description: "Детальная планировка кухни: расположение шкафов, техники, рабочего треугольника и систем хранения.",
    tips: ["Рабочий треугольник: холодильник - мойка - плита", "Между мойкой и плитой - минимум 60 см рабочей поверхности", "Верхние шкафы - на высоте 50-60 см от столешницы", "Розетки для техники - за шкафами на высоте 110 см"],
    checklistItems: ["Нижние шкафы (с размерами)", "Верхние шкафы", "Холодильник", "Варочная панель / плита", "Духовой шкаф", "Мойка", "Посудомоечная машина", "Вытяжка", "Фартук - материал и размер"],
    aiPromptHint: "Укажите размеры кухни, тип планировки (линейная, угловая, П-образная) и список техники",
  },
  bedroom: {
    title: "Спальня",
    icon: "Bed",
    description: "Планировка спальни: расположение кровати, систем хранения, освещения и текстильного оформления.",
    tips: ["Кровать - изголовьем к глухой стене, не напротив двери", "По бокам кровати - минимум 50 см для прохода", "Светильники у кровати - на высоте 120-160 см", "Шторы blackout - для качественного сна"],
    checklistItems: ["Кровать (размер и расположение)", "Прикроватные тумбы", "Шкаф / гардеробная", "Туалетный столик", "Освещение: основное + прикроватное", "Шторы / жалюзи", "Розетки у кровати"],
    aiPromptHint: "Опишите спальню: размеры, кто спит, нужен ли гардероб, рабочее место",
  },
};

function formatAiContent(content: string) {
  return content.split("\n").map((line, i) => {
    const t = line.trim();
    if (!t) return <br key={i} />;
    if (t.startsWith("### ")) return <h4 key={i} className="font-semibold text-sm mt-4 mb-1">{t.slice(4)}</h4>;
    if (t.startsWith("## ")) return <h3 key={i} className="font-bold text-base mt-5 mb-2">{t.slice(3)}</h3>;
    if (t.startsWith("# ")) return <h2 key={i} className="font-bold text-lg mt-5 mb-2">{t.slice(2)}</h2>;
    if (t.startsWith("- ") || t.startsWith("* ")) return <div key={i} className="flex gap-2 ml-2 text-sm text-gray-700"><span className="text-primary mt-0.5">&#8226;</span><span>{t.slice(2)}</span></div>;
    if (/^\d+\.\s/.test(t)) {
      const num = t.match(/^(\d+)\./)?.[1];
      return <div key={i} className="flex gap-2 ml-2 text-sm text-gray-700"><span className="font-semibold text-primary min-w-[20px]">{num}.</span><span>{t.replace(/^\d+\.\s/, "")}</span></div>;
    }
    if (t.startsWith("**") && t.endsWith("**")) return <p key={i} className="font-semibold text-sm mt-2">{t.slice(2, -2)}</p>;
    return <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>;
  });
}

export default function DesignerStage() {
  const { stageId } = useParams<{ stageId: string }>();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  const navigate = useNavigate();
  const resultRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = stageId ? STAGE_CONFIG[stageId] : null;

  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<Array<{ content: string; timestamp: string }>>([]);
  const [isLoadingStage, setIsLoadingStage] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    setAiResult(null);
    setAiProvider(null);
    setUserDescription("");
    setNotes("");
    setCheckedItems(new Set());
    setGenerationHistory([]);
    setSaveStatus("idle");

    if (projectId && stageId) {
      loadStageData();
    } else {
      setIsLoadingStage(false);
    }
  }, [stageId, projectId]);

  const loadStageData = async () => {
    setIsLoadingStage(true);
    try {
      const res = await fetch(`${PROJECTS_URL}?project_id=${projectId}`);
      if (!res.ok) { setIsLoadingStage(false); return; }
      const data = await res.json();
      const stageData = (data.stages || []).find((s: { stage_id: string }) => s.stage_id === stageId);
      if (stageData) {
        setUserDescription(stageData.user_description || "");
        setNotes(stageData.notes || "");
        setAiResult(stageData.ai_result || null);
        setAiProvider(stageData.ai_provider || null);
        const checklist: number[] = stageData.checklist_state || [];
        setCheckedItems(new Set(checklist));
        if (stageData.ai_result) {
          setGenerationHistory([{ content: stageData.ai_result, timestamp: "загружено" }]);
        }
      }
    } catch (e) {
      console.error("Error loading stage:", e);
    } finally {
      setIsLoadingStage(false);
    }
  };

  const saveStage = useCallback(async (overrides?: { ai_result?: string; ai_provider?: string; checklist?: Set<number>; desc?: string; stageNotes?: string }) => {
    if (!projectId || !stageId) return;
    setSaveStatus("saving");
    const checkArr = Array.from(overrides?.checklist ?? checkedItems);
    const currentAi = overrides?.ai_result ?? aiResult;
    const currentDesc = overrides?.desc ?? userDescription;
    const status = currentAi ? (checkArr.length === (config?.checklistItems.length || 0) ? "completed" : "in_progress") : (checkArr.length > 0 || currentDesc.trim() ? "in_progress" : "not_started");

    try {
      await fetch(PROJECTS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_stage",
          project_id: parseInt(projectId),
          stage_id: stageId,
          user_description: currentDesc,
          notes: overrides?.stageNotes ?? notes,
          ai_result: currentAi,
          ai_provider: overrides?.ai_provider ?? aiProvider,
          checklist_state: checkArr,
          status,
        }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }, [projectId, stageId, checkedItems, aiResult, aiProvider, userDescription, notes, config]);

  const debouncedSave = useCallback((overrides?: Parameters<typeof saveStage>[0]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveStage(overrides), 1500);
  }, [saveStage]);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Icon name="AlertCircle" className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Этап не найден</h2>
          <Button onClick={() => navigate("/designer")}>Вернуться к проекту</Button>
        </Card>
      </div>
    );
  }

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      debouncedSave({ checklist: next });
      return next;
    });
  };

  const checkedPercent = config.checklistItems.length > 0 ? Math.round((checkedItems.size / config.checklistItems.length) * 100) : 0;

  const handleGenerate = async () => {
    if (!userDescription.trim()) return;
    setIsGenerating(true);
    setAiResult(null);
    try {
      const response = await fetch(GENERATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage_id: stageId, description: userDescription.trim(), notes: notes.trim() }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка генерации");
      }
      const data = await response.json();
      setAiResult(data.content);
      setAiProvider(data.provider);
      setGenerationHistory((prev) => [...prev, { content: data.content, timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) }]);
      saveStage({ ai_result: data.content, ai_provider: data.provider });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e: unknown) {
      setAiResult(`Ошибка: ${e instanceof Error ? e.message : "Неизвестная ошибка"}. Попробуйте ещё раз.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDescChange = (val: string) => { setUserDescription(val); debouncedSave({ desc: val }); };
  const handleNotesChange = (val: string) => { setNotes(val); debouncedSave({ stageNotes: val }); };

  if (isLoadingStage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Загрузка этапа...</p>
        </div>
      </div>
    );
  }

  const stageKeys = Object.keys(STAGE_CONFIG);
  const currentIdx = stageKeys.indexOf(stageId || "");
  const projectParam = projectId ? `?project=${projectId}` : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs items={[{ label: "Главная", path: "/" }, { label: "Конструктор", path: "/designer" }, { label: config.title, path: `/designer/${stageId}` }]} />

      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/designer")}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name={config.icon} className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">{config.title}</h1>
                  <p className="text-sm text-gray-500">
                    Чеклист: {checkedPercent}%
                    {saveStatus === "saving" && <span className="text-blue-500 ml-2">Сохранение...</span>}
                    {saveStatus === "saved" && <span className="text-green-500 ml-2">Сохранено</span>}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {aiResult && (
                <Button variant="outline" size="sm" onClick={() => {
                  const blob = new Blob([aiResult], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = `${config.title}.txt`; a.click();
                  URL.revokeObjectURL(url);
                }}>
                  <Icon name="Download" className="mr-2 h-4 w-4" />Скачать
                </Button>
              )}
              {projectId && (
                <Button size="sm" onClick={() => saveStage()} disabled={saveStatus === "saving"}>
                  <Icon name="Save" className="mr-2 h-4 w-4" />Сохранить
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <p className="text-gray-700 leading-relaxed mb-5">{config.description}</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                    <Icon name="FileText" className="h-4 w-4 text-primary" />Opишите ваше помещение
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{config.aiPromptHint}</p>
                  <textarea className="w-full min-h-[100px] px-3 py-2 border rounded-lg text-sm resize-y focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="Например: Квартира 60 м2, 2 комнаты, для семьи из 3 человек..." value={userDescription} onChange={(e) => handleDescChange(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Icon name="StickyNote" className="h-4 w-4 text-gray-400" />Дополнительные заметки <span className="text-xs text-gray-400">(необязательно)</span>
                  </label>
                  <textarea className="w-full min-h-[60px] px-3 py-2 border rounded-lg text-sm resize-y" placeholder="Размеры, особенности, пожелания..." value={notes} onChange={(e) => handleNotesChange(e.target.value)} />
                </div>
                <Button className="w-full h-12 text-base" onClick={handleGenerate} disabled={isGenerating || !userDescription.trim()}>
                  {isGenerating ? (<><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />ИИ генерирует рекомендации...</>) : (<><Icon name="Sparkles" className="mr-2 h-5 w-5" />{aiResult ? "Перегенерировать" : "Сгенерировать рекомендации ИИ"}</>)}
                </Button>
              </div>
            </Card>

            {isGenerating && (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative mb-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
                    <Icon name="Sparkles" className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className="font-semibold mb-1">ИИ анализирует ваше помещение</h3>
                  <p className="text-sm text-gray-500">Создаём рекомендации для этапа "{config.title}"...</p>
                </div>
              </Card>
            )}

            {aiResult && !isGenerating && (
              <Card className="p-6 border-2 border-primary/20" ref={resultRef}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2"><Icon name="Sparkles" className="h-5 w-5 text-primary" />Рекомендации ИИ</h3>
                  <div className="flex items-center gap-2">
                    {aiProvider && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{aiProvider === "yandexgpt" ? "YandexGPT" : "ChatGPT"}</span>}
                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(aiResult)}><Icon name="Copy" className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 space-y-1">{formatAiContent(aiResult)}</div>
              </Card>
            )}

            {generationHistory.length > 1 && (
              <Card className="p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Icon name="History" className="h-4 w-4 text-gray-400" />История генераций ({generationHistory.length})</h3>
                <div className="space-y-2">
                  {generationHistory.map((item, idx) => (
                    <button key={idx} className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${item.content === aiResult ? "border-primary bg-primary/5" : "border-gray-200 hover:bg-gray-50"}`} onClick={() => { setAiResult(item.content); resultRef.current?.scrollIntoView({ behavior: "smooth" }); }}>
                      <div className="flex items-center justify-between"><span className="font-medium">Вариант {idx + 1}</span><span className="text-xs text-gray-400">{item.timestamp}</span></div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.content.slice(0, 120)}...</p>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Icon name="ListChecks" className="h-5 w-5 text-primary" />Чеклист</h3>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                <div className="bg-green-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${checkedPercent}%` }} />
              </div>
              <div className="space-y-2">
                {config.checklistItems.map((item, index) => (
                  <label key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="checkbox" checked={checkedItems.has(index)} onChange={() => toggleCheck(index)} className="w-4 h-4 rounded flex-shrink-0" />
                    <span className={`text-sm ${checkedItems.has(index) ? "line-through text-gray-400" : "text-gray-700"}`}>{item}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Icon name="Lightbulb" className="h-5 w-5 text-yellow-500" />Советы</h3>
              <ul className="space-y-2">
                {config.tips.map((tip, index) => (
                  <li key={index} className="flex gap-2 text-xs text-gray-600"><Icon name="ChevronRight" className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" /><span>{tip}</span></li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
              <Icon name="Sparkles" className="h-7 w-7 text-blue-600 mb-2" />
              <h3 className="font-semibold text-sm mb-1 text-blue-900">Как это работает</h3>
              <ol className="text-xs text-gray-600 space-y-1.5 mt-2">
                <li className="flex gap-2"><span className="font-bold text-blue-600">1.</span>Опишите помещение</li>
                <li className="flex gap-2"><span className="font-bold text-blue-600">2.</span>Нажмите "Сгенерировать"</li>
                <li className="flex gap-2"><span className="font-bold text-blue-600">3.</span>ИИ создаст детальный план</li>
                <li className="flex gap-2"><span className="font-bold text-blue-600">4.</span>Данные сохраняются автоматически</li>
              </ol>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-sm" onClick={() => { if (currentIdx > 0) navigate(`/designer/${stageKeys[currentIdx - 1]}${projectParam}`); }} disabled={currentIdx === 0}>
                <Icon name="ArrowLeft" className="mr-1 h-4 w-4" />Назад
              </Button>
              <Button className="flex-1 text-sm" onClick={() => { if (currentIdx < stageKeys.length - 1) navigate(`/designer/${stageKeys[currentIdx + 1]}${projectParam}`); }} disabled={currentIdx === stageKeys.length - 1}>
                Далее<Icon name="ArrowRight" className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
