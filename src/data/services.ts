import type { Service } from '../types/content';

export const services: readonly Service[] = [
  {
    number: '01',
    tier: 'Paquete 1',
    title: 'Landing Profesional',
    description:
      'Una página diseñada con un propósito claro: representarte bien, transmitir tu propuesta de valor y hacer que quien te busca quiera contactarte.',
    features: [
      'Dominio + hosting + SSL (1 año)',
      'Hasta 3 correos corporativos',
      '1 a 2 páginas 100% a medida',
      'Diseño responsive en todos los dispositivos',
      'Panel para gestionar textos e imágenes + capacitación',
    ],
  },
  {
    number: '02',
    tier: 'Paquete 2',
    title: 'Web Corporativa a Medida',
    description:
      'Tu presencia digital completa. Una web que refleja quién eres, posiciona en Google y transmite la credibilidad que tu trabajo merece.',
    features: [
      'Todo lo del Paquete 1 incluido',
      '3 a 4 páginas diseñadas a medida',
      'SEO básico integrado desde el inicio',
      'Sistema de citas online',
      'Botón de WhatsApp directo',
    ],
  },
];
