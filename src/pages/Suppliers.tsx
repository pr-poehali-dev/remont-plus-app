import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  image_url: string | null;
  in_stock: boolean;
  min_order_quantity: number;
  delivery_available: boolean;
  delivery_cost: number;
  delivery_days: number;
  floor_lifting_cost: number;
  specifications: Record<string, string>;
  supplier: {
    id: number;
    name: string;
    rating: number;
    verified: boolean;
  };
}

export default function Suppliers() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(
        `https://functions.poehali.dev/735f02a5-eb3f-4e4b-b378-7564c92b8e00?${params}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Поставщики материалов</h1>
                <p className="text-sm text-gray-600">Каталог стройматериалов и интерьера</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/profile')}>
                <Icon name="User" className="mr-2 h-4 w-4" />
                Личный кабинет
              </Button>
              <Button variant="outline" onClick={() => navigate('/designer')}>
                <Icon name="Palette" className="mr-2 h-4 w-4" />
                Мои проекты
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="Filter" className="h-5 w-5 text-primary" />
                Фильтры
              </h3>
              
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Поиск</label>
                <Input
                  placeholder="Название товара..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Категории</label>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory('')}
                  >
                    Все категории
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className="w-full justify-start text-sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="bg-primary/10 rounded-lg p-4">
                  <Icon name="Info" className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-gray-700">
                    Все товары от проверенных поставщиков с гарантией качества
                  </p>
                </div>
              </div>
            </Card>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedCategory || 'Все товары'}
                  </h2>
                  <p className="text-gray-600">
                    Найдено товаров: {products.length}
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка товаров...</p>
              </div>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon name="Package" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-4">
                  Попробуйте изменить фильтры или поисковый запрос
                </p>
                <Button onClick={() => { setSelectedCategory(''); setSearchQuery(''); }}>
                  Сбросить фильтры
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon name="Package" className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-2 text-xs">
                            {product.subcategory || product.category}
                          </Badge>
                          <h3 className="font-semibold text-sm leading-tight mb-1">
                            {product.name}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                        <Icon name="Store" className="h-3 w-3" />
                        <span>{product.supplier.name}</span>
                        {product.supplier.verified && (
                          <Badge variant="default" className="text-xs px-1 py-0">
                            <Icon name="BadgeCheck" className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>

                      <div className="border-t pt-3 mb-3 space-y-1 text-xs">
                        {product.delivery_available && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Icon name="Truck" className="h-3 w-3" />
                            <span>Доставка: {formatPrice(product.delivery_cost)} ₽</span>
                          </div>
                        )}
                        {product.floor_lifting_cost > 0 && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Icon name="MoveUp" className="h-3 w-3" />
                            <span>Подъем: {formatPrice(product.floor_lifting_cost)} ₽</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(product.price)} ₽
                          </div>
                          <div className="text-xs text-gray-500">за {product.unit}</div>
                        </div>
                        <Button 
                          size="sm"
                          disabled={!product.in_stock}
                        >
                          {product.in_stock ? (
                            <>
                              <Icon name="Plus" className="h-4 w-4 mr-1" />
                              В проект
                            </>
                          ) : (
                            'Нет в наличии'
                          )}
                        </Button>
                      </div>

                      {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <details className="text-xs">
                            <summary className="cursor-pointer font-medium mb-2">
                              Характеристики
                            </summary>
                            <div className="space-y-1 text-gray-600">
                              {Object.entries(product.specifications).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span>{key}:</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}