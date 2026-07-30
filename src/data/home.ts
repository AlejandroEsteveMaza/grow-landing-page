import type { HeroStat, ProcessStep } from '../types/content';
import { CONTACT_SERVICE_OPTIONS } from '../../contact-workflow';

export const heroStats: readonly HeroStat[] = [
  { value: '+6 años', label: 'Experiencia en marketing' },
  { value: '+7 años', label: 'En desarrollo web' },
  { value: '100%', label: 'Proyectos a medida' },
];

export const marqueeItems = [
  'Diseño web',
  'SEO local',
  'Landing profesional',
  'Web corporativa',
  'Google Business',
  'Sistema de citas',
  'Integración IA',
  'Sector salud',
] as const;

export const processSteps: readonly ProcessStep[] = [
  {
    number: '01',
    title: 'Análisis estratégico',
    description: 'Escuchamos tu negocio y tus objetivos. Tu proyecto se convierte en nuestra prioridad.',
  },
  {
    number: '02',
    title: 'Estudio de competencia',
    description: 'Analizamos a tus competidores para identificar oportunidades y posicionarte por encima.',
  },
  {
    number: '03',
    title: 'Investigación de keywords',
    description: 'Encontramos las palabras exactas que tus clientes usan para buscarte en Google.',
  },
  {
    number: '04',
    title: 'Estrategia SEO',
    description: 'Diseñamos la hoja de ruta para que tu web aparezca cuando más te necesitan.',
  },
  {
    number: '05',
    title: 'Prototipo visual',
    description: 'Antes de construir nada, ves y apruebas cómo quedará tu web. Sin sorpresas.',
  },
  {
    number: '06',
    title: 'Arquitectura web',
    description: 'Estructuramos cada página para guiar al visitante hacia la acción que tú quieres.',
  },
  {
    number: '07',
    title: 'Diseño UX',
    description: 'Creamos una experiencia fluida e intuitiva para que tus visitantes confíen y actúen.',
  },
  {
    number: '08',
    title: 'Optimización responsive',
    description: 'Ajustamos cada detalle para móvil, tablet y ordenador.',
  },
];

export const contactServiceOptions = CONTACT_SERVICE_OPTIONS;
