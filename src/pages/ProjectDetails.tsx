import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { AddMeasurementForm } from '@/components/measurements/AddMeasurementForm';

const PROJECTS_API_URL = 'https://functions.poehali.dev/91a90ccd-9392-4390-8d40-9b2eb3908daa';

interface Project {
  id: number;
  user_id: number;
  title: string;
  address: string;
  project_type: string;
  area?: number;
  rooms?: number;
  budget?: number;
  description?: string;
  status: string;
  progress: number;
  start_date?: string;
  deadline?: string;
  created_at: string;
}

interface Measurement {
  id: number;
  room_name: string;
  length: number;
  width: number;
  height: number;
  area?: number;
  notes?: string;
}

interface Photo {
  id: number;
  photo_url: string;
  room_name?: string;
  description?: string;
  created_at: string;
}

interface ProjectDetailsProps {
  projectId: number;
  onBack: () => void;
}

export const ProjectDetails = ({ projectId, onBack }: ProjectDetailsProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const { toast } = useToast();

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${PROJECTS_API_URL}?project_id=${projectId}`);
      const data = await response.json();
      
      if (data.project) {
        setProject(data.project);
        setEditForm(data.project);
        setMeasurements(data.measurements || []);
        setPhotos(data.photos || []);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить проект',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleSave = async () => {
    try {
      const response = await fetch(PROJECTS_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          ...editForm
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Сохранено!',
          description: 'Изменения успешно сохранены'
        });
        setIsEditing(false);
        loadProject();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось сохранить',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      draft: { label: 'Черновик', color: 'bg-gray-500' },
      measurement: { label: 'Замеры', color: 'bg-blue-500' },
      design: { label: 'Дизайн', color: 'bg-purple-500' },
      estimate: { label: 'Смета', color: 'bg-orange-500' },
      in_progress: { label: 'В работе', color: 'bg-green-500' },
      completed: { label: 'Завершён', color: 'bg-emerald-500' },
      cancelled: { label: 'Отменён', color: 'bg-red-500' }
    };
    const info = statusMap[status] || { label: status, color: 'bg-gray-500' };
    return <Badge className={`${info.color} text-white border-0`}>{info.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="mx-auto mb-3 animate-spin text-primary" />
          <p className="text-muted-foreground">Загрузка проекта...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-3 text-destructive" />
            <h3 className="font-bold text-xl mb-2">Проект не найден</h3>
            <Button onClick={onBack}>Вернуться назад</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pb-24">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="text-2xl font-bold h-auto p-2"
                  />
                ) : (
                  <CardTitle className="text-2xl">{project.title}</CardTitle>
                )}
                {isEditing ? (
                  <Input
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    className="mt-2"
                  />
                ) : (
                  <CardDescription className="mt-2">{project.address}</CardDescription>
                )}
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setEditForm(project);
                  }}>
                    Отмена
                  </Button>
                  <Button onClick={handleSave}>
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Icon name="Edit" size={18} className="mr-2" />
                  Редактировать
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="gradient-purple-pink rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {getStatusBadge(project.status)}
              {project.area && (
                <div className="flex items-center gap-2 text-white/90">
                  <Icon name="Maximize2" size={18} />
                  <span>{project.area} м²</span>
                </div>
              )}
              {project.rooms && (
                <div className="flex items-center gap-2 text-white/90">
                  <Icon name="DoorOpen" size={18} />
                  <span>{project.rooms} комн.</span>
                </div>
              )}
            </div>
            {project.budget && (
              <div className="text-right">
                <div className="text-white/70 text-sm">Бюджет</div>
                <div className="text-2xl font-bold">{project.budget.toLocaleString()} ₽</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-xl font-bold">{project.progress}%</span>
          </div>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">
              <Icon name="Info" size={16} className="mr-2" />
              Информация
            </TabsTrigger>
            <TabsTrigger value="measurements">
              <Icon name="Ruler" size={16} className="mr-2" />
              Замеры ({measurements.length})
            </TabsTrigger>
            <TabsTrigger value="photos">
              <Icon name="Image" size={16} className="mr-2" />
              Фото ({photos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Площадь (м²)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editForm.area || ''}
                          onChange={(e) => setEditForm({...editForm, area: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Количество комнат</Label>
                        <Input
                          type="number"
                          value={editForm.rooms || ''}
                          onChange={(e) => setEditForm({...editForm, rooms: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Бюджет (₽)</Label>
                      <Input
                        type="number"
                        value={editForm.budget || ''}
                        onChange={(e) => setEditForm({...editForm, budget: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Описание</Label>
                      <Textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Площадь</div>
                        <div className="text-xl font-bold">{project.area ? `${project.area} м²` : 'Не указано'}</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Комнат</div>
                        <div className="text-xl font-bold">{project.rooms || 'Не указано'}</div>
                      </div>
                    </div>
                    {project.description && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Описание</div>
                        <div className="text-sm">{project.description}</div>
                      </div>
                    )}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Дата создания</div>
                      <div className="font-medium">{new Date(project.created_at).toLocaleDateString('ru-RU')}</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="measurements" className="space-y-4 mt-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Измерения помещений</CardTitle>
                  <Button onClick={() => setShowAddMeasurement(true)}>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {measurements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Ruler" size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Измерений пока нет</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {measurements.map((m) => (
                      <Card key={m.id}>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-3">{m.room_name}</h4>
                          <div className="grid grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Длина:</span>
                              <div className="font-medium">{m.length} м</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Ширина:</span>
                              <div className="font-medium">{m.width} м</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Высота:</span>
                              <div className="font-medium">{m.height} м</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Площадь:</span>
                              <div className="font-medium">{m.area ? `${m.area} м²` : '-'}</div>
                            </div>
                          </div>
                          {m.notes && (
                            <div className="mt-3 text-sm text-muted-foreground">
                              {m.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4 mt-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Фотографии объекта</CardTitle>
                  <Button>
                    <Icon name="Upload" size={18} className="mr-2" />
                    Загрузить
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {photos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Image" size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Фотографий пока нет</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <Card key={photo.id} className="overflow-hidden">
                        <img 
                          src={photo.photo_url} 
                          alt={photo.room_name || 'Фото проекта'}
                          className="w-full h-48 object-cover"
                        />
                        {photo.room_name && (
                          <CardContent className="p-3">
                            <div className="font-medium text-sm">{photo.room_name}</div>
                            {photo.description && (
                              <div className="text-xs text-muted-foreground mt-1">{photo.description}</div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showAddMeasurement && (
          <AddMeasurementForm
            projectId={projectId}
            onClose={() => setShowAddMeasurement(false)}
            onSuccess={() => {
              setShowAddMeasurement(false);
              loadProject();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;