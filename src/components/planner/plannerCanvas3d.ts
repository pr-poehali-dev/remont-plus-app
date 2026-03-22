import type {
  Point,
  Wall,
  Opening,
  PlacedFurniture,
  PlannerState,
  ViewState,
} from "./plannerTypes";
import { FURNITURE_CATALOG, type FurnitureItem } from "./furnitureCatalog";

const COLOR_BG = "#0f0f1a";
const COLOR_SELECTED = "#ffdd57";
const COLOR_GRID = "rgba(255,255,255,0.05)";
const COLOR_EDGE = "rgba(0,0,0,0.2)";
const COLOR_SHADOW = "rgba(0,0,0,0.12)";
const COLOR_DOOR_OPENING = "rgba(30,30,30,0.85)";
const COLOR_WINDOW_GLASS = "rgba(135,206,235,0.4)";
const COLOR_WINDOW_FRAME = "rgba(135,206,235,0.7)";
const COLOR_BADGE_BG = "rgba(0,0,0,0.5)";
const COLOR_BADGE_TEXT = "rgba(255,255,255,0.7)";

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);

const DOOR_HEIGHT = 2100;
const WINDOW_BOTTOM = 800;
const WINDOW_TOP = 1800;

function parseHex(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`;
}

function lightenColor(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

function darkenColor(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  return rgbToHex(r - amount, g - amount, b - amount);
}

function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

type RenderItem =
  | { kind: "wall"; wall: Wall; depth: number }
  | { kind: "furniture"; item: PlacedFurniture; depth: number };

export class PlannerCanvas3D {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private furnitureMap: Map<string, FurnitureItem>;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot get 2d context");
    this.ctx = ctx;
    this.furnitureMap = new Map();
    for (const item of FURNITURE_CATALOG) {
      this.furnitureMap.set(item.id, item);
    }
  }

  toIso(
    x: number,
    y: number,
    z: number,
    view: ViewState
  ): { sx: number; sy: number } {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    return {
      sx: (x - y) * COS30 * view.zoom + cx + view.offsetX,
      sy: (x + y) * SIN30 * view.zoom - z * view.zoom + cy + view.offsetY,
    };
  }

  render(state: PlannerState): void {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    const view = state.viewState3d;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, w, h);

    this.drawGrid3D(view);
    this.drawFloor(state.walls, view, state.floorColor);

    const items: RenderItem[] = [];

    for (const wall of state.walls) {
      const mx = (wall.start.x + wall.end.x) / 2;
      const my = (wall.start.y + wall.end.y) / 2;
      items.push({ kind: "wall", wall, depth: mx + my });
    }

    for (const furn of state.furniture) {
      items.push({ kind: "furniture", item: furn, depth: furn.x + furn.y });
    }

    items.sort((a, b) => a.depth - b.depth);

    for (const entry of items) {
      if (entry.kind === "wall") {
        this.drawWall3D(
          entry.wall,
          view,
          state.ceilingHeight,
          state.wallColor
        );
        for (const opening of entry.wall.openings) {
          this.drawOpening3D(opening, entry.wall, view, state.ceilingHeight);
        }
      } else {
        const isSelected =
          state.selectedId === entry.item.id &&
          state.selectedType === "furniture";
        this.drawFurniture3D(entry.item, view, isSelected);
      }
    }

    ctx.font = "12px monospace";
    ctx.fillStyle = COLOR_BADGE_BG;
    const badgeText = "3D \u0432\u0438\u0434";
    const tm = ctx.measureText(badgeText);
    ctx.fillRect(w - tm.width - 24, 8, tm.width + 16, 24);
    ctx.fillStyle = COLOR_BADGE_TEXT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, w - tm.width / 2 - 16, 20);
  }

  private drawFloor(walls: Wall[], view: ViewState, color: string): void {
    const ctx = this.ctx;
    if (walls.length === 0) return;

    const points: Point[] = [];
    for (const w of walls) {
      points.push(w.start, w.end);
    }

    const unique: Point[] = [];
    for (const p of points) {
      let found = false;
      for (const u of unique) {
        if (Math.abs(u.x - p.x) < 1 && Math.abs(u.y - p.y) < 1) {
          found = true;
          break;
        }
      }
      if (!found) unique.push(p);
    }

    if (unique.length < 3) {
      if (unique.length === 2) {
        const minX = Math.min(unique[0].x, unique[1].x);
        const maxX = Math.max(unique[0].x, unique[1].x);
        const minY = Math.min(unique[0].y, unique[1].y);
        const maxY = Math.max(unique[0].y, unique[1].y);
        const corners = [
          { x: minX, y: minY },
          { x: maxX, y: minY },
          { x: maxX, y: maxY },
          { x: minX, y: maxY },
        ];
        this.fillFloorPolygon(corners, view, color);
        return;
      }
      return;
    }

    const cx = unique.reduce((s, p) => s + p.x, 0) / unique.length;
    const cy = unique.reduce((s, p) => s + p.y, 0) / unique.length;
    const sorted = [...unique].sort(
      (a, b) =>
        Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
    );

    this.fillFloorPolygon(sorted, view, color);

    const minX = Math.min(...unique.map((p) => p.x));
    const maxX = Math.max(...unique.map((p) => p.x));
    const minY = Math.min(...unique.map((p) => p.y));
    const maxY = Math.max(...unique.map((p) => p.y));

    ctx.save();
    ctx.beginPath();
    const first = this.toIso(sorted[0].x, sorted[0].y, 0, view);
    ctx.moveTo(first.sx, first.sy);
    for (let i = 1; i < sorted.length; i++) {
      const sp = this.toIso(sorted[i].x, sorted[i].y, 0, view);
      ctx.lineTo(sp.sx, sp.sy);
    }
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 0.5;
    const step = 1000;
    const gStartX = Math.floor(minX / step) * step;
    const gStartY = Math.floor(minY / step) * step;

    for (let gx = gStartX; gx <= maxX; gx += step) {
      const a = this.toIso(gx, minY, 0, view);
      const b = this.toIso(gx, maxY, 0, view);
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.stroke();
    }

    for (let gy = gStartY; gy <= maxY; gy += step) {
      const a = this.toIso(minX, gy, 0, view);
      const b = this.toIso(maxX, gy, 0, view);
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.stroke();
    }

    ctx.restore();
  }

  private fillFloorPolygon(
    pts: Point[],
    view: ViewState,
    color: string
  ): void {
    const ctx = this.ctx;
    if (pts.length < 2) return;

    ctx.beginPath();
    const f = this.toIso(pts[0].x, pts[0].y, 0, view);
    ctx.moveTo(f.sx, f.sy);
    for (let i = 1; i < pts.length; i++) {
      const sp = this.toIso(pts[i].x, pts[i].y, 0, view);
      ctx.lineTo(sp.sx, sp.sy);
    }
    ctx.closePath();
    ctx.fillStyle = hexToRgba(color, 0.6);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(color, 0.3);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawWall3D(
    wall: Wall,
    view: ViewState,
    ceilingHeight: number,
    wallColor: string
  ): void {
    const ctx = this.ctx;
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    const halfT = wall.thickness / 2;

    const bl0 = { x: wall.start.x - nx * halfT, y: wall.start.y - ny * halfT };
    const bl1 = { x: wall.end.x - nx * halfT, y: wall.end.y - ny * halfT };
    const br0 = { x: wall.start.x + nx * halfT, y: wall.start.y + ny * halfT };
    const br1 = { x: wall.end.x + nx * halfT, y: wall.end.y + ny * halfT };

    const topColor = lightenColor(wallColor, 20);
    const frontColor = wallColor;
    const sideColor = darkenColor(wallColor, 25);

    const h = ceilingHeight;

    const faceFront = this.getVisibleFrontFace(bl0, bl1, br0, br1, view);

    if (faceFront === "left") {
      this.drawQuad(
        this.toIso(bl0.x, bl0.y, 0, view),
        this.toIso(bl1.x, bl1.y, 0, view),
        this.toIso(bl1.x, bl1.y, h, view),
        this.toIso(bl0.x, bl0.y, h, view),
        frontColor
      );
    } else {
      this.drawQuad(
        this.toIso(br0.x, br0.y, 0, view),
        this.toIso(br1.x, br1.y, 0, view),
        this.toIso(br1.x, br1.y, h, view),
        this.toIso(br0.x, br0.y, h, view),
        frontColor
      );
    }

    const sideStart =
      faceFront === "left"
        ? this.chooseSideEnd(bl0, bl1, br0, br1, view)
        : this.chooseSideEnd(br0, br1, bl0, bl1, view);

    if (sideStart === "start") {
      if (faceFront === "left") {
        this.drawQuad(
          this.toIso(bl0.x, bl0.y, 0, view),
          this.toIso(br0.x, br0.y, 0, view),
          this.toIso(br0.x, br0.y, h, view),
          this.toIso(bl0.x, bl0.y, h, view),
          sideColor
        );
      } else {
        this.drawQuad(
          this.toIso(br0.x, br0.y, 0, view),
          this.toIso(bl0.x, bl0.y, 0, view),
          this.toIso(bl0.x, bl0.y, h, view),
          this.toIso(br0.x, br0.y, h, view),
          sideColor
        );
      }
    } else {
      if (faceFront === "left") {
        this.drawQuad(
          this.toIso(bl1.x, bl1.y, 0, view),
          this.toIso(br1.x, br1.y, 0, view),
          this.toIso(br1.x, br1.y, h, view),
          this.toIso(bl1.x, bl1.y, h, view),
          sideColor
        );
      } else {
        this.drawQuad(
          this.toIso(br1.x, br1.y, 0, view),
          this.toIso(bl1.x, bl1.y, 0, view),
          this.toIso(bl1.x, bl1.y, h, view),
          this.toIso(br1.x, br1.y, h, view),
          sideColor
        );
      }
    }

    this.drawQuad(
      this.toIso(bl0.x, bl0.y, h, view),
      this.toIso(bl1.x, bl1.y, h, view),
      this.toIso(br1.x, br1.y, h, view),
      this.toIso(br0.x, br0.y, h, view),
      topColor
    );
  }

  private getVisibleFrontFace(
    bl0: Point,
    bl1: Point,
    br0: Point,
    br1: Point,
    _view: ViewState
  ): "left" | "right" {
    const leftMid = (bl0.x + bl1.x) / 2 + (bl0.y + bl1.y) / 2;
    const rightMid = (br0.x + br1.x) / 2 + (br0.y + br1.y) / 2;
    return leftMid >= rightMid ? "left" : "right";
  }

  private chooseSideEnd(
    f0: Point,
    f1: Point,
    _b0: Point,
    _b1: Point,
    _view: ViewState
  ): "start" | "end" {
    const depthStart = f0.x + f0.y;
    const depthEnd = f1.x + f1.y;
    return depthEnd >= depthStart ? "end" : "start";
  }

  private drawQuad(
    p0: { sx: number; sy: number },
    p1: { sx: number; sy: number },
    p2: { sx: number; sy: number },
    p3: { sx: number; sy: number },
    color: string
  ): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(p0.sx, p0.sy);
    ctx.lineTo(p1.sx, p1.sy);
    ctx.lineTo(p2.sx, p2.sy);
    ctx.lineTo(p3.sx, p3.sy);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = COLOR_EDGE;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawOpening3D(
    opening: Opening,
    wall: Wall,
    view: ViewState,
    ceilingHeight: number
  ): void {
    const ctx = this.ctx;
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    const halfT = wall.thickness / 2;

    const cx = wall.start.x + dx * opening.position;
    const cy = wall.start.y + dy * opening.position;
    const halfW = opening.width / 2;

    const bl0 = { x: wall.start.x - nx * halfT, y: wall.start.y - ny * halfT };
    const br0 = { x: wall.start.x + nx * halfT, y: wall.start.y + ny * halfT };
    const faceFront = this.getVisibleFrontFace(
      bl0,
      { x: wall.end.x - nx * halfT, y: wall.end.y - ny * halfT },
      br0,
      { x: wall.end.x + nx * halfT, y: wall.end.y + ny * halfT },
      view
    );

    const sign = faceFront === "left" ? -1 : 1;
    const faceNx = nx * sign;
    const faceNy = ny * sign;

    const p0x = cx - ux * halfW + faceNx * halfT;
    const p0y = cy - uy * halfW + faceNy * halfT;
    const p1x = cx + ux * halfW + faceNx * halfT;
    const p1y = cy + uy * halfW + faceNy * halfT;

    if (opening.type === "door") {
      const zBottom = 0;
      const zTop = Math.min(DOOR_HEIGHT, ceilingHeight);

      const s0b = this.toIso(p0x, p0y, zBottom, view);
      const s1b = this.toIso(p1x, p1y, zBottom, view);
      const s1t = this.toIso(p1x, p1y, zTop, view);
      const s0t = this.toIso(p0x, p0y, zTop, view);

      ctx.beginPath();
      ctx.moveTo(s0b.sx, s0b.sy);
      ctx.lineTo(s1b.sx, s1b.sy);
      ctx.lineTo(s1t.sx, s1t.sy);
      ctx.lineTo(s0t.sx, s0t.sy);
      ctx.closePath();
      ctx.fillStyle = COLOR_DOOR_OPENING;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      const zBottom = WINDOW_BOTTOM;
      const zTop = Math.min(WINDOW_TOP, ceilingHeight);

      const s0b = this.toIso(p0x, p0y, zBottom, view);
      const s1b = this.toIso(p1x, p1y, zBottom, view);
      const s1t = this.toIso(p1x, p1y, zTop, view);
      const s0t = this.toIso(p0x, p0y, zTop, view);

      ctx.beginPath();
      ctx.moveTo(s0b.sx, s0b.sy);
      ctx.lineTo(s1b.sx, s1b.sy);
      ctx.lineTo(s1t.sx, s1t.sy);
      ctx.lineTo(s0t.sx, s0t.sy);
      ctx.closePath();
      ctx.fillStyle = COLOR_WINDOW_GLASS;
      ctx.fill();
      ctx.strokeStyle = COLOR_WINDOW_FRAME;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const sMidB = this.toIso(
        (p0x + p1x) / 2,
        (p0y + p1y) / 2,
        zBottom,
        view
      );
      const sMidT = this.toIso(
        (p0x + p1x) / 2,
        (p0y + p1y) / 2,
        zTop,
        view
      );
      ctx.beginPath();
      ctx.moveTo(sMidB.sx, sMidB.sy);
      ctx.lineTo(sMidT.sx, sMidT.sy);
      ctx.stroke();

      const zMid = (zBottom + zTop) / 2;
      const sL = this.toIso(p0x, p0y, zMid, view);
      const sR = this.toIso(p1x, p1y, zMid, view);
      ctx.beginPath();
      ctx.moveTo(sL.sx, sL.sy);
      ctx.lineTo(sR.sx, sR.sy);
      ctx.stroke();
    }
  }

  private drawFurniture3D(
    item: PlacedFurniture,
    view: ViewState,
    isSelected: boolean
  ): void {
    const ctx = this.ctx;
    const catalogItem = this.furnitureMap.get(item.itemId);
    if (!catalogItem) return;

    const rad = (item.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const flipX = item.flipped ? -1 : 1;

    const hw = catalogItem.width / 2;
    const hd = catalogItem.depth / 2;
    const h = catalogItem.height;

    const localCorners = [
      { lx: -hw * flipX, ly: -hd },
      { lx: hw * flipX, ly: -hd },
      { lx: hw * flipX, ly: hd },
      { lx: -hw * flipX, ly: hd },
    ];

    const worldCorners = localCorners.map((c) => ({
      x: item.x + c.lx * cos - c.ly * sin,
      y: item.y + c.lx * sin + c.ly * cos,
    }));

    const shadowRx = Math.max(hw, hd) * view.zoom * 0.7;
    const shadowRy = shadowRx * 0.4;
    const shadowCenter = this.toIso(item.x, item.y, 0, view);
    ctx.beginPath();
    ctx.ellipse(shadowCenter.sx, shadowCenter.sy + shadowRy * 0.3, shadowRx, shadowRy, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_SHADOW;
    ctx.fill();

    const topColor = lightenColor(catalogItem.color, 25);
    const frontColor = catalogItem.color;
    const sideColorVal = darkenColor(catalogItem.color, 30);

    const depthValues = worldCorners.map((c, i) => ({
      i,
      d: c.x + c.y,
    }));
    depthValues.sort((a, b) => a.d - b.d);

    const bottomIso = worldCorners.map((c) => this.toIso(c.x, c.y, 0, view));
    const topIso = worldCorners.map((c) => this.toIso(c.x, c.y, h, view));

    const edges: { i0: number; i1: number; midDepth: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      const md = (worldCorners[i].x + worldCorners[i].y + worldCorners[j].x + worldCorners[j].y) / 2;
      edges.push({ i0: i, i1: j, midDepth: md });
    }
    edges.sort((a, b) => a.midDepth - b.midDepth);

    const drawnFaces: { i0: number; i1: number }[] = [];
    for (let e = edges.length - 1; e >= 0 && drawnFaces.length < 2; e--) {
      const { i0, i1 } = edges[e];
      const crossZ =
        (worldCorners[i1].x - worldCorners[i0].x) *
          (0 - (worldCorners[i0].y + worldCorners[i1].y) / 2) -
        (worldCorners[i1].y - worldCorners[i0].y) *
          (0 - (worldCorners[i0].x + worldCorners[i1].x) / 2);

      const edgeDx = worldCorners[i1].x - worldCorners[i0].x;
      const edgeDy = worldCorners[i1].y - worldCorners[i0].y;
      const outNx = edgeDy;
      const outNy = -edgeDx;
      const centerToEdgeX =
        (worldCorners[i0].x + worldCorners[i1].x) / 2 - item.x;
      const centerToEdgeY =
        (worldCorners[i0].y + worldCorners[i1].y) / 2 - item.y;
      const dot = outNx * centerToEdgeX + outNy * centerToEdgeY;
      const facingCamera = dot > 0 ? outNx + outNy > 0 : -(outNx + outNy) > 0;

      drawnFaces.push({ i0, i1 });
    }

    const facesToDraw = this.getVisibleSideFaces(worldCorners);

    for (const face of facesToDraw) {
      const isLongSide =
        Math.hypot(
          worldCorners[face.i1].x - worldCorners[face.i0].x,
          worldCorners[face.i1].y - worldCorners[face.i0].y
        ) > Math.min(catalogItem.width, catalogItem.depth);

      this.drawQuad(
        bottomIso[face.i0],
        bottomIso[face.i1],
        topIso[face.i1],
        topIso[face.i0],
        isLongSide ? frontColor : sideColorVal
      );

      if (isSelected) {
        ctx.strokeStyle = COLOR_SELECTED;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bottomIso[face.i0].sx, bottomIso[face.i0].sy);
        ctx.lineTo(bottomIso[face.i1].sx, bottomIso[face.i1].sy);
        ctx.lineTo(topIso[face.i1].sx, topIso[face.i1].sy);
        ctx.lineTo(topIso[face.i0].sx, topIso[face.i0].sy);
        ctx.closePath();
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.moveTo(topIso[0].sx, topIso[0].sy);
    ctx.lineTo(topIso[1].sx, topIso[1].sy);
    ctx.lineTo(topIso[2].sx, topIso[2].sy);
    ctx.lineTo(topIso[3].sx, topIso[3].sy);
    ctx.closePath();
    ctx.fillStyle = topColor;
    ctx.fill();
    ctx.strokeStyle = COLOR_EDGE;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (isSelected) {
      ctx.strokeStyle = COLOR_SELECTED;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(topIso[0].sx, topIso[0].sy);
      ctx.lineTo(topIso[1].sx, topIso[1].sy);
      ctx.lineTo(topIso[2].sx, topIso[2].sy);
      ctx.lineTo(topIso[3].sx, topIso[3].sy);
      ctx.closePath();
      ctx.stroke();
    }

    const topCenterX = (topIso[0].sx + topIso[1].sx + topIso[2].sx + topIso[3].sx) / 4;
    const topCenterY = (topIso[0].sy + topIso[1].sy + topIso[2].sy + topIso[3].sy) / 4;

    const minTopDim = Math.min(catalogItem.width, catalogItem.depth) * view.zoom;
    const emojiSize = Math.max(10, Math.min(minTopDim * 0.45, 36));

    ctx.font = `${emojiSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(catalogItem.icon, topCenterX, topCenterY);
  }

  private getVisibleSideFaces(
    corners: Point[]
  ): { i0: number; i1: number }[] {
    const result: { i0: number; i1: number; depth: number }[] = [];

    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      const midX = (corners[i].x + corners[j].x) / 2;
      const midY = (corners[i].y + corners[j].y) / 2;
      const cx =
        (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4;
      const cy =
        (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4;

      const edgeDx = corners[j].x - corners[i].x;
      const edgeDy = corners[j].y - corners[i].y;
      const outX = edgeDy;
      const outY = -edgeDx;

      const toMidX = midX - cx;
      const toMidY = midY - cy;
      const outwardDot = outX * toMidX + outY * toMidY;
      const normalX = outwardDot >= 0 ? outX : -outX;
      const normalY = outwardDot >= 0 ? outY : -outY;

      const cameraDir = normalX + normalY;

      if (cameraDir > 0) {
        const depth = midX + midY;
        result.push({ i0: i, i1: j, depth });
      }
    }

    result.sort((a, b) => a.depth - b.depth);

    return result.map((r) => ({ i0: r.i0, i1: r.i1 }));
  }

  private drawGrid3D(view: ViewState): void {
    const ctx = this.ctx;
    const step = 1000;
    const range = 15000;

    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 0.5;

    for (let x = -range; x <= range; x += step) {
      const a = this.toIso(x, -range, 0, view);
      const b = this.toIso(x, range, 0, view);
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.stroke();
    }

    for (let y = -range; y <= range; y += step) {
      const a = this.toIso(-range, y, 0, view);
      const b = this.toIso(range, y, 0, view);
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.stroke();
    }
  }
}

export default PlannerCanvas3D;
