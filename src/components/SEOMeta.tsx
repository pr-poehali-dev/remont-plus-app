import { useEffect } from "react";

const SITE_NAME = "АВАНГАРД";
const BASE_URL = "https://avangard-ai.ru";
const DEFAULT_IMAGE = "https://cdn.poehali.dev/projects/YCAKhBqnf1NcFvR3wsTx6T/bucket/og-image.jpg";

interface GeoInfo {
  /** Город: «Самара» */
  city: string;
  /** Субъект РФ: «Самарская область» */
  region: string;
  lat: number;
  lon: number;
}

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: object | object[];
  /** Геопривязка страницы — для региональных посадочных */
  geo?: GeoInfo;
  /** Закрыть страницу от индексации (служебные разделы) */
  noindex?: boolean;
  /** Постраничная навигация — ссылки на предыдущую/следующую */
  prev?: string;
  next?: string;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(attr: "name" | "property", key: string) {
  if (typeof document === "undefined") return;
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

function upsertLink(rel: string, href?: string) {
  if (typeof document === "undefined") return;
  const existing = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!href) {
    existing?.remove();
    return;
  }
  const el = existing ?? document.createElement("link");
  if (!existing) {
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const SEO_LD_ATTR = "data-seo-jsonld";

function setJsonLd(schemas: object[]) {
  if (typeof document === "undefined") return;
  document.head.querySelectorAll(`script[${SEO_LD_ATTR}]`).forEach((n) => n.remove());
  schemas.forEach((schema) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute(SEO_LD_ATTR, "1");
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  });
}

export default function SEOMeta({
  title,
  description,
  keywords,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  jsonLd,
  geo,
  noindex = false,
  prev,
  next,
}: SEOMetaProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonical = `${BASE_URL}${path}`;
  const ogImage = image.startsWith("http") ? image : `${BASE_URL}${image}`;
  const schemasKey = JSON.stringify(
    Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []
  );
  const geoKey = geo ? JSON.stringify(geo) : "";

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta("name", "description", description);
    if (keywords) upsertMeta("name", "keywords", keywords);
    upsertLink("canonical", canonical);

    upsertMeta(
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1",
    );

    // Геопривязка региональных страниц
    const g: GeoInfo | undefined = geoKey ? JSON.parse(geoKey) : undefined;
    if (g) {
      upsertMeta("name", "geo.region", "RU");
      upsertMeta("name", "geo.placename", g.city);
      upsertMeta("name", "geo.position", `${g.lat};${g.lon}`);
      upsertMeta("name", "ICBM", `${g.lat}, ${g.lon}`);
    } else {
      removeMeta("name", "geo.region");
      removeMeta("name", "geo.placename");
      removeMeta("name", "geo.position");
      removeMeta("name", "ICBM");
    }

    upsertLink("prev", prev ? `${BASE_URL}${prev}` : undefined);
    upsertLink("next", next ? `${BASE_URL}${next}` : undefined);

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("property", "og:image:width", "1200");
    upsertMeta("property", "og:image:height", "630");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "ru_RU");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);

    setJsonLd(JSON.parse(schemasKey));
  }, [fullTitle, description, keywords, canonical, type, ogImage, schemasKey, geoKey, noindex, prev, next]);

  return null;
}

export function calcJsonLd(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url: `https://avangard-ai.ru${url}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "RUB",
    },
    provider: {
      "@type": "Organization",
      name: "АВАНГАРД",
      url: "https://avangard-ai.ru",
    },
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** Организация — базовая схема бренда, ставится на главную. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    description:
      "Онлайн-расчёт сметы на ремонт квартиры и строительство: работы, материалы, цены по регионам России.",
    areaServed: { "@type": "Country", name: "Россия" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+7-927-748-68-68",
      contactType: "customer service",
      areaServed: "RU",
      availableLanguage: "Russian",
    },
  };
}

/**
 * Услуга с региональной привязкой и вилкой цен — для городских страниц.
 * Поисковик понимает: что за услуга, где оказывается и сколько стоит.
 */
export function localServiceJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
  priceMin: number;
  priceMax: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: `${BASE_URL}${opts.url}`,
    serviceType: "Ремонт и отделка помещений",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
    },
    areaServed: {
      "@type": "City",
      name: opts.city,
      containedInPlace: { "@type": "AdministrativeArea", name: opts.region },
      geo: { "@type": "GeoCoordinates", latitude: opts.lat, longitude: opts.lon },
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "RUB",
      lowPrice: opts.priceMin,
      highPrice: opts.priceMax,
      unitText: "за квадратный метр",
      availability: "https://schema.org/InStock",
    },
  };
}

/** Список ссылок (например, «другие города») — помогает обходу сайта. */
export function itemListJsonLd(name: string, items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: `${BASE_URL}${it.url}`,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      ...(url ? { item: `${BASE_URL}${url}` } : {}),
    })),
  };
}