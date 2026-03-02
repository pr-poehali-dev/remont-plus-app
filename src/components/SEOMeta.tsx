import { Helmet } from "react-helmet-async";

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

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ru_RU" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
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
