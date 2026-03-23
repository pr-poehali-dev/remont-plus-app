import { useReducer, useRef, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  plannerReducer,
  initialState,
} from "@/components/planner/plannerTypes";
import type {
  PlannerTool,
  Point,
  Wall,
  PlacedFurniture,
  Opening,
} from "@/components/planner/plannerTypes";
import { PlannerCanvas2D } from "@/components/planner/plannerCanvas2d";
import { PlannerCanvas3D } from "@/components/planner/plannerCanvas3d";
import { FURNITURE_CATALOG } from "@/components/planner/furnitureCatalog";
import PlannerToolbar from "@/components/planner/PlannerToolbar";
import PlannerFurniturePanel from "@/components/planner/PlannerFurniturePanel";
import PlannerProperties from "@/components/planner/PlannerProperties";
import { exportPlannerPdf } from "@/components/planner/plannerPdfExport";

const STORAGE_KEY = "planner_project";
const SAVE_DELAY = 1000;
const ZOOM_FACTOR = 1.12;
const HIT_THRESHOLD = 200;

const catalogMap = new Map(FURNITURE_CATALOG.map((i) => [i.id, i]));

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function pointInRotatedRect(
  px: number,
  py: number,
  cx: number,
  cy: number,
  w: number,
  d: number,
  rotation: number
): boolean {
  const rad = (-rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - cx;
  const dy = py - cy;
  const lx = dx * cos - dy * sin;
  const ly = dx * sin + dy * cos;
  return Math.abs(lx) <= w / 2 && Math.abs(ly) <= d / 2;
}

function makeWall(
  start: Point,
  end: Point,
  thickness: number,
  openings: Opening[] = []
): Wall {
  return { id: uid(), start, end, thickness, openings };
}

function makeOpening(
  type: "door" | "window",
  position: number,
  width: number,
  direction?: "left" | "right"
): Opening {
  return { id: uid(), type, position, width, direction };
}

function generatePreset(
  presetId: string,
  thickness: number
): { walls: Wall[]; furniture: PlacedFurniture[] } {
  const t = thickness;
  const furniture: PlacedFurniture[] = [];

  switch (presetId) {
    case "studio": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 7000, y: 0 }, t, [
          makeOpening("window", 0.5, 1500),
        ]),
        makeWall({ x: 7000, y: 0 }, { x: 7000, y: 4000 }, t, [
          makeOpening("window", 0.5, 1200),
        ]),
        makeWall({ x: 7000, y: 4000 }, { x: 0, y: 4000 }, t, [
          makeOpening("door", 0.15, 900, "left"),
        ]),
        makeWall({ x: 0, y: 4000 }, { x: 0, y: 0 }, t),
        makeWall({ x: 4000, y: 0 }, { x: 4000, y: 4000 }, t, [
          makeOpening("door", 0.5, 800, "right"),
        ]),
      ];
      return { walls, furniture };
    }
    case "living": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 5000, y: 0 }, t, [
          makeOpening("window", 0.5, 1800),
        ]),
        makeWall({ x: 5000, y: 0 }, { x: 5000, y: 4000 }, t, [
          makeOpening("window", 0.5, 1400),
        ]),
        makeWall({ x: 5000, y: 4000 }, { x: 0, y: 4000 }, t, [
          makeOpening("door", 0.2, 900, "left"),
        ]),
        makeWall({ x: 0, y: 4000 }, { x: 0, y: 0 }, t),
      ];
      return { walls, furniture };
    }
    case "bedroom": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 4000, y: 0 }, t, [
          makeOpening("window", 0.5, 1500),
        ]),
        makeWall({ x: 4000, y: 0 }, { x: 4000, y: 3500 }, t),
        makeWall({ x: 4000, y: 3500 }, { x: 0, y: 3500 }, t, [
          makeOpening("door", 0.25, 800, "left"),
        ]),
        makeWall({ x: 0, y: 3500 }, { x: 0, y: 0 }, t),
      ];
      return { walls, furniture };
    }
    case "kitchen": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 4000, y: 0 }, t, [
          makeOpening("window", 0.5, 1400),
        ]),
        makeWall({ x: 4000, y: 0 }, { x: 4000, y: 3000 }, t),
        makeWall({ x: 4000, y: 3000 }, { x: 0, y: 3000 }, t, [
          makeOpening("door", 0.2, 800, "right"),
        ]),
        makeWall({ x: 0, y: 3000 }, { x: 0, y: 0 }, t),
      ];
      return { walls, furniture };
    }
    case "bathroom": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 2500, y: 0 }, t),
        makeWall({ x: 2500, y: 0 }, { x: 2500, y: 2000 }, t),
        makeWall({ x: 2500, y: 2000 }, { x: 0, y: 2000 }, t, [
          makeOpening("door", 0.5, 700, "left"),
        ]),
        makeWall({ x: 0, y: 2000 }, { x: 0, y: 0 }, t),
      ];
      return { walls, furniture };
    }
    case "hallway": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 6000, y: 0 }, t),
        makeWall({ x: 6000, y: 0 }, { x: 6000, y: 1500 }, t, [
          makeOpening("door", 0.5, 900, "right"),
        ]),
        makeWall({ x: 6000, y: 1500 }, { x: 0, y: 1500 }, t, [
          makeOpening("door", 0.8, 900, "left"),
        ]),
        makeWall({ x: 0, y: 1500 }, { x: 0, y: 0 }, t, [
          makeOpening("door", 0.5, 900, "left"),
        ]),
      ];
      return { walls, furniture };
    }
    default:
      return { walls: [], furniture: [] };
  }
}

