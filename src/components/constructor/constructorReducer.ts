import { ConstructorState, ConstructorAction } from './types';

export const initialState: ConstructorState = {
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

export function constructorReducer(
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
    case 'UPDATE_OPENING': {
      return {
        ...state,
        walls: state.walls.map((w) =>
          w.id === action.wallId
            ? {
                ...w,
                openings: w.openings.map((o) =>
                  o.id === action.openingId ? { ...o, ...action.updates } : o
                ),
              }
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