import type { MaintenancePlan, PricingPlan } from '../types/content';

export const pricingPlans: readonly PricingPlan[] = [
  {
    number: 'Paquete 01',
    name: 'Landing Profesional',
    description:
      'Para profesionales que quieren empezar a tener presencia digital: una web que los represente y aparezca en Google desde el primer día.',
    price: null,
    note: 'Pago único · Sin cuotas ocultas',
    features: [
      'Alta de dominio (.com o .es)',
      'Hosting profesional por 1 año',
      'Certificado SSL de seguridad',
      'Hasta 3 cuentas de correo corporativo',
      '1 a 2 páginas 100% a medida',
      'Diseño responsive en todos los dispositivos',
      'Panel autogestionable + formación incluida',
    ],
    cta: 'Empezar con este plan',
    featured: false,
  },
  {
    number: 'Paquete 02',
    name: 'Web Corporativa Completa',
    description:
      'Para profesionales y clínicas que quieren una presencia digital sólida que refleje su identidad y posicione en Google.',
    price: null,
    note: 'Pago único · Dominio, hosting y SSL incluidos',
    features: [
      'Todo lo del Paquete 1 incluido',
      '3 a 4 páginas diseñadas a medida',
      'SEO básico integrado desde el inicio',
      'Sistema de citas online',
      'Botón de WhatsApp directo integrado',
      'Panel autogestionable + formación completa',
    ],
    cta: 'Quiero esta web',
    featured: true,
  },
];

export const maintenancePlans: readonly MaintenancePlan[] = [
  {
    name: 'Plan Web Segura',
    tagline: 'Tu web siempre activa',
    price: null,
    included: [
      'Hosting activo y SSL renovado',
      'Copias de seguridad periódicas automáticas',
      'Actualizaciones de seguridad y plugins',
      'Soporte ante caídas del servidor',
      'Ajustes mensuales (máx. 30 min: textos, fotos)',
    ],
    excluded: [
      'Creación de nuevas páginas adicionales',
      'Rediseño visual o cambios estructurales',
      'Subida masiva de contenidos',
      'Estrategia de marketing o SEO continuo',
      'Los trabajos adicionales se presupuestan de forma independiente',
    ],
  },
];
