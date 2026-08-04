import { isCanonicalUtcIsoTimestamp } from './article-schema.ts';
import { isSanityImageDimensions, isSanityImageUrl, type SanityImageDimensions } from './sanity/image.ts';
import type { SanityResource } from './sanity/types.ts';

export interface PublishedResource {
  slug: string;
  resourceType: 'article' | 'guide';
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt?: string | undefined;
  authorName?: string | undefined;
  coverImageUrl?: string | undefined;
  coverImageAlt?: string | undefined;
  coverImageDimensions?: SanityImageDimensions | undefined;
  body: unknown[];
  seo: { title: string; description: string };
  action?: { label: string; url: string } | undefined;
}

const externalHttpsAction = (action: SanityResource['action']): PublishedResource['action'] => {
  if (!action?.label || !action.url) return undefined;
  try {
    return new URL(action.url).protocol === 'https:' ? { label: action.label, url: action.url } : undefined;
  } catch {
    return undefined;
  }
};

export const mapPublishedResource = (resource: SanityResource): PublishedResource | undefined => {
  const complete = (resource.resourceType === 'article' || resource.resourceType === 'guide') &&
    Boolean(resource.slug && resource.title && resource.excerpt && resource.publishedAt && isSanityImageUrl(resource.coverImage?.asset?.url) && resource.coverImage.alt && isSanityImageDimensions(resource.coverImage.asset?.metadata?.dimensions) && resource.body?.length && resource.seo?.title && resource.seo.description);
  if (!complete || !isCanonicalUtcIsoTimestamp(resource.publishedAt)) return undefined;

  const authorName = resource.authorName?.trim();
  if (resource.resourceType === 'article' && (!authorName || !isCanonicalUtcIsoTimestamp(resource._updatedAt))) return undefined;
  const updatedAt = resource.resourceType === 'article' && Date.parse(resource._updatedAt!) < Date.parse(resource.publishedAt!)
    ? resource.publishedAt
    : resource._updatedAt;

  return {
    slug: resource.slug!,
    resourceType: resource.resourceType!,
    title: resource.title!,
    excerpt: resource.excerpt!,
    category: resource.category ?? (resource.resourceType === 'guide' ? 'Guía gratuita' : 'Artículo'),
    publishedAt: resource.publishedAt!,
    ...(updatedAt ? { updatedAt } : {}),
    ...(authorName ? { authorName } : {}),
    coverImageUrl: resource.coverImage?.asset?.url,
    coverImageAlt: resource.coverImage?.alt,
    coverImageDimensions: resource.coverImage?.asset?.metadata?.dimensions as SanityImageDimensions,
    body: resource.body!,
    seo: { title: resource.seo!.title!, description: resource.seo!.description! },
    action: externalHttpsAction(resource.action),
  };
};
