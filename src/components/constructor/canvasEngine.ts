import { Point, Wall, Opening, ViewState } from './types';

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  private viewState: ViewState = { offsetX: 0, offsetY: 0, zoom: 0.1 };
  private width: number = 0;
  private height: number = 0;

  // Colors
  static readonly BG = '#1e1e2e';
  static readonly GRID_MAJOR = 'rgba(255,255,255,0.08)';
  static readonly GRID_MINOR = 'rgba(255,255,255,0.03)';
  static readonly WALL_COLOR = '#00d4ff';
  static readonly WALL_FILL = 'rgba(0,212,255,0.08)';
  static readonly WALL_SELECTED = '#ffdd57';
  static readonly WALL_PREVIEW = 'rgba(0,212,255,0.4)';
  static readonly DIM_COLOR = '#ff6b35';
  static readonly DOOR_COLOR = '#4ade80';
  static readonly WINDOW_COLOR = '#60a5fa';
  static readonly LABEL_COLOR = 'rgba(255,255,255,0.6)';
  static readonly CROSSHAIR_COLOR = 'rgba(255,255,255,0.2)';
  static readonly SNAP_COLOR = '#ffdd57';
  static readonly MEASURE_COLOR = '#f472b6';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get 2d context');
    this.ctx = ctx;
    this.dpr = window.devicePixelRatio || 1;
    this.resize();
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setViewState(vs: ViewState) {
    this.viewState = vs;
  }

  getViewState(): ViewState {
    return this.viewState;
  }

  screenToWorld(sx: number, sy: number): Point {
    return {
      x: (sx - this.viewState.offsetX) / this.viewState.zoom,
      y: (sy - this.viewState.offsetY) / this.viewState.zoom,
    };
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return {
      x: wx * this.viewState.zoom + this.viewState.offsetX,
      y: wy * this.viewState.zoom + this.viewState.offsetY,
    };
  }

  clear() {
    const ctx = this.ctx;
    ctx.fillStyle = CanvasEngine.BG;
    ctx.fillRect(0, 0, this.width, this.height);

    // Vignette overlay for premium feel
    const grd = ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.width * 0.2,
      this.width / 2, this.height / 2, this.width * 0.8
    );
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid(gridSize: number) {
    const ctx = this.ctx;
    const zoom = this.viewState.zoom;
    const minorGridMM = gridSize; // 100mm = 10cm
    const majorGridMM = gridSize * 10; // 1000mm = 1m

    // Calculate visible world bounds
    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(this.width, this.height);

    // Minor grid
    const minorPixelSize = minorGridMM * zoom;
    if (minorPixelSize > 4) {
      ctx.strokeStyle = CanvasEngine.GRID_MINOR;
      ctx.lineWidth = 0.5;
      ctx.beginPath();

      const startX = Math.floor(topLeft.x / minorGridMM) * minorGridMM;
      const endX = Math.ceil(bottomRight.x / minorGridMM) * minorGridMM;
      const startY = Math.floor(topLeft.y / minorGridMM) * minorGridMM;
      const endY = Math.ceil(bottomRight.y / minorGridMM) * minorGridMM;

      for (let x = startX; x <= endX; x += minorGridMM) {
        if (Math.abs(x % majorGridMM) < 1) continue; // skip major lines
        const sx = this.worldToScreen(x, 0).x;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, this.height);
      }
      for (let y = startY; y <= endY; y += minorGridMM) {
        if (Math.abs(y % majorGridMM) < 1) continue;
        const sy = this.worldToScreen(0, y).y;
        ctx.moveTo(0, sy);
        ctx.lineTo(this.width, sy);
      }
      ctx.stroke();
    }

    // Major grid
    const majorPixelSize = majorGridMM * zoom;
    if (majorPixelSize > 10) {
      ctx.strokeStyle = CanvasEngine.GRID_MAJOR;
      ctx.lineWidth = 0.5;
      ctx.beginPath();

      const startX = Math.floor(topLeft.x / majorGridMM) * majorGridMM;
      const endX = Math.ceil(bottomRight.x / majorGridMM) * majorGridMM;
      const startY = Math.floor(topLeft.y / majorGridMM) * majorGridMM;
      const endY = Math.ceil(bottomRight.y / majorGridMM) * majorGridMM;

      for (let x = startX; x <= endX; x += majorGridMM) {
        const sx = this.worldToScreen(x, 0).x;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, this.height);
      }
      for (let y = startY; y <= endY; y += majorGridMM) {
        const sy = this.worldToScreen(0, y).y;
        ctx.moveTo(0, sy);
        ctx.lineTo(this.width, sy);
      }
      ctx.stroke();

      // Grid labels (meters) on major lines
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (let x = startX; x <= endX; x += majorGridMM) {
        const sx = this.worldToScreen(x, 0).x;
        if (sx > 30 && sx < this.width - 30) {
          ctx.fillText(`${(x / 1000).toFixed(1)}m`, sx + 3, 4);
        }
      }
      ctx.textAlign = 'left';
      for (let y = startY; y <= endY; y += majorGridMM) {
        const sy = this.worldToScreen(0, y).y;
        if (sy > 15 && sy < this.height - 40) {
          ctx.fillText(`${(y / 1000).toFixed(1)}m`, 4, sy + 3);
        }
      }
    }

    // Origin crosshair
    const origin = this.worldToScreen(0, 0);
    if (origin.x > -5 && origin.x < this.width + 5 && origin.y > -5 && origin.y < this.height + 5) {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(origin.x - 15, origin.y);
      ctx.lineTo(origin.x + 15, origin.y);
      ctx.moveTo(origin.x, origin.y - 15);
      ctx.lineTo(origin.x, origin.y + 15);
      ctx.stroke();
    }
  }

  drawCrosshair(sx: number, sy: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = CanvasEngine.CROSSHAIR_COLOR;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, this.height);
    ctx.moveTo(0, sy);
    ctx.lineTo(this.width, sy);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
  }

  drawWall(wall: Wall, selected: boolean, isPreview: boolean = false) {
    const ctx = this.ctx;
    const s = this.worldToScreen(wall.start.x, wall.start.y);
    const e = this.worldToScreen(wall.end.x, wall.end.y);

    const dx = e.x - s.x;
    const dy = e.y - s.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.5) return;

    const nx = -dy / len;
    const ny = dx / len;
    const halfThick = (wall.thickness / 2) * this.viewState.zoom;

    const color = isPreview ? CanvasEngine.WALL_PREVIEW : selected ? CanvasEngine.WALL_SELECTED : CanvasEngine.WALL_COLOR;
    const fillColor = isPreview ? 'rgba(0,212,255,0.04)' : selected ? 'rgba(255,221,87,0.08)' : CanvasEngine.WALL_FILL;

    // Wall body (filled rectangle)
    ctx.beginPath();
    ctx.moveTo(s.x + nx * halfThick, s.y + ny * halfThick);
    ctx.lineTo(e.x + nx * halfThick, e.y + ny * halfThick);
    ctx.lineTo(e.x - nx * halfThick, e.y - ny * halfThick);
    ctx.lineTo(s.x - nx * halfThick, s.y - ny * halfThick);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Wall outline
    ctx.strokeStyle = color;
    ctx.lineWidth = isPreview ? 1 : 1.5;
    ctx.stroke();

    // Center line (thin)
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = isPreview ? 0.5 : 0.8;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Endpoint dots
    if (!isPreview) {
      for (const p of [s, e]) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }

  drawOpening(wall: Wall, opening: Opening) {
    const ctx = this.ctx;
    const s = this.worldToScreen(wall.start.x, wall.start.y);
    const e = this.worldToScreen(wall.end.x, wall.end.y);

    const dx = e.x - s.x;
    const dy = e.y - s.y;
    const wallLen = Math.sqrt(dx * dx + dy * dy);
    if (wallLen < 1) return;

    const ux = dx / wallLen;
    const uy = dy / wallLen;
    const nx = -uy;
    const ny = ux;
    const halfThick = (wall.thickness / 2) * this.viewState.zoom;

    const openingScreenWidth = opening.width * this.viewState.zoom;
    const centerPos = opening.position;
    const halfOpeningLen = openingScreenWidth / 2;

    const cx = s.x + dx * centerPos;
    const cy = s.y + dy * centerPos;
    const osX = cx - ux * halfOpeningLen;
    const osY = cy - uy * halfOpeningLen;
    const oeX = cx + ux * halfOpeningLen;
    const oeY = cy + uy * halfOpeningLen;

    // Clear wall area for opening (draw BG-colored rectangle)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(osX + nx * (halfThick + 1), osY + ny * (halfThick + 1));
    ctx.lineTo(oeX + nx * (halfThick + 1), oeY + ny * (halfThick + 1));
    ctx.lineTo(oeX - nx * (halfThick + 1), oeY - ny * (halfThick + 1));
    ctx.lineTo(osX - nx * (halfThick + 1), osY - ny * (halfThick + 1));
    ctx.closePath();
    ctx.fillStyle = CanvasEngine.BG;
    ctx.fill();
    ctx.restore();

    if (opening.type === 'door') {
      this.drawDoor(osX, osY, oeX, oeY, nx, ny, halfThick, opening.direction || 'left', openingScreenWidth);
    } else {
      this.drawWindow(osX, osY, oeX, oeY, nx, ny, halfThick);
    }
  }

  private drawDoor(
    osX: number, osY: number, oeX: number, oeY: number,
    nx: number, ny: number, halfThick: number,
    direction: 'left' | 'right', openingWidth: number
  ) {
    const ctx = this.ctx;
    ctx.strokeStyle = CanvasEngine.DOOR_COLOR;
    ctx.lineWidth = 1.5;

    // Door frame lines at opening edges
    ctx.beginPath();
    ctx.moveTo(osX + nx * halfThick, osY + ny * halfThick);
    ctx.lineTo(osX - nx * halfThick, osY - ny * halfThick);
    ctx.moveTo(oeX + nx * halfThick, oeY + ny * halfThick);
    ctx.lineTo(oeX - nx * halfThick, oeY - ny * halfThick);
    ctx.stroke();

    // Door swing arc
    const pivotX = direction === 'left' ? osX : oeX;
    const pivotY = direction === 'left' ? osY : oeY;

    const swingNx = nx;
    const swingNy = ny;

    // Arc from wall edge outward
    const arcRadius = openingWidth;
    const wallAngle = Math.atan2(oeY - osY, oeX - osX);
    const normalAngle = Math.atan2(swingNy, swingNx);

    let startAngle: number, endAngle: number;
    if (direction === 'left') {
      startAngle = wallAngle;
      endAngle = normalAngle;
    } else {
      startAngle = normalAngle;
      endAngle = wallAngle + Math.PI;
    }

    ctx.beginPath();
    ctx.arc(pivotX, pivotY, arcRadius, startAngle, endAngle, direction === 'right');
    ctx.strokeStyle = CanvasEngine.DOOR_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Door leaf line
    const leafEndX = pivotX + Math.cos(normalAngle) * arcRadius;
    const leafEndY = pivotY + Math.sin(normalAngle) * arcRadius;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(leafEndX, leafEndY);
    ctx.strokeStyle = CanvasEngine.DOOR_COLOR;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private drawWindow(
    osX: number, osY: number, oeX: number, oeY: number,
    nx: number, ny: number, halfThick: number
  ) {
    const ctx = this.ctx;
    ctx.strokeStyle = CanvasEngine.WINDOW_COLOR;
    ctx.lineWidth = 1.5;

    // Three parallel lines across wall opening
    const offsets = [-halfThick * 0.6, 0, halfThick * 0.6];
    for (const off of offsets) {
      ctx.beginPath();
      ctx.moveTo(osX + nx * off, osY + ny * off);
      ctx.lineTo(oeX + nx * off, oeY + ny * off);
      ctx.stroke();
    }

    // End caps
    ctx.beginPath();
    ctx.moveTo(osX + nx * halfThick * 0.6, osY + ny * halfThick * 0.6);
    ctx.lineTo(osX - nx * halfThick * 0.6, osY - ny * halfThick * 0.6);
    ctx.moveTo(oeX + nx * halfThick * 0.6, oeY + ny * halfThick * 0.6);
    ctx.lineTo(oeX - nx * halfThick * 0.6, oeY - ny * halfThick * 0.6);
    ctx.stroke();
  }

  drawDimensionLine(start: Point, end: Point, offset: number = 30, color: string = CanvasEngine.DIM_COLOR) {
    const ctx = this.ctx;
    const s = this.worldToScreen(start.x, start.y);
    const e = this.worldToScreen(end.x, end.y);

    const dx = e.x - s.x;
    const dy = e.y - s.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 20) return;

    // Normal direction for offset
    const nx = -dy / len;
    const ny = dx / len;

    const so = { x: s.x + nx * offset, y: s.y + ny * offset };
    const eo = { x: e.x + nx * offset, y: e.y + ny * offset };

    ctx.strokeStyle = color;
    ctx.lineWidth = 0.7;

    // Extension lines
    ctx.beginPath();
    ctx.moveTo(s.x + nx * 5, s.y + ny * 5);
    ctx.lineTo(so.x + nx * 5, so.y + ny * 5);
    ctx.moveTo(e.x + nx * 5, e.y + ny * 5);
    ctx.lineTo(eo.x + nx * 5, eo.y + ny * 5);
    ctx.stroke();

    // Dimension line
    ctx.beginPath();
    ctx.moveTo(so.x, so.y);
    ctx.lineTo(eo.x, eo.y);
    ctx.stroke();

    // Tick marks at ends
    const tickLen = 5;
    const tdx = dx / len * tickLen;
    const tdy = dy / len * tickLen;

    ctx.lineWidth = 1;
    ctx.beginPath();
    // Tick at start
    ctx.moveTo(so.x - tdx + nx * tickLen, so.y - tdy + ny * tickLen);
    ctx.lineTo(so.x + tdx - nx * tickLen, so.y + tdy - ny * tickLen);
    // Tick at end
    ctx.moveTo(eo.x - tdx + nx * tickLen, eo.y - tdy + ny * tickLen);
    ctx.lineTo(eo.x + tdx - nx * tickLen, eo.y + tdy - ny * tickLen);
    ctx.stroke();

    // Measurement text
    const distMM = Math.sqrt(
      (end.x - start.x) ** 2 + (end.y - start.y) ** 2
    );
    const text = formatDimension(distMM);

    const midX = (so.x + eo.x) / 2;
    const midY = (so.y + eo.y) / 2;

    ctx.save();
    ctx.translate(midX, midY);
    let angle = Math.atan2(dy, dx);
    if (angle > Math.PI / 2) angle -= Math.PI;
    if (angle < -Math.PI / 2) angle += Math.PI;
    ctx.rotate(angle);

    ctx.fillStyle = CanvasEngine.BG;
    ctx.font = '11px monospace';
    const tw = ctx.measureText(text).width;
    ctx.fillRect(-tw / 2 - 3, -8, tw + 6, 14);

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  drawRoomLabel(center: Point, name: string, area: number) {
    const ctx = this.ctx;
    const s = this.worldToScreen(center.x, center.y);

    ctx.fillStyle = CanvasEngine.LABEL_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(name, s.x, s.y - 10);

    ctx.font = '12px sans-serif';
    const areaText = `${area.toFixed(1)} m\u00B2`;
    ctx.fillText(areaText, s.x, s.y + 10);
  }

  drawSnapIndicator(point: Point, snapType: 'grid' | 'endpoint' | 'midpoint') {
    const ctx = this.ctx;
    const s = this.worldToScreen(point.x, point.y);

    ctx.strokeStyle = CanvasEngine.SNAP_COLOR;
    ctx.lineWidth = 1.5;

    if (snapType === 'endpoint') {
      ctx.beginPath();
      ctx.rect(s.x - 5, s.y - 5, 10, 10);
      ctx.stroke();
    } else if (snapType === 'midpoint') {
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - 6);
      ctx.lineTo(s.x + 6, s.y + 4);
      ctx.lineTo(s.x - 6, s.y + 4);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = CanvasEngine.SNAP_COLOR;
      ctx.fill();
    }
  }

  drawPreviewLine(from: Point, to: Point, thickness: number) {
    const wall: Wall = {
      id: '__preview__',
      start: from,
      end: to,
      thickness,
      openings: [],
    };
    this.drawWall(wall, false, true);

    // Also draw dimension for preview
    this.drawDimensionLine(from, to, 30, 'rgba(255,107,53,0.5)');
  }

  drawStatusBar(mouseWorld: Point, zoom: number, tool: string) {
    const ctx = this.ctx;
    const barH = 28;
    const y = this.height - barH;

    // Background
    ctx.fillStyle = 'rgba(20,20,35,0.9)';
    ctx.fillRect(0, y, this.width, barH);

    // Top border
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.width, y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px monospace';
    ctx.textBaseline = 'middle';

    // Coordinates
    ctx.textAlign = 'left';
    const xStr = `X: ${Math.round(mouseWorld.x).toLocaleString('ru-RU')} mm`;
    const yStr = `Y: ${Math.round(mouseWorld.y).toLocaleString('ru-RU')} mm`;
    ctx.fillText(xStr, 12, y + barH / 2);
    ctx.fillText(yStr, 180, y + barH / 2);

    // Zoom
    ctx.fillText(`Zoom: ${Math.round(zoom * 1000)}%`, 350, y + barH / 2);

    // Tool
    const toolNames: Record<string, string> = {
      select: 'Select',
      wall: 'Draw Wall',
      door: 'Place Door',
      window: 'Place Window',
      room: 'Room',
      measure: 'Measure',
      eraser: 'Eraser',
    };
    ctx.textAlign = 'right';
    ctx.fillText(toolNames[tool] || tool, this.width - 12, y + barH / 2);

    // Scale indicator
    this.drawScaleIndicator(y);
  }

  private drawScaleIndicator(barY: number) {
    const ctx = this.ctx;
    const zoom = this.viewState.zoom;

    // Find a nice round length in mm that maps to ~100-200px
    const targetPx = 120;
    const targetMM = targetPx / zoom;

    // Round to nice number
    const magnitudes = [100, 200, 500, 1000, 2000, 5000, 10000];
    let scaleMM = magnitudes[0];
    for (const m of magnitudes) {
      if (m * zoom >= 60 && m * zoom <= 250) {
        scaleMM = m;
        break;
      }
    }
    if (scaleMM * zoom < 60) scaleMM = Math.ceil(targetMM / 1000) * 1000;

    const scalePx = scaleMM * zoom;
    const x = this.width / 2 - scalePx / 2;
    const y = barY + 14;

    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y + 4);
    ctx.moveTo(x, y);
    ctx.lineTo(x + scalePx, y);
    ctx.moveTo(x + scalePx, y - 4);
    ctx.lineTo(x + scalePx, y + 4);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = scaleMM >= 1000 ? `${scaleMM / 1000} m` : `${scaleMM} mm`;
    ctx.fillText(label, x + scalePx / 2, y - 10);
  }

  drawHintText(text: string) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = text.split('\n');
    const lineHeight = 24;
    const startY = this.height / 2 - (lines.length * lineHeight) / 2;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], this.width / 2, startY + i * lineHeight);
    }
  }

  drawMeasureLine(p1: Point, p2: Point) {
    const ctx = this.ctx;
    const s1 = this.worldToScreen(p1.x, p1.y);
    const s2 = this.worldToScreen(p2.x, p2.y);

    ctx.strokeStyle = CanvasEngine.MEASURE_COLOR;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(s1.x, s1.y);
    ctx.lineTo(s2.x, s2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Endpoints
    for (const p of [s1, s2]) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = CanvasEngine.MEASURE_COLOR;
      ctx.fill();
    }

    // Distance label
    const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    const text = formatDimension(dist);
    const midX = (s1.x + s2.x) / 2;
    const midY = (s1.y + s2.y) / 2;

    ctx.fillStyle = 'rgba(20,20,35,0.85)';
    ctx.font = 'bold 12px monospace';
    const tw = ctx.measureText(text).width;
    ctx.fillRect(midX - tw / 2 - 6, midY - 22, tw + 12, 20);

    ctx.strokeStyle = CanvasEngine.MEASURE_COLOR;
    ctx.lineWidth = 1;
    ctx.strokeRect(midX - tw / 2 - 6, midY - 22, tw + 12, 20);

    ctx.fillStyle = CanvasEngine.MEASURE_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, midX, midY - 12);
  }

  drawDrawingPoints(points: Point[]) {
    const ctx = this.ctx;
    ctx.fillStyle = CanvasEngine.WALL_COLOR;

    for (const p of points) {
      const s = this.worldToScreen(p.x, p.y);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0,212,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  getCanvasSize() {
    return { width: this.width, height: this.height };
  }
}

export function formatDimension(mm: number): string {
  const rounded = Math.round(mm);
  if (rounded >= 1000) {
    const str = rounded.toString();
    // Insert space as thousands separator
    const formatted = str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted}`;
  }
  return `${rounded}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function wallLength(wall: Wall): number {
  return Math.sqrt(
    (wall.end.x - wall.start.x) ** 2 + (wall.end.y - wall.start.y) ** 2
  );
}

export function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((point.x - start.x) ** 2 + (point.y - start.y) ** 2);

  let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = start.x + t * dx;
  const projY = start.y + t * dy;
  return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
}

export function positionOnWall(point: Point, wall: Wall): number {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  const t = ((point.x - wall.start.x) * dx + (point.y - wall.start.y) * dy) / lenSq;
  return Math.max(0.1, Math.min(0.9, t));
}

export function snapToAngle(from: Point, to: Point, shiftHeld: boolean): Point {
  if (!shiftHeld) return to;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return to;

  const angle = Math.atan2(dy, dx);
  const snapAngles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (-3 * Math.PI) / 4, -Math.PI / 2, -Math.PI / 4];

  let closestAngle = snapAngles[0];
  let minDiff = Math.abs(angle - snapAngles[0]);

  for (const sa of snapAngles) {
    let diff = Math.abs(angle - sa);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    if (diff < minDiff) {
      minDiff = diff;
      closestAngle = sa;
    }
  }

  return {
    x: from.x + Math.cos(closestAngle) * dist,
    y: from.y + Math.sin(closestAngle) * dist,
  };
}

export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

export function findSnapPoint(
  point: Point,
  walls: Wall[],
  gridSize: number,
  doSnap: boolean
): { point: Point; snapped: boolean; snapType?: 'grid' | 'endpoint' | 'midpoint' } {
  if (!doSnap) return { point, snapped: false };

  const snapRadius = 150; // mm

  // Check endpoints first
  for (const wall of walls) {
    for (const ep of [wall.start, wall.end]) {
      const dist = Math.sqrt((point.x - ep.x) ** 2 + (point.y - ep.y) ** 2);
      if (dist < snapRadius) {
        return { point: { ...ep }, snapped: true, snapType: 'endpoint' };
      }
    }
  }

  // Check midpoints
  for (const wall of walls) {
    const mid = {
      x: (wall.start.x + wall.end.x) / 2,
      y: (wall.start.y + wall.end.y) / 2,
    };
    const dist = Math.sqrt((point.x - mid.x) ** 2 + (point.y - mid.y) ** 2);
    if (dist < snapRadius) {
      return { point: mid, snapped: true, snapType: 'midpoint' };
    }
  }

  // Grid snap
  const gridSnapped = snapToGrid(point, gridSize);
  return { point: gridSnapped, snapped: true, snapType: 'grid' };
}
