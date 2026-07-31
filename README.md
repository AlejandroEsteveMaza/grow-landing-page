# TuNorte Landing Page

Landing corporativa estática de TuNorte, construida con Astro, TypeScript estricto y Tailwind CSS v4.

## Requisitos

- Node.js 22.16.0.
- npm 10.9.2.

## Uso

```bash
npm install
npm run dev
npm run check
npm run build
```

## Integración continua

GitHub Actions ejecuta `npm ci`, comprobación y build de la web, valida que exista `dist/index.html`, e instala y construye Sanity Studio sin credenciales ni acceso a datos de producción. No despliega: Cloudflare Pages mantiene la integración de despliegue.

Después de que el workflow se ejecute al menos una vez, configura manualmente la protección de `main` y `develop` para exigir el check **`Validate`**. GitHub no permite seleccionar ese check antes de su primera ejecución.

## Estructura

- `src/pages`: rutas del sitio.
- `src/layouts`: documento, SEO y estructura global.
- `src/components`: secciones y tarjetas Astro.
- `src/data`: contenido local tipado, preparado para sustituirse por consultas a Sanity.
- `src/lib/content.ts`: adaptador de contenido; conserva los datos locales hasta que Sanity esté configurado.
- `src/lib/sanity`: cliente de solo lectura, consultas GROQ y tipos del CMS.
- `studio`: Sanity Studio aislado de la salida pública de Astro.
- `src/config/site.ts`: marca y datos de contacto.
- `src/styles/global.css`: Tailwind v4, tokens y estilos globales mínimos.

## Sanity

La web pública sigue generándose estáticamente. El build raíz usa tres valores de Sanity: `SANITY_PROJECT_ID`, `SANITY_DATASET` y `SANITY_API_TOKEN`. El identificador de proyecto y el dataset son configuración; solo el token es secreto. Ninguno usa el prefijo `PUBLIC_`, y el token se declara como variable secreta de servidor para que nunca llegue al sitio estático generado.

`DEPLOY_ENV` controla el comportamiento del contenido. En `local`, una configuración incompleta o un error de consulta permite usar el contenido local. En `preview` y `production`, la configuración, el dataset y las consultas deben ser válidos; el build falla en vez de publicar contenido local silenciosamente.

1. Copia `.env.example` a `.env` y añade el identificador, dataset y un token de lectura de un proyecto Sanity ya creado. No incluyas el token en documentación, control de versiones ni variables `PUBLIC_`.
2. Crea o autentica ese proyecto por separado siguiendo la documentación de Sanity. Este repositorio no crea proyectos remotos ni contiene credenciales.
3. En `studio/`, copia `.env.example` a `.env`, completa `SANITY_STUDIO_PROJECT_ID`, conserva `SANITY_STUDIO_DATASET=development`, instala dependencias con `npm install` y ejecuta `npm run dev`.
4. Abre el Studio local en `http://localhost:3333/`. El Studio usa la raíz del host tanto en local como en el hosting gestionado.

### Despliegue del Studio de producción

El Studio de producción se aloja en Sanity, no en Cloudflare Pages, usa exclusivamente el dataset `production` y queda disponible en `https://tunorte.sanity.studio`. Los editores inician sesión mediante Sanity; el build del Studio no necesita `SANITY_API_TOKEN`.

Desde `studio/`, usa primero el ensayo no mutante y revisa el destino antes de desplegar. El ensayo no modifica recursos remotos, pero vuelve a generar la salida local del Studio:

```bash
SANITY_STUDIO_DATASET=production npm run deploy:production:dry-run
SANITY_STUDIO_DATASET=production npm run deploy:production
```

Ambos scripts fuerzan `DEPLOY_ENV=production` y `SANITY_STUDIO_BASEPATH=/`, por lo que la validación rechaza cualquier dataset distinto de `production` y el Studio se construye en la raíz. El despliegue real exige escribir exactamente `DEPLOY TUNORTE PRODUCTION` antes de ejecutar Sanity CLI y usa su sesión local. Un futuro despliegue desde CI necesitaría un `SANITY_AUTH_TOKEN` almacenado como secreto del proveedor, pero este repositorio no lo define.

Sanity Free permite exactamente dos datasets públicos para este proyecto: `development` para el Studio local y previews de la web, y `production` para producción. No crees un dataset de staging ni un tercero.

