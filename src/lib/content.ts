import { faqItems } from '../data/faq';
import { contactServiceOptions, heroStats, marqueeItems, processSteps } from '../data/home';
import { maintenancePlan, pricingPlans } from '../data/pricing';
import { articles, guides } from '../data/resources';
import { services } from '../data/services';
import { teamMembers } from '../data/team';
import { siteConfig } from '../config/site';
import { deployment, sanityClient, sanityConfig } from './sanity/config';
import { faqQuery, landingPageQuery, offersQuery, resourcesQuery, servicesQuery, siteSettingsQuery, teamQuery } from './sanity/queries';
import type { SanityLandingPage, SanityOffer, SanityResource, SanitySiteSettings, SanitySocialPlatform, SanityTeamMember } from './sanity/types';
import type { ArticlePreview, FaqItem, GuidePreview, MaintenancePlan, PricingPlan, ProcessStep, SectionCopy, Service, TeamMember } from '../types/content';

export interface LandingContent {
  site: {
    name: string;
    description: string;
    corporateContact: {
      email: string | null;
      whatsappNumber: string | null;
      socialProfiles: readonly { platform: SanitySocialPlatform; url: string }[];
    };
  };
  services: readonly Service[];
  processSteps: readonly ProcessStep[];
  teamMembers: readonly TeamMember[];
  pricingPlans: readonly PricingPlan[];
  maintenancePlan: MaintenancePlan;
  articles: readonly ArticlePreview[];
  guides: readonly GuidePreview[];
  faqItems: readonly FaqItem[];
  contactServiceOptions: readonly string[];
  hero: {
    eyebrow: string;
    titleLines: readonly string[];
    emphasizedLine: string;
    description: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    stats: readonly { value: string; label: string }[];
    marqueeItems: readonly string[];
  };
  contact: { description: string; whatsappMessage: string };
  sectionCopy: Record<'services' | 'process' | 'team' | 'pricing' | 'resources' | 'faq', SectionCopy>;
}

export interface PublishedResource {
  slug: string;
  resourceType: 'article' | 'guide';
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  coverImageUrl?: string | undefined;
  coverImageAlt?: string | undefined;
  body: unknown[];
  seo: { title: string; description: string };
  action?: { label: string; url: string } | undefined;
}

const localContent: LandingContent = {
  site: {
    name: siteConfig.name,
    description: siteConfig.description,
    corporateContact: {
      email: null,
      whatsappNumber: siteConfig.whatsappNumber,
      socialProfiles: [],
    },
  },
  services,
  processSteps,
  teamMembers,
  pricingPlans,
  maintenancePlan,
  articles,
  guides,
  faqItems,
  contactServiceOptions,
  hero: {
    eyebrow: 'Agencia de diseño web especializada',
    titleLines: ['Tu web no es', 'decoración.', 'Es tu'],
    emphasizedLine: 'motor de ventas.',
    description: 'Diseñamos webs a medida para profesionales que quieren una presencia digital que los represente, aparezca en Google y transmita confianza desde el primer clic.',
    primaryCta: { label: 'Solicitar presupuesto', href: '#contacto' },
    secondaryCta: { label: 'Ver servicios', href: '#servicios' },
    stats: heroStats,
    marqueeItems,
  },
  contact: {
    description: 'Cuéntanos qué necesitas y te responderemos con un presupuesto personalizado. Sin rodeos y sin compromiso.',
    whatsappMessage: 'Hola, quiero información sobre sus servicios web.',
  },
  sectionCopy: {
    services: { eyebrow: 'Servicios', title: 'Lo que construimos', mutedTitle: 'para tu negocio' },
    process: { eyebrow: 'Metodología', title: 'Cómo trabajamos', mutedTitle: 'tu proyecto' },
    team: { eyebrow: 'El equipo', title: 'Dos personas reales', mutedTitle: 'detrás de tu web' },
    pricing: { eyebrow: 'Inversión', title: 'Elige el plan', mutedTitle: 'que necesita tu negocio' },
    resources: { eyebrow: 'Recursos gratuitos', title: 'Blog y guías', mutedTitle: 'para crecer online' },
    faq: { eyebrow: 'Preguntas frecuentes', title: 'Lo que siempre', mutedTitle: 'nos preguntan' },
  },
};

