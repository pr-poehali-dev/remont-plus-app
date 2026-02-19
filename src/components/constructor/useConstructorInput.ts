import { useRef, useEffect, useCallback, Dispatch, RefObject } from 'react';
import {
  Wall,
  Opening,
  Tool,
  Point,
  ConstructorState,
  ConstructorAction,
} from './types';
import {
  CanvasEngine,
  generateId,
  distanceToSegment,
  positionOnWall,
  snapToAngle,
  findSnapPoint,
} from './canvasEngine';
import { roomPresets } from './roomPresets';

export function useConstructorInput(
  state: ConstructorState,
  dispatch: Dispatch<ConstructorAction>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  engineRef: RefObject<CanvasEngine | null>,
) {
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const isDraggingRef = useRef(false);
  const dragWallIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });
  const isDraggingOpeningRef = useRef(false);
  const dragOpeningWallIdRef = useRef<string | null>(null);
  const dragOpeningIdRef = useRef<string | null>(null);

  const getCanvasPos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const findWallNear = useCallback(
    (worldPoint: Point, threshold: number = 200): Wall | null => {
      let closest: Wall | null = null;
      let minDist = threshold;
      for (const wall of state.walls) {
        const dist = distanceToSegment(worldPoint, wall.start, wall.end);
        if (dist < minDist) {
          minDist = dist;
          closest = wall;
        }
      }
      return closest;
    },
    [state.walls]
  );

  const findOpeningNear = useCallback(
    (worldPoint: Point, threshold: number = 200): { wall: Wall; opening: Opening } | null => {
      let best: { wall: Wall; opening: Opening; dist: number } | null = null;
      for (const wall of state.walls) {
        const wdx = wall.end.x - wall.start.x;
        const wdy = wall.end.y - wall.start.y;
        const wLen = Math.sqrt(wdx * wdx + wdy * wdy);
        if (wLen < 1) continue;
        for (const op of wall.openings) {
          const cx = wall.start.x + wdx * op.position;
          const cy = wall.start.y + wdy * op.position;
          const dx = worldPoint.x - cx;
          const dy = worldPoint.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < threshold && (!best || dist < best.dist)) {
            best = { wall, opening: op, dist };
          }
        }
      }
      return best ? { wall: best.wall, opening: best.opening } : null;
    },
    [state.walls]
  );

  const finishDrawing = useCallback(() => {
    const points = state.drawingPoints;
    if (points.length < 2) {
      dispatch({ type: 'CANCEL_DRAWING' });
      return;
    }

    const newWalls: Wall[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      newWalls.push({
        id: generateId(),
        start: { ...points[i] },
        end: { ...points[i + 1] },
        thickness: state.wallThickness,
        openings: [],
      });
    }

    for (const w of newWalls) {
      dispatch({ type: 'ADD_WALL', wall: w });
    }

    dispatch({ type: 'FINISH_DRAWING' });
    dispatch({ type: 'PUSH_HISTORY' });
  }, [state.drawingPoints, state.wallThickness]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasPos(e);
      const engine = engineRef.current;
      if (!engine) return;

      const worldPoint = engine.screenToWorld(pos.x, pos.y);

      if (e.button === 1 || e.button === 2) {
        isPanningRef.current = true;
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          ox: state.viewState.offsetX,
          oy: state.viewState.offsetY,
        };
        e.preventDefault();
        return;
      }

      if (e.button !== 0) return;

      switch (state.tool) {
        case 'select': {
          const openingHit = findOpeningNear(worldPoint, 250);
          if (openingHit) {
            dispatch({ type: 'SELECT', id: openingHit.wall.id });
            isDraggingOpeningRef.current = true;
            dragOpeningWallIdRef.current = openingHit.wall.id;
            dragOpeningIdRef.current = openingHit.opening.id;
            break;
          }
          const wall = findWallNear(worldPoint);
          if (wall) {
            dispatch({ type: 'SELECT', id: wall.id });
            isDraggingRef.current = true;
            dragWallIdRef.current = wall.id;
            const midX = (wall.start.x + wall.end.x) / 2;
            const midY = (wall.start.y + wall.end.y) / 2;
            dragOffsetRef.current = {
              x: worldPoint.x - midX,
              y: worldPoint.y - midY,
            };
          } else {
            dispatch({ type: 'SELECT', id: null });
          }
          break;
        }

        case 'wall': {
          let snappedPoint = worldPoint;
          if (state.snapToGrid) {
            const snap = findSnapPoint(worldPoint, state.walls, state.gridSize, true);
            snappedPoint = snap.point;
          }
          if (state.isDrawing) {
            const lastPt = state.drawingPoints[state.drawingPoints.length - 1];
            if (state.shiftHeld) {
              snappedPoint = snapToAngle(lastPt, snappedPoint, true);
            }
            dispatch({ type: 'ADD_DRAWING_POINT', point: snappedPoint });
          } else {
            dispatch({ type: 'START_DRAWING', point: snappedPoint });
          }
          break;
        }

        case 'door': {
          const wall = findWallNear(worldPoint, 300);
          if (wall) {
            const pos = positionOnWall(worldPoint, wall);
            const opening: Opening = {
              id: generateId(),
              type: 'door',
              position: pos,
              width: 900,
              direction: 'left',
            };
            dispatch({ type: 'ADD_OPENING', wallId: wall.id, opening });
            dispatch({ type: 'PUSH_HISTORY' });
          }
          break;
        }

        case 'window': {
          const wall = findWallNear(worldPoint, 300);
          if (wall) {
            const pos = positionOnWall(worldPoint, wall);
            const opening: Opening = {
              id: generateId(),
              type: 'window',
              position: pos,
              width: 1200,
            };
            dispatch({ type: 'ADD_OPENING', wallId: wall.id, opening });
            dispatch({ type: 'PUSH_HISTORY' });
          }
          break;
        }

        case 'eraser': {
          const wall = findWallNear(worldPoint);
          if (wall) {
            dispatch({ type: 'DELETE_WALL', id: wall.id });
            dispatch({ type: 'PUSH_HISTORY' });
          }
          break;
        }

        case 'measure': {
          let snappedPoint = worldPoint;
          if (state.snapToGrid) {
            const snap = findSnapPoint(worldPoint, state.walls, state.gridSize, true);
            snappedPoint = snap.point;
          }
          dispatch({ type: 'ADD_MEASURE_POINT', point: snappedPoint });
          break;
        }
      }
    },
    [state.tool, state.viewState, state.isDrawing, state.drawingPoints, state.walls, state.snapToGrid, state.gridSize, state.shiftHeld, state.wallThickness, getCanvasPos, findWallNear, findOpeningNear]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasPos(e);
      const engine = engineRef.current;
      if (!engine) return;

      const worldPoint = engine.screenToWorld(pos.x, pos.y);
      dispatch({ type: 'SET_MOUSE', world: worldPoint, screen: { x: pos.x, y: pos.y } });

      if (isPanningRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        dispatch({
          type: 'SET_VIEW',
          viewState: {
            offsetX: panStartRef.current.ox + dx,
            offsetY: panStartRef.current.oy + dy,
          },
        });
        return;
      }

      if (isDraggingOpeningRef.current && dragOpeningWallIdRef.current && dragOpeningIdRef.current && state.tool === 'select') {
        const wall = state.walls.find((w) => w.id === dragOpeningWallIdRef.current);
        if (wall) {
          const newPos = positionOnWall(worldPoint, wall);
          const clamped = Math.max(0.05, Math.min(0.95, newPos));
          dispatch({
            type: 'UPDATE_OPENING',
            wallId: wall.id,
            openingId: dragOpeningIdRef.current,
            updates: { position: clamped },
          });
        }
        return;
      }

      if (isDraggingRef.current && dragWallIdRef.current && state.tool === 'select') {
        const wall = state.walls.find((w) => w.id === dragWallIdRef.current);
        if (wall) {
          const midX = (wall.start.x + wall.end.x) / 2;
          const midY = (wall.start.y + wall.end.y) / 2;
          const dx = worldPoint.x - dragOffsetRef.current.x - midX;
          const dy = worldPoint.y - dragOffsetRef.current.y - midY;

          let newStart = { x: wall.start.x + dx, y: wall.start.y + dy };
          let newEnd = { x: wall.end.x + dx, y: wall.end.y + dy };

          if (state.snapToGrid) {
            const snapS = findSnapPoint(newStart, state.walls.filter(w => w.id !== wall.id), state.gridSize, true);
            const snapOff = { x: snapS.point.x - newStart.x, y: snapS.point.y - newStart.y };
            newStart = snapS.point;
            newEnd = { x: newEnd.x + snapOff.x, y: newEnd.y + snapOff.y };
          }

          dispatch({
            type: 'UPDATE_WALL',
            id: wall.id,
            updates: { start: newStart, end: newEnd },
          });
        }
      }
    },
    [state.tool, state.walls, state.snapToGrid, state.gridSize, getCanvasPos]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        return;
      }

      if (isDraggingOpeningRef.current) {
        isDraggingOpeningRef.current = false;
        dragOpeningWallIdRef.current = null;
        dragOpeningIdRef.current = null;
        dispatch({ type: 'PUSH_HISTORY' });
        return;
      }

      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        dragWallIdRef.current = null;
        dispatch({ type: 'PUSH_HISTORY' });
      }

      if (e.button === 2) {
        e.preventDefault();
      }
    },
    []
  );

  const handleDoubleClick = useCallback(() => {
    if (state.tool === 'wall' && state.isDrawing) {
      finishDrawing();
    }
  }, [state.tool, state.isDrawing, finishDrawing]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const viewStateRef = useRef(state.viewState);
  viewStateRef.current = state.viewState;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const posX = e.clientX - rect.left;
      const posY = e.clientY - rect.top;
      const engine = engineRef.current;
      if (!engine) return;

      const vs = viewStateRef.current;
      const zoomFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newZoom = Math.max(0.005, Math.min(2, vs.zoom * zoomFactor));

      const wx = (posX - vs.offsetX) / vs.zoom;
      const wy = (posY - vs.offsetY) / vs.zoom;

      const newOffX = posX - wx * newZoom;
      const newOffY = posY - wy * newZoom;

      dispatch({
        type: 'SET_VIEW',
        viewState: { zoom: newZoom, offsetX: newOffX, offsetY: newOffY },
      });
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        dispatch({ type: 'SET_SHIFT', held: true });
      }

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Escape') {
        if (state.isDrawing) {
          finishDrawing();
        } else {
          dispatch({ type: 'SELECT', id: null });
          dispatch({ type: 'CLEAR_MEASURE' });
        }
      }

      if (e.key === 'Enter' && state.isDrawing) {
        finishDrawing();
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedId) {
          dispatch({ type: 'DELETE_WALL', id: state.selectedId });
          dispatch({ type: 'PUSH_HISTORY' });
        }
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          dispatch({ type: 'UNDO' });
        }
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          dispatch({ type: 'REDO' });
        }
      }

      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === 'g' || e.key === 'G') dispatch({ type: 'TOGGLE_GRID' });
        if (e.key === 's' || e.key === 'S') dispatch({ type: 'TOGGLE_SNAP' });
        if (e.key === 'v' || e.key === 'V') dispatch({ type: 'SET_TOOL', tool: 'select' });
        if (e.key === 'w' || e.key === 'W') dispatch({ type: 'SET_TOOL', tool: 'wall' });
        if (e.key === 'd' || e.key === 'D') dispatch({ type: 'SET_TOOL', tool: 'door' });
        if (e.key === 'n' || e.key === 'N') dispatch({ type: 'SET_TOOL', tool: 'window' });
        if (e.key === 'm' || e.key === 'M') dispatch({ type: 'SET_TOOL', tool: 'measure' });
        if (e.key === 'e' || e.key === 'E') dispatch({ type: 'SET_TOOL', tool: 'eraser' });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        dispatch({ type: 'SET_SHIFT', held: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.isDrawing, state.selectedId, finishDrawing]);

  const handleToolChange = useCallback((tool: Tool) => {
    dispatch({ type: 'SET_TOOL', tool });
  }, []);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(2, state.viewState.zoom * 1.3);
    const engine = engineRef.current;
    if (!engine) return;
    const size = engine.getCanvasSize();
    const cx = size.width / 2;
    const cy = size.height / 2;
    const wx = (cx - state.viewState.offsetX) / state.viewState.zoom;
    const wy = (cy - state.viewState.offsetY) / state.viewState.zoom;
    dispatch({
      type: 'SET_VIEW',
      viewState: {
        zoom: newZoom,
        offsetX: cx - wx * newZoom,
        offsetY: cy - wy * newZoom,
      },
    });
  }, [state.viewState]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(0.005, state.viewState.zoom / 1.3);
    const engine = engineRef.current;
    if (!engine) return;
    const size = engine.getCanvasSize();
    const cx = size.width / 2;
    const cy = size.height / 2;
    const wx = (cx - state.viewState.offsetX) / state.viewState.zoom;
    const wy = (cy - state.viewState.offsetY) / state.viewState.zoom;
    dispatch({
      type: 'SET_VIEW',
      viewState: {
        zoom: newZoom,
        offsetX: cx - wx * newZoom,
        offsetY: cy - wy * newZoom,
      },
    });
  }, [state.viewState]);

  const handleFitView = useCallback(() => {
    if (state.walls.length === 0) {
      dispatch({
        type: 'SET_VIEW',
        viewState: { offsetX: 400, offsetY: 200, zoom: 0.08 },
      });
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const w of state.walls) {
      minX = Math.min(minX, w.start.x, w.end.x);
      minY = Math.min(minY, w.start.y, w.end.y);
      maxX = Math.max(maxX, w.start.x, w.end.x);
      maxY = Math.max(maxY, w.start.y, w.end.y);
    }

    const engine = engineRef.current;
    if (!engine) return;
    const size = engine.getCanvasSize();
    const worldW = maxX - minX || 1;
    const worldH = maxY - minY || 1;
    const padding = 60;

    const zoom = Math.min(
      (size.width - padding * 2) / worldW,
      (size.height - padding * 2 - 28) / worldH
    );

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    dispatch({
      type: 'SET_VIEW',
      viewState: {
        zoom,
        offsetX: size.width / 2 - cx * zoom,
        offsetY: (size.height - 28) / 2 - cy * zoom,
      },
    });
  }, [state.walls]);

  const handleAddPreset = useCallback(
    (presetId: string) => {
      const preset = roomPresets.find((p) => p.id === presetId);
      if (!preset) return;

      let offsetX = 0;
      let offsetY = 0;
      if (state.walls.length > 0) {
        let maxX = -Infinity;
        let minY = Infinity;
        for (const w of state.walls) {
          maxX = Math.max(maxX, w.start.x, w.end.x);
          minY = Math.min(minY, w.start.y, w.end.y);
        }
        offsetX = maxX + 500;
        offsetY = minY;
      }

      const newWalls: Wall[] = preset.walls.map((pw) => ({
        id: generateId(),
        start: { x: pw.start.x + offsetX, y: pw.start.y + offsetY },
        end: { x: pw.end.x + offsetX, y: pw.end.y + offsetY },
        thickness: state.wallThickness,
        openings: [],
      }));

      for (const w of newWalls) {
        dispatch({ type: 'ADD_WALL', wall: w });
      }

      dispatch({ type: 'PUSH_HISTORY' });

      setTimeout(() => {
        handleFitView();
      }, 50);
    },
    [state.walls, state.wallThickness, handleFitView]
  );

  const handleExportPDF = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'floor-plan.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const getCursorClass = useCallback(() => {
    switch (state.tool) {
      case 'wall':
      case 'measure':
        return 'cursor-crosshair';
      case 'door':
      case 'window':
        return 'cursor-cell';
      case 'eraser':
        return 'cursor-pointer';
      default:
        return 'cursor-default';
    }
  }, [state.tool]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleContextMenu,
    handleToolChange,
    handleZoomIn,
    handleZoomOut,
    handleFitView,
    handleAddPreset,
    handleExportPDF,
    getCursorClass,
  };
}