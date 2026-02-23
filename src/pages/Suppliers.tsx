import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import SuppliersHeader from "@/components/suppliers/SuppliersHeader";
import SuppliersFilters from "@/components/suppliers/SuppliersFilters";
import ProductCard, { type Product } from "@/components/suppliers/ProductCard";

export default function Suppliers() {
  useMeta({
    title: "Поставщики строительных и отделочных материалов",
    description: "Каталог проверенных поставщиков строительных материалов в Самаре. Сравните цены на плитку, краску, ламинат, обои и другие отделочные материалы.",
    keywords: "поставщики стройматериалов Самара, отделочные материалы, строительные материалы каталог, купить стройматериалы",
    canonical: "/suppliers",
  });
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState<string>('');

  useEffect(() => {
    loadProducts();
    addOrganizationSchema();
  }, [selectedCategory, searchQuery]);

  const addOrganizationSchema = () => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'organization-schema';

    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "АВАНГАРД",
      "description": "Каталог товаров для ремонта и интерьера",
      "url": window.location.origin,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "RU"
      }
    };

    script.text = JSON.stringify(organizationData);

    const existingScript = document.getElementById('organization-schema');
    if (existingScript) {
      existingScript.remove();
    }
    document.head.appendChild(script);
  };

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

  const hasAreaSpecs = selectedCategory === 'Кондиционеры' || products.some(
    (p) => p.specifications?.['площадь_м2']
  );

  const filteredProducts = areaFilter
    ? products.filter((p) => {
        const area = parseFloat(String(p.specifications?.['площадь_м2'] || '0'));
        if (!area) return true;
        const [min, max] = areaFilter.split('-').map(Number);
        return area >= min && area <= max;
      })
    : products;

  return (
    <div className="min-h-screen bg-gray-50">
      <SuppliersHeader />

      <Breadcrumbs
        items={[
          { label: "Главная", path: "/" },
          { label: "Каталог товаров", path: "/suppliers" }
        ]}
      />

      <div className="container mx-auto px-4 pt-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 md:p-8 mb-6">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute -right-2 bottom-0 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="text-white">
              <div className="inline-flex items-center gap-1.5 bg-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Icon name="Sparkles" size={12} />
                Бесплатно — без регистрации
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold mb-1 leading-snug">
                Знаете, что купить? Посчитайте итог заранее
              </h2>
              <p className="text-white/85 text-sm md:text-base max-w-md">
                Добавьте материалы и работы в смету — получите полный документ с итоговой суммой. Без сюрпризов при расчёте с подрядчиком.
              </p>
            </div>
            <Button
              onClick={() => navigate('/calculator')}
              size="lg"
              className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl shrink-0 shadow-lg shadow-emerald-700/20 px-7"
            >
              <Icon name="Calculator" size={17} className="mr-2" />
              Открыть калькулятор
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <SuppliersFilters
              categories={categories}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              areaFilter={areaFilter}
              hasAreaSpecs={hasAreaSpecs}
              onCategoryChange={setSelectedCategory}
              onSearchChange={setSearchQuery}
              onAreaFilterChange={setAreaFilter}
            />
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedCategory || 'Все товары'}
                  </h2>
                  <p className="text-gray-600">
                    Найдено товаров: {filteredProducts.length}
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка товаров...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon name="Package" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-4">
                  Попробуйте изменить фильтры или поисковый запрос
                </p>
                <Button onClick={() => { setSelectedCategory(''); setSearchQuery(''); setAreaFilter(''); }}>
                  Сбросить фильтры
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
