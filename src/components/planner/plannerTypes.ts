import type { FurnitureItem } from "./furnitureCatalog";

export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number;
  openings: Opening[];
}

export interface Opening {
  id: string;
  type: "door" | "window";
  position: number;
  width: number;
  direction?: "left" | "right";
}

export interface PlacedFurniture {
  id: string;
  itemId: string;
  x: number;
  y: number;
  rotation: number;
  flipped: boolean;
}

export type PlannerTool =
  | "select"
  | "wall"
  | "door"
  | "window"
  | "furniture"
  | "eraser"
  | "measure";

export type ViewMode = "2d" | "3d";

export interface ViewState {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

export interface PlannerState {
  tool: PlannerTool;
  viewMode: ViewMode;
  walls: Wall[];
  furniture: PlacedFurniture[];
  selectedId: string | null;
  selectedType: "wall" | "furniture" | null;
  drawingPoints: Point[];
  isDrawing: boolean;
  viewState: ViewState;
  viewState3d: ViewState;
  gridSize: number;
  wallThickness: number;
  ceilingHeight: number;
  showGrid: boolean;
  showDimensions: boolean;
  snapToGrid: boolean;
  history: { walls: Wall[]; furniture: PlacedFurniture[] }[];
  historyIndex: number;
  mouseWorld: Point;
  mouseScreen: Point;
  shiftHeld: boolean;
  measurePoints: Point[];
  dragFurnitureId: string | null;
  floorColor: string;
  wallColor: string;
}

export type PlannerAction =
  | { type: "SET_TOOL"; payload: PlannerTool }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "ADD_WALL"; payload: Wall }
  | { type: "UPDATE_WALL"; payload: { id: string } & Partial<Wall> }
  | { type: "DELETE_WALL"; payload: string }
  | { type: "START_DRAWING"; payload: Point }
  | { type: "ADD_DRAWING_POINT"; payload: Point }
  | { type: "FINISH_DRAWING" }
  | { type: "CANCEL_DRAWING" }
  | { type: "SELECT"; payload: { id: string; type: "wall" | "furniture" } }
  | { type: "DESELECT" }
  | { type: "ADD_OPENING"; payload: { wallId: string; opening: Opening } }
  | { type: "DELETE_OPENING"; payload: { wallId: string; openingId: string } }
  | { type: "ADD_FURNITURE"; payload: PlacedFurniture }
  | { type: "UPDATE_FURNITURE"; payload: { id: string } & Partial<PlacedFurniture> }
  | { type: "DELETE_FURNITURE"; payload: string }
  | { type: "SET_VIEW"; payload: Partial<ViewState> }
  | { type: "SET_VIEW_3D"; payload: Partial<ViewState> }
  | { type: "SET_MOUSE"; payload: { world: Point; screen: Point } }
  | { type: "SET_SHIFT"; payload: boolean }
  | { type: "PUSH_HISTORY" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "TOGGLE_GRID" }
  | { type: "TOGGLE_DIMENSIONS" }
  | { type: "TOGGLE_SNAP" }
  | { type: "SET_WALL_THICKNESS"; payload: number }
  | { type: "SET_CEILING_HEIGHT"; payload: number }
  | { type: "ADD_MEASURE_POINT"; payload: Point }
  | { type: "CLEAR_MEASURE" }
  | { type: "SET_DRAG_FURNITURE"; payload: string | null }
  | { type: "SET_FLOOR_COLOR"; payload: string }
  | { type: "SET_WALL_COLOR"; payload: string }
  | { type: "LOAD_DATA"; payload: { walls: Wall[]; furniture: PlacedFurniture[] } };

const MAX_HISTORY = 50;

export const initialState: PlannerState = {
  tool: "select",
  viewMode: "2d",
  walls: [],
  furniture: [],
  selectedId: null,
  selectedType: null,
  drawingPoints: [],
  isDrawing: false,
  viewState: { offsetX: 0, offsetY: 0, zoom: 0.08 },
  viewState3d: { offsetX: 0, offsetY: 0, zoom: 0.06 },
  gridSize: 100,
  wallThickness: 120,
  ceilingHeight: 2700,
  showGrid: true,
  showDimensions: true,
  snapToGrid: true,
  history: [{ walls: [], furniture: [] }],
  historyIndex: 0,
  mouseWorld: { x: 0, y: 0 },
  mouseScreen: { x: 0, y: 0 },
  shiftHeld: false,
  measurePoints: [],
  dragFurnitureId: null,
  floorColor: "#E8DCC8",
  wallColor: "#F5F0E8",
};

