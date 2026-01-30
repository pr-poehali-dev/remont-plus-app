import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const YASEN_API_URL = 'https://functions.poehali.dev/f540d647-f4c0-4217-84af-9f25ac6a842d';
const NOTIFICATIONS_API_URL = 'https://functions.poehali.dev/d6486f4d-19a8-4e90-b7c9-704773186863';

interface WorkOrder {
  id: number;
  customer_phone: string;
  contractor_phone?: string;
  work_description: string;
  price?: number;
  deadline?: string;
  status: string;
  created_at: string;
}

interface Recording {
  id: number;
  conversation_id: string;
  audio_url: string;
  duration: number;
  participants: string[];
  created_at: string;
}

export const YasenAdminPanel = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [testTelegram, setTestTelegram] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
    loadRecordings();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${YASEN_API_URL}?action=orders&limit=50`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
    setIsLoading(false);
  };

  const loadRecordings = async () => {
    try {
      const response = await fetch(`${YASEN_API_URL}?action=recordings&limit=50`);
      const data = await response.json();
      if (data.success) {
        setRecordings(data.recordings);
      }
    } catch (error) {
      console.error('Failed to load recordings:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-2xl border-0 mb-6 overflow-hidden">
          <div className="gradient-purple-pink p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Icon name="Bot" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Панель администратора ЯСЕН</h1>
                <p className="text-white/90">Управление нарядами-заказами и записями разговоров</p>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders" className="gap-2">
              <Icon name="ClipboardList" size={18} />
              Наряды-заказы
            </TabsTrigger>
            <TabsTrigger value="recordings" className="gap-2">
              <Icon name="Mic" size={18} />
              Записи разговоров
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Icon name="Bell" size={18} />
              Уведомления
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Наряды-заказы ({orders.length})</h2>
                <Button onClick={loadOrders} disabled={isLoading} variant="outline">
                  <Icon name="RefreshCw" size={18} className={isLoading ? 'animate-spin' : ''} />
                  Обновить
                </Button>
              </div>

              {orders.length === 0 ? (
                <Card className="shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Icon name="FileText" size={64} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">Нет нарядов-заказов</h3>
                    <p className="text-muted-foreground">Когда ЯСЕН создаст заказы, они появятся здесь</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <Card 
                      key={order.id} 
                      className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              Заказ #{order.id}
                              <Badge className={`${getStatusColor(order.status)} text-white border-0`}>
                                {getStatusLabel(order.status)}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {new Date(order.created_at).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </CardDescription>
                          </div>
                          {order.price && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">{order.price.toLocaleString()} ₽</p>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Описание работ:</p>
                            <p className="font-medium">{order.work_description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Заказчик:</p>
                              <p className="font-medium flex items-center gap-2">
                                <Icon name="Phone" size={16} />
                                {order.customer_phone}
                              </p>
                            </div>
                            {order.contractor_phone && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Исполнитель:</p>
                                <p className="font-medium flex items-center gap-2">
                                  <Icon name="Phone" size={16} />
                                  {order.contractor_phone}
                                </p>
                              </div>
                            )}
                          </div>
                          {order.deadline && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Срок выполнения:</p>
                              <p className="font-medium flex items-center gap-2">
                                <Icon name="Calendar" size={16} />
                                {new Date(order.deadline).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recordings">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Записи разговоров ({recordings.length})</h2>
                <Button onClick={loadRecordings} variant="outline">
                  <Icon name="RefreshCw" size={18} />
                  Обновить
                </Button>
              </div>

              {recordings.length === 0 ? (
                <Card className="shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Icon name="Mic" size={64} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">Нет записей</h3>
                    <p className="text-muted-foreground">Записи голосовых разговоров появятся здесь</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {recordings.map((recording) => (
                    <Card key={recording.id} className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon name="Mic" size={20} />
                          Разговор {recording.conversation_id}
                        </CardTitle>
                        <CardDescription>
                          {new Date(recording.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="gap-1">
                              <Icon name="Clock" size={14} />
                              {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')} мин
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Icon name="Users" size={14} />
                              {recording.participants.length} участников
                            </Badge>
                          </div>
                          <audio controls className="w-full">
                            <source src={recording.audio_url} type="audio/webm" />
                            Ваш браузер не поддерживает аудио
                          </audio>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Настройка уведомлений</h2>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Send" size={24} className="text-primary" />
                    Тестирование отправки
                  </CardTitle>
                  <CardDescription>
                    Проверьте работу SMS и Telegram уведомлений
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Тест SMS</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="+7 999 123-45-67"
                          value={testPhone}
                          onChange={(e) => setTestPhone(e.target.value)}
                        />
                        <Button
                          onClick={async () => {
                            try {
                              const response = await fetch(NOTIFICATIONS_API_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  action: 'test',
                                  type: 'sms',
                                  phone: testPhone
                                })
                              });
                              const data = await response.json();
                              toast({
                                title: data.success ? 'SMS отправлено' : 'Ошибка',
                                description: data.success ? 'Проверьте телефон' : data.result?.error || 'Не удалось отправить',
                                variant: data.success ? 'default' : 'destructive'
                              });
                            } catch (error) {
                              toast({
                                title: 'Ошибка',
                                description: 'Не удалось отправить SMS',
                                variant: 'destructive'
                              });
                            }
                          }}
                        >
                          <Icon name="Send" size={18} />
                          Отправить
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Тест Telegram</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Chat ID или @username"
                          value={testTelegram}
                          onChange={(e) => setTestTelegram(e.target.value)}
                        />
                        <Button
                          onClick={async () => {
                            try {
                              const response = await fetch(NOTIFICATIONS_API_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  action: 'test',
                                  type: 'telegram',
                                  telegram_id: testTelegram
                                })
                              });
                              const data = await response.json();
                              toast({
                                title: data.success ? 'Сообщение отправлено' : 'Ошибка',
                                description: data.success ? 'Проверьте Telegram' : data.result?.error || 'Не удалось отправить',
                                variant: data.success ? 'default' : 'destructive'
                              });
                            } catch (error) {
                              toast({
                                title: 'Ошибка',
                                description: 'Не удалось отправить в Telegram',
                                variant: 'destructive'
                              });
                            }
                          }}
                        >
                          <Icon name="Send" size={18} />
                          Отправить
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg gradient-card">
                <CardHeader>
                  <CardTitle>Как настроить уведомления</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="MessageSquare" size={18} />
                      Telegram Bot
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                      <li>Найдите @BotFather в Telegram</li>
                      <li>Создайте бота командой /newbot</li>
                      <li>Скопируйте токен и добавьте в секреты проекта</li>
                      <li>Узнайте Chat ID: отправьте боту /start и используйте @userinfobot</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Smartphone" size={18} />
                      SMS уведомления
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                      <li>Зарегистрируйтесь на sms.ru или smsc.ru</li>
                      <li>Получите API ключ в личном кабинете</li>
                      <li>Пополните баланс для отправки SMS</li>
                      <li>Добавьте ключ в секреты проекта</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};