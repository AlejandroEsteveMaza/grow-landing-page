import type { ArticlePreview, GuidePreview } from '../types/content';

export const articles: readonly ArticlePreview[] = [
  {
    category: 'Presencia digital',
    title: '5 cosas que la web de un médico en Perú necesita para generar confianza',
    excerpt:
      'Muchos profesionales de la salud tienen web, pero muy pocos la tienen bien. Estos son los elementos que no pueden faltar para generar confianza antes de una llamada.',
    readingTime: '5 min de lectura',
  },
  {
    category: 'SEO local',
    title: 'Cómo aparecer en Google Maps si tienes una consulta en Piura',
    excerpt:
      'El Perfil de Empresa en Google es una herramienta potente y gratuita para que tus pacientes te encuentren. Te explicamos cómo configurarlo correctamente.',
    readingTime: '7 min de lectura',
  },
  {
    category: 'Marketing digital',
    title: 'Por qué tu web no aparece en Google y cómo solucionarlo sin ser técnico',
    excerpt:
      'El SEO puede parecer complicado, pero muchos de los errores más habituales tienen una solución sencilla.',
    readingTime: '6 min de lectura',
  },
];

export const guides: readonly GuidePreview[] = [
  {
    symbol: '01',
    title: 'Checklist: ¿Tu web está lista para atraer pacientes?',
    description: '12 puntos clave que debes revisar antes de invertir en publicidad.',
  },
  {
    symbol: '02',
    title: 'Perfil de Empresa en Google para profesionales de la salud en Piura',
    description: 'Paso a paso para mejorar tu presencia en los resultados locales.',
  },
  {
    symbol: '03',
    title: 'Cómo escribir los textos de tu web sin sonar genérico',
    description: 'Pautas para escribir textos que reflejen quién eres y conecten con tus clientes.',
  },
  {
    symbol: '04',
    title: 'Mini kit de presencia digital para profesionales de la salud',
    description: 'Qué plataformas usar, qué publicar y cómo organizar tu tiempo.',
  },
];
