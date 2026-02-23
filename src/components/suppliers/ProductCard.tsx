import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

export interface Product {
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
  specifications: Record<string, unknown>;
  rating: number;
  review_count: number;
  supplier: {
    id: number;
    name: string;
    rating: number;
    verified: boolean;
  };
}

function ProductGallery({ product }: { product: Pick<Product, 'image_url' | 'name' | 'specifications'> }) {
  const photos: string[] = Array.isArray(product.specifications?.photos)
    ? (product.specifications.photos as string[])
    : product.image_url
    ? [product.image_url]
    : [];
  const [idx, setIdx] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        <Icon name="Package" className="h-16 w-16 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-gray-100 overflow-hidden group" itemProp="image">
      <img src={photos[idx]} alt={product.name} className="w-full h-full object-cover" />
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + photos.length) % photos.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon name="ChevronLeft" size={16} className="text-white" />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % photos.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon name="ChevronRight" size={16} className="text-white" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
          <div className="absolute top-2 right-2 bg-black/40 text-white text-xs rounded-full px-2 py-0.5">
            {idx + 1}/{photos.length}
          </div>
        </>
      )}
    </div>
  );
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU').format(price);

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow"
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="productID" content={String(product.id)} />
      <meta itemProp="category" content={product.category} />

      {product.rating > 0 && (
        <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating" style={{ display: 'none' }}>
          <meta itemProp="ratingValue" content={String(product.rating)} />
          <meta itemProp="reviewCount" content={String(product.review_count)} />
          <meta itemProp="bestRating" content="5" />
          <meta itemProp="worstRating" content="1" />
        </div>
      )}

      <ProductGallery product={product} />

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Badge variant="outline" className="mb-2 text-xs">
              {product.subcategory || product.category}
            </Badge>
            <h3 className="font-semibold text-sm leading-tight mb-1" itemProp="name">
              {product.name}
            </h3>
          </div>
        </div>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name="Star"
                  className={`h-3 w-3 ${
                    star <= Math.round(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {product.rating} ({product.review_count} отзывов)
            </span>
          </div>
        )}

        {product.specifications?.['площадь_м2'] && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge variant="secondary" className="text-xs">
              <Icon name="Maximize2" className="h-3 w-3 mr-1" />
              до {String(product.specifications['площадь_м2'])} м²
            </Badge>
            {product.specifications?.['тип_компрессора'] && (
              <Badge variant={product.specifications['тип_компрессора'] === 'инвертор' ? 'default' : 'outline'} className="text-xs">
                {product.specifications['тип_компрессора'] === 'инвертор' ? 'Инвертор' : 'On/Off'}
              </Badge>
            )}
            {product.specifications?.['wifi'] === 'да' && (
              <Badge variant="outline" className="text-xs">
                <Icon name="Wifi" className="h-3 w-3 mr-1" />
                Wi-Fi
              </Badge>
            )}
          </div>
        )}

        {product.specifications?.['installation'] && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              <Icon name="Wrench" className="h-3 w-3 mr-1" />
              {String(product.specifications['installation'])}
            </Badge>
            {product.specifications?.['warranty'] && (
              <Badge variant="outline" className="text-xs">
                <Icon name="ShieldCheck" className="h-3 w-3 mr-1" />
                Гарантия {String(product.specifications['warranty'])}
              </Badge>
            )}
          </div>
        )}

        <p className="text-xs text-gray-600 mb-3 line-clamp-2" itemProp="description">
          {product.description}
        </p>

        <div className="flex items-center gap-2 mb-3 text-xs text-gray-600" itemProp="brand" itemScope itemType="https://schema.org/Brand">
          <Icon name="Store" className="h-3 w-3" />
          <span itemProp="name">{product.supplier.name}</span>
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

        <div className="flex items-end justify-between" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <link itemProp="url" href={`${window.location.origin}/suppliers?product=${product.id}`} />
          <meta itemProp="priceCurrency" content="RUB" />
          <meta itemProp="price" content={String(product.price)} />
          <meta itemProp="availability" content={product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
          <div>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(product.price)} ₽
            </div>
            <div className="text-xs text-gray-500">за {product.unit}</div>
          </div>
          <Button size="sm" disabled={!product.in_stock}>
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
          <div className="mt-3 pt-3 border-t" itemProp="additionalProperty" itemScope itemType="https://schema.org/PropertyValue">
            <details className="text-xs">
              <summary className="cursor-pointer font-medium mb-2">
                Характеристики
              </summary>
              <div className="space-y-1 text-gray-600">
                {Object.entries(product.specifications)
                  .filter(([key]) => key !== 'photos' && key !== 'source_url')
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span itemProp="name">{key}:</span>
                      <span className="font-medium" itemProp="value">{String(value)}</span>
                    </div>
                  ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </Card>
  );
}
