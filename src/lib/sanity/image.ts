const SANITY_IMAGE_ORIGIN = 'https://cdn.sanity.io';
const SANITY_IMAGE_PATH = /^\/images\/[a-z0-9-]+\/[A-Za-z0-9_-]+\/[A-Za-z0-9._-]+$/;
const ALLOWED_FITS = new Set(['crop', 'max']);
const MAX_TRANSFORM_DIMENSION = 4096;

export interface SanityImageDimensions {
  width: number;
  height: number;
}

interface SanityImageTransform {
  width: number;
  height?: number;
  fit?: 'crop' | 'max';
  crop?: 'top';
  quality?: number;
}

interface SanityImageSrcSetOptions extends Omit<SanityImageTransform, 'width' | 'height'> {
  maxWidth: number;
  aspectRatio?: number;
}

const positiveInteger = (value: unknown, maximum = Number.MAX_SAFE_INTEGER): value is number =>
  Number.isInteger(value) && Number(value) > 0 && Number(value) <= maximum;

export const isSanityImageDimensions = (value: unknown): value is SanityImageDimensions => {
  if (!value || typeof value !== 'object') return false;
  const dimensions = value as Partial<SanityImageDimensions>;
  return positiveInteger(dimensions.width) && positiveInteger(dimensions.height);
};

export const isSanityImageUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.origin === SANITY_IMAGE_ORIGIN && !url.username && !url.password && !url.hash && SANITY_IMAGE_PATH.test(url.pathname);
  } catch {
    return false;
  }
};

export const buildSanityImageUrl = (source: unknown, transform: SanityImageTransform): string | undefined => {
  if (!isSanityImageUrl(source) || !positiveInteger(transform.width, MAX_TRANSFORM_DIMENSION)) return undefined;
  if (transform.height !== undefined && !positiveInteger(transform.height, MAX_TRANSFORM_DIMENSION)) return undefined;
  if (transform.quality !== undefined && !positiveInteger(transform.quality, 100)) return undefined;
  if (transform.fit !== undefined && !ALLOWED_FITS.has(transform.fit)) return undefined;
  if (transform.crop !== undefined && (transform.crop !== 'top' || transform.fit !== 'crop')) return undefined;

  const url = new URL(source);
  url.searchParams.set('auto', 'format');
  url.searchParams.set('w', String(transform.width));
  if (transform.height !== undefined) url.searchParams.set('h', String(transform.height));
  if (transform.fit !== undefined) url.searchParams.set('fit', transform.fit);
  if (transform.crop !== undefined) url.searchParams.set('crop', transform.crop);
  if (transform.quality !== undefined) url.searchParams.set('q', String(transform.quality));
  return url.toString();
};

export const buildSanityImageSrcSet = (
  source: unknown,
  widths: readonly number[],
  options: SanityImageSrcSetOptions,
): string | undefined => {
  if (!positiveInteger(options.maxWidth) || options.aspectRatio !== undefined && (!Number.isFinite(options.aspectRatio) || options.aspectRatio <= 0)) return undefined;

  const candidates = [...new Set(widths)]
    .filter((width) => positiveInteger(width, MAX_TRANSFORM_DIMENSION) && width <= options.maxWidth)
    .sort((left, right) => left - right)
    .flatMap((width) => {
      const height = options.aspectRatio === undefined ? undefined : Math.round(width / options.aspectRatio);
      const url = buildSanityImageUrl(source, {
        width,
        ...(height ? { height } : {}),
        ...(options.fit ? { fit: options.fit } : {}),
        ...(options.crop ? { crop: options.crop } : {}),
        ...(options.quality ? { quality: options.quality } : {}),
      });
      return url ? [`${url} ${width}w`] : [];
    });

  return candidates.length ? candidates.join(', ') : undefined;
};
