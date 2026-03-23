import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import type { RoomDimensions, WallOpening, PlacedFurniture, WallStyle, WallName } from "./types";
import { WALL_LABELS, MATERIALS, DEFAULT_WALL_STYLES } from "./types";
import { FURNITURE_CATALOG, FURNITURE_CATEGORIES } from "./furnitureCatalog";
import ModelManager from "./ModelManager";

interface Props {
  dimensions: RoomDimensions;
  onDimensionsChange: (d: RoomDimensions) => void;
  openings: WallOpening[];
  onAddOpening: (o: WallOpening) => void;
  onRemoveOpening: (id: string) => void;
  furniture: PlacedFurniture[];
  onAddFurniture: (catalogId: string) => void;
  onRemoveFurniture: (id: string) => void;
  onUpdateFurniture: (id: string, patch: Partial<PlacedFurniture>) => void;
  selectedFurnitureId: string | null;
  wallStyles: WallStyle[];
  onUpdateWallStyle: (wall: string, patch: Partial<WallStyle>) => void;
  modelMap: Record<string, string>;
  onModelAttached: (catalogId: string, modelUrl: string | null) => void;
}

export default function DesignerSidebar({
  dimensions, onDimensionsChange,
  openings, onAddOpening, onRemoveOpening,
  furniture, onAddFurniture, onRemoveFurniture, onUpdateFurniture,
  selectedFurnitureId,
  wallStyles, onUpdateWallStyle,
  modelMap, onModelAttached,
}: Props) {
  const [furnitureFilter, setFurnitureFilter] = useState("all");

  const selectedPlaced = furniture.find(f => f.id === selectedFurnitureId);
  const selectedCatalog = selectedPlaced
    ? FURNITURE_CATALOG.find(f => f.id === selectedPlaced.catalogId)
    : null;

  const filteredFurniture = furnitureFilter === "all"
    ? FURNITURE_CATALOG
    : FURNITURE_CATALOG.filter(f => f.category === furnitureFilter);

  const addOpening = (wall: WallName, type: "door" | "window") => {
    onAddOpening({
      id: `op-${Date.now()}`,
      wall,
      type,
      position: 0.5,
      width: type === "door" ? 0.9 : 1.2,
      height: type === "door" ? 2.1 : 1.5,
      elevation: type === "door" ? 0 : 0.9,
    });
  };

  const getWallStyle = (wall: string) =>
    wallStyles.find(s => s.wall === wall) ?? DEFAULT_WALL_STYLES.find(s => s.wall === wall)!;

  return (
    <div className="w-80 bg-white border-l overflow-y-auto flex flex-col">
      <Tabs defaultValue="room" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-5 m-2 h-8">
          <TabsTrigger value="room" className="text-[11px] px-1">Комната</TabsTrigger>
          <TabsTrigger value="openings" className="text-[11px] px-1">Проёмы</TabsTrigger>
          <TabsTrigger value="furniture" className="text-[11px] px-1">Мебель</TabsTrigger>
          <TabsTrigger value="style" className="text-[11px] px-1">Стиль</TabsTrigger>
          <TabsTrigger value="models" className="text-[11px] px-1">3D</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <TabsContent value="room" className="mt-0 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">Размеры помещения</p>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Ширина, м</Label>
                <Input type="number" min={1} max={20} step={0.1}
                  value={dimensions.width}
                  onChange={e => onDimensionsChange({ ...dimensions, width: parseFloat(e.target.value) || 1 })}
                  className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Длина, м</Label>
                <Input type="number" min={1} max={20} step={0.1}
                  value={dimensions.length}
                  onChange={e => onDimensionsChange({ ...dimensions, length: parseFloat(e.target.value) || 1 })}
                  className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Высота потолка, м</Label>
                <Input type="number" min={2} max={5} step={0.1}
                  value={dimensions.height}
                  onChange={e => onDimensionsChange({ ...dimensions, height: parseFloat(e.target.value) || 2.5 })}
                  className="h-8 text-sm" />
              </div>
            </div>
            <Card className="p-3 bg-gray-50">
              <p className="text-xs text-gray-500">Площадь пола: <strong>{(dimensions.width * dimensions.length).toFixed(1)} м²</strong></p>
              <p className="text-xs text-gray-500">Объём: <strong>{(dimensions.width * dimensions.length * dimensions.height).toFixed(1)} м³</strong></p>
            </Card>
          </TabsContent>

          <TabsContent value="openings" className="mt-0 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">Двери и окна</p>
            {(["front", "back", "left", "right"] as WallName[]).map(wall => {
              const wallOpenings = openings.filter(o => o.wall === wall);
              return (
                <Card key={wall} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">{WALL_LABELS[wall]} стена</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => addOpening(wall, "door")}>
                        <Icon name="DoorOpen" size={11} className="mr-1" />Дверь
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => addOpening(wall, "window")}>
                        <Icon name="AppWindow" size={11} className="mr-1" />Окно
                      </Button>
                    </div>
                  </div>
                  {wallOpenings.length === 0 && (
                    <p className="text-[11px] text-gray-400">Нет проёмов</p>
                  )}
                  {wallOpenings.map(o => (
                    <div key={o.id} className="flex items-center justify-between text-xs py-1 border-t">
                      <div className="flex items-center gap-1.5">
                        <Icon name={o.type === "door" ? "DoorOpen" : "AppWindow"} size={12} className={o.type === "door" ? "text-green-600" : "text-blue-600"} />
                        <span>{o.type === "door" ? "Дверь" : "Окно"} {o.width}×{o.height} м</span>
                      </div>
                      <button onClick={() => onRemoveOpening(o.id)} className="text-gray-300 hover:text-red-400">
                        <Icon name="Trash2" size={12} />
                      </button>
                    </div>
                  ))}
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="furniture" className="mt-0 space-y-3">
            {selectedPlaced && selectedCatalog ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Свойства</p>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px]"
                    onClick={() => onRemoveFurniture(selectedPlaced.id)}>
                    <Icon name="Trash2" size={11} className="mr-1 text-red-400" />Удалить
                  </Button>
                </div>
                <Card className="p-3 space-y-2">
                  <p className="text-sm font-medium">{selectedCatalog.name}</p>
                  <p className="text-[11px] text-gray-400">
                    {selectedCatalog.width}×{selectedCatalog.depth}×{selectedCatalog.height} м
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Позиция X, м</Label>
                    <Input type="number" step={0.1} value={selectedPlaced.x}
                      onChange={e => onUpdateFurniture(selectedPlaced.id, { x: parseFloat(e.target.value) || 0 })}
                      className="h-7 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Позиция Z, м</Label>
                    <Input type="number" step={0.1} value={selectedPlaced.z}
                      onChange={e => onUpdateFurniture(selectedPlaced.id, { z: parseFloat(e.target.value) || 0 })}
                      className="h-7 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Поворот, °</Label>
                    <Input type="number" step={15} value={selectedPlaced.rotation}
                      onChange={e => onUpdateFurniture(selectedPlaced.id, { rotation: parseFloat(e.target.value) || 0 })}
                      className="h-7 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Цвет</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={selectedPlaced.color}
                        onChange={e => onUpdateFurniture(selectedPlaced.id, { color: e.target.value })}
                        className="w-8 h-7 rounded border cursor-pointer" />
                      <span className="text-[11px] text-gray-400">{selectedPlaced.color}</span>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase">Каталог мебели</p>
                <div className="flex flex-wrap gap-1 mb-1">
                  <button
                    onClick={() => setFurnitureFilter("all")}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${furnitureFilter === "all" ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-500"}`}
                  >Все</button>
                  {FURNITURE_CATEGORIES.map(c => (
                    <button key={c.id}
                      onClick={() => setFurnitureFilter(c.id)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${furnitureFilter === c.id ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-500"}`}
                    >{c.label}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredFurniture.map(item => (
                    <button key={item.id}
                      onClick={() => onAddFurniture(item.id)}
                      className="relative flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-center"
                    >
                      {(item.modelUrl || modelMap[item.id]) && (
                        <Badge variant="secondary" className="absolute top-1 right-1 px-1 py-0 text-[8px] leading-tight bg-violet-100 text-violet-600 border-violet-200">3D</Badge>
                      )}
                      <Icon name={item.icon as "Sofa"} size={18} className="text-gray-500" />
                      <span className="text-[10px] text-gray-700 leading-tight">{item.name}</span>
                      <span className="text-[9px] text-gray-400">{item.width}×{item.depth} м</span>
                    </button>
                  ))}
                </div>
                {furniture.length > 0 && (
                  <div className="border-t pt-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Добавлено ({furniture.length})</p>
                    {furniture.map(f => {
                      const cat = FURNITURE_CATALOG.find(c => c.id === f.catalogId);
                      return (
                        <div key={f.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                          <span className="truncate">{cat?.name}</span>
                          <button onClick={() => onRemoveFurniture(f.id)} className="text-gray-300 hover:text-red-400 shrink-0 ml-2">
                            <Icon name="Trash2" size={11} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="style" className="mt-0 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">Отделка поверхностей</p>
            {(["floor", "ceiling", "front", "back", "left", "right"] as const).map(surface => {
              const style = getWallStyle(surface);
              const label = surface === "floor" ? "Пол" : surface === "ceiling" ? "Потолок" : WALL_LABELS[surface as WallName] + " стена";
              return (
                <Card key={surface} className="p-3 space-y-2">
                  <p className="text-xs font-medium">{label}</p>
                  <div className="flex items-center gap-2">
                    <Label className="text-[11px] w-12">Цвет</Label>
                    <input type="color" value={style.color}
                      onChange={e => onUpdateWallStyle(surface, { color: e.target.value })}
                      className="w-7 h-6 rounded border cursor-pointer" />
                    <span className="text-[10px] text-gray-400">{style.color}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[11px] w-12">Отделка</Label>
                    <Select value={style.material} onValueChange={v => onUpdateWallStyle(surface, { material: v })}>
                      <SelectTrigger className="h-7 text-[11px] flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIALS.map(m => (
                          <SelectItem key={m.id} value={m.id} className="text-xs">{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="models" className="mt-0">
            <ModelManager
              selectedCatalogId={selectedPlaced?.catalogId}
              onModelAttached={onModelAttached}
              modelMap={modelMap}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}