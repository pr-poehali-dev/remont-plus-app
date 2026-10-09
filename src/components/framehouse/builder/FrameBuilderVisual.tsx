import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import HousePlan2D from "@/components/framehouse/HousePlan2D";
import House3DPanel from "@/components/framehouse/House3DPanel";
import type { FrameHouseSpec } from "@/lib/frameHouseGenerator";

export default function FrameBuilderVisual({ spec }: { spec: FrameHouseSpec }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 flex-wrap justify-between">
          <span className="flex items-center gap-2">
            <Icon name="Box" className="w-4 h-4 text-orange-500" />
            Визуализация дома
          </span>
          <span className="text-[11px] font-normal text-slate-500 inline-flex items-center gap-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-semibold">
              <Icon name="Sparkles" size={10} />
              PBR
            </span>
            Реалистичный рендер в реальном времени
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="3d">
          <TabsList>
            <TabsTrigger value="3d">
              <Icon name="Box" className="w-4 h-4 mr-1.5" />
              3D-вид
            </TabsTrigger>
            <TabsTrigger value="plan">
              <Icon name="Map" className="w-4 h-4 mr-1.5" />
              План этажа
            </TabsTrigger>
          </TabsList>
          <TabsContent value="3d" className="mt-3">
            <House3DPanel spec={spec} />
          </TabsContent>
          <TabsContent value="plan" className="mt-3">
            <HousePlan2D spec={spec} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
