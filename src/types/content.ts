import type { ImageMetadata } from 'astro';

export interface NavItem {
  label: string;
  href: `#${string}`;
}

export interface HeroStat {
  value: string;
  label: string;
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
  image: ImageMetadata;
  imageAlt: string;
}

export interface PricingPlan {
  number: string;
  name: string;
  description: string;
  price: string;
  note: string;
  features: readonly string[];
  cta: string;
  featured: boolean;
}

export interface MaintenancePlan {
  name: string;
  tagline: string;
  price: string;
  included: readonly string[];
  excluded: readonly string[];
}

export interface ArticlePreview {
  category: string;
  title: string;
  excerpt: string;
  readingTime: string;
}

export interface GuidePreview {
  symbol: string;
  title: string;
  description: string;
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