function InteriorPlanner() {
  const navigate = useNavigate();

  useMeta({
    title: "3D-\u041F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0449\u0438\u043A \u0438\u043D\u0442\u0435\u0440\u044C\u0435\u0440\u0430 \u2014 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440 \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u043E\u043A \u043E\u043D\u043B\u0430\u0439\u043D",
    description:
      "\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0439 3D-\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0449\u0438\u043A \u0438\u043D\u0442\u0435\u0440\u044C\u0435\u0440\u0430: \u0440\u0438\u0441\u0443\u0439\u0442\u0435 \u0441\u0442\u0435\u043D\u044B, \u0440\u0430\u0441\u0441\u0442\u0430\u0432\u043B\u044F\u0439\u0442\u0435 \u043C\u0435\u0431\u0435\u043B\u044C, \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0439\u0442\u0435\u0441\u044C \u043C\u0435\u0436\u0434\u0443 2D \u0438 3D \u0432\u0438\u0434\u043E\u043C",
    canonical: "/interior-planner",
  });

  const [state, dispatch] = useReducer(plannerReducer, initialState);
  const [showFurniture, setShowFurniture] = useState(false);
  const [showProperties, setShowProperties] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engine2dRef = useRef<PlannerCanvas2D | null>(null);
  const engine3dRef = useRef<PlannerCanvas3D | null>(null);
  const stateRef = useRef(state);
  const animFrameRef = useRef(0);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetStartRef = useRef({ x: 0, y: 0 });
  const isDraggingFurnitureRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    engine2dRef.current = new PlannerCanvas2D(canvas);
    engine3dRef.current = new PlannerCanvas3D(canvas);

    function renderLoop() {
      const s = stateRef.current;
      if (s.viewMode === "2d" && engine2dRef.current) {
        engine2dRef.current.render(s);
      } else if (s.viewMode === "3d" && engine3dRef.current) {
        engine3dRef.current.render(s);
      }
      animFrameRef.current = requestAnimationFrame(renderLoop);
    }
    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    function resize() {
      if (!container || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [showFurniture, showProperties]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.walls)) {
          dispatch({
            type: "LOAD_DATA",
            payload: {
              walls: data.walls,
              furniture: data.furniture || [],
            },
          });
        }
      }
    } catch (_e) { /* storage read error */ }
  }, []);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ walls: state.walls, furniture: state.furniture })
        );
      } catch (_e) { /* storage write error */ }
    }, SAVE_DELAY);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.walls, state.furniture]);

  const getWorldPos = useCallback(
    (e: React.MouseEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas || !engine2dRef.current) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const view =
        stateRef.current.viewMode === "2d"
          ? stateRef.current.viewState
          : stateRef.current.viewState3d;
      return engine2dRef.current.screenToWorld(sx, sy, view);
    },
    []
  );

  const getScreenPos = useCallback(
    (e: React.MouseEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    []
  );

  const getSnappedPoint = useCallback(
    (world: Point): Point => {
      const s = stateRef.current;
      if (!s.snapToGrid || !engine2dRef.current) return world;
      const snap = engine2dRef.current.findSnapPoint(
        world,
        s.walls,
        s.gridSize
      );
      return snap ? snap.point : engine2dRef.current.snapToGrid(world, s.gridSize);
    },
    []
  );

  const hitTestFurniture = useCallback(
    (world: Point): PlacedFurniture | null => {
      const s = stateRef.current;
      for (let i = s.furniture.length - 1; i >= 0; i--) {
        const f = s.furniture[i];
        const cat = catalogMap.get(f.itemId);
        if (!cat) continue;
        if (
          pointInRotatedRect(
            world.x,
            world.y,
            f.x,
            f.y,
            cat.width,
            cat.depth,
            f.rotation
          )
        ) {
          return f;
        }
      }
      return null;
    },
    []
  );

  const hitTestWall = useCallback(
    (world: Point): Wall | null => {
      const s = stateRef.current;
      if (!engine2dRef.current) return null;
      let best: Wall | null = null;
      let bestDist = HIT_THRESHOLD;
      for (const w of s.walls) {
        const d = engine2dRef.current.distanceToSegment(
          world,
          w.start,
          w.end
        );
        if (d < bestDist) {
          bestDist = d;
          best = w;
        }
      }
      return best;
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const s = stateRef.current;
      const world = getWorldPos(e);
      const screen = getScreenPos(e);

      if (e.button === 1 || e.button === 2) {
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY };
        const view = s.viewMode === "2d" ? s.viewState : s.viewState3d;
        panOffsetStartRef.current = {
          x: view.offsetX,
          y: view.offsetY,
        };
        e.preventDefault();
        return;
      }

      if (s.viewMode === "3d") return;

      const snapped = getSnappedPoint(world);

      switch (s.tool) {
        case "select": {
          const hitFurn = hitTestFurniture(world);
          if (hitFurn) {
            dispatch({
              type: "SELECT",
              payload: { id: hitFurn.id, type: "furniture" },
            });
            isDraggingFurnitureRef.current = true;
            dragOffsetRef.current = {
              x: world.x - hitFurn.x,
              y: world.y - hitFurn.y,
            };
            return;
          }
          const hitW = hitTestWall(world);
          if (hitW) {
            dispatch({
              type: "SELECT",
              payload: { id: hitW.id, type: "wall" },
            });
            return;
          }
          dispatch({ type: "DESELECT" });
          break;
        }

        case "wall": {
          if (!s.isDrawing) {
            dispatch({ type: "START_DRAWING", payload: snapped });
          } else {
            const pts = s.drawingPoints;
            const lastPt = pts[pts.length - 1];
            const newWall = makeWall(lastPt, snapped, s.wallThickness);
            dispatch({ type: "ADD_WALL", payload: newWall });
            dispatch({ type: "ADD_DRAWING_POINT", payload: snapped });
            dispatch({ type: "PUSH_HISTORY" });
          }
          break;
        }

        case "door":
        case "window": {
          const hitW = hitTestWall(world);
          if (hitW && engine2dRef.current) {
            const pos = engine2dRef.current.positionOnWall(hitW, world);
            const opening = makeOpening(
              s.tool,
              pos,
              s.tool === "door" ? 900 : 1200,
              s.tool === "door" ? "left" : undefined
            );
            dispatch({
              type: "ADD_OPENING",
              payload: { wallId: hitW.id, opening },
            });
            dispatch({ type: "PUSH_HISTORY" });
          }
          break;
        }

        case "furniture": {
          if (s.dragFurnitureId) {
            const cat = catalogMap.get(s.dragFurnitureId);
            if (cat) {
              const placed: PlacedFurniture = {
                id: uid(),
                itemId: s.dragFurnitureId,
                x: snapped.x,
                y: snapped.y,
                rotation: 0,
                flipped: false,
              };
              dispatch({ type: "ADD_FURNITURE", payload: placed });
              dispatch({ type: "PUSH_HISTORY" });
              dispatch({ type: "SET_DRAG_FURNITURE", payload: null });
            }
          }
          break;
        }

        case "eraser": {
          const hitFurn = hitTestFurniture(world);
          if (hitFurn) {
            dispatch({ type: "DELETE_FURNITURE", payload: hitFurn.id });
            dispatch({ type: "PUSH_HISTORY" });
            return;
          }
          const hitW = hitTestWall(world);
          if (hitW) {
            dispatch({ type: "DELETE_WALL", payload: hitW.id });
            dispatch({ type: "PUSH_HISTORY" });
          }
          break;
        }

        case "measure": {
          dispatch({ type: "ADD_MEASURE_POINT", payload: snapped });
          break;
        }
      }
    },
    [getWorldPos, getScreenPos, getSnappedPoint, hitTestFurniture, hitTestWall]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const s = stateRef.current;
      const world = getWorldPos(e);
      const screen = getScreenPos(e);

      dispatch({
        type: "SET_MOUSE",
        payload: { world, screen },
      });

      if (isPanningRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        const actionType = s.viewMode === "2d" ? "SET_VIEW" : "SET_VIEW_3D";
        dispatch({
          type: actionType as "SET_VIEW",
          payload: {
            offsetX: panOffsetStartRef.current.x + dx,
            offsetY: panOffsetStartRef.current.y + dy,
          },
        });
        return;
      }

      if (isDraggingFurnitureRef.current && s.selectedId && s.selectedType === "furniture") {
        const snapped = getSnappedPoint({
          x: world.x - dragOffsetRef.current.x,
          y: world.y - dragOffsetRef.current.y,
        });
        dispatch({
          type: "UPDATE_FURNITURE",
          payload: { id: s.selectedId, x: snapped.x, y: snapped.y },
        });
      }
    },
    [getWorldPos, getScreenPos, getSnappedPoint]
  );

  const handleMouseUp = useCallback(
    () => {
      if (isDraggingFurnitureRef.current) {
        isDraggingFurnitureRef.current = false;
        dispatch({ type: "PUSH_HISTORY" });
      }
      isPanningRef.current = false;
    },
    []
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const s = stateRef.current;
      const is2d = s.viewMode === "2d";
      const view = is2d ? s.viewState : s.viewState3d;
      const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
      const newZoom = Math.max(0.005, Math.min(1, view.zoom * factor));

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cx = canvas.width / (window.devicePixelRatio || 1) / 2;
      const cy = canvas.height / (window.devicePixelRatio || 1) / 2;

      const newOffsetX = mx - cx - (mx - cx - view.offsetX) * (newZoom / view.zoom);
      const newOffsetY = my - cy - (my - cy - view.offsetY) * (newZoom / view.zoom);

      dispatch({
        type: is2d ? "SET_VIEW" : "SET_VIEW_3D",
        payload: { zoom: newZoom, offsetX: newOffsetX, offsetY: newOffsetY },
      });
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const itemId = e.dataTransfer.getData("text/plain") || stateRef.current.dragFurnitureId;
      if (!itemId) return;

      const cat = catalogMap.get(itemId);
      if (!cat) return;

      const canvas = canvasRef.current;
      if (!canvas || !engine2dRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const world = engine2dRef.current.screenToWorld(
        sx,
        sy,
        stateRef.current.viewState
      );
      const snapped = getSnappedPoint(world);

      const placed: PlacedFurniture = {
        id: uid(),
        itemId,
        x: snapped.x,
        y: snapped.y,
        rotation: 0,
        flipped: false,
      };
      dispatch({ type: "ADD_FURNITURE", payload: placed });
      dispatch({ type: "PUSH_HISTORY" });
      dispatch({ type: "SET_DRAG_FURNITURE", payload: null });
    },
    [getSnappedPoint]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const s = stateRef.current;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "Shift") {
        dispatch({ type: "SET_SHIFT", payload: true });
        return;
      }

      if (e.key === "Escape") {
        if (s.isDrawing) {
          dispatch({ type: "CANCEL_DRAWING" });
        } else {
          dispatch({ type: "DESELECT" });
        }
        return;
      }

      if (e.key === "Enter" && s.isDrawing) {
        dispatch({ type: "FINISH_DRAWING" });
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && s.selectedId) {
        if (s.selectedType === "wall") {
          dispatch({ type: "DELETE_WALL", payload: s.selectedId });
        } else if (s.selectedType === "furniture") {
          dispatch({ type: "DELETE_FURNITURE", payload: s.selectedId });
        }
        dispatch({ type: "PUSH_HISTORY" });
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
        return;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        ((e.key === "z" && e.shiftKey) || e.key === "y")
      ) {
        e.preventDefault();
        dispatch({ type: "REDO" });
        return;
      }

      if (e.key === "r" || e.key === "R") {
        if (s.selectedId && s.selectedType === "furniture") {
          const furn = s.furniture.find((f) => f.id === s.selectedId);
          if (furn) {
            dispatch({
              type: "UPDATE_FURNITURE",
              payload: {
                id: furn.id,
                rotation: (furn.rotation + 90) % 360,
              },
            });
            dispatch({ type: "PUSH_HISTORY" });
          }
        }
        return;
      }

      const toolKeys: Record<string, PlannerTool> = {
        v: "select",
        w: "wall",
        d: "door",
        n: "window",
        f: "furniture",
        m: "measure",
        e: "eraser",
      };
      const toolKey = toolKeys[e.key.toLowerCase()];
      if (toolKey && s.viewMode === "2d") {
        dispatch({ type: "SET_TOOL", payload: toolKey });
        return;
      }

      if (e.key === "g" || e.key === "G") {
        dispatch({ type: "TOGGLE_GRID" });
        return;
      }
      if (e.key === "s" && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: "TOGGLE_SNAP" });
        return;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "Shift") {
        dispatch({ type: "SET_SHIFT", payload: false });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleSetTool = useCallback((tool: PlannerTool) => {
    dispatch({ type: "SET_TOOL", payload: tool });
    if (tool === "furniture") {
      setShowFurniture(true);
    }
  }, []);

  const handleSetViewMode = useCallback((mode: "2d" | "3d") => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  const handleZoomIn = useCallback(() => {
    const s = stateRef.current;
    const is2d = s.viewMode === "2d";
    const view = is2d ? s.viewState : s.viewState3d;
    const newZoom = Math.min(1, view.zoom * 1.25);
    dispatch({
      type: is2d ? "SET_VIEW" : "SET_VIEW_3D",
      payload: { zoom: newZoom },
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    const s = stateRef.current;
    const is2d = s.viewMode === "2d";
    const view = is2d ? s.viewState : s.viewState3d;
    const newZoom = Math.max(0.005, view.zoom * 0.8);
    dispatch({
      type: is2d ? "SET_VIEW" : "SET_VIEW_3D",
      payload: { zoom: newZoom },
    });
  }, []);

  const handleFitView = useCallback(() => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const allPoints: Point[] = [];
    for (const w of s.walls) {
      allPoints.push(w.start, w.end);
    }
    for (const f of s.furniture) {
      const cat = catalogMap.get(f.itemId);
      const hw = cat ? cat.width / 2 : 500;
      const hd = cat ? cat.depth / 2 : 500;
      allPoints.push(
        { x: f.x - hw, y: f.y - hd },
        { x: f.x + hw, y: f.y + hd }
      );
    }

    if (allPoints.length === 0) return;

    const minX = Math.min(...allPoints.map((p) => p.x));
    const maxX = Math.max(...allPoints.map((p) => p.x));
    const minY = Math.min(...allPoints.map((p) => p.y));
    const maxY = Math.max(...allPoints.map((p) => p.y));

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    const padding = 100;

    const rangeX = maxX - minX || 1000;
    const rangeY = maxY - minY || 1000;

    const zoom = Math.min(
      (cw - padding * 2) / rangeX,
      (ch - padding * 2) / rangeY
    );

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const is2d = s.viewMode === "2d";
    dispatch({
      type: is2d ? "SET_VIEW" : "SET_VIEW_3D",
      payload: {
        zoom,
        offsetX: -centerX * zoom,
        offsetY: -centerY * zoom,
      },
    });
  }, []);

  const handleAddPreset = useCallback(
    (presetId: string) => {
      const data = generatePreset(presetId, stateRef.current.wallThickness);
      dispatch({ type: "LOAD_DATA", payload: data });
      dispatch({ type: "PUSH_HISTORY" });
      setTimeout(() => handleFitView(), 50);
    },
    [handleFitView]
  );

  const handleAddFurnitureFromPanel = useCallback(
    (itemId: string) => {
      const cat = catalogMap.get(itemId);
      if (!cat) return;

      const s = stateRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !engine2dRef.current) return;

      const dpr = window.devicePixelRatio || 1;
      const cx = canvas.width / dpr / 2;
      const cy = canvas.height / dpr / 2;
      const center = engine2dRef.current.screenToWorld(cx, cy, s.viewState);

      const placed: PlacedFurniture = {
        id: uid(),
        itemId,
        x: Math.round(center.x / 100) * 100,
        y: Math.round(center.y / 100) * 100,
        rotation: 0,
        flipped: false,
      };
      dispatch({ type: "ADD_FURNITURE", payload: placed });
      dispatch({ type: "PUSH_HISTORY" });
      dispatch({ type: "SELECT", payload: { id: placed.id, type: "furniture" } });
    },
    []
  );

  const handleDragStartFromPanel = useCallback((itemId: string) => {
    dispatch({ type: "SET_DRAG_FURNITURE", payload: itemId });
  }, []);

  const handleUpdateWall = useCallback(
    (id: string, updates: Partial<Wall>) => {
      dispatch({ type: "UPDATE_WALL", payload: { id, ...updates } });
      dispatch({ type: "PUSH_HISTORY" });
    },
    []
  );

  const handleDeleteWall = useCallback((id: string) => {
    dispatch({ type: "DELETE_WALL", payload: id });
    dispatch({ type: "PUSH_HISTORY" });
  }, []);

  const handleUpdateFurniture = useCallback(
    (id: string, updates: Partial<PlacedFurniture>) => {
      dispatch({ type: "UPDATE_FURNITURE", payload: { id, ...updates } });
      dispatch({ type: "PUSH_HISTORY" });
    },
    []
  );

  const handleDeleteFurniture = useCallback((id: string) => {
    dispatch({ type: "DELETE_FURNITURE", payload: id });
    dispatch({ type: "PUSH_HISTORY" });
  }, []);

  const handleAddOpening = useCallback(
    (wallId: string, type: "door" | "window") => {
      const opening = makeOpening(
        type,
        0.5,
        type === "door" ? 900 : 1200,
        type === "door" ? "left" : undefined
      );
      dispatch({
        type: "ADD_OPENING",
        payload: { wallId, opening },
      });
      dispatch({ type: "PUSH_HISTORY" });
    },
    []
  );

  const handleDeleteOpening = useCallback(
    (wallId: string, openingId: string) => {
      dispatch({
        type: "DELETE_OPENING",
        payload: { wallId, openingId },
      });
      dispatch({ type: "PUSH_HISTORY" });
    },
    []
  );

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