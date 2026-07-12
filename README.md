# GROW Landing Page

Landing corporativa estática construida con Astro, TypeScript estricto y Tailwind CSS v4.

## Requisitos

- Node.js 22.12 o superior.
- npm 11 o superior.

## Uso

```bash
npm install
npm run dev
npm run check
npm run build
```

## Estructura

- `src/pages`: rutas del sitio.
- `src/layouts`: documento, SEO y estructura global.
- `src/components`: secciones y tarjetas Astro.
- `src/data`: contenido local tipado, preparado para sustituirse por consultas a Sanity.
- `src/config/site.ts`: marca, dominio y datos de contacto.
- `src/styles/global.css`: Tailwind v4, tokens y estilos globales mínimos.

## Configuración pendiente

1. Define el dominio definitivo en `src/config/site.ts` y en `astro.config.mjs` antes de añadir canonical y sitemap.
2. Añade el número de WhatsApp en `src/config/site.ts` para activar el enlace.
3. Conecta destinos reales para artículos y guías cuando estén disponibles.
4. Conecta un backend al formulario en una fase posterior.
5. Sanity no está instalado; los componentes reciben datos por props para facilitar esa migración futura.

La tipografía actual utiliza fuentes seguras del sistema. Las fuentes de marca podrán autoalojarse cuando se faciliten los archivos correspondientes.
