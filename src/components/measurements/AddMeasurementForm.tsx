import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const MEASUREMENTS_API_URL = 'https://functions.poehali.dev/ca4728a3-6912-416e-89e7-034c6de68e60';

interface AddMeasurementFormProps {
  projectId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMeasurementForm = ({ projectId, onClose, onSuccess }: AddMeasurementFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [useLaser, setUseLaser] = useState(false);
  const [formData, setFormData] = useState({
    room_name: '',
    length: '',
    width: '',
    height: '',
    notes: ''
  });
  const { toast } = useToast();

  const roomPresets = [
    'Гостиная',
    'Спальня',
    'Кухня',
    'Ванная',
    'Туалет',
    'Коридор',
    'Балкон',
    'Кладовая'
  ];

  const handleLaserMeasure = async (field: 'length' | 'width' | 'height') => {
    try {
      const simulatedValue = (Math.random() * 5 + 2).toFixed(2);
      
      toast({
        title: 'Измерение получено',
        description: `${simulatedValue} м`,
        duration: 2000
      });
      
      setFormData({...formData, [field]: simulatedValue});
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить измерение',
        variant: 'destructive'
      });
    }
  };

  const calculateArea = () => {
    if (formData.length && formData.width) {
      const area = (parseFloat(formData.length) * parseFloat(formData.width)).toFixed(2);
      return area;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(MEASUREMENTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          room_name: formData.room_name,
          length: parseFloat(formData.length),
          width: parseFloat(formData.width),
          height: parseFloat(formData.height),
          notes: formData.notes || null
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Измерение добавлено!',
          description: `Площадь: ${data.area.toFixed(2)} м²`
        });
        onSuccess();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось добавить измерение',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить измерение',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const area = calculateArea();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Добавить измерение</CardTitle>
              <CardDescription>Внесите размеры помещения</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="room_name">Название помещения *</Label>
              <div className="flex gap-2">
                <Input
                  id="room_name"
                  value={formData.room_name}
                  onChange={(e) => setFormData({...formData, room_name: e.target.value})}
                  placeholder="Гостиная"
                  required
                  className="flex-1"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {roomPresets.map((room) => (
                  <Button
                    key={room}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({...formData, room_name: room})}
                    className="text-xs"
                  >
                    {room}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="Smartphone" size={24} className="text-primary" />
                <div>
                  <div className="font-semibold">Использовать лазерную рулетку</div>
                  <div className="text-sm text-muted-foreground">Автоматические измерения</div>
                </div>
              </div>
              <Button
                type="button"
                variant={useLaser ? 'default' : 'outline'}
                onClick={() => setUseLaser(!useLaser)}
              >
                {useLaser ? 'Включено' : 'Выключено'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Длина (м) *</Label>
                <div className="flex gap-2">
                  <Input
                    id="length"
                    type="number"
                    step="0.01"
                    value={formData.length}
                    onChange={(e) => setFormData({...formData, length: e.target.value})}
                    placeholder="4.50"
                    required
                  />
                  {useLaser && (
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => handleLaserMeasure('length')}
                    >
                      <Icon name="Zap" size={18} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">Ширина (м) *</Label>
                <div className="flex gap-2">
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    value={formData.width}
                    onChange={(e) => setFormData({...formData, width: e.target.value})}
                    placeholder="3.20"
                    required
                  />
                  {useLaser && (
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => handleLaserMeasure('width')}
                    >
                      <Icon name="Zap" size={18} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Высота (м) *</Label>
                <div className="flex gap-2">
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    placeholder="2.70"
                    required
                  />
                  {useLaser && (
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => handleLaserMeasure('height')}
                    >
                      <Icon name="Zap" size={18} />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {area && (
              <div className="p-4 bg-green-500/10 border-2 border-green-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Maximize2" size={24} className="text-green-600" />
                    <div>
                      <div className="text-sm text-muted-foreground">Площадь помещения</div>
                      <div className="text-2xl font-bold text-green-600">{area} м²</div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{formData.length} × {formData.width}</div>
                    <div>Высота: {formData.height} м</div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Дополнительная информация о помещении..."
                rows={3}
              />
            </div>

            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Info" size={16} className="text-primary" />
                <span className="font-medium">Совет</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Для точных измерений используйте лазерную рулетку. Измеряйте по полу для длины и ширины, и от пола до потолка для высоты.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    Добавить измерение
                    <Icon name="Check" size={20} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
