export interface Point {
  x: number; // in mm
  y: number; // in mm
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number; // mm
  openings: Opening[];
}

export interface Opening {
  id: string;
  type: 'door' | 'window';
  position: number; // 0-1, position along wall
  width: number; // mm
  direction?: 'left' | 'right'; // door swing direction
}

export interface Room {
  id: string;
  name: string;
  walls: string[]; // wall IDs forming the room
  color?: string;
}

export interface FloorPlan {
  walls: Wall[];
  rooms: Room[];
  scale: number; // pixels per mm
}

export type Tool = 'select' | 'wall' | 'door' | 'window' | 'room' | 'measure' | 'eraser';

export interface ViewState {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

export interface SnapResult {
  point: Point;
  snapped: boolean;
  snapType?: 'grid' | 'endpoint' | 'midpoint';
}

export interface ConstructorState {
  tool: Tool;
  walls: Wall[];
  rooms: Room[];
  selectedId: string | null;
  drawingPoints: Point[];
  isDrawing: boolean;
  viewState: ViewState;
  gridSize: number; // mm, default 100
  wallThickness: number; // mm, default 120
  showGrid: boolean;
  showDimensions: boolean;
  snapToGrid: boolean;
  history: { walls: Wall[]; rooms: Room[] }[];
  historyIndex: number;
  mouseWorld: Point;
  mouseScreen: Point;
  shiftHeld: boolean;
  measurePoints: Point[];
}

export type ConstructorAction =
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'SET_WALLS'; walls: Wall[] }
  | { type: 'SET_ROOMS'; rooms: Room[] }
  | { type: 'ADD_WALL'; wall: Wall }
  | { type: 'UPDATE_WALL'; id: string; updates: Partial<Wall> }
  | { type: 'DELETE_WALL'; id: string }
  | { type: 'SELECT'; id: string | null }
  | { type: 'START_DRAWING'; point: Point }
  | { type: 'ADD_DRAWING_POINT'; point: Point }
  | { type: 'FINISH_DRAWING' }
  | { type: 'CANCEL_DRAWING' }
  | { type: 'SET_VIEW'; viewState: Partial<ViewState> }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_DIMENSIONS' }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'SET_WALL_THICKNESS'; thickness: number }
  | { type: 'SET_MOUSE'; world: Point; screen: Point }
  | { type: 'SET_SHIFT'; held: boolean }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'PUSH_HISTORY' }
  | { type: 'ADD_OPENING'; wallId: string; opening: Opening }
  | { type: 'UPDATE_OPENING'; wallId: string; openingId: string; updates: Partial<Opening> }
  | { type: 'DELETE_OPENING'; wallId: string; openingId: string }
  | { type: 'ADD_MEASURE_POINT'; point: Point }
  | { type: 'CLEAR_MEASURE' }
  | { type: 'LOAD_DATA'; walls: Wall[]; rooms: Room[] };