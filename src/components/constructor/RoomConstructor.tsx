import { useReducer, useRef, useEffect, useCallback } from 'react';
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
  wallLength,
} from './canvasEngine';
import { roomPresets } from './roomPresets';
import ConstructorToolbar from './ConstructorToolbar';
import ConstructorSidebar from './ConstructorSidebar';

interface RoomConstructorProps {
  onSave?: (data: { walls: Wall[]; rooms: never[] }) => void;
  initialData?: { walls: Wall[]; rooms: never[] };
  className?: string;
}

const initialState: ConstructorState = {
  tool: 'select',
  walls: [],
  rooms: [],
  selectedId: null,
  drawingPoints: [],
  isDrawing: false,
  viewState: { offsetX: 400, offsetY: 200, zoom: 0.08 },
  gridSize: 100,
  wallThickness: 120,
  showGrid: true,
  showDimensions: true,
  snapToGrid: true,
  history: [{ walls: [], rooms: [] }],
  historyIndex: 0,
  mouseWorld: { x: 0, y: 0 },
  mouseScreen: { x: 0, y: 0 },
  shiftHeld: false,
  measurePoints: [],
};

function constructorReducer(
  state: ConstructorState,
  action: ConstructorAction
): ConstructorState {
  switch (action.type) {
    case 'SET_TOOL':
      return {
        ...state,
        tool: action.tool,
        selectedId: null,
        isDrawing: false,
        drawingPoints: [],
        measurePoints: [],
      };
    case 'SET_WALLS':
      return { ...state, walls: action.walls };
    case 'SET_ROOMS':
      return { ...state, rooms: action.rooms };
    case 'ADD_WALL':
      return { ...state, walls: [...state.walls, action.wall] };
    case 'UPDATE_WALL':
      return {
        ...state,
        walls: state.walls.map((w) =>
          w.id === action.id ? { ...w, ...action.updates } : w
        ),
      };
    case 'DELETE_WALL':
      return {
        ...state,
        walls: state.walls.filter((w) => w.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    case 'SELECT':
      return { ...state, selectedId: action.id };
    case 'START_DRAWING':
      return {
        ...state,
        isDrawing: true,
        drawingPoints: [action.point],
      };
    case 'ADD_DRAWING_POINT':
      return {
        ...state,
        drawingPoints: [...state.drawingPoints, action.point],
      };
    case 'FINISH_DRAWING':
      return {
        ...state,
        isDrawing: false,
        drawingPoints: [],
      };
    case 'CANCEL_DRAWING':
      return {
        ...state,
        isDrawing: false,
        drawingPoints: [],
      };
    case 'SET_VIEW':
      return {
        ...state,
        viewState: { ...state.viewState, ...action.viewState },
      };
    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };
    case 'TOGGLE_DIMENSIONS':
      return { ...state, showDimensions: !state.showDimensions };
    case 'TOGGLE_SNAP':
      return { ...state, snapToGrid: !state.snapToGrid };
    case 'SET_WALL_THICKNESS':
      return { ...state, wallThickness: action.thickness };
    case 'SET_MOUSE':
      return { ...state, mouseWorld: action.world, mouseScreen: action.screen };
    case 'SET_SHIFT':
      return { ...state, shiftHeld: action.held };
    case 'PUSH_HISTORY': {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({
        walls: JSON.parse(JSON.stringify(state.walls)),
        rooms: JSON.parse(JSON.stringify(state.rooms)),
      });
      // Keep max 50 history entries
      if (newHistory.length > 50) newHistory.shift();
      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }
    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const idx = state.historyIndex - 1;
      const entry = state.history[idx];
      return {
        ...state,
        walls: JSON.parse(JSON.stringify(entry.walls)),
        rooms: JSON.parse(JSON.stringify(entry.rooms)),
        historyIndex: idx,
        selectedId: null,
      };
    }
    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const idx = state.historyIndex + 1;
      const entry = state.history[idx];
      return {
        ...state,
        walls: JSON.parse(JSON.stringify(entry.walls)),
        rooms: JSON.parse(JSON.stringify(entry.rooms)),
        historyIndex: idx,
        selectedId: null,
      };
    }
    case 'ADD_OPENING': {
      return {
        ...state,
        walls: state.walls.map((w) =>
          w.id === action.wallId
            ? { ...w, openings: [...w.openings, action.opening] }
            : w
        ),
      };
    }
    case 'DELETE_OPENING': {
      return {
        ...state,
        walls: state.walls.map((w) =>
          w.id === action.wallId
            ? { ...w, openings: w.openings.filter((o) => o.id !== action.openingId) }
            : w
        ),
      };
    }
    case 'ADD_MEASURE_POINT': {
      if (state.measurePoints.length >= 2) {
        return { ...state, measurePoints: [action.point] };
      }
      return { ...state, measurePoints: [...state.measurePoints, action.point] };
    }
    case 'CLEAR_MEASURE':
      return { ...state, measurePoints: [] };
    case 'LOAD_DATA':
      return {
        ...state,
        walls: action.walls,
        rooms: action.rooms as never[],
        history: [{ walls: JSON.parse(JSON.stringify(action.walls)), rooms: JSON.parse(JSON.stringify(action.rooms)) }],
        historyIndex: 0,
      };
    default:
      return state;
  }
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
  const animFrameRef = useRef<number>(0);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const isDraggingRef = useRef(false);
  const dragWallIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });

  // Load initial data
  useEffect(() => {
    if (initialData) {
      dispatch({ type: 'LOAD_DATA', walls: initialData.walls, rooms: initialData.rooms });
    }
  }, [initialData]);

  // Initialize canvas engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new CanvasEngine(canvas);
    engineRef.current = engine;

    const observer = new ResizeObserver(() => {
      engine.resize();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Render loop
  useEffect(() => {
    const render = () => {
      const engine = engineRef.current;
      if (!engine) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      engine.setViewState(state.viewState);
      engine.clear();

      // Grid
      if (state.showGrid) {
        engine.drawGrid(state.gridSize);
      }

      // Walls
      for (const wall of state.walls) {
        const isSelected = wall.id === state.selectedId;
        engine.drawWall(wall, isSelected);

        // Openings
        for (const opening of wall.openings) {
          engine.drawOpening(wall, opening);
        }

        // Dimension lines
        if (state.showDimensions && wallLength(wall) > 0) {
          engine.drawDimensionLine(wall.start, wall.end, 30);
        }
      }

      // Drawing preview
      if (state.isDrawing && state.drawingPoints.length > 0) {
        // Draw already placed wall segments as preview
        for (let i = 0; i < state.drawingPoints.length - 1; i++) {
          engine.drawPreviewLine(
            state.drawingPoints[i],
            state.drawingPoints[i + 1],
            state.wallThickness
          );
        }

        // Draw from last point to current mouse position
        const lastPoint = state.drawingPoints[state.drawingPoints.length - 1];
        let cursorPoint = { ...state.mouseWorld };

        // Apply snap
        if (state.snapToGrid) {
          const snap = findSnapPoint(cursorPoint, state.walls, state.gridSize, true);
          cursorPoint = snap.point;
          if (snap.snapped && snap.snapType) {
            engine.drawSnapIndicator(cursorPoint, snap.snapType);
          }
        }

        // Apply angle snap
        if (state.shiftHeld) {
          cursorPoint = snapToAngle(lastPoint, cursorPoint, true);
        }

        engine.drawPreviewLine(lastPoint, cursorPoint, state.wallThickness);
        engine.drawDrawingPoints(state.drawingPoints);
      }

      // Measure
      if (state.measurePoints.length === 2) {
        engine.drawMeasureLine(state.measurePoints[0], state.measurePoints[1]);
      } else if (state.measurePoints.length === 1) {
        engine.drawMeasureLine(state.measurePoints[0], state.mouseWorld);
      }

      // Snap indicator when not drawing
      if (!state.isDrawing && state.snapToGrid && (state.tool === 'wall' || state.tool === 'measure')) {
        const snap = findSnapPoint(state.mouseWorld, state.walls, state.gridSize, true);
        if (snap.snapped && snap.snapType) {
          engine.drawSnapIndicator(snap.point, snap.snapType);
        }
      }

      // Crosshair
      engine.drawCrosshair(state.mouseScreen.x, state.mouseScreen.y);

      // Hint text when empty
      if (state.walls.length === 0 && !state.isDrawing) {
        engine.drawHintText(
          '\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u00AB\u0421\u0442\u0435\u043D\u0430\u00BB \u0438 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043D\u0430 \u0445\u043E\u043B\u0441\u0442,\n\u0447\u0442\u043E\u0431\u044B \u043D\u0430\u0447\u0430\u0442\u044C \u0447\u0435\u0440\u0442\u0451\u0436'
        );
      }

      // Status bar
      engine.drawStatusBar(state.mouseWorld, state.viewState.zoom, state.tool);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state]);

  // Save callback
  useEffect(() => {
    if (onSave && state.walls.length > 0) {
      const timer = setTimeout(() => {
        onSave({ walls: state.walls, rooms: [] });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.walls, onSave]);

  // Get mouse position relative to canvas
  const getCanvasPos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // Find wall near a world point
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

  // Finish drawing walls from points
  const finishDrawing = useCallback(() => {
    const points = state.drawingPoints;
    if (points.length < 2) {
      dispatch({ type: 'CANCEL_DRAWING' });
      return;
    }

    // Create walls from consecutive point pairs
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

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasPos(e);
      const engine = engineRef.current;
      if (!engine) return;

      const worldPoint = engine.screenToWorld(pos.x, pos.y);

      // Middle mouse or right mouse = pan
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
    [state.tool, state.viewState, state.isDrawing, state.drawingPoints, state.walls, state.snapToGrid, state.gridSize, state.shiftHeld, state.wallThickness, getCanvasPos, findWallNear]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasPos(e);
      const engine = engineRef.current;
      if (!engine) return;

      const worldPoint = engine.screenToWorld(pos.x, pos.y);
      dispatch({ type: 'SET_MOUSE', world: worldPoint, screen: { x: pos.x, y: pos.y } });

      // Panning
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

      // Dragging a wall (select tool)
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

      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        dragWallIdRef.current = null;
        dispatch({ type: 'PUSH_HISTORY' });
      }

      // Suppress context menu for right-click pan
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

  // Use native wheel event listener so we can call preventDefault with passive:false
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

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Track shift
      if (e.key === 'Shift') {
        dispatch({ type: 'SET_SHIFT', held: true });
      }

      // Don't intercept if user is typing in an input
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

  // Toolbar callbacks
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
    const padding = 80;

    const worldW = maxX - minX || 1000;
    const worldH = maxY - minY || 1000;
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

      // Offset preset based on existing walls bounding box
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

      // Fit view after adding preset
      setTimeout(() => {
        handleFitView();
      }, 50);
    },
    [state.walls, state.wallThickness, handleFitView]
  );

  const handleExportPDF = useCallback(() => {
    // For now, simple canvas-to-image export
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'floor-plan.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  // Cursor style
  const getCursorClass = () => {
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
  };

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