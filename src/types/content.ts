import type { ImageMetadata } from 'astro';
import type { SanityImageDimensions } from '../lib/sanity/image';

export interface NavItem {
  label: string;
  href: `/#${string}`;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface SectionCopy {
  eyebrow: string;
  title: string;
  mutedTitle: string;
}

export interface Service {
  number: string;
  tier: string;
  title: string;
  description: string;
  features: readonly string[];
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  tags: readonly string[];
  image: ImageMetadata | string;
  imageAlt: string;
  imageDimensions?: SanityImageDimensions;
}

export interface PricingPlan {
  number: string;
  name: string;
  description: string;
  price: string | null;
  note: string;
  features: readonly string[];
  cta: string;
  featured: boolean;
}

export interface MaintenancePlan {
  name: string;
  tagline: string;
  price: string | null;
  included: readonly string[];
  excluded: readonly string[];
}

export interface ArticlePreview {
  category: string;
  title: string;
  excerpt: string;
  readingTime: string;
  href?: string;
}

export interface GuidePreview {
  symbol: string;
  title: string;
  description: string;
  href?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

export type JsonLd = Record<string, unknown>;