const priceLabel = (price: SanityOffer['price']): string | null => {
  if (!price) return null;
  if (price.display) return price.display;
  if (typeof price.amount !== 'number' || !price.currency) return null;
  return `${new Intl.NumberFormat('es', { style: 'currency', currency: price.currency }).format(price.amount)}${price.suffix ? ` ${price.suffix}` : ''}`;
};

const completeResource = (resource: SanityResource): resource is Required<Pick<SanityResource, 'slug' | 'resourceType' | 'title' | 'excerpt' | 'publishedAt' | 'body' | 'seo'>> & SanityResource =>
  (resource.resourceType === 'article' || resource.resourceType === 'guide') &&
  Boolean(resource.slug && resource.title && resource.excerpt && resource.publishedAt && resource.coverImage?.asset?.url && resource.coverImage.alt && resource.body?.length && resource.seo?.title && resource.seo.description);

const externalHttpsAction = (action: SanityResource['action']): PublishedResource['action'] => {
  if (!action?.label || !action.url) return undefined;
  try {
    return new URL(action.url).protocol === 'https:' ? { label: action.label, url: action.url } : undefined;
  } catch {
    return undefined;
  }
};

const nonEmptyText = (value: string | undefined): string | undefined => value?.trim() || undefined;

const contentOrLocal = <T>(value: T | null | undefined | false, localValue: T, field: string): T => {
  if (value !== null && value !== undefined && value !== false) return value;
  if (deployment.environment === 'local') return localValue;
  throw new Error(`Sanity ${field} content is missing or invalid for the ${deployment.environment} deployment.`);
};

const whatsappNumber = (value: string | undefined): string | undefined => {
  const number = nonEmptyText(value);
  return number && /^\+?\d{8,15}$/.test(number) ? number.replace(/^\+/, '') : undefined;
};

