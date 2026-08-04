import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSanityImageSrcSet, buildSanityImageUrl, isSanityImageDimensions, isSanityImageUrl } from '../src/lib/sanity/image.ts';

const imageUrl = 'https://cdn.sanity.io/images/abc123/production/photo-1200x800.jpg';

test('builds bounded Sanity CDN transformations while preserving safe existing parameters', () => {
  assert.equal(
    buildSanityImageUrl(`${imageUrl}?rect=0,0,800,800`, { width: 384, height: 384, fit: 'crop', crop: 'top', quality: 82 }),
    `${imageUrl}?rect=0%2C0%2C800%2C800&auto=format&w=384&h=384&fit=crop&crop=top&q=82`,
  );
});

test('builds sorted, deduplicated srcsets bounded by source width', () => {
  const srcset = buildSanityImageSrcSet(imageUrl, [768, 320, 320, 1280], { maxWidth: 800, fit: 'max', quality: 82 });
  assert.equal(
    srcset,
    `${imageUrl}?auto=format&w=320&fit=max&q=82 320w, ${imageUrl}?auto=format&w=768&fit=max&q=82 768w`,
  );
});

test('uses proportional crop heights in responsive srcsets', () => {
  const srcset = buildSanityImageSrcSet(imageUrl, [640, 1280], { maxWidth: 1000, aspectRatio: 16 / 9, fit: 'crop', quality: 82 });
  assert.equal(srcset, `${imageUrl}?auto=format&w=640&h=360&fit=crop&q=82 640w`);
});

test('rejects non-Sanity, non-HTTPS, malformed, and credentialed image URLs', () => {
  for (const source of [
    'https://example.com/images/abc123/production/photo.jpg',
    'http://cdn.sanity.io/images/abc123/production/photo.jpg',
    'https://user@cdn.sanity.io/images/abc123/production/photo.jpg',
    'https://cdn.sanity.io/files/abc123/production/photo.jpg',
    'not a URL',
  ]) {
    assert.equal(isSanityImageUrl(source), false);
    assert.equal(buildSanityImageUrl(source, { width: 320 }), undefined);
  }
});

test('rejects invalid dimensions, quality, fit, and empty srcset candidates', () => {
  assert.equal(buildSanityImageUrl(imageUrl, { width: 0 }), undefined);
  assert.equal(buildSanityImageUrl(imageUrl, { width: 4097 }), undefined);
  assert.equal(buildSanityImageUrl(imageUrl, { width: 320, quality: 101 }), undefined);
  assert.equal(buildSanityImageUrl(imageUrl, { width: 320, fit: 'fill' as 'crop' }), undefined);
  assert.equal(buildSanityImageUrl(imageUrl, { width: 320, fit: 'max', crop: 'top' }), undefined);
  assert.equal(buildSanityImageSrcSet(imageUrl, [0, 4097], { maxWidth: 1200 }), undefined);
  assert.equal(isSanityImageDimensions({ width: 1200, height: 800 }), true);
  assert.equal(isSanityImageDimensions({ width: 1200, height: 0 }), false);
});