`sanity deploy` registra y gestiona automáticamente el origen `*.sanity.studio`; no hace falta añadir CORS para `https://tunorte.sanity.studio`. Sanity también permite por defecto `http://localhost:3333`, que sigue siendo necesario para el Studio local. Solo un Studio autoalojado o un puerto local distinto exigirían revisar CORS manualmente.

Los recursos solo generan `/recursos` y `/recursos/[slug]` cuando Sanity está configurado y el registro publicado tiene slug global, fecha, extracto, portada con alt, SEO y Portable Text completos. Los marcadores locales de próximos recursos no generan páginas indexables.

Antes de migrar los datos de ejemplo, valida cada afirmación comercial, precio, biografía y contenido con el negocio. No hay seed automático para evitar publicar información no aprobada.

## Cloudflare Pages

La producción de la web se publica desde `main`; cualquier otra rama y cada pull request generan previews. Cloudflare proporciona `CF_PAGES_BRANCH` automáticamente. Si omites `DEPLOY_ENV`, la validación infiere `production` para `main` y `preview` para las demás ramas; un valor explícito se valida y prevalece. Producción exige el dataset `production` y preview exige `development`. No definas `CF_PAGES_BRANCH` manualmente en el dashboard.

Solo producción publica canonicales con origen `https://tunorteweb.com`, `sitemap-index.xml` y un `robots.txt` que permite rastreo. Los builds locales y preview no generan sitemap, marcan los documentos como `noindex, nofollow` y sirven un `robots.txt` con `Disallow: /`. Cloudflare Pages añade además `X-Robots-Tag: noindex` a sus previews como protección de plataforma.

### Configuración de build

| Campo de Pages | Valor |
| --- | --- |
| Rama de producción | `main` |
| Comando de build | `npm run build` |
| Directorio de salida | `dist` |
| Versión de Node.js | `22.16.0` |

### Variables por entorno

| Variable | Producción | Preview | Sensible |
| --- | --- | --- | --- |
| `DEPLOY_ENV` | `production` | `preview` | No |
| `SANITY_PROJECT_ID` | Identificador del proyecto existente | El mismo identificador | No |
| `SANITY_DATASET` | `production` | `development` | No |
| `SANITY_API_TOKEN` | Token de lectura exclusivo de producción | Token de lectura exclusivo de preview | Sí |

Usa dos tokens de solo lectura distintos, aunque ambos pertenezcan al mismo proyecto Sanity. Así se pueden rotar o revocar por entorno sin ampliar permisos ni reutilizar el secreto de producción.

### Pasos en el dashboard

1. Crea un proyecto de Cloudflare Pages conectado a este repositorio.
2. Selecciona `main` como rama de producción.
3. Configura `npm run build` y `dist` como comando y salida.
4. En **Settings > Environment variables**, añade la fila de producción de la matriz al entorno **Production**.
5. Añade la fila de preview al entorno **Preview** y guarda cada `SANITY_API_TOKEN` como secreto independiente.
6. Despliega primero una rama distinta de `main` y confirma que Pages usa `CF_PAGES_BRANCH` junto con el dataset `development`.
7. Despliega `main` únicamente cuando el dataset `production` esté preparado.

Cloudflare Pages aloja únicamente la web pública. El Studio de producción usa el hosting gestionado de Sanity descrito arriba, con ciclo de despliegue y autenticación independientes de Cloudflare.

### Formulario de contacto

El formulario real y su Pages Function están cerrados por defecto. La secuencia de aprobación, las variables requeridas (solo nombres) y las comprobaciones sin entregas externas se documentan en [`docs/contact-workflow.md`](docs/contact-workflow.md). No actives sus indicadores antes de completar la revisión legal y registral indicada allí.

## Configuración pendiente

1. Diseña el flujo de promoción de contenido de `development` a `production`.
2. Reconcilia el historial de ramas cuando exista una estrategia acordada; esta unidad no modifica ramas.
3. Añade el número de WhatsApp en `src/config/site.ts` para activar el enlace.
4. Completa la aprobación legal y registral antes de activar el flujo de contacto documentado.

La tipografía actual utiliza fuentes seguras del sistema. Las fuentes de marca podrán autoalojarse cuando se faciliten los archivos correspondientes.
