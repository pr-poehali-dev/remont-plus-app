import { useEffect } from "react";

interface MetaOptions {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
}

const SITE_NAME = "АВАНГАРД";
const BASE_URL = "https://avangard-ai.ru";
const DEFAULT_IMAGE = "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/5db2b293-0004-43ad-9516-aca337e3250f.jpg";

export function useMeta({ title, description, keywords, canonical, ogImage }: MetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const image = ogImage || DEFAULT_IMAGE;
    const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

    document.title = fullTitle;

    setMeta("name", "description", description);
    if (keywords) setMeta("name", "keywords", keywords);

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);

    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);

    setCanonical(url);

    return () => {
      document.title = `${SITE_NAME} — ремонт квартир под ключ с ИИ-дизайнером`;
    };
  }, [title, description, keywords, canonical, ogImage]);
}

function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setCanonical(url: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}