const heroCta = (cta: { label?: string; href?: string } | undefined): { label: string; href: string } | undefined => {
  const label = nonEmptyText(cta?.label);
  const href = nonEmptyText(cta?.href);
  if (!label || !href) return undefined;
  if (/^#[A-Za-z][\w-]*$/.test(href)) return { label, href };

  try {
    return new URL(href).protocol === 'https:' ? { label, href } : undefined;
  } catch {
    return undefined;
  }
};

export const isSanityEnabled = (): boolean => sanityConfig !== null;

export async function getLandingContent(): Promise<LandingContent> {
  if (!sanityClient) return contentOrLocal(null, localContent, 'configuration');

  try {
    const [siteSettings, landing, cmsServices, offers, cmsTeam, cmsFaq, cmsResources] = await Promise.all([
      sanityClient.fetch<SanitySiteSettings | null>(siteSettingsQuery),
      sanityClient.fetch<SanityLandingPage | null>(landingPageQuery),
      sanityClient.fetch<Array<SanityOffer & { tier?: string }>>(servicesQuery),
      sanityClient.fetch<SanityOffer[]>(offersQuery),
      sanityClient.fetch<SanityTeamMember[]>(teamQuery),
      sanityClient.fetch<Array<{ question?: string; answer?: string }>>(faqQuery),
      sanityClient.fetch<SanityResource[]>(resourcesQuery),
    ]);
    const standardOffers = offers.filter((offer) => offer.displayVariant !== 'maintenance');
    const maintenance = offers.find((offer) => offer.displayVariant === 'maintenance');
    const mappedPlans = standardOffers.flatMap((offer, index) => {
      const price = priceLabel(offer.price);
      return offer.title && offer.description && price && offer.note && offer.features?.length && offer.cta?.label
        ? [{ number: `Paquete ${String(index + 1).padStart(2, '0')}`, name: offer.title, description: offer.description, price, note: offer.note, features: offer.features, cta: offer.cta.label, featured: Boolean(offer.featured) }]
        : [];
    });
    const mappedMaintenance = contentOrLocal(maintenance && maintenance.title && priceLabel(maintenance.price) && maintenance.included?.length && maintenance.excluded?.length
      ? { name: maintenance.title, tagline: maintenance.description ?? '', price: priceLabel(maintenance.price)!, included: maintenance.included, excluded: maintenance.excluded }
      : null, localContent.maintenancePlan, 'maintenance offer');
    const mappedServices = cmsServices.flatMap((service, index) => service.title && service.tier && service.description && service.features?.length
      ? [{ number: String(index + 1).padStart(2, '0'), tier: service.tier, title: service.title, description: service.description, features: service.features }]
      : []);
    const mappedFaq = cmsFaq.flatMap((item) => item.question && item.answer ? [{ question: item.question, answer: item.answer }] : []);
    const mappedTeam = cmsTeam.flatMap((member) => member.name && member.role && member.bio && member.tags?.length && member.image?.asset?.url && member.image.alt
      ? [{ name: member.name, role: member.role, bio: member.bio, tags: member.tags, image: member.image.asset.url, imageAlt: member.image.alt }]
      : []);
    const mappedProcessSteps = landing?.processSteps?.flatMap((step) => step.number && step.title && step.description
      ? [{ number: step.number, title: step.title, description: step.description }]
      : []) ?? [];
    const completeResources = cmsResources.filter(completeResource);
    const cmsArticles = completeResources.filter((resource) => resource.resourceType === 'article').map((resource) => ({
      category: resource.category ?? 'Artículo', title: resource.title!, excerpt: resource.excerpt!, readingTime: 'Leer artículo', href: `/recursos/${resource.slug}`,
    }));
    const cmsGuides = completeResources.filter((resource) => resource.resourceType === 'guide').map((resource) => ({
      symbol: '→', title: resource.title!, description: resource.excerpt!, href: `/recursos/${resource.slug}`,
    }));
    const hero = landing?.hero;
    const mappedHero = contentOrLocal<Omit<LandingContent['hero'], 'primaryCta' | 'secondaryCta'>>(hero?.eyebrow && hero.titleLines?.length && hero.emphasizedLine && hero.description && hero.stats?.length && hero.marqueeItems?.length
      ? { eyebrow: hero.eyebrow, titleLines: hero.titleLines, emphasizedLine: hero.emphasizedLine, description: hero.description, stats: hero.stats.flatMap((stat) => stat.value && stat.label ? [{ value: stat.value, label: stat.label }] : []), marqueeItems: hero.marqueeItems }
      : null, localContent.hero, 'hero');
    const configuredOffers = offers.filter((offer) => offer.title && offer.enabled).map((offer) => offer.title!);

    return {
      ...localContent,
      site: {
        name: contentOrLocal(nonEmptyText(siteSettings?.name), localContent.site.name, 'site name'),
        description: contentOrLocal(nonEmptyText(siteSettings?.description), localContent.site.description, 'site description'),
        corporateContact: {
          email: nonEmptyText(siteSettings?.corporateContact?.email) ?? (deployment.environment === 'local' ? localContent.site.corporateContact.email : null),
          whatsappNumber: whatsappNumber(siteSettings?.corporateContact?.whatsappNumber) ?? (deployment.environment === 'local' ? localContent.site.corporateContact.whatsappNumber : null),
          socialProfiles: siteSettings?.corporateContact?.socialProfiles?.flatMap((profile) => {
            const url = nonEmptyText(profile.url);
            return profile.platform && url ? [{ platform: profile.platform, url }] : [];
          }) ?? (deployment.environment === 'local' ? localContent.site.corporateContact.socialProfiles : []),
        },
      },
      services: contentOrLocal(mappedServices.length ? mappedServices : null, localContent.services, 'services'),
      processSteps: contentOrLocal(mappedProcessSteps.length ? mappedProcessSteps : null, localContent.processSteps, 'process steps'),
      teamMembers: contentOrLocal(mappedTeam.length ? mappedTeam : null, localContent.teamMembers, 'team'),
      pricingPlans: contentOrLocal(mappedPlans.length ? mappedPlans : null, localContent.pricingPlans, 'pricing offers'),
      maintenancePlan: mappedMaintenance,
      faqItems: contentOrLocal(mappedFaq.length ? mappedFaq : null, localContent.faqItems, 'FAQ'),
      articles: deployment.environment === 'local' && !cmsArticles.length ? localContent.articles : cmsArticles,
      guides: deployment.environment === 'local' && !cmsGuides.length ? localContent.guides : cmsGuides,
      contactServiceOptions: contentOrLocal(configuredOffers.length ? [...configuredOffers, 'Otro / Tengo dudas'] : null, localContent.contactServiceOptions, 'contact service options'),
      hero: {
        ...mappedHero,
        primaryCta: contentOrLocal(heroCta(hero?.primaryCta), localContent.hero.primaryCta, 'primary hero CTA'),
        secondaryCta: contentOrLocal(heroCta(hero?.secondaryCta), localContent.hero.secondaryCta, 'secondary hero CTA'),
      },
      contact: {
        description: contentOrLocal(nonEmptyText(landing?.contact?.description), localContent.contact.description, 'contact description'),
        whatsappMessage: contentOrLocal(nonEmptyText(landing?.contact?.whatsappMessage), localContent.contact.whatsappMessage, 'contact WhatsApp message'),
      },
      sectionCopy: {
        services: contentOrLocal(landing?.sectionCopy?.services?.eyebrow && landing.sectionCopy.services.title && landing.sectionCopy.services.mutedTitle ? landing.sectionCopy.services as SectionCopy : null, localContent.sectionCopy.services, 'services section copy'),
        process: contentOrLocal(landing?.sectionCopy?.process?.eyebrow && landing.sectionCopy.process.title && landing.sectionCopy.process.mutedTitle ? landing.sectionCopy.process as SectionCopy : null, localContent.sectionCopy.process, 'process section copy'),
        team: contentOrLocal(landing?.sectionCopy?.team?.eyebrow && landing.sectionCopy.team.title && landing.sectionCopy.team.mutedTitle ? landing.sectionCopy.team as SectionCopy : null, localContent.sectionCopy.team, 'team section copy'),
        pricing: contentOrLocal(landing?.sectionCopy?.pricing?.eyebrow && landing.sectionCopy.pricing.title && landing.sectionCopy.pricing.mutedTitle ? landing.sectionCopy.pricing as SectionCopy : null, localContent.sectionCopy.pricing, 'pricing section copy'),
        resources: contentOrLocal(landing?.sectionCopy?.resources?.eyebrow && landing.sectionCopy.resources.title && landing.sectionCopy.resources.mutedTitle ? landing.sectionCopy.resources as SectionCopy : null, localContent.sectionCopy.resources, 'resources section copy'),
        faq: contentOrLocal(landing?.sectionCopy?.faq?.eyebrow && landing.sectionCopy.faq.title && landing.sectionCopy.faq.mutedTitle ? landing.sectionCopy.faq as SectionCopy : null, localContent.sectionCopy.faq, 'FAQ section copy'),
      },
    };
  } catch {
    if (deployment.environment === 'local') return localContent;
    throw new Error(`Sanity landing content fetch failed for the ${deployment.environment} deployment.`);
  }
}

export async function getPublishedResources(): Promise<PublishedResource[]> {
  if (!sanityClient) {
    if (deployment.environment === 'local') return [];
    throw new Error(`Sanity configuration is unavailable for the ${deployment.environment} deployment.`);
  }
  try {
    const resources = await sanityClient.fetch<SanityResource[]>(resourcesQuery);
    return resources.filter(completeResource).map((resource) => ({
      slug: resource.slug,
      resourceType: resource.resourceType,
      title: resource.title,
      excerpt: resource.excerpt,
      category: resource.category ?? (resource.resourceType === 'guide' ? 'Guía gratuita' : 'Artículo'),
      publishedAt: resource.publishedAt,
      coverImageUrl: resource.coverImage?.asset?.url,
      coverImageAlt: resource.coverImage?.alt,
      body: resource.body,
      seo: { title: resource.seo.title!, description: resource.seo.description! },
      action: externalHttpsAction(resource.action),
    }));
  } catch {
    if (deployment.environment === 'local') return [];
    throw new Error(`Sanity resource fetch failed for the ${deployment.environment} deployment.`);
  }
}
