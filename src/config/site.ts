import type { NavItem } from '../types/content';

export const siteConfig = {
  name: 'TuNorte',
  description:
    'Diseño web a medida para profesionales que quieren una presencia digital que inspire confianza y convierta visitas en oportunidades.',
  locale: 'es_PE',
  language: 'es-PE',
  // TODO: Sustituye null por el número completo con prefijo de país, solo dígitos.
  whatsappNumber: null,
  whatsappMessage: 'Hola, quiero información sobre sus servicios web.',
} as const;

export const navigation: readonly NavItem[] = [
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Proceso', href: '/#proceso' },
  { label: 'Nosotros', href: '/#nosotros' },
  { label: 'Precios', href: '/#precios' },
  { label: 'Recursos', href: '/#recursos' },
];
