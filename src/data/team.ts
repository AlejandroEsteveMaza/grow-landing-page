import alejandroImage from '../assets/images/alejandro-esteve.jpg';
import danielaImage from '../assets/images/daniela-ortiz.jpg';
import type { TeamMember } from '../types/content';

export const teamMembers: readonly TeamMember[] = [
  {
    name: 'Daniela Ortiz',
    role: 'Estrategia · Marketing · SEO',
    bio: 'Con más de 6 años de experiencia en marketing digital en mercados B2C y B2B, me encargo de que tu web aparezca en Google, refleje quién eres y transmita exactamente la confianza que tus clientes necesitan para elegirte. Soy de Piura y conozco el mercado por dentro.',
    tags: ['Estrategia digital', 'SEO & posicionamiento', 'Marketing B2B & B2C', 'Máster ESIC España'],
    image: danielaImage,
    imageAlt: 'Retrato de Daniela Ortiz, especialista en estrategia, marketing y SEO',
  },
  {
    name: 'Alejandro Esteve',
    role: 'Desarrollo · Project Manager · IA',
    bio: 'Con más de 7 años convirtiendo tecnología en resultados de negocio, es Project Manager e integrador de Inteligencia Artificial. Se encarga de que tu web funcione perfectamente y esté potenciada con herramientas avanzadas: sistemas de citas, automatizaciones y soluciones a medida.',
    tags: ['Desarrollo web', 'Project Manager', 'Integración IA', 'Apps a medida'],
    image: alejandroImage,
    imageAlt: 'Retrato de Alejandro Esteve, desarrollador y project manager',
  },
];
