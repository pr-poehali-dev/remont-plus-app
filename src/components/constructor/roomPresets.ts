import { Point } from './types';

export interface RoomPreset {
  id: string;
  name: string;
  icon: string;
  walls: { start: Point; end: Point }[];
  label: string;
}

export const roomPresets: RoomPreset[] = [
  {
    id: 'studio-28',
    name: '\u0421\u0442\u0443\u0434\u0438\u044F 28 \u043C\u00B2',
    icon: 'Home',
    label: '5,6 \u00D7 5 \u043C',
    walls: [
      { start: { x: 0, y: 0 }, end: { x: 5600, y: 0 } },
      { start: { x: 5600, y: 0 }, end: { x: 5600, y: 5000 } },
      { start: { x: 5600, y: 5000 }, end: { x: 0, y: 5000 } },
      { start: { x: 0, y: 5000 }, end: { x: 0, y: 0 } },
    ],
  },
  {
    id: 'living-20',
    name: '\u0413\u043E\u0441\u0442\u0438\u043D\u0430\u044F 20 \u043C\u00B2',
    icon: 'Sofa',
    label: '5 \u00D7 4 \u043C',
    walls: [
      { start: { x: 0, y: 0 }, end: { x: 5000, y: 0 } },
      { start: { x: 5000, y: 0 }, end: { x: 5000, y: 4000 } },
      { start: { x: 5000, y: 4000 }, end: { x: 0, y: 4000 } },
      { start: { x: 0, y: 4000 }, end: { x: 0, y: 0 } },
    ],
  },
  {
    id: 'bedroom-14',
    name: '\u0421\u043F\u0430\u043B\u044C\u043D\u044F 14 \u043C\u00B2',
    icon: 'Bed',
    label: '4 \u00D7 3,5 \u043C',
    walls: [
      { start: { x: 0, y: 0 }, end: { x: 4000, y: 0 } },
      { start: { x: 4000, y: 0 }, end: { x: 4000, y: 3500 } },
      { start: { x: 4000, y: 3500 }, end: { x: 0, y: 3500 } },
      { start: { x: 0, y: 3500 }, end: { x: 0, y: 0 } },
    ],
  },
  {
    id: 'kitchen-10',
    name: '\u041A\u0443\u0445\u043D\u044F 10 \u043C\u00B2',
    icon: 'CookingPot',
    label: '4 \u00D7 2,5 \u043C',
    walls: [
      { start: { x: 0, y: 0 }, end: { x: 4000, y: 0 } },
      { start: { x: 4000, y: 0 }, end: { x: 4000, y: 2500 } },
      { start: { x: 4000, y: 2500 }, end: { x: 0, y: 2500 } },
      { start: { x: 0, y: 2500 }, end: { x: 0, y: 0 } },
    ],
  },
  {
    id: 'bathroom-4',
    name: '\u0412\u0430\u043D\u043D\u0430\u044F 4 \u043C\u00B2',
    icon: 'Bath',
    label: '2 \u00D7 2 \u043C',
    walls: [
      { start: { x: 0, y: 0 }, end: { x: 2000, y: 0 } },
      { start: { x: 2000, y: 0 }, end: { x: 2000, y: 2000 } },
      { start: { x: 2000, y: 2000 }, end: { x: 0, y: 2000 } },
      { start: { x: 0, y: 2000 }, end: { x: 0, y: 0 } },
    ],
  },
  {
    id: 'corridor',
    name: '\u041A\u043E\u0440\u0438\u0434\u043E\u0440',
    icon: 'MoveHorizontal',
    label: '5 \u00D7 1,5 \u043C',
    walls: [
      { start: { x: 0, y: 0 }, end: { x: 5000, y: 0 } },
      { start: { x: 5000, y: 0 }, end: { x: 5000, y: 1500 } },
      { start: { x: 5000, y: 1500 }, end: { x: 0, y: 1500 } },
      { start: { x: 0, y: 1500 }, end: { x: 0, y: 0 } },
    ],
  },
  {
    id: 'l-shape',
    name: '\u0413-\u043E\u0431\u0440\u0430\u0437\u043D\u0430\u044F',
    icon: 'CornerDownRight',
    label: '\u0413-\u043E\u0431\u0440\u0430\u0437\u043D\u0430\u044F',
    walls: [
      { start: { x: 0, y: 0 }, end: { x: 6000, y: 0 } },
      { start: { x: 6000, y: 0 }, end: { x: 6000, y: 3000 } },
      { start: { x: 6000, y: 3000 }, end: { x: 3000, y: 3000 } },
      { start: { x: 3000, y: 3000 }, end: { x: 3000, y: 5000 } },
      { start: { x: 3000, y: 5000 }, end: { x: 0, y: 5000 } },
      { start: { x: 0, y: 5000 }, end: { x: 0, y: 0 } },
    ],
  },
  {
    id: 'u-shape',
    name: '\u041F-\u043E\u0431\u0440\u0430\u0437\u043D\u0430\u044F',
    icon: 'Square',
    label: '\u041F-\u043E\u0431\u0440\u0430\u0437\u043D\u0430\u044F',
    walls: [
      { start: { x: 0, y: 0 }, end: { x: 6000, y: 0 } },
      { start: { x: 6000, y: 0 }, end: { x: 6000, y: 5000 } },
      { start: { x: 6000, y: 5000 }, end: { x: 4500, y: 5000 } },
      { start: { x: 4500, y: 5000 }, end: { x: 4500, y: 2000 } },
      { start: { x: 4500, y: 2000 }, end: { x: 1500, y: 2000 } },
      { start: { x: 1500, y: 2000 }, end: { x: 1500, y: 5000 } },
      { start: { x: 1500, y: 5000 }, end: { x: 0, y: 5000 } },
      { start: { x: 0, y: 5000 }, end: { x: 0, y: 0 } },
    ],
  },
];

export default roomPresets;