import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const interiorStyles = [
  { name: 'Скандинавский', emoji: '🌿', description: 'Минимализм и уют' },
  { name: 'Лофт', emoji: '🏭', description: 'Индустриальный стиль' },
  { name: 'Современный', emoji: '✨', description: 'Актуальные тренды' },
  { name: 'Классика', emoji: '🏛️', description: 'Вечная элегантность' },
];

export const DesignerSection = () => {
  return (
    <div className="space-y-6 animate-slide-up">
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="gradient-orange-blue p-6 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Icon name="Wand2" size={28} />
            ИИ-Дизайнер интерьеров
          </h2>
          <p className="text-white/90 text-sm">Создайте визуализацию вашей мечты за минуты</p>
        </div>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Загрузите фото помещения</CardTitle>
          <CardDescription>ИИ проанализирует и предложит дизайн-решения</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center hover:border-primary/60 transition-colors cursor-pointer">
            <Icon name="Upload" size={48} className="mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground mb-2">Нажмите или перетащите фото</p>
            <p className="text-xs text-muted-foreground">PNG, JPG до 10MB</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Выберите стиль</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {interiorStyles.map((style) => (
              <Card key={style.name} className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{style.emoji}</div>
                  <h3 className="font-semibold mb-1">{style.name}</h3>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full gradient-purple-pink text-white border-0 h-14 text-lg font-semibold shadow-lg">
        <Icon name="Sparkles" size={20} className="mr-2" />
        Сгенерировать дизайн
      </Button>
    </div>
  );
};
