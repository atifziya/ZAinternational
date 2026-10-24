import { useEffect } from 'react';

interface PageMetaProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  slug?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: Record<string, any> | Array<Record<string, any>>;
}

export function PageMeta({
  title,
  description,
  image = '/images/slide1.jpeg',
  type = 'website',
  slug = '',
  schema,
}: PageMetaProps) {
  useEffect(() => {
    const fullTitle = `${title} | ZA International`;
    document.title = fullTitle;

    const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', nameOrProperty);
        } else {
          element.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', 'ZA International Tours & Travels', true);

    const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const pageUrl = `${baseUrl}${slug ? (slug.startsWith('/') ? slug : `/${slug}`) : window.location.pathname}`;
    setMeta('og:url', pageUrl, true);

    const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`;
    setMeta('og:image', fullImageUrl, true);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', fullImageUrl);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    let schemaScript = document.getElementById('json-ld-schema');
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.setAttribute('id', 'json-ld-schema');
        schemaScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    return () => {
      if (schemaScript && document.getElementById('json-ld-schema')) {
        schemaScript.remove();
      }
    };
  }, [title, description, image, type, slug, schema]);

  return null;
}
