import { useRef, useEffect, RefObject } from 'react';
import { Wall, ConstructorState } from './types';
import {
  CanvasEngine,
  findSnapPoint,
  snapToAngle,
  wallLength,
} from './canvasEngine';

export function useCanvasRenderer(
  state: ConstructorState,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  engineRef: RefObject<CanvasEngine | null>,
  onSave?: (data: { walls: Wall[]; rooms: never[] }) => void,
) {
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new CanvasEngine(canvas);
    (engineRef as React.MutableRefObject<CanvasEngine | null>).current = engine;

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

  useEffect(() => {
    const render = () => {
      const engine = engineRef.current;
      if (!engine) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      engine.setViewState(state.viewState);
      engine.clear();

      if (state.showGrid) {
        engine.drawGrid(state.gridSize);
      }

      for (const wall of state.walls) {
        const isSelected = wall.id === state.selectedId;
        engine.drawWall(wall, isSelected);

        for (const opening of wall.openings) {
          engine.drawOpening(wall, opening);
        }

        if (state.showDimensions && wallLength(wall) > 0) {
          engine.drawDimensionLine(wall.start, wall.end, 30);
        }
      }

      if (state.isDrawing && state.drawingPoints.length > 0) {
        for (let i = 0; i < state.drawingPoints.length - 1; i++) {
          engine.drawPreviewLine(
            state.drawingPoints[i],
            state.drawingPoints[i + 1],
            state.wallThickness
          );
        }

        const lastPoint = state.drawingPoints[state.drawingPoints.length - 1];
        let cursorPoint = { ...state.mouseWorld };

        if (state.snapToGrid) {
          const snap = findSnapPoint(cursorPoint, state.walls, state.gridSize, true);
          cursorPoint = snap.point;
          if (snap.snapped && snap.snapType) {
            engine.drawSnapIndicator(cursorPoint, snap.snapType);
          }
        }

        if (state.shiftHeld) {
          cursorPoint = snapToAngle(lastPoint, cursorPoint, true);
        }

        engine.drawPreviewLine(lastPoint, cursorPoint, state.wallThickness);
        engine.drawDrawingPoints(state.drawingPoints);
      }

      if (state.measurePoints.length === 2) {
        engine.drawMeasureLine(state.measurePoints[0], state.measurePoints[1]);
      } else if (state.measurePoints.length === 1) {
        engine.drawMeasureLine(state.measurePoints[0], state.mouseWorld);
      }

      if (!state.isDrawing && state.snapToGrid && (state.tool === 'wall' || state.tool === 'measure')) {
        const snap = findSnapPoint(state.mouseWorld, state.walls, state.gridSize, true);
        if (snap.snapped && snap.snapType) {
          engine.drawSnapIndicator(snap.point, snap.snapType);
        }
      }

      engine.drawCrosshair(state.mouseScreen.x, state.mouseScreen.y);

      if (state.walls.length === 0 && !state.isDrawing) {
        engine.drawHintText(
          '\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u00AB\u0421\u0442\u0435\u043D\u0430\u00BB \u0438 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043D\u0430 \u0445\u043E\u043B\u0441\u0442,\n\u0447\u0442\u043E\u0431\u044B \u043D\u0430\u0447\u0430\u0442\u044C \u0447\u0435\u0440\u0442\u0451\u0436'
        );
      }

      engine.drawStatusBar(state.mouseWorld, state.viewState.zoom, state.tool);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state]);

  useEffect(() => {
    if (onSave && state.walls.length > 0) {
      const timer = setTimeout(() => {
        onSave({ walls: state.walls, rooms: [] });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.walls, onSave]);
}
