import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const ADMIN_API_URL = 'https://functions.poehali.dev/874af9cd-edd6-471e-b6d4-e68c828e6dca';

interface Stats {
  users: {
    total: number;
    customers: number;
    contractors: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    by_type: Record<string, number>;
    avg_budget: number;
  };
  content: {
    measurements: number;
    photos: number;
  };
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
  customer: {
    name: string;
    phone: string;
    email: string;
  };
}

interface User {
  id: number;
  phone: string;
  name: string;
  email: string;
  user_type: string;
  specialization?: string;
  experience?: number;
  is_verified: boolean;
  created_at: string;
}

export const AdminStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const { toast } = useToast();

  const adminPassword = localStorage.getItem('admin_password') || 'admin2025';

  const fetchStats = async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}?action=stats`, {
        headers: {
          'X-Admin-Token': adminPassword
        }
      });
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить статистику',
        variant: 'destructive'
      });
    }
  };

  const fetchProjects = async () => {
    try {
      const url = statusFilter === 'all' 
        ? `${ADMIN_API_URL}?action=projects&limit=100`
        : `${ADMIN_API_URL}?action=projects&limit=100&status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: {
          'X-Admin-Token': adminPassword
        }
      });
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
    }
  };

  const fetchUsers = async () => {
    try {
      const url = userTypeFilter === 'all'
        ? `${ADMIN_API_URL}?action=users`
        : `${ADMIN_API_URL}?action=users&user_type=${userTypeFilter}`;
      
      const response = await fetch(url, {
        headers: {
          'X-Admin-Token': adminPassword
        }
      });
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchProjects(), fetchUsers()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [userTypeFilter]);

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

  const getProjectTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      apartment: 'Квартира',
      house: 'Дом',
      office: 'Офис',
      commercial: 'Коммерция'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Icon name="Loader2" size={48} className="mx-auto mb-3 animate-spin text-primary" />
        <p className="text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-lg border-0 gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Пользователи</CardTitle>
                <Icon name="Users" size={24} className="text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">{stats.users.total}</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Заказчики:</span>
                  <span className="font-semibold">{stats.users.customers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Исполнители:</span>
                  <span className="font-semibold">{stats.users.contractors}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Проекты</CardTitle>
                <Icon name="Briefcase" size={24} className="text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">{stats.projects.total}</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Активные:</span>
                  <span className="font-semibold text-green-600">{stats.projects.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Завершённые:</span>
                  <span className="font-semibold">{stats.projects.completed}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Контент</CardTitle>
                <Icon name="Image" size={24} className="text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-muted-foreground text-sm mb-1">Замеры</div>
                  <div className="text-2xl font-bold">{stats.content.measurements}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm mb-1">Фотографии</div>
                  <div className="text-2xl font-bold">{stats.content.photos}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">
            <Icon name="Briefcase" size={16} className="mr-2" />
            Проекты
          </TabsTrigger>
          <TabsTrigger value="users">
            <Icon name="Users" size={16} className="mr-2" />
            Пользователи
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4 mt-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Все проекты</CardTitle>
                  <CardDescription>Всего: {projects.length}</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="measurement">Замеры</SelectItem>
                    <SelectItem value="design">Дизайн</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="completed">Завершён</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{project.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{project.address}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {getStatusBadge(project.status)}
                            <Badge variant="outline">{getProjectTypeLabel(project.project_type)}</Badge>
                            {project.area && <Badge variant="outline">{project.area} м²</Badge>}
                            {project.budget && <Badge variant="outline">{project.budget.toLocaleString()} ₽</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>Заказчик: {project.customer.name}</div>
                            <div>Телефон: {project.customer.phone}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium mb-1">{project.progress}%</div>
                          <div className="w-16 h-2 bg-muted rounded-full">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="FolderOpen" size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Проектов не найдено</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 mt-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Все пользователи</CardTitle>
                  <CardDescription>Всего: {users.length}</CardDescription>
                </div>
                <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="customer">Заказчики</SelectItem>
                    <SelectItem value="contractor">Исполнители</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon 
                              name={user.user_type === 'customer' ? 'User' : 'Briefcase'} 
                              size={20} 
                              className="text-primary" 
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.specialization && (
                              <p className="text-sm text-primary">{user.specialization}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.user_type === 'customer' ? 'default' : 'secondary'}>
                            {user.user_type === 'customer' ? 'Заказчик' : 'Исполнитель'}
                          </Badge>
                          {user.is_verified && (
                            <div className="mt-2">
                              <Badge className="bg-green-500 text-white">
                                <Icon name="CheckCircle2" size={12} className="mr-1" />
                                Подтверждён
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Users" size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Пользователей не найдено</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};