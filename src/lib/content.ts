import { faqItems } from '../data/faq';
import { contactServiceOptions, heroStats, marqueeItems, processSteps } from '../data/home';
import { maintenancePlans, pricingPlans } from '../data/pricing';
import { articles, guides } from '../data/resources';
import { services } from '../data/services';
import { teamMembers } from '../data/team';
import { siteConfig } from '../config/site';
import { deployment, sanityClient, sanityConfig } from './sanity/config';
import { isSanityImageDimensions, isSanityImageUrl } from './sanity/image';
import { faqQuery, landingPageQuery, offersQuery, resourcesQuery, servicesQuery, siteSettingsQuery, teamQuery } from './sanity/queries';
import type { SanityLandingPage, SanityOffer, SanityResource, SanitySiteSettings, SanitySocialPlatform, SanityTeamMember } from './sanity/types';
import { mapPublishedResource, type PublishedResource } from './published-resource';
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
  maintenancePlans: readonly MaintenancePlan[];
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
  sectionCopy: Record<'services' | 'process' | 'team' | 'resources' | 'faq', SectionCopy>;
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
  maintenancePlans,
  articles,
  guides,
  faqItems,
  contactServiceOptions,
  hero: {
    eyebrow: 'Agencia de diseño web especializada',
    titleLines: ['Tu web no es', 'decoración.', 'Es tu'],
    emphasizedLine: 'motor de ventas.',
    description: 'Diseñamos sitios web a medida para profesionales que quieren una presencia digital que los represente, aparezca en Google y transmita confianza desde el primer clic.',
    primaryCta: { label: 'Solicitar cotización', href: '#contacto' },
    secondaryCta: { label: 'Ver servicios', href: '#servicios' },
    stats: heroStats,
    marqueeItems,
  },
  contact: {
    description: 'Cuéntanos qué necesitas y te responderemos con una cotización personalizada. Sin rodeos y sin compromiso.',
    whatsappMessage: 'Hola, quiero información sobre sus servicios web.',
  },
  sectionCopy: {
    services: { eyebrow: 'Servicios', title: 'Lo que construimos', mutedTitle: 'para tu negocio' },
    process: { eyebrow: 'Metodología', title: 'Cómo trabajamos', mutedTitle: 'tu proyecto' },
    team: { eyebrow: 'El equipo', title: 'Dos personas reales', mutedTitle: 'detrás de tu web' },
    resources: { eyebrow: 'Recursos gratuitos', title: 'Blog y guías', mutedTitle: 'para crecer online' },
    faq: { eyebrow: 'Preguntas frecuentes', title: 'Lo que siempre', mutedTitle: 'nos preguntan' },
  },
};

const priceLabel = (publicPrice: SanityOffer['publicPrice']): string | null => publicPrice?.trim() || null;

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
    const maintenanceOffers = offers.filter((offer) => offer.displayVariant === 'maintenance');
    const mappedPlans = standardOffers.flatMap((offer, index) => {
      const price = priceLabel(offer.publicPrice);
      return offer.title && offer.description && offer.note && offer.features?.length && offer.cta?.label
        ? [{ number: `Paquete ${String(index + 1).padStart(2, '0')}`, name: offer.title, description: offer.description, price, note: offer.note, features: offer.features, cta: offer.cta.label, featured: Boolean(offer.featured) }]
        : [];
    });
    const mappedMaintenance = maintenanceOffers.flatMap((offer) => offer.title && offer.included?.length && offer.excluded?.length
      ? [{ name: offer.title, tagline: offer.description ?? '', price: priceLabel(offer.publicPrice), included: offer.included, excluded: offer.excluded }]
      : []);
    const mappedServices = cmsServices.flatMap((service, index) => service.title && service.tier && service.description && service.features?.length
      ? [{ number: String(index + 1).padStart(2, '0'), tier: service.tier, title: service.title, description: service.description, features: service.features }]
      : []);
    const mappedFaq = cmsFaq.flatMap((item) => item.question && item.answer ? [{ question: item.question, answer: item.answer }] : []);
    const mappedTeam = cmsTeam.flatMap((member) => member.name && member.role && member.bio && member.tags?.length && isSanityImageUrl(member.image?.asset?.url) && member.image.alt && isSanityImageDimensions(member.image.asset?.metadata?.dimensions)
      ? [{ name: member.name, role: member.role, bio: member.bio, tags: member.tags, image: member.image.asset.url, imageAlt: member.image.alt, imageDimensions: member.image.asset.metadata.dimensions }]
      : []);
    const mappedProcessSteps = landing?.processSteps?.flatMap((step) => step.number && step.title && step.description
      ? [{ number: step.number, title: step.title, description: step.description }]
      : []) ?? [];
    const completeResources = cmsResources.flatMap((resource) => mapPublishedResource(resource) ?? []);
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
      services: mappedServices.length || deployment.environment !== 'local' ? mappedServices : localContent.services,
      processSteps: contentOrLocal(mappedProcessSteps.length ? mappedProcessSteps : null, localContent.processSteps, 'process steps'),
      teamMembers: contentOrLocal(mappedTeam.length ? mappedTeam : null, localContent.teamMembers, 'team'),
      pricingPlans: contentOrLocal(mappedPlans.length ? mappedPlans : null, localContent.pricingPlans, 'pricing offers'),
      maintenancePlans: contentOrLocal(mappedMaintenance.length ? mappedMaintenance : null, localContent.maintenancePlans, 'maintenance offers'),
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
    return resources.flatMap((resource) => mapPublishedResource(resource) ?? []);
  } catch {
    if (deployment.environment === 'local') return [];
    throw new Error(`Sanity resource fetch failed for the ${deployment.environment} deployment.`);
  }
}
