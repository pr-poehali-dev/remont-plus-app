import { useReducer, useRef, useEffect } from 'react';
import { Wall } from './types';
import { CanvasEngine } from './canvasEngine';
import { constructorReducer, initialState } from './constructorReducer';
import { useCanvasRenderer } from './useCanvasRenderer';
import { useConstructorInput } from './useConstructorInput';
import ConstructorToolbar from './ConstructorToolbar';
import ConstructorSidebar from './ConstructorSidebar';

interface RoomConstructorProps {
  onSave?: (data: { walls: Wall[]; rooms: never[] }) => void;
  initialData?: { walls: Wall[]; rooms: never[] };
  className?: string;
}

export default function RoomConstructor({
  onSave,
  initialData,
  className,
}: RoomConstructorProps) {
  const [state, dispatch] = useReducer(constructorReducer, initialState);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);

  const initialDataRef = useRef<string>("");
  const needsFitRef = useRef(false);
  useEffect(() => {
    if (initialData && initialData.walls.length > 0) {
      const key = JSON.stringify(initialData.walls.map(w => ({ s: w.start, e: w.end })));
      if (key !== initialDataRef.current) {
        initialDataRef.current = key;
        dispatch({ type: 'LOAD_DATA', walls: initialData.walls, rooms: initialData.rooms });
        needsFitRef.current = true;
      }
    }
  }, [initialData]);

  useCanvasRenderer(state, canvasRef, containerRef, engineRef, onSave);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleContextMenu,
    handleToolChange,
    handleZoomIn,
    handleZoomOut,
    handleFitView: fitView,
    handleAddPreset,
    handleExportPDF,
    getCursorClass,
  } = useConstructorInput(state, dispatch, canvasRef, engineRef);

  useEffect(() => {
    if (needsFitRef.current && state.walls.length > 0) {
      needsFitRef.current = false;
      setTimeout(() => fitView(), 100);
    }
  }, [state.walls, fitView]);

  const handleFitView = fitView;

  return (
    <div className={`flex flex-col h-[calc(100vh-200px)] min-h-[500px] bg-[#1e1e2e] rounded-lg overflow-hidden border border-[#3a3a5c] ${className || ''}`}>
      <ConstructorToolbar
        tool={state.tool}
        onToolChange={handleToolChange}
        showGrid={state.showGrid}
        showDimensions={state.showDimensions}
        snapToGrid={state.snapToGrid}
        zoom={state.viewState.zoom}
        onToggleGrid={() => dispatch({ type: 'TOGGLE_GRID' })}
        onToggleDimensions={() => dispatch({ type: 'TOGGLE_DIMENSIONS' })}
        onToggleSnap={() => dispatch({ type: 'TOGGLE_SNAP' })}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        canUndo={state.historyIndex > 0}
        canRedo={state.historyIndex < state.history.length - 1}
        onAddPreset={handleAddPreset}
        onExportPDF={handleExportPDF}
      />

      <div className="flex flex-1 overflow-hidden">
        <div ref={containerRef} className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className={`w-full h-full ${getCursorClass()}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
          />
        </div>

        <ConstructorSidebar
          walls={state.walls}
          selectedId={state.selectedId}
          tool={state.tool}
          isDrawing={state.isDrawing}
          wallThickness={state.wallThickness}
          onWallThicknessChange={(t) =>
            dispatch({ type: 'SET_WALL_THICKNESS', thickness: t })
          }
          onAddOpening={(wallId, opening) => {
            dispatch({ type: 'ADD_OPENING', wallId, opening });
            dispatch({ type: 'PUSH_HISTORY' });
          }}
          onUpdateOpening={(wallId, openingId, updates) => {
            dispatch({ type: 'UPDATE_OPENING', wallId, openingId, updates });
            dispatch({ type: 'PUSH_HISTORY' });
          }}
          onDeleteOpening={(wallId, openingId) => {
            dispatch({ type: 'DELETE_OPENING', wallId, openingId });
            dispatch({ type: 'PUSH_HISTORY' });
          }}
          onDeleteWall={(id) => {
            dispatch({ type: 'DELETE_WALL', id });
            dispatch({ type: 'PUSH_HISTORY' });
          }}
          onSelect={(id) => dispatch({ type: 'SELECT', id })}
        />
      </div>
    </div>
  );
}