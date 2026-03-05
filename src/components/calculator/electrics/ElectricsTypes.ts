export interface ElectricsConfig {
  id: string;
  roomName: string;
  roomType: string;
  area: number;
  outletsCount: number;
  doubleOutletsCount: number;
  groundedOutletsCount: number;
  switchesCount: number;
  doubleSwitchesCount: number;
  dimmersCount: number;
  lightGroupsCount: number;
  spotLightsCount: number;
  cablingType: string;
  cableRunM: number;
  panelIncluded: boolean;
  breakersCount: number;
  groundingIncluded: boolean;
  testingIncluded: boolean;
  note: string;
  totalPrice: number;
}


export interface RoomType {
  value: string;
  label: string;
  icon: string;
  priceCoeff: number;
}

export interface CablingType {
  id: string;
  label: string;
  description: string;
  pricePerM: number;
}

export const ROOM_TYPES: RoomType[] = [
  { value: "bedroom",  label: "Спальня",          icon: "BedDouble",    priceCoeff: 1.0 },
  { value: "living",   label: "Гостиная",          icon: "Sofa",         priceCoeff: 1.0 },
  { value: "kitchen",  label: "Кухня",             icon: "UtensilsCrossed", priceCoeff: 1.2 },
  { value: "bathroom", label: "Ванная / санузел",  icon: "ShowerHead",   priceCoeff: 1.35 },
  { value: "hallway",  label: "Коридор / прихожая",icon: "DoorOpen",     priceCoeff: 0.9 },
  { value: "office",   label: "Кабинет",           icon: "Monitor",      priceCoeff: 1.1 },
];

export const CABLING_TYPES: CablingType[] = [
  { id: "open",        label: "Открытая проводка",       description: "Кабель-канал / ретро",     pricePerM: 200 },
  { id: "corrugated",  label: "В гофре / трубе",         description: "Поверх стен в гофре",      pricePerM: 290 },
  { id: "hidden",      label: "Скрытая (в штробах)",     description: "Штробление + шпаклёвка",   pricePerM: 520 },
];

export { CALC_REGIONS as REGIONS, DEFAULT_REGION_ID } from "@/components/calculator/shared/regions";

export const DEFAULT_ELECTRICS_CONFIG: Omit<ElectricsConfig, "id" | "totalPrice"> = {
  roomName: "",
  roomType: "bedroom",
  area: 18,
  outletsCount: 4,
  doubleOutletsCount: 1,
  groundedOutletsCount: 2,
  switchesCount: 2,
  doubleSwitchesCount: 0,
  dimmersCount: 0,
  lightGroupsCount: 1,
  spotLightsCount: 6,
  cablingType: "hidden",
  cableRunM: 20,
  panelIncluded: false,
  breakersCount: 4,
  groundingIncluded: false,
  testingIncluded: true,
  note: "",
};