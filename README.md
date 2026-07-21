# TuNorte Landing Page

Landing corporativa estática de TuNorte, construida con Astro, TypeScript estricto y Tailwind CSS v4.

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
- `src/lib/content.ts`: adaptador de contenido; conserva los datos locales hasta que Sanity esté configurado.
- `src/lib/sanity`: cliente de solo lectura, consultas GROQ y tipos del CMS.
- `studio`: Sanity Studio aislado de la salida pública de Astro.
- `src/config/site.ts`: marca, dominio y datos de contacto.
- `src/styles/global.css`: Tailwind v4, tokens y estilos globales mínimos.

## Sanity

La web pública sigue generándose estáticamente. Sanity se activa durante el build únicamente cuando existen valores válidos para `SANITY_PROJECT_ID`, `SANITY_DATASET` y `SANITY_API_TOKEN` en el `.env` raíz; si falta alguno, el build conserva el contenido local actual y no consulta Sanity. Estas variables no usan el prefijo `PUBLIC_`, por lo que el token solo llega al cliente de compilación y nunca al sitio estático generado.

1. Copia `.env.example` a `.env` y añade el identificador, dataset y un token de lectura de un proyecto Sanity ya creado. No incluyas el valor del token en documentación, control de versiones ni variables `PUBLIC_`.
2. Crea o autentica ese proyecto por separado siguiendo la documentación de Sanity. Este repositorio no crea proyectos remotos ni contiene credenciales.
3. En `studio/`, copia `.env.example` a `.env`, usa los mismos identificador y dataset como `SANITY_STUDIO_PROJECT_ID` y `SANITY_STUDIO_DATASET`, instala dependencias con `npm install` y ejecuta `npm run dev`. Estas variables del Studio no son secretas y son distintas de las tres variables privadas del build raíz.
4. El Studio usa `basePath: '/admin'`. Una publicación combinada requiere composición de build y enrutado de despliegue específicos de la plataforma elegida. No se incluye configuración de despliegue y `/admin` no debe indexarse.

Los recursos solo generan `/recursos` y `/recursos/[slug]` cuando Sanity está configurado y el registro publicado tiene slug global, fecha, extracto, portada con alt, SEO y Portable Text completos. Los marcadores locales de próximos recursos no generan páginas indexables.

Antes de migrar los datos de ejemplo, valida cada afirmación comercial, precio, biografía y contenido con el negocio. No hay seed automático para evitar publicar información no aprobada.

## Configuración pendiente

1. Define el dominio definitivo en `src/config/site.ts` y en `astro.config.mjs` antes de añadir canonical y sitemap.
2. Añade el número de WhatsApp en `src/config/site.ts` para activar el enlace.
3. Configura Sanity y valida la migración editorial antes de publicar recursos reales.
4. Conecta un backend al formulario en una fase posterior.
5. Compón el Studio en `/admin` y aplica una regla de no indexación cuando exista una plataforma de despliegue definida.

La tipografía actual utiliza fuentes seguras del sistema. Las fuentes de marca podrán autoalojarse cuando se faciliten los archivos correspondientes.
