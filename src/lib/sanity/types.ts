export interface SanityImage {
  asset?: { url?: string };
  alt?: string;
}

export interface SanityLandingPage {
  hero?: {
    eyebrow?: string;
    titleLines?: string[];
    emphasizedLine?: string;
    description?: string;
    primaryCta?: { label?: string; href?: string };
    secondaryCta?: { label?: string; href?: string };
    stats?: Array<{ value?: string; label?: string }>;
    marqueeItems?: string[];
  };
  sectionCopy?: Partial<Record<'services' | 'process' | 'team' | 'resources' | 'faq', { eyebrow?: string; title?: string; mutedTitle?: string }>>;
  processSteps?: Array<{ number?: string; title?: string; description?: string }>;
  contact?: { description?: string; whatsappMessage?: string };
}

export type SanitySocialPlatform = 'linkedin' | 'instagram' | 'facebook' | 'x' | 'youtube' | 'tiktok';

export interface SanitySocialProfile {
  platform?: SanitySocialPlatform;
  url?: string;
}

export interface SanitySiteSettings {
  name?: string;
  description?: string;
  corporateContact?: {
    email?: string;
    whatsappNumber?: string;
    socialProfiles?: SanitySocialProfile[];
  };
}

export interface SanityOffer {
  _id: string;
  title?: string;
  displayVariant?: 'standard' | 'maintenance';
  enabled?: boolean;
  order?: number;
  description?: string;
  publicPrice?: string;
  note?: string;
  features?: string[];
  included?: string[];
  excluded?: string[];
  cta?: { label?: string };
  featured?: boolean;
}

export interface SanityTeamMember {
  _id: string;
  name?: string;
  role?: string;
  bio?: string;
  tags?: string[];
  image?: SanityImage;
}

export interface SanityResource {
  _id: string;
  resourceType?: 'article' | 'guide';
  title?: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  publishedAt?: string;
  coverImage?: SanityImage;
  body?: unknown[];
  seo?: { title?: string; description?: string };
  action?: { label?: string; url?: string };
}
