import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useEffect } from "react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": `${window.location.origin}${item.path}`
      }))
    };
    
    script.text = JSON.stringify(breadcrumbList);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [items]);

  return (
    <nav className="container mx-auto px-4 py-3 text-sm" aria-label="Навигация">
      <ol className="flex items-center gap-2 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => (
          <li 
            key={item.path}
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
            className="flex items-center gap-2"
          >
            {index < items.length - 1 ? (
              <>
                <Link 
                  to={item.path} 
                  className="text-gray-600 hover:text-primary transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
                <meta itemProp="position" content={String(index + 1)} />
                <Icon name="ChevronRight" className="h-4 w-4 text-gray-400" />
              </>
            ) : (
              <>
                <span className="text-gray-900 font-medium" itemProp="name">
                  {item.label}
                </span>
                <meta itemProp="position" content={String(index + 1)} />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
