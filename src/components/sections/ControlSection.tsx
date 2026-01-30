import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

const projectStages = [
  { name: 'Демонтаж', progress: 100, status: 'completed' },
  { name: 'Электрика', progress: 75, status: 'in-progress' },
  { name: 'Сантехника', progress: 30, status: 'in-progress' },
  { name: 'Отделка стен', progress: 0, status: 'pending' },
  { name: 'Напольное покрытие', progress: 0, status: 'pending' },
];

export const ControlSection = () => {
  return (
    <div className="space-y-6 animate-slide-up">
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="gradient-orange-blue p-6 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Icon name="ClipboardCheck" size={28} />
            Контроль работ
          </h2>
          <p className="text-white/90 text-sm">Отслеживайте прогресс в режиме реального времени</p>
        </div>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Этапы ремонта</CardTitle>
          <CardDescription>Квартира на ул. Ленина, 45 • 2-комнатная</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {projectStages.map((stage, index) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      stage.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : stage.status === 'in-progress'
                        ? 'gradient-purple-pink text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {stage.status === 'completed' ? (
                      <Icon name="Check" size={20} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{stage.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {stage.status === 'completed'
                        ? 'Завершено'
                        : stage.status === 'in-progress'
                        ? 'В работе'
                        : 'Ожидает'}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-primary">{stage.progress}%</span>
              </div>
              <Progress value={stage.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 gradient-card">
        <CardHeader>
          <CardTitle className="text-lg">Инструменты контроля</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Icon name="Ruler" size={24} className="text-primary" />
            <span className="text-xs">Рулетка</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Icon name="Move" size={24} className="text-secondary" />
            <span className="text-xs">Уровень</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Icon name="Calculator" size={24} className="text-accent" />
            <span className="text-xs">Калькулятор</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
