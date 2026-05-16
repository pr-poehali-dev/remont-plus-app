import { useEffect } from "react";

const SITE_NAME = "АВАНГАРД";
const BASE_URL = "https://avangard-ai.ru";
const DEFAULT_IMAGE = "https://cdn.poehali.dev/projects/YCAKhBqnf1NcFvR3wsTx6T/bucket/og-image.jpg";

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: object | object[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const SEO_LD_ATTR = "data-seo-jsonld";

function setJsonLd(schemas: object[]) {
  const old = document.head.querySelectorAll(`script[${SEO_LD_ATTR}]`);
  old.forEach((n) => n.remove());
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
}: SEOMetaProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonical = `${BASE_URL}${path}`;
  const ogImage = image.startsWith("http") ? image : `${BASE_URL}${image}`;
  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta("name", "description", description);
    if (keywords) upsertMeta("name", "keywords", keywords);
    upsertLink("canonical", canonical);

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

    setJsonLd(schemas);
  }, [fullTitle, description, keywords, canonical, type, ogImage, JSON.stringify(schemas)]);

  return null;
}

// ── Готовые пресеты для калькуляторов ─────────────────────────────────────

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

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `https://avangard-ai.ru${url}`,
    })),
  };
}
