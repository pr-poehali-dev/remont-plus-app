import type {
  Point,
  Wall,
  Opening,
  PlacedFurniture,
  PlannerState,
  ViewState,
} from "./plannerTypes";
import { FURNITURE_CATALOG } from "./furnitureCatalog";
import type { FurnitureItem } from "./furnitureCatalog";

const COLOR_BG = "#1a1a2e";
const COLOR_GRID_MAJOR = "rgba(255,255,255,0.07)";
const COLOR_GRID_MINOR = "rgba(255,255,255,0.025)";
const COLOR_WALL = "#00d4ff";
const COLOR_SELECTED = "#ffdd57";
const COLOR_DOOR = "#4ade80";
const COLOR_WINDOW = "#60a5fa";
const COLOR_DIMENSION = "#ff6b35";
const COLOR_MEASURE = "#f472b6";
const COLOR_SNAP = "#22d3ee";
const COLOR_PREVIEW = "rgba(0,212,255,0.4)";
const COLOR_LABEL = "rgba(255,255,255,0.5)";
const COLOR_STATUS_BG = "rgba(0,0,0,0.6)";
const COLOR_STATUS_TEXT = "rgba(255,255,255,0.8)";
const COLOR_CROSSHAIR = "rgba(255,255,255,0.15)";
const COLOR_ENDPOINT = "#00d4ff";
const SNAP_RADIUS = 150;

const catalogMap = new Map<string, FurnitureItem>();
for (const item of FURNITURE_CATALOG) {
  catalogMap.set(item.id, item);
}

function darkenColor(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}

export class PlannerCanvas2D {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot get 2d context");
    this.ctx = ctx;
  }

  screenToWorld(sx: number, sy: number, view: ViewState): Point {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    return {
      x: (sx - cx - view.offsetX) / view.zoom,
      y: (sy - cy - view.offsetY) / view.zoom,
    };
  }

  worldToScreen(wx: number, wy: number, view: ViewState): Point {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    return {
      x: wx * view.zoom + cx + view.offsetX,
      y: wy * view.zoom + cy + view.offsetY,
    };
  }

  snapToGrid(p: Point, gridSize: number): Point {
    return {
      x: Math.round(p.x / gridSize) * gridSize,
      y: Math.round(p.y / gridSize) * gridSize,
    };
  }

  findSnapPoint(
    p: Point,
    walls: Wall[],
    gridSize: number,
    excludeWallId?: string
  ): { point: Point; type: "endpoint" | "grid" | "midpoint" } | null {
    let best: { point: Point; type: "endpoint" | "grid" | "midpoint" } | null =
      null;
    let bestDist = SNAP_RADIUS;

    for (const w of walls) {
      if (w.id === excludeWallId) continue;

      const dStart = Math.hypot(p.x - w.start.x, p.y - w.start.y);
      if (dStart < bestDist) {
        bestDist = dStart;
        best = { point: { ...w.start }, type: "endpoint" };
      }

      const dEnd = Math.hypot(p.x - w.end.x, p.y - w.end.y);
      if (dEnd < bestDist) {
        bestDist = dEnd;
        best = { point: { ...w.end }, type: "endpoint" };
      }

      const mid: Point = {
        x: (w.start.x + w.end.x) / 2,
        y: (w.start.y + w.end.y) / 2,
      };
      const dMid = Math.hypot(p.x - mid.x, p.y - mid.y);
      if (dMid < bestDist) {
        bestDist = dMid;
        best = { point: mid, type: "midpoint" };
      }
    }

    if (best) return best;

    const snapped = this.snapToGrid(p, gridSize);
    const dGrid = Math.hypot(p.x - snapped.x, p.y - snapped.y);
    if (dGrid < gridSize) {
      return { point: snapped, type: "grid" };
    }

    return null;
  }

  distanceToSegment(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const proj = { x: a.x + t * dx, y: a.y + t * dy };
    return Math.hypot(p.x - proj.x, p.y - proj.y);
  }

  wallLength(wall: Wall): number {
    return Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
  }

  formatDimension(mm: number): string {
    const rounded = Math.round(mm);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  positionOnWall(wall: Wall, point: Point): number {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return 0;
    const t = ((point.x - wall.start.x) * dx + (point.y - wall.start.y) * dy) / lenSq;
    return Math.max(0, Math.min(1, t));
  }

  render(state: PlannerState): void {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    const view = state.viewState;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, w, h);

    if (state.showGrid) {
      this.drawGrid(view, state.gridSize, w, h);
    }

    for (const wall of state.walls) {
      const isSelected =
        state.selectedId === wall.id && state.selectedType === "wall";
      this.drawWall(wall, view, isSelected);
      for (const opening of wall.openings) {
        this.drawOpening(opening, wall, view);
      }
    }

    for (const furn of state.furniture) {
      const isSelected =
        state.selectedId === furn.id && state.selectedType === "furniture";
      this.drawFurniture(furn, view, isSelected);
    }

    if (state.showDimensions) {
      for (const wall of state.walls) {
        this.drawDimensionLine(wall.start, wall.end, view);
      }
    }

    if (state.isDrawing && state.drawingPoints.length > 0) {
      this.drawPreviewWall(state.drawingPoints, state.mouseWorld, view);
    }

    if (state.snapToGrid && (state.tool === "wall" || state.tool === "furniture")) {
      const snap = this.findSnapPoint(
        state.mouseWorld,
        state.walls,
        state.gridSize
      );
      if (snap) {
        this.drawSnapIndicator(snap.point, snap.type, view);
      }
    }

    if (state.measurePoints.length > 0) {
      this.drawMeasureLine(state.measurePoints, view);
    }

    if (state.tool !== "select") {
      this.drawCrosshair(state.mouseScreen);
    }

    this.drawStatusBar(state);
  }

  private drawGrid(
    view: ViewState,
    gridSize: number,
    width: number,
    height: number
  ): void {
    const ctx = this.ctx;
    const topLeft = this.screenToWorld(0, 0, view);
    const bottomRight = this.screenToWorld(width, height, view);

    const minorStep = gridSize;
    const majorStep = gridSize * 10;

    const startX = Math.floor(topLeft.x / minorStep) * minorStep;
    const endX = Math.ceil(bottomRight.x / minorStep) * minorStep;
    const startY = Math.floor(topLeft.y / minorStep) * minorStep;
    const endY = Math.ceil(bottomRight.y / minorStep) * minorStep;

    ctx.lineWidth = 1;

    ctx.strokeStyle = COLOR_GRID_MINOR;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += minorStep) {
      if (x % majorStep === 0) continue;
      const s = this.worldToScreen(x, 0, view);
      ctx.moveTo(Math.round(s.x) + 0.5, 0);
      ctx.lineTo(Math.round(s.x) + 0.5, height);
    }
    for (let y = startY; y <= endY; y += minorStep) {
      if (y % majorStep === 0) continue;
      const s = this.worldToScreen(0, y, view);
      ctx.moveTo(0, Math.round(s.y) + 0.5);
      ctx.lineTo(width, Math.round(s.y) + 0.5);
    }
    ctx.stroke();

    ctx.strokeStyle = COLOR_GRID_MAJOR;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += minorStep) {
      if (x % majorStep !== 0) continue;
      const s = this.worldToScreen(x, 0, view);
      ctx.moveTo(Math.round(s.x) + 0.5, 0);
      ctx.lineTo(Math.round(s.x) + 0.5, height);
    }
    for (let y = startY; y <= endY; y += minorStep) {
      if (y % majorStep !== 0) continue;
      const s = this.worldToScreen(0, y, view);
      ctx.moveTo(0, Math.round(s.y) + 0.5);
      ctx.lineTo(width, Math.round(s.y) + 0.5);
    }
    ctx.stroke();

    ctx.font = "10px monospace";
    ctx.fillStyle = COLOR_LABEL;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    for (let x = startX; x <= endX; x += majorStep) {
      const s = this.worldToScreen(x, 0, view);
      if (s.x < 0 || s.x > width) continue;
      const label = Math.abs(x) >= 1000 ? `${(x / 1000).toFixed(1)}m` : `${x}`;
      ctx.fillText(label, s.x + 3, 3);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    for (let y = startY; y <= endY; y += majorStep) {
      const s = this.worldToScreen(0, y, view);
      if (s.y < 0 || s.y > height) continue;
      const label = Math.abs(y) >= 1000 ? `${(y / 1000).toFixed(1)}m` : `${y}`;
      ctx.fillText(label, 3, s.y + 3);
    }
  }

  private drawWall(wall: Wall, view: ViewState, isSelected: boolean): void {
    const ctx = this.ctx;
    const s1 = this.worldToScreen(wall.start.x, wall.start.y, view);
    const s2 = this.worldToScreen(wall.end.x, wall.end.y, view);

    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const nx = -dy / len;
    const ny = dx / len;
    const halfT = wall.thickness / 2;

    const c1 = this.worldToScreen(
      wall.start.x + nx * halfT,
      wall.start.y + ny * halfT,
      view
    );
    const c2 = this.worldToScreen(
      wall.end.x + nx * halfT,
      wall.end.y + ny * halfT,
      view
    );
    const c3 = this.worldToScreen(
      wall.end.x - nx * halfT,
      wall.end.y - ny * halfT,
      view
    );
    const c4 = this.worldToScreen(
      wall.start.x - nx * halfT,
      wall.start.y - ny * halfT,
      view
    );

    ctx.beginPath();
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(c3.x, c3.y);
    ctx.lineTo(c4.x, c4.y);
    ctx.closePath();

    ctx.fillStyle = isSelected
      ? hexToRgba(COLOR_SELECTED, 0.3)
      : hexToRgba(COLOR_WALL, 0.15);
    ctx.fill();

    ctx.strokeStyle = isSelected ? COLOR_SELECTED : COLOR_WALL;
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.setLineDash([]);
    ctx.stroke();

    const endpointRadius = Math.max(3, 4 * view.zoom * 10);
    ctx.fillStyle = isSelected ? COLOR_SELECTED : COLOR_ENDPOINT;
    ctx.beginPath();
    ctx.arc(s1.x, s1.y, endpointRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s2.x, s2.y, endpointRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawOpening(opening: Opening, wall: Wall, view: ViewState): void {
    const ctx = this.ctx;
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    const halfW = opening.width / 2;
    const halfT = wall.thickness / 2;

    const cx = wall.start.x + dx * opening.position;
    const cy = wall.start.y + dy * opening.position;

    const p1w = { x: cx - ux * halfW, y: cy - uy * halfW };
    const p2w = { x: cx + ux * halfW, y: cy + uy * halfW };

    if (opening.type === "door") {
      const gapC1n = this.worldToScreen(
        p1w.x + nx * halfT,
        p1w.y + ny * halfT,
        view
      );
      const gapC2n = this.worldToScreen(
        p2w.x + nx * halfT,
        p2w.y + ny * halfT,
        view
      );
      const gapC1f = this.worldToScreen(
        p1w.x - nx * halfT,
        p1w.y - ny * halfT,
        view
      );
      const gapC2f = this.worldToScreen(
        p2w.x - nx * halfT,
        p2w.y - ny * halfT,
        view
      );

      ctx.fillStyle = COLOR_BG;
      ctx.beginPath();
      ctx.moveTo(gapC1n.x, gapC1n.y);
      ctx.lineTo(gapC2n.x, gapC2n.y);
      ctx.lineTo(gapC2f.x, gapC2f.y);
      ctx.lineTo(gapC1f.x, gapC1f.y);
      ctx.closePath();
      ctx.fill();

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = COLOR_DOOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gapC1n.x, gapC1n.y);
      ctx.lineTo(gapC2n.x, gapC2n.y);
      ctx.lineTo(gapC2f.x, gapC2f.y);
      ctx.lineTo(gapC1f.x, gapC1f.y);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      const dir = opening.direction === "right" ? -1 : 1;
      const hingeW = opening.direction === "right" ? p2w : p1w;
      const hinge = this.worldToScreen(hingeW.x, hingeW.y, view);
      const arcRadius = opening.width * view.zoom;

      const wallAngle = Math.atan2(dy, dx);
      const startAngle =
        dir === 1 ? wallAngle + Math.PI : wallAngle;
      const endAngle = startAngle + (dir * Math.PI) / 2;

      ctx.strokeStyle = COLOR_DOOR;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hinge.x, hinge.y, arcRadius, startAngle, endAngle, dir < 0);
      ctx.stroke();

      const doorEndX = hingeW.x + Math.cos(endAngle) * opening.width;
      const doorEndY = hingeW.y + Math.sin(endAngle) * opening.width;
      const doorEndS = this.worldToScreen(doorEndX, doorEndY, view);

      ctx.strokeStyle = COLOR_DOOR;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hinge.x, hinge.y);
      ctx.lineTo(doorEndS.x, doorEndS.y);
      ctx.stroke();
    } else {
      const offsets = [-halfT, 0, halfT];
      ctx.strokeStyle = COLOR_WINDOW;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      const gapC1n = this.worldToScreen(
        p1w.x + nx * halfT,
        p1w.y + ny * halfT,
        view
      );
      const gapC2n = this.worldToScreen(
        p2w.x + nx * halfT,
        p2w.y + ny * halfT,
        view
      );
      const gapC1f = this.worldToScreen(
        p1w.x - nx * halfT,
        p1w.y - ny * halfT,
        view
      );
      const gapC2f = this.worldToScreen(
        p2w.x - nx * halfT,
        p2w.y - ny * halfT,
        view
      );

      ctx.fillStyle = COLOR_BG;
      ctx.beginPath();
      ctx.moveTo(gapC1n.x, gapC1n.y);
      ctx.lineTo(gapC2n.x, gapC2n.y);
      ctx.lineTo(gapC2f.x, gapC2f.y);
      ctx.lineTo(gapC1f.x, gapC1f.y);
      ctx.closePath();
      ctx.fill();

      for (const off of offsets) {
        const lp1 = this.worldToScreen(
          p1w.x + nx * off,
          p1w.y + ny * off,
          view
        );
        const lp2 = this.worldToScreen(
          p2w.x + nx * off,
          p2w.y + ny * off,
          view
        );
        ctx.lineWidth = off === 0 ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.moveTo(lp1.x, lp1.y);
        ctx.lineTo(lp2.x, lp2.y);
        ctx.stroke();
      }
    }
  }

  private drawFurniture(
    item: PlacedFurniture,
    view: ViewState,
    isSelected: boolean
  ): void {
    const ctx = this.ctx;
    const catalogItem = catalogMap.get(item.itemId);
    if (!catalogItem) return;

    const center = this.worldToScreen(item.x, item.y, view);
    const sw = catalogItem.width * view.zoom;
    const sd = catalogItem.depth * view.zoom;
    const rad = (item.rotation * Math.PI) / 180;

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rad);
    if (item.flipped) {
      ctx.scale(-1, 1);
    }

    ctx.fillStyle = hexToRgba(catalogItem.color, 0.7);
    ctx.fillRect(-sw / 2, -sd / 2, sw, sd);

    ctx.strokeStyle = darkenColor(catalogItem.color, 40);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.strokeRect(-sw / 2, -sd / 2, sw, sd);

    if (isSelected) {
      ctx.strokeStyle = COLOR_SELECTED;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(-sw / 2 - 3, -sd / 2 - 3, sw + 6, sd + 6);
      ctx.setLineDash([]);

      const markerR = 4;
      ctx.fillStyle = COLOR_SELECTED;
      const corners = [
        [-sw / 2 - 3, -sd / 2 - 3],
        [sw / 2 + 3, -sd / 2 - 3],
        [sw / 2 + 3, sd / 2 + 3],
        [-sw / 2 - 3, sd / 2 + 3],
      ];
      for (const [mx, my] of corners) {
        ctx.beginPath();
        ctx.arc(mx, my, markerR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const minDim = Math.min(sw, sd);
    const emojiSize = Math.max(10, Math.min(minDim * 0.5, 40));
    ctx.font = `${emojiSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(catalogItem.icon, 0, 0);

    const labelSize = Math.max(8, Math.min(minDim * 0.15, 12));
    if (labelSize >= 8 && sd > 20) {
      ctx.font = `${labelSize}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(catalogItem.name, 0, sd / 2 + 4);
    }

    ctx.restore();
  }

  private drawDimensionLine(start: Point, end: Point, view: ViewState): void {
    const ctx = this.ctx;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;

    const nx = -dy / len;
    const ny = dx / len;
    const offset = 250;

    const a: Point = { x: start.x + nx * offset, y: start.y + ny * offset };
    const b: Point = { x: end.x + nx * offset, y: end.y + ny * offset };

    const sa = this.worldToScreen(a.x, a.y, view);
    const sb = this.worldToScreen(b.x, b.y, view);
    const ss = this.worldToScreen(start.x + nx * offset * 0.3, start.y + ny * offset * 0.3, view);
    const se = this.worldToScreen(end.x + nx * offset * 0.3, end.y + ny * offset * 0.3, view);

    ctx.strokeStyle = COLOR_DIMENSION;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(ss.x, ss.y);
    ctx.lineTo(sa.x, sa.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(se.x, se.y);
    ctx.lineTo(sb.x, sb.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(sa.x, sa.y);
    ctx.lineTo(sb.x, sb.y);
    ctx.stroke();

    const arrowLen = 8;
    const angle = Math.atan2(sb.y - sa.y, sb.x - sa.x);
    ctx.beginPath();
    ctx.moveTo(sa.x, sa.y);
    ctx.lineTo(
      sa.x + arrowLen * Math.cos(angle + 0.4),
      sa.y + arrowLen * Math.sin(angle + 0.4)
    );
    ctx.moveTo(sa.x, sa.y);
    ctx.lineTo(
      sa.x + arrowLen * Math.cos(angle - 0.4),
      sa.y + arrowLen * Math.sin(angle - 0.4)
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(sb.x, sb.y);
    ctx.lineTo(
      sb.x - arrowLen * Math.cos(angle + 0.4),
      sb.y - arrowLen * Math.sin(angle + 0.4)
    );
    ctx.moveTo(sb.x, sb.y);
    ctx.lineTo(
      sb.x - arrowLen * Math.cos(angle - 0.4),
      sb.y - arrowLen * Math.sin(angle - 0.4)
    );
    ctx.stroke();

    const midX = (sa.x + sb.x) / 2;
    const midY = (sa.y + sb.y) / 2;
    const text = this.formatDimension(len);
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const metrics = ctx.measureText(text);
    const pad = 3;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(
      midX - metrics.width / 2 - pad,
      midY - 14 - pad,
      metrics.width + pad * 2,
      14 + pad
    );

    ctx.fillStyle = COLOR_DIMENSION;
    ctx.fillText(text, midX, midY - 2);
  }

  private drawPreviewWall(
    points: Point[],
    mouseWorld: Point,
    view: ViewState
  ): void {
    const ctx = this.ctx;

    ctx.strokeStyle = COLOR_WALL;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    for (let i = 0; i < points.length - 1; i++) {
      const s1 = this.worldToScreen(points[i].x, points[i].y, view);
      const s2 = this.worldToScreen(points[i + 1].x, points[i + 1].y, view);
      ctx.beginPath();
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.stroke();
    }

    const lastPt = points[points.length - 1];
    const sLast = this.worldToScreen(lastPt.x, lastPt.y, view);
    const sMouse = this.worldToScreen(mouseWorld.x, mouseWorld.y, view);

    ctx.strokeStyle = COLOR_PREVIEW;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(sLast.x, sLast.y);
    ctx.lineTo(sMouse.x, sMouse.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const dx = mouseWorld.x - lastPt.x;
    const dy = mouseWorld.y - lastPt.y;
    const segLen = Math.hypot(dx, dy);
    if (segLen > 10) {
      const midSx = (sLast.x + sMouse.x) / 2;
      const midSy = (sLast.y + sMouse.y) / 2;
      const label = this.formatDimension(segLen);

      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const metrics = ctx.measureText(label);
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(
        midSx - metrics.width / 2 - 3,
        midSy - 17,
        metrics.width + 6,
        17
      );
      ctx.fillStyle = COLOR_PREVIEW;
      ctx.fillText(label, midSx, midSy - 2);
    }

    for (const p of points) {
      const sp = this.worldToScreen(p.x, p.y, view);
      ctx.fillStyle = COLOR_WALL;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawSnapIndicator(
    point: Point,
    type: string,
    view: ViewState
  ): void {
    const ctx = this.ctx;
    const sp = this.worldToScreen(point.x, point.y, view);

    ctx.strokeStyle = COLOR_SNAP;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);

    if (type === "endpoint") {
      const r = 8;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_SNAP;
      ctx.fill();
    } else if (type === "midpoint") {
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y - r);
      ctx.lineTo(sp.x + r, sp.y);
      ctx.lineTo(sp.x, sp.y + r);
      ctx.lineTo(sp.x - r, sp.y);
      ctx.closePath();
      ctx.stroke();
    } else {
      const r = 5;
      ctx.beginPath();
      ctx.moveTo(sp.x - r, sp.y - r);
      ctx.lineTo(sp.x + r, sp.y + r);
      ctx.moveTo(sp.x + r, sp.y - r);
      ctx.lineTo(sp.x - r, sp.y + r);
      ctx.stroke();
    }
  }

  private drawMeasureLine(points: Point[], view: ViewState): void {
    const ctx = this.ctx;
    if (points.length === 0) return;

    ctx.strokeStyle = COLOR_MEASURE;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);

    for (let i = 0; i < points.length - 1; i++) {
      const s1 = this.worldToScreen(points[i].x, points[i].y, view);
      const s2 = this.worldToScreen(points[i + 1].x, points[i + 1].y, view);

      ctx.beginPath();
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.stroke();

      const segLen = Math.hypot(
        points[i + 1].x - points[i].x,
        points[i + 1].y - points[i].y
      );
      const midX = (s1.x + s2.x) / 2;
      const midY = (s1.y + s2.y) / 2;
      const label = this.formatDimension(segLen);

      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const metrics = ctx.measureText(label);
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(
        midX - metrics.width / 2 - 4,
        midY - 18,
        metrics.width + 8,
        18
      );
      ctx.fillStyle = COLOR_MEASURE;
      ctx.fillText(label, midX, midY - 3);
    }

    ctx.setLineDash([]);

    for (const p of points) {
      const sp = this.worldToScreen(p.x, p.y, view);
      ctx.fillStyle = COLOR_MEASURE;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (points.length > 2) {
      let total = 0;
      for (let i = 0; i < points.length - 1; i++) {
        total += Math.hypot(
          points[i + 1].x - points[i].x,
          points[i + 1].y - points[i].y
        );
      }
      const lastS = this.worldToScreen(
        points[points.length - 1].x,
        points[points.length - 1].y,
        view
      );
      const totalLabel = `\u03A3 ${this.formatDimension(total)}`;
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const m = ctx.measureText(totalLabel);
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(lastS.x + 10, lastS.y - 10, m.width + 8, 20);
      ctx.fillStyle = COLOR_MEASURE;
      ctx.fillText(totalLabel, lastS.x + 14, lastS.y);
    }
  }

  private drawStatusBar(state: PlannerState): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const barH = 28;

    ctx.fillStyle = COLOR_STATUS_BG;
    ctx.fillRect(0, h - barH, w, barH);

    const toolNames: Record<string, string> = {
      select: "\u041A\u0443\u0440\u0441\u043E\u0440",
      wall: "\u0421\u0442\u0435\u043D\u0430",
      door: "\u0414\u0432\u0435\u0440\u044C",
      window: "\u041E\u043A\u043D\u043E",
      furniture: "\u041C\u0435\u0431\u0435\u043B\u044C",
      eraser: "\u041B\u0430\u0441\u0442\u0438\u043A",
      measure: "\u0417\u0430\u043C\u0435\u0440",
    };

    const zoomPct = Math.round(state.viewState.zoom * 1000);
    const mx = Math.round(state.mouseWorld.x);
    const my = Math.round(state.mouseWorld.y);
    const toolLabel = toolNames[state.tool] || state.tool;

    const parts = [
      `X: ${mx}  Y: ${my}`,
      `\u041C\u0430\u0441\u0448\u0442\u0430\u0431: ${zoomPct}%`,
      `\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442: ${toolLabel}`,
    ];

    if (state.showGrid) parts.push("\u0421\u0435\u0442\u043A\u0430");
    if (state.snapToGrid) parts.push("Snap");
    if (state.showDimensions) parts.push("\u0420\u0430\u0437\u043C\u0435\u0440\u044B");

    ctx.font = "12px monospace";
    ctx.fillStyle = COLOR_STATUS_TEXT;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(parts.join("  |  "), 12, h - barH / 2);

    const wallCount = `\u0421\u0442\u0435\u043D: ${state.walls.length}  \u041C\u0435\u0431\u0435\u043B\u044C: ${state.furniture.length}`;
    ctx.textAlign = "right";
    ctx.fillText(wallCount, w - 12, h - barH / 2);
  }

  private drawCrosshair(mouseScreen: Point): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.strokeStyle = COLOR_CROSSHAIR;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(mouseScreen.x, 0);
    ctx.lineTo(mouseScreen.x, h - 28);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, mouseScreen.y);
    ctx.lineTo(w, mouseScreen.y);
    ctx.stroke();

    ctx.setLineDash([]);
  }
}

export default PlannerCanvas2D;
