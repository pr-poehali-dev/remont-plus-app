import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

const contractors = [
  {
    name: 'Алексей Иванов',
    specialty: 'Электрик',
    rating: 9.8,
    reviews: 127,
    avatar: 'AI',
    price: '2500 ₽/день',
    experience: '12 лет',
  },
  {
    name: 'Мария Петрова',
    specialty: 'Дизайнер интерьеров',
    rating: 9.5,
    reviews: 89,
    avatar: 'МП',
    price: '5000 ₽/проект',
    experience: '8 лет',
  },
  {
    name: 'Дмитрий Сидоров',
    specialty: 'Прораб',
    rating: 9.7,
    reviews: 156,
    avatar: 'ДС',
    price: '10% от сметы',
    experience: '15 лет',
  },
];

export const WorkersSection = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="gradient-purple-pink p-6 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Icon name="Users" size={28} />
            Исполнители
          </h2>
          <p className="text-white/90 text-sm">Проверенные специалисты с высоким рейтингом</p>
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant="default" size="sm" className="whitespace-nowrap">Все</Button>
        <Button variant="outline" size="sm" className="whitespace-nowrap">Электрики</Button>
        <Button variant="outline" size="sm" className="whitespace-nowrap">Сантехники</Button>
        <Button variant="outline" size="sm" className="whitespace-nowrap">Отделочники</Button>
        <Button variant="outline" size="sm" className="whitespace-nowrap">Дизайнеры</Button>
      </div>

      <div className="space-y-4">
        {contractors.map((contractor) => (
          <Card key={contractor.name} className="shadow-lg border-0 hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                    {contractor.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{contractor.name}</h3>
                      <p className="text-sm text-muted-foreground">{contractor.specialty}</p>
                    </div>
                    <Badge className="gradient-orange-blue text-white border-0">
                      <Icon name="Star" size={14} className="mr-1 fill-white" />
                      {contractor.rating}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm mb-3">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Icon name="MessageCircle" size={14} />
                      {contractor.reviews} отзывов
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Icon name="Award" size={14} />
                      {contractor.experience}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{contractor.price}</span>
                    <Button size="sm" className="gradient-purple-pink text-white border-0">
                      Написать
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
