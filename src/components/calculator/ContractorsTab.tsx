import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface Contractor {
  name: string;
  rating: number;
  reviews: number;
  price: number;
  experience: string;
}

interface ContractorsTabProps {
  contractors: Contractor[];
}

export default function ContractorsTab({ contractors }: ContractorsTabProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Сравнение предложений</h3>
        <Button variant="outline" size="sm">
          <Icon name="Filter" className="mr-2 h-4 w-4" />
          Фильтры
        </Button>
      </div>

      {contractors.map((contractor, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {contractor.name[0]}
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">{contractor.name}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Icon name="Star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{contractor.rating}</span>
                    <span>({contractor.reviews} отзывов)</span>
                  </div>
                  <span>·</span>
                  <span>Опыт {contractor.experience}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Стоимость</p>
              <p className="text-2xl font-bold text-purple-600">
                {contractor.price.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">
              <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
              Написать
            </Button>
            <Button variant="outline" className="flex-1">
              <Icon name="Eye" className="mr-2 h-4 w-4" />
              Подробнее
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" className="w-full">
        Показать ещё мастеров
      </Button>
    </>
  );
}
