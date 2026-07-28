import { useEffect } from 'react';

const SITE_URL = 'https://dioneraze.com';
const DEFAULT_IMAGE = `${SITE_URL}/portfolio-preview.jpg`;
const DEFAULT_IMAGE_WIDTH = '1200';
const DEFAULT_IMAGE_HEIGHT = '630';
const DEFAULT_IMAGE_TYPE = 'image/jpeg';

interface RouteMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  structuredData?: Record<string, unknown>;
  noIndex?: boolean;
}

const setMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
};

const resolveImageUrl = (image: string) => image.startsWith('http') ? image : `${SITE_URL}${image}`;

const getImageType = (imageUrl: string) => {
  const normalizedImageUrl = imageUrl.toLowerCase();
  if (normalizedImageUrl.endsWith('.png')) return 'image/png';
  if (normalizedImageUrl.endsWith('.jpg') || normalizedImageUrl.endsWith('.jpeg')) return 'image/jpeg';
  if (normalizedImageUrl.endsWith('.webp')) return 'image/webp';
  return DEFAULT_IMAGE_TYPE;
};

export const useRouteMetadata = ({ title, description, canonicalPath, image = DEFAULT_IMAGE, openGraphTitle = title, openGraphDescription = description, structuredData, noIndex = false }: RouteMetadata) => {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const imageUrl = resolveImageUrl(image);
    document.title = title;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', openGraphTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', openGraphDescription);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', DEFAULT_IMAGE_WIDTH);
    setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', DEFAULT_IMAGE_HEIGHT);
    setMeta('meta[property="og:image:type"]', 'property', 'og:image:type', getImageType(imageUrl));
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', openGraphTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', openGraphDescription);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    setMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;

    const previousStructuredData = document.getElementById('route-structured-data');
    previousStructuredData?.remove();
    if (structuredData) {
      const script = document.createElement('script');
      script.id = 'route-structured-data';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.append(script);
    }

    return () => document.getElementById('route-structured-data')?.remove();
  }, [canonicalPath, description, image, noIndex, openGraphDescription, openGraphTitle, structuredData, title]);
};
