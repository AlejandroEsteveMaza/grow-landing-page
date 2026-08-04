import { buildSanityImageUrl } from './sanity/image.ts';
import type { JsonLd } from '../types/content.ts';

const imageTransforms = [
  { width: 1200, height: 675 },
  { width: 1200, height: 900 },
  { width: 1200, height: 1200 },
] as const;

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  imageUrl: string;
  articleSection: string;
  canonicalOrigin?: string;
  pathname?: string;
}

export const isCanonicalUtcIsoTimestamp = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{3}))?Z$/.exec(value);
  if (!match) return false;

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === `${match[1]}.${match[2] ?? '000'}Z`;
};

const text = (value: string): string | undefined => value.trim() || undefined;

const canonicalPageUrl = (origin: string | undefined, pathname: string | undefined): string | undefined => {
  if (!origin || !pathname?.startsWith('/')) return undefined;
  try {
    const site = new URL(origin);
    if (site.protocol !== 'https:' || site.origin !== origin || site.username || site.password) return undefined;
    const page = new URL(pathname, site);
    return page.origin === site.origin ? page.toString() : undefined;
  } catch {
    return undefined;
  }
};

export const buildArticleSchema = (input: ArticleSchemaInput): JsonLd | undefined => {
  const headline = text(input.headline);
  const description = text(input.description);
  const authorName = text(input.authorName);
  const articleSection = text(input.articleSection);
  if (!headline || !description || !authorName || !articleSection || !isCanonicalUtcIsoTimestamp(input.datePublished) || !isCanonicalUtcIsoTimestamp(input.dateModified)) return undefined;
  if (Date.parse(input.dateModified) < Date.parse(input.datePublished)) return undefined;

  const image = imageTransforms.flatMap(({ width, height }) => {
    const url = buildSanityImageUrl(input.imageUrl, { width, height, fit: 'crop', quality: 82 });
    return url ? [url] : [];
  });
  if (image.length !== imageTransforms.length) return undefined;

  const pageUrl = canonicalPageUrl(input.canonicalOrigin, input.pathname);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: { '@type': 'Person', name: authorName },
    publisher: { '@type': 'Organization', name: 'TuNorte', ...(pageUrl ? { url: input.canonicalOrigin } : {}) },
    image,
    articleSection,
    inLanguage: 'es-PE',
    ...(pageUrl ? { url: pageUrl, mainEntityOfPage: pageUrl } : {}),
  };
};

export const isMeaningfullyModified = (publishedAt: string, updatedAt: string): boolean =>
  isCanonicalUtcIsoTimestamp(publishedAt) && isCanonicalUtcIsoTimestamp(updatedAt) && Date.parse(updatedAt) - Date.parse(publishedAt) >= 24 * 60 * 60 * 1000;
