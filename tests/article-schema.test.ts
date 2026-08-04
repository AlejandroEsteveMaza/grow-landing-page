import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArticleSchema, isCanonicalUtcIsoTimestamp, isMeaningfullyModified } from '../src/lib/article-schema.ts';
import { mapPublishedResource } from '../src/lib/published-resource.ts';
import type { SanityResource } from '../src/lib/sanity/types.ts';

const imageUrl = 'https://cdn.sanity.io/images/abc123/production/photo-1600x1200.jpg';
const article = {
  headline: 'Un artículo útil',
  description: 'Una descripción SEO específica.',
  datePublished: '2026-07-14T13:00:00.000Z',
  dateModified: '2026-08-03T20:00:00Z',
  authorName: 'Daniela Ortiz',
  imageUrl,
  articleSection: 'Diseño web',
};

test('accepts only real canonical UTC Sanity timestamps', () => {
  for (const value of [
    '2024-02-29T23:59:59Z',
    '2026-08-03T13:00:00.000Z',
  ]) assert.equal(isCanonicalUtcIsoTimestamp(value), true, value);

  for (const value of [
    '2026-02-30T13:00:00Z',
    '2025-02-29T13:00:00Z',
    '2026-13-01T13:00:00Z',
    '2026-04-31T13:00:00Z',
    '2026-08-03T24:00:00Z',
    '2026-08-03T13:60:00Z',
    '2026-08-03T13:00:60Z',
    '2026-08-03T13:00:00.0Z',
    '2026-08-03T13:00:00+00:00',
    '2026-08-03T13:00:00z',
    'invalid',
    null,
  ]) assert.equal(isCanonicalUtcIsoTimestamp(value), false, String(value));
});

test('builds truthful production Article schema with canonical identity', () => {
  const schema = buildArticleSchema({ ...article, canonicalOrigin: 'https://tunorteweb.com', pathname: '/recursos/articulo' });
  assert.deepEqual(schema, {
    '@context': 'https://schema.org', '@type': 'Article', headline: article.headline, description: article.description,
    datePublished: article.datePublished, dateModified: article.dateModified,
    author: { '@type': 'Person', name: 'Daniela Ortiz' },
    publisher: { '@type': 'Organization', name: 'TuNorte', url: 'https://tunorteweb.com' },
    image: [
      `${imageUrl}?auto=format&w=1200&h=675&fit=crop&q=82`,
      `${imageUrl}?auto=format&w=1200&h=900&fit=crop&q=82`,
      `${imageUrl}?auto=format&w=1200&h=1200&fit=crop&q=82`,
    ],
    articleSection: 'Diseño web', inLanguage: 'es-PE',
    url: 'https://tunorteweb.com/recursos/articulo', mainEntityOfPage: 'https://tunorteweb.com/recursos/articulo',
  });
});

test('omits production identity in preview while retaining valid publisher and images', () => {
  const schema = buildArticleSchema(article)!;
  assert.deepEqual(schema.publisher, { '@type': 'Organization', name: 'TuNorte' });
  assert.equal(schema.url, undefined);
  assert.equal(schema.mainEntityOfPage, undefined);
  for (const [url, ratio] of (schema.image as string[]).map((url) => [new URL(url), url.includes('h=675') ? 16 / 9 : url.includes('h=900') ? 4 / 3 : 1] as const)) {
    assert.equal(url.origin, 'https://cdn.sanity.io');
    assert.ok(Number(url.searchParams.get('w'))! * Number(url.searchParams.get('h'))! >= 50_000);
    assert.equal(Number(url.searchParams.get('w'))! / Number(url.searchParams.get('h'))!, ratio);
  }
});

test('rejects incomplete, malformed, non-Sanity, and chronologically invalid schema input', () => {
  assert.equal(buildArticleSchema({ ...article, authorName: '   ' }), undefined);
  assert.equal(buildArticleSchema({ ...article, dateModified: 'August 3, 2026' }), undefined);
  assert.equal(buildArticleSchema({ ...article, dateModified: '2026-02-30T13:00:00Z' }), undefined);
  assert.equal(buildArticleSchema({ ...article, dateModified: '2026-07-01T00:00:00Z' }), undefined);
  assert.equal(buildArticleSchema({ ...article, imageUrl: 'https://example.com/photo.jpg' }), undefined);
  assert.equal(buildArticleSchema({ ...article, canonicalOrigin: 'http://tunorteweb.com', pathname: '/recursos/articulo' })?.url, undefined);
  assert.equal(buildArticleSchema({ ...article, canonicalOrigin: 'https://tunorteweb.com', pathname: '//example.com/articulo' })?.url, undefined);
});

const resource = (overrides: Partial<SanityResource> = {}): SanityResource => ({
  _id: 'resource-article', _updatedAt: article.dateModified, resourceType: 'article', title: article.headline,
  slug: 'articulo', excerpt: 'Extracto', category: article.articleSection, publishedAt: article.datePublished,
  authorName: article.authorName, coverImage: { asset: { url: imageUrl, metadata: { dimensions: { width: 1600, height: 1200 } } }, alt: 'Portada' },
  body: [{ _type: 'block' }], seo: { title: 'Título SEO', description: article.description }, ...overrides,
});

test('maps ordinary article updates to the Sanity update timestamp', () => {
  const mapped = mapPublishedResource(resource())!;
  assert.equal(mapped.authorName, 'Daniela Ortiz');
  assert.equal(mapped.publishedAt, article.datePublished);
  assert.equal(mapped.updatedAt, article.dateModified);
});

test('keeps a scheduled article routable and maps modification to publication time', () => {
  const publishedAt = '2026-08-10T13:00:00Z';
  const mapped = mapPublishedResource(resource({ publishedAt, _updatedAt: '2026-08-03T20:00:00Z' }));
  assert.equal(mapped?.slug, 'articulo');
  assert.equal(mapped?.updatedAt, publishedAt);

  const schema = buildArticleSchema({ ...article, datePublished: mapped!.publishedAt, dateModified: mapped!.updatedAt! });
  assert.equal(schema?.dateModified, publishedAt);
});

test('rejects articles missing markup data', () => {
  assert.equal(mapPublishedResource(resource({ authorName: ' ' })), undefined);
  assert.equal(mapPublishedResource(resource({ _updatedAt: 'invalid' })), undefined);
  assert.equal(mapPublishedResource(resource({ publishedAt: '2026-02-30T13:00:00Z' })), undefined);
  assert.equal(mapPublishedResource(resource({ _updatedAt: '2026-04-31T13:00:00Z' })), undefined);
});

test('keeps guides complete without invented authorship or modification dates', () => {
  const guide = resource({ resourceType: 'guide' });
  delete guide.authorName;
  delete guide._updatedAt;
  const mapped = mapPublishedResource(guide);
  assert.equal(mapped?.resourceType, 'guide');
  assert.equal(mapped?.authorName, undefined);
  assert.equal(mapped?.updatedAt, undefined);
});

test('rejects guides with malformed publication timestamps', () => {
  assert.equal(mapPublishedResource(resource({ resourceType: 'guide', publishedAt: '2026-02-30T13:00:00Z' })), undefined);
});

test('shows modification only when at least one day later than publication', () => {
  assert.equal(isMeaningfullyModified(article.datePublished, '2026-07-15T12:59:59.999Z'), false);
  assert.equal(isMeaningfullyModified(article.datePublished, '2026-07-15T13:00:00.000Z'), true);
  assert.equal(isMeaningfullyModified('invalid', article.dateModified), false);
});
