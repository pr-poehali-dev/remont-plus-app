import { useCallback, useEffect, useRef } from "react";
import type {
  PlannerAction,
  PlannerState,
  PlannerTool,
  Point,
  Wall,
  PlacedFurniture,
} from "@/components/planner/plannerTypes";
import { PlannerCanvas2D } from "@/components/planner/plannerCanvas2d";
import {
  ZOOM_FACTOR,
  HIT_THRESHOLD,
  catalogMap,
  uid,
  pointInRotatedRect,
  makeWall,
  makeOpening,
  generatePreset,
} from "./plannerUtils";

interface UsePlannerInteractionArgs {
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
  stateRef: React.MutableRefObject<PlannerState>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  engine2dRef: React.MutableRefObject<PlannerCanvas2D | null>;
  getWorldPos: (e: React.MouseEvent) => Point;
  getScreenPos: (e: React.MouseEvent) => Point;
  getSnappedPoint: (world: Point) => Point;
  setShowFurniture: React.Dispatch<React.SetStateAction<boolean>>;
}

export function usePlannerInteraction({
  state,
  dispatch,
  stateRef,
  canvasRef,
  engine2dRef,
  getWorldPos,
  getScreenPos,
  getSnappedPoint,
  setShowFurniture,
}: UsePlannerInteractionArgs) {
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetStartRef = useRef({ x: 0, y: 0 });
  const isDraggingFurnitureRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

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
    [stateRef]
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
    [stateRef, engine2dRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const s = stateRef.current;
      const world = getWorldPos(e);

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
    [getWorldPos, getSnappedPoint, hitTestFurniture, hitTestWall, stateRef, engine2dRef, dispatch]
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
    [getWorldPos, getScreenPos, getSnappedPoint, stateRef, dispatch]
  );

  const handleMouseUp = useCallback(
    () => {
      if (isDraggingFurnitureRef.current) {
        isDraggingFurnitureRef.current = false;
        dispatch({ type: "PUSH_HISTORY" });
      }
      isPanningRef.current = false;
    },
    [dispatch]
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
    [stateRef, canvasRef, dispatch]
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
    [getSnappedPoint, stateRef, canvasRef, engine2dRef, dispatch]
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
  }, [stateRef, dispatch]);

  const handleSetTool = useCallback((tool: PlannerTool) => {
    dispatch({ type: "SET_TOOL", payload: tool });
    if (tool === "furniture") {
      setShowFurniture(true);
    }
  }, [dispatch, setShowFurniture]);

  const handleSetViewMode = useCallback((mode: "2d" | "3d") => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, [dispatch]);

  const handleZoomIn = useCallback(() => {
    const s = stateRef.current;
    const is2d = s.viewMode === "2d";
    const view = is2d ? s.viewState : s.viewState3d;
    const newZoom = Math.min(1, view.zoom * 1.25);
    dispatch({
      type: is2d ? "SET_VIEW" : "SET_VIEW_3D",
      payload: { zoom: newZoom },
    });
  }, [stateRef, dispatch]);

  const handleZoomOut = useCallback(() => {
    const s = stateRef.current;
    const is2d = s.viewMode === "2d";
    const view = is2d ? s.viewState : s.viewState3d;
    const newZoom = Math.max(0.005, view.zoom * 0.8);
    dispatch({
      type: is2d ? "SET_VIEW" : "SET_VIEW_3D",
      payload: { zoom: newZoom },
    });
  }, [stateRef, dispatch]);

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
  }, [stateRef, canvasRef, dispatch]);

  const handleAddPreset = useCallback(
    (presetId: string) => {
      const data = generatePreset(presetId, stateRef.current.wallThickness);
      dispatch({ type: "LOAD_DATA", payload: data });
      dispatch({ type: "PUSH_HISTORY" });
      setTimeout(() => handleFitView(), 50);
    },
    [handleFitView, stateRef, dispatch]
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
    [stateRef, canvasRef, engine2dRef, dispatch]
  );

  const handleDragStartFromPanel = useCallback((itemId: string) => {
    dispatch({ type: "SET_DRAG_FURNITURE", payload: itemId });
  }, [dispatch]);

  const handleUpdateWall = useCallback(
    (id: string, updates: Partial<Wall>) => {
      dispatch({ type: "UPDATE_WALL", payload: { id, ...updates } });
      dispatch({ type: "PUSH_HISTORY" });
    },
    [dispatch]
  );

  const handleDeleteWall = useCallback((id: string) => {
    dispatch({ type: "DELETE_WALL", payload: id });
    dispatch({ type: "PUSH_HISTORY" });
  }, [dispatch]);

  const handleUpdateFurniture = useCallback(
    (id: string, updates: Partial<PlacedFurniture>) => {
      dispatch({ type: "UPDATE_FURNITURE", payload: { id, ...updates } });
      dispatch({ type: "PUSH_HISTORY" });
    },
    [dispatch]
  );

  const handleDeleteFurniture = useCallback((id: string) => {
    dispatch({ type: "DELETE_FURNITURE", payload: id });
    dispatch({ type: "PUSH_HISTORY" });
  }, [dispatch]);

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
    [dispatch]
  );

  const handleDeleteOpening = useCallback(
    (wallId: string, openingId: string) => {
      dispatch({
        type: "DELETE_OPENING",
        payload: { wallId, openingId },
      });
      dispatch({ type: "PUSH_HISTORY" });
    },
    [dispatch]
  );

  return {
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
  };
}

export default usePlannerInteraction;