export function plannerReducer(
  state: PlannerState,
  action: PlannerAction
): PlannerState {
  switch (action.type) {
    case "SET_TOOL":
      return {
        ...state,
        tool: action.payload,
        isDrawing: false,
        drawingPoints: [],
        measurePoints: [],
      };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "ADD_WALL":
      return { ...state, walls: [...state.walls, action.payload] };

    case "UPDATE_WALL": {
      const { id, ...updates } = action.payload;
      return {
        ...state,
        walls: state.walls.map((w) => (w.id === id ? { ...w, ...updates } : w)),
      };
    }

    case "DELETE_WALL":
      return {
        ...state,
        walls: state.walls.filter((w) => w.id !== action.payload),
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
        selectedType:
          state.selectedId === action.payload ? null : state.selectedType,
      };

    case "START_DRAWING":
      return {
        ...state,
        isDrawing: true,
        drawingPoints: [action.payload],
      };

    case "ADD_DRAWING_POINT":
      return {
        ...state,
        drawingPoints: [...state.drawingPoints, action.payload],
      };

    case "FINISH_DRAWING":
      return {
        ...state,
        isDrawing: false,
        drawingPoints: [],
      };

    case "CANCEL_DRAWING":
      return {
        ...state,
        isDrawing: false,
        drawingPoints: [],
      };

    case "SELECT":
      return {
        ...state,
        selectedId: action.payload.id,
        selectedType: action.payload.type,
      };

    case "DESELECT":
      return { ...state, selectedId: null, selectedType: null };

    case "ADD_OPENING": {
      const { wallId, opening } = action.payload;
      return {
        ...state,
        walls: state.walls.map((w) =>
          w.id === wallId
            ? { ...w, openings: [...w.openings, opening] }
            : w
        ),
      };
    }

    case "DELETE_OPENING": {
      const { wallId, openingId } = action.payload;
      return {
        ...state,
        walls: state.walls.map((w) =>
          w.id === wallId
            ? {
                ...w,
                openings: w.openings.filter((o) => o.id !== openingId),
              }
            : w
        ),
      };
    }

    case "ADD_FURNITURE":
      return {
        ...state,
        furniture: [...state.furniture, action.payload],
      };

    case "UPDATE_FURNITURE": {
      const { id, ...updates } = action.payload;
      return {
        ...state,
        furniture: state.furniture.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ),
      };
    }

    case "DELETE_FURNITURE":
      return {
        ...state,
        furniture: state.furniture.filter((f) => f.id !== action.payload),
        selectedId:
          state.selectedId === action.payload ? null : state.selectedId,
        selectedType:
          state.selectedId === action.payload ? null : state.selectedType,
      };

    case "SET_VIEW":
      return {
        ...state,
        viewState: { ...state.viewState, ...action.payload },
      };

    case "SET_VIEW_3D":
      return {
        ...state,
        viewState3d: { ...state.viewState3d, ...action.payload },
      };

    case "SET_MOUSE":
      return {
        ...state,
        mouseWorld: action.payload.world,
        mouseScreen: action.payload.screen,
      };

    case "SET_SHIFT":
      return { ...state, shiftHeld: action.payload };

    case "PUSH_HISTORY": {
      const newEntry = {
        walls: JSON.parse(JSON.stringify(state.walls)),
        furniture: JSON.parse(JSON.stringify(state.furniture)),
      };
      const trimmed = state.history.slice(0, state.historyIndex + 1);
      const updated = [...trimmed, newEntry];
      const clamped =
        updated.length > MAX_HISTORY
          ? updated.slice(updated.length - MAX_HISTORY)
          : updated;
      return {
        ...state,
        history: clamped,
        historyIndex: clamped.length - 1,
      };
    }

    case "UNDO": {
      if (state.historyIndex <= 0) return state;
      const prevIndex = state.historyIndex - 1;
      const entry = state.history[prevIndex];
      return {
        ...state,
        walls: JSON.parse(JSON.stringify(entry.walls)),
        furniture: JSON.parse(JSON.stringify(entry.furniture)),
        historyIndex: prevIndex,
        selectedId: null,
        selectedType: null,
      };
    }

    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIndex = state.historyIndex + 1;
      const entry = state.history[nextIndex];
      return {
        ...state,
        walls: JSON.parse(JSON.stringify(entry.walls)),
        furniture: JSON.parse(JSON.stringify(entry.furniture)),
        historyIndex: nextIndex,
        selectedId: null,
        selectedType: null,
      };
    }

    case "TOGGLE_GRID":
      return { ...state, showGrid: !state.showGrid };

    case "TOGGLE_DIMENSIONS":
      return { ...state, showDimensions: !state.showDimensions };

    case "TOGGLE_SNAP":
      return { ...state, snapToGrid: !state.snapToGrid };

    case "SET_WALL_THICKNESS":
      return { ...state, wallThickness: action.payload };

    case "SET_CEILING_HEIGHT":
      return { ...state, ceilingHeight: action.payload };

    case "ADD_MEASURE_POINT":
      return {
        ...state,
        measurePoints: [...state.measurePoints, action.payload],
      };

    case "CLEAR_MEASURE":
      return { ...state, measurePoints: [] };

    case "SET_DRAG_FURNITURE":
      return { ...state, dragFurnitureId: action.payload };

    case "SET_FLOOR_COLOR":
      return { ...state, floorColor: action.payload };

    case "SET_WALL_COLOR":
      return { ...state, wallColor: action.payload };

    case "LOAD_DATA":
      return {
        ...state,
        walls: action.payload.walls,
        furniture: action.payload.furniture,
        selectedId: null,
        selectedType: null,
        history: [
          {
            walls: JSON.parse(JSON.stringify(action.payload.walls)),
            furniture: JSON.parse(JSON.stringify(action.payload.furniture)),
          },
        ],
        historyIndex: 0,
      };

    default:
      return state;
  }
}
