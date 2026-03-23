import { useRef, useEffect, useCallback } from "react";
import { PlannerCanvas2D } from "@/components/planner/plannerCanvas2d";
import { PlannerCanvas3D } from "@/components/planner/plannerCanvas3d";
import type { PlannerState, PlannerAction, Point } from "@/components/planner/plannerTypes";
import { STORAGE_KEY, SAVE_DELAY } from "./plannerUtils";

interface UsePlannerCanvasArgs {
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
  showFurniture: boolean;
  showProperties: boolean;
}

export function usePlannerCanvas({
  state,
  dispatch,
  showFurniture,
  showProperties,
}: UsePlannerCanvasArgs) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engine2dRef = useRef<PlannerCanvas2D | null>(null);
  const engine3dRef = useRef<PlannerCanvas3D | null>(null);
  const stateRef = useRef(state);
  const animFrameRef = useRef(0);
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

  return {
    canvasRef,
    containerRef,
    engine2dRef,
    engine3dRef,
    stateRef,
    getWorldPos,
    getScreenPos,
    getSnappedPoint,
  };
}

export default usePlannerCanvas;