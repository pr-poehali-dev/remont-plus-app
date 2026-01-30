import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { CreateProjectForm } from '@/components/projects/CreateProjectForm';
import ProjectDetails from '@/pages/ProjectDetails';

const PROJECTS_API_URL = 'https://functions.poehali.dev/91a90ccd-9392-4390-8d40-9b2eb3908daa';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  user_type: string;
}

interface Project {
  id: number;
  title: string;
  address: string;
  project_type: string;
  area?: number;
  rooms?: number;
  budget?: number;
  status: string;
  progress: number;
  created_at: string;
}

interface CustomerDashboardProps {
  user: User;
  onLogout: () => void;
}

export const CustomerDashboard = ({ user, onLogout }: CustomerDashboardProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { toast } = useToast();

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${PROJECTS_API_URL}?user_id=${user.id}`);
      const data = await response.json();
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить проекты',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user.id]);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    loadProjects();
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

  if (selectedProjectId) {
    return (
      <ProjectDetails 
        projectId={selectedProjectId} 
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pb-24">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="User" size={24} className="text-primary" />
                </div>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.phone}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <Icon name="LogOut" size={20} />
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="gradient-purple-pink rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Home" size={32} />
            <h2 className="text-2xl font-bold">Личный кабинет заказчика</h2>
          </div>
          <p className="text-white/90">Управляйте проектами и отслеживайте прогресс</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Briefcase" size={24} className="text-primary" />
                Мои проекты
              </CardTitle>
              <Button onClick={() => setShowCreateForm(true)}>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Icon name="Loader2" size={48} className="mx-auto mb-3 animate-spin text-primary" />
                <p className="text-muted-foreground">Загрузка проектов...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="FolderOpen" size={48} className="mx-auto mb-3 opacity-50" />
                <p>У вас пока нет проектов</p>
                <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать первый проект
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{project.address}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {getStatusBadge(project.status)}
                            {project.area && (
                              <Badge variant="outline">
                                <Icon name="Maximize2" size={12} className="mr-1" />
                                {project.area} м²
                              </Badge>
                            )}
                            {project.rooms && (
                              <Badge variant="outline">
                                <Icon name="DoorOpen" size={12} className="mr-1" />
                                {project.rooms} комн.
                              </Badge>
                            )}
                            {project.budget && (
                              <Badge variant="outline">
                                <Icon name="Wallet" size={12} className="mr-1" />
                                {project.budget.toLocaleString()} ₽
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedProjectId(project.id)}
                        >
                          <Icon name="ChevronRight" size={20} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 gradient-card">
          <CardHeader>
            <CardTitle>Доступные услуги</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-start gap-3 text-left">
                <Icon name="MapPin" size={24} className="text-orange-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Внесение данных объекта</div>
                  <div className="text-sm text-muted-foreground">Адрес, размеры, лазерная рулетка</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-start gap-3 text-left">
                <Icon name="Palette" size={24} className="text-purple-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Консультации по дизайну</div>
                  <div className="text-sm text-muted-foreground">Подбор стиля интерьера</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-start gap-3 text-left">
                <Icon name="Pen" size={24} className="text-blue-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Разработка дизайн-проекта</div>
                  <div className="text-sm text-muted-foreground">Полный проект с визуализацией</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-start gap-3 text-left">
                <Icon name="Calculator" size={24} className="text-green-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Формирование сметы</div>
                  <div className="text-sm text-muted-foreground">Точный расчёт стоимости работ</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="User" size={24} className="text-primary" />
              Профиль
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Имя</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Телефон</span>
              <span className="font-medium">{user.phone}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Статус</span>
              <Badge className="bg-green-500">
                <Icon name="CheckCircle2" size={14} className="mr-1" />
                Подтверждён
              </Badge>
            </div>
          </CardContent>
        </Card>

        {showCreateForm && (
          <CreateProjectForm
            userId={user.id}
            onClose={() => setShowCreateForm(false)}
            onSuccess={handleCreateSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;