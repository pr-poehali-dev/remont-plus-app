import { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  plannerReducer,
  initialState,
} from "@/components/planner/plannerTypes";
import PlannerToolbar from "@/components/planner/PlannerToolbar";
import PlannerFurniturePanel from "@/components/planner/PlannerFurniturePanel";
import PlannerProperties from "@/components/planner/PlannerProperties";
import { exportPlannerPdf } from "@/components/planner/plannerPdfExport";
import { usePlannerCanvas } from "./planner/usePlannerCanvas";
import { usePlannerInteraction } from "./planner/usePlannerInteraction";

function InteriorPlanner() {
  const navigate = useNavigate();

  useMeta({
    title: "3D-Планировщик интерьера — конструктор планировок онлайн",
    description:
      "Бесплатный 3D-планировщик интерьера: рисуйте стены, расставляйте мебель, переключайтесь между 2D и 3D видом",
    canonical: "/interior-planner",
  });

  const [state, dispatch] = useReducer(plannerReducer, initialState);
  const [showFurniture, setShowFurniture] = useState(false);
  const [showProperties, setShowProperties] = useState(true);

  const {
    canvasRef,
    containerRef,
    engine2dRef,
    stateRef,
    getWorldPos,
    getScreenPos,
    getSnappedPoint,
  } = usePlannerCanvas({ state, dispatch, showFurniture, showProperties });

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleDragOver,
    handleDrop,
    handleSetTool,
    handleSetViewMode,
    handleZoomIn,
    handleZoomOut,
    handleFitView,
    handleAddPreset,
    handleAddFurnitureFromPanel,
    handleDragStartFromPanel,
    handleUpdateWall,
    handleDeleteWall,
    handleUpdateFurniture,
    handleDeleteFurniture,
    handleAddOpening,
    handleDeleteOpening,
  } = usePlannerInteraction({
    state,
    dispatch,
    stateRef,
    canvasRef,
    engine2dRef,
    getWorldPos,
    getScreenPos,
    getSnappedPoint,
    setShowFurniture,
  });

  const currentZoom =
    state.viewMode === "2d"
      ? state.viewState.zoom
      : state.viewState3d.zoom;

  return (
    <div className="flex h-screen flex-col bg-[#0f0f1a] text-white overflow-hidden">
      <div className="flex h-11 items-center justify-between border-b border-gray-700 bg-[#1e1e2e] px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="h-7 gap-1 text-xs text-gray-400 hover:text-white"
          >
            <Icon name="ArrowLeft" size={14} />
            Назад
          </Button>
          <div className="h-5 w-px bg-gray-700" />
          <div>
            <span className="text-sm font-semibold">3D-Планировщик</span>
            <span className="ml-2 text-[10px] text-gray-500">
              Конструктор интерьера
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setShowFurniture((v) => !v);
            }}
            className={`flex h-7 items-center gap-1 rounded px-2 text-xs transition-colors ${
              showFurniture
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Icon name="Armchair" size={14} />
            Мебель
          </button>
          <button
            onClick={() => setShowProperties((v) => !v)}
            className={`flex h-7 items-center gap-1 rounded px-2 text-xs transition-colors ${
              showProperties
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Icon name="SlidersHorizontal" size={14} />
            Свойства
          </button>
          <div className="mx-1 h-5 w-px bg-gray-700" />
          <button
            onClick={() => exportPlannerPdf(state)}
            className="flex h-7 items-center gap-1 rounded bg-orange-600 px-3 text-xs text-white hover:bg-orange-500 transition-colors"
            title="Экспорт планировки в PDF со сметой материалов"
          >
            <Icon name="FileDown" size={14} />
            PDF со сметой
          </button>
        </div>
      </div>

      <PlannerToolbar
        tool={state.tool}
        viewMode={state.viewMode}
        showGrid={state.showGrid}
        showDimensions={state.showDimensions}
        snapToGrid={state.snapToGrid}
        zoom={currentZoom}
        onSetTool={handleSetTool}
        onSetViewMode={handleSetViewMode}
        onToggleGrid={() => dispatch({ type: "TOGGLE_GRID" })}
        onToggleDimensions={() => dispatch({ type: "TOGGLE_DIMENSIONS" })}
        onToggleSnap={() => dispatch({ type: "TOGGLE_SNAP" })}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onUndo={() => dispatch({ type: "UNDO" })}
        onRedo={() => dispatch({ type: "REDO" })}
        onAddPreset={handleAddPreset}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        <PlannerFurniturePanel
          isOpen={showFurniture}
          onClose={() => setShowFurniture(false)}
          onDragStart={handleDragStartFromPanel}
          onAddFurniture={handleAddFurnitureFromPanel}
        />

        {showProperties && (
          <PlannerProperties
            selectedId={state.selectedId}
            selectedType={state.selectedType}
            walls={state.walls}
            furniture={state.furniture}
            ceilingHeight={state.ceilingHeight}
            floorColor={state.floorColor}
            wallColor={state.wallColor}
            onUpdateWall={handleUpdateWall}
            onDeleteWall={handleDeleteWall}
            onUpdateFurniture={handleUpdateFurniture}
            onDeleteFurniture={handleDeleteFurniture}
            onSetCeilingHeight={(h) =>
              dispatch({ type: "SET_CEILING_HEIGHT", payload: h })
            }
            onSetFloorColor={(c) =>
              dispatch({ type: "SET_FLOOR_COLOR", payload: c })
            }
            onSetWallColor={(c) =>
              dispatch({ type: "SET_WALL_COLOR", payload: c })
            }
            onAddOpening={handleAddOpening}
            onDeleteOpening={handleDeleteOpening}
          />
        )}
      </div>
    </div>
  );
}

export default InteriorPlanner;
