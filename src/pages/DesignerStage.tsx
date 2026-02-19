import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import RoomConstructor from "@/components/constructor/RoomConstructor";
import type { Wall } from "@/components/constructor/types";
import { GENERATE_URL, PROJECTS_URL, STAGE_CONFIG } from "@/components/designer-stage/stageConfig";
import StageInputForm from "@/components/designer-stage/StageInputForm";
import StageSidebar from "@/components/designer-stage/StageSidebar";

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
  const [photos, setPhotos] = useState<Array<{ data: string; type: string; preview: string }>>([]);
  const [drawingData, setDrawingData] = useState<{ walls: Wall[] } | null>(null);
  const drawingSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAiResult(null);
    setAiProvider(null);
    setUserDescription("");
    setNotes("");
    setCheckedItems(new Set());
    setGenerationHistory([]);
    setSaveStatus("idle");
    setPhotos([]);
    setDrawingData(null);

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
        if (stageData.drawing_data && stageData.drawing_data.walls) {
          setDrawingData({ walls: stageData.drawing_data.walls });
        }
      }
    } catch (e) {
      console.error("Error loading stage:", e);
    } finally {
      setIsLoadingStage(false);
    }
  };

  const saveStage = useCallback(async (overrides?: { ai_result?: string; ai_provider?: string; checklist?: Set<number>; desc?: string; stageNotes?: string; drawing?: { walls: Wall[] } | null }) => {
    if (!projectId || !stageId) return;
    setSaveStatus("saving");
    const checkArr = Array.from(overrides?.checklist ?? checkedItems);
    const currentAi = overrides?.ai_result ?? aiResult;
    const currentDesc = overrides?.desc ?? userDescription;
    const status = currentAi ? (checkArr.length === (config?.checklistItems.length || 0) ? "completed" : "in_progress") : (checkArr.length > 0 || currentDesc.trim() ? "in_progress" : "not_started");

    const payload: Record<string, unknown> = {
      action: "save_stage",
      project_id: parseInt(projectId),
      stage_id: stageId,
      user_description: currentDesc,
      notes: overrides?.stageNotes ?? notes,
      ai_result: currentAi,
      ai_provider: overrides?.ai_provider ?? aiProvider,
      checklist_state: checkArr,
      status,
    };

    const drawingToSave = overrides?.drawing !== undefined ? overrides.drawing : drawingData;
    if (drawingToSave) {
      payload.drawing_data = drawingToSave;
    }

    try {
      await fetch(PROJECTS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }, [projectId, stageId, checkedItems, aiResult, aiProvider, userDescription, notes, config, drawingData]);

  const debouncedSave = useCallback((overrides?: Parameters<typeof saveStage>[0]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveStage(overrides), 1500);
  }, [saveStage]);

  const constructorInitialData = useMemo(() => {
    if (!drawingData || !drawingData.walls || drawingData.walls.length === 0) return undefined;
    return { walls: drawingData.walls, rooms: [] as never[] };
  }, [drawingData]);

  const handleDrawingSave = useCallback((data: { walls: Wall[]; rooms: never[] }) => {
    setDrawingData({ walls: data.walls });
    if (drawingSaveTimerRef.current) clearTimeout(drawingSaveTimerRef.current);
    drawingSaveTimerRef.current = setTimeout(() => {
      saveStage({ drawing: { walls: data.walls } });
    }, 2000);
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 5 - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        setPhotos((prev) => [
          ...prev,
          { data: base64, type: file.type, preview: result },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!userDescription.trim()) return;
    setIsGenerating(true);
    setAiResult(null);
    const photoPayload = photos.map((p) => ({ data: p.data, type: p.type }));
    try {
      const response = await fetch(GENERATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage_id: stageId, description: userDescription.trim(), notes: notes.trim(), photos: photoPayload }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка генерации");
      }
      const data = await response.json();
      setAiResult(data.content);
      setAiProvider(data.provider);
      setGenerationHistory((prev) => [...prev, { content: data.content, timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) }]);

      const saveOverrides: { ai_result: string; ai_provider: string; drawing?: { walls: Wall[] } } = { ai_result: data.content, ai_provider: data.provider };

      if (data.drawing_data && data.drawing_data.walls && data.drawing_data.walls.length > 0) {
        setDrawingData({ walls: data.drawing_data.walls });
        saveOverrides.drawing = { walls: data.drawing_data.walls };
      }

      saveStage(saveOverrides);
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
        {stageId === "drawings" && (
          <div className="mb-6">
            <RoomConstructor
              className="h-[calc(100vh-220px)] min-h-[600px]"
              initialData={constructorInitialData}
              onSave={handleDrawingSave}
            />
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-6">
          <StageInputForm
            config={config}
            userDescription={userDescription}
            notes={notes}
            photos={photos}
            isGenerating={isGenerating}
            aiResult={aiResult}
            aiProvider={aiProvider}
            generationHistory={generationHistory}
            resultRef={resultRef}
            onDescChange={handleDescChange}
            onNotesChange={handleNotesChange}
            onPhotoUpload={handlePhotoUpload}
            onRemovePhoto={removePhoto}
            onGenerate={handleGenerate}
            onSetAiResult={setAiResult}
          />

          <StageSidebar
            config={config}
            checkedItems={checkedItems}
            checkedPercent={checkedPercent}
            onToggleCheck={toggleCheck}
            currentIdx={currentIdx}
            stageKeys={stageKeys}
            projectParam={projectParam}
            onNavigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}
