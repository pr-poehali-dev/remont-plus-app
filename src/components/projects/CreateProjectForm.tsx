import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const PROJECTS_API_URL = 'https://functions.poehali.dev/91a90ccd-9392-4390-8d40-9b2eb3908daa';

interface CreateProjectFormProps {
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProjectForm = ({ userId, onClose, onSuccess }: CreateProjectFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    project_type: 'apartment',
    area: '',
    rooms: '',
    budget: '',
    description: ''
  });
  const { toast } = useToast();

  const projectTypes = [
    { value: 'apartment', label: 'Квартира', icon: 'Home' },
    { value: 'house', label: 'Дом', icon: 'Building' },
    { value: 'office', label: 'Офис', icon: 'Briefcase' },
    { value: 'commercial', label: 'Коммерческое', icon: 'Store' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(PROJECTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: formData.title,
          address: formData.address,
          project_type: formData.project_type,
          area: formData.area ? parseFloat(formData.area) : null,
          rooms: formData.rooms ? parseInt(formData.rooms) : null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          description: formData.description || null
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Проект создан!',
          description: 'Вы можете приступить к работе над проектом'
        });
        onSuccess();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать проект',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать проект',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl shadow-2xl animate-fade-in my-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Создать проект</CardTitle>
              <CardDescription>Заполните информацию о вашем проекте</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Название проекта *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ремонт квартиры на ул. Ленина"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Адрес объекта *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="г. Москва, ул. Ленина, д. 10, кв. 25"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Тип объекта</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {projectTypes.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={formData.project_type === type.value ? 'default' : 'outline'}
                    className="h-auto py-3 flex-col gap-2"
                    onClick={() => setFormData({...formData, project_type: type.value})}
                  >
                    <Icon name={type.icon as any} size={24} />
                    <span className="text-xs">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Площадь (м²)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  placeholder="65.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Количество комнат</Label>
                <Input
                  id="rooms"
                  type="number"
                  value={formData.rooms}
                  onChange={(e) => setFormData({...formData, rooms: e.target.value})}
                  placeholder="3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Бюджет (₽)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  placeholder="500000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание проекта</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Косметический ремонт трёхкомнатной квартиры..."
                rows={4}
              />
            </div>

            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="CheckCircle2" size={16} className="text-green-500" />
                <span>После создания вы сможете добавить измерения помещений</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="CheckCircle2" size={16} className="text-green-500" />
                <span>Загрузка фотографий объекта</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="CheckCircle2" size={16} className="text-green-500" />
                <span>Консультации дизайнера и составление сметы</span>
              </div>
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
                    Создание...
                  </>
                ) : (
                  <>
                    Создать проект
                    <Icon name="Plus" size={20} className="ml-2" />
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
