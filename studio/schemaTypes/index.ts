import { defineArrayMember, defineField, defineType } from 'sanity';

const nonBlank = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const parentVariant = (context: { parent?: unknown }) => (context.parent as { displayVariant?: unknown } | undefined)?.displayVariant;

const requiredText = (max: number) => (rule: any) => rule.required().max(max).custom((value: unknown) => nonBlank(value) ? true : 'Este campo no puede estar vacío.');

const nonBlankStringMember = (when: (document: any) => boolean = () => true) => defineArrayMember({
  type: 'string',
  validation: (rule) => rule.custom((value, context) => !when(context.document) || nonBlank(value) ? true : 'Este elemento no puede estar vacío.'),
});

const validHttpsUrl = (value: unknown) => {
  if (!nonBlank(value)) return false;
  try {
    return new URL(value.trim()).protocol === 'https:';
  } catch {
    return false;
  }
};

const validCtaHref = (value: unknown) => nonBlank(value) && (/^#[A-Za-z][\w-]*$/.test(value.trim()) || validHttpsUrl(value));

const validPortableTextBody = (value: unknown) => {
  if (!Array.isArray(value)) return true;
  if (value.some((item) => item?._type === 'imageWithAlt' && !item.asset?._ref)) return 'Cada imagen insertada requiere un recurso.';
  return value.some((item) => item?._type === 'imageWithAlt' || item?._type === 'block' && item.children?.some((child: any) => nonBlank(child?.text)))
    ? true
    : 'El contenido requiere texto o una imagen válida.';
};

const seo = defineType({
  name: 'editorialSeo', title: 'SEO editorial', type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Título SEO', type: 'string', description: 'Escribe un título descriptivo y específico para esta página. Google puede mostrar otro título según la búsqueda.', validation: requiredText(60) }),
    defineField({ name: 'description', title: 'Descripción SEO', type: 'text', rows: 3, description: 'Resume de forma descriptiva y específica el contenido de esta página. Google puede mostrar un fragmento distinto según la búsqueda.', validation: requiredText(160) }),
  ],
});

const imageWithAlt = defineType({
  name: 'imageWithAlt', title: 'Imagen con texto alternativo', type: 'image', options: { hotspot: true },
  fields: [defineField({ name: 'alt', title: 'Texto alternativo', type: 'string', validation: requiredText(160) })],
});

const cta = defineType({
  name: 'cta', title: 'Llamada a la acción', type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Texto', type: 'string', validation: requiredText(60) }),
    defineField({ name: 'href', title: 'Destino', type: 'string', validation: (rule) => rule.required().custom((value) => validCtaHref(value) ? true : 'Usa un ancla válida (#seccion) o una URL HTTPS.' ) }),
  ],
});

// Legacy compatibility only. Remove this type after an explicit dataset migration clears offer.price.
const structuredPrice = defineType({
  name: 'structuredPrice', title: 'Precio heredado', type: 'object',
  deprecated: { reason: 'No se publica. Requiere una migración explícita antes de eliminar este tipo.' },
  fields: [
    defineField({ name: 'amount', title: 'Importe', type: 'number' }),
    defineField({ name: 'currency', title: 'Moneda ISO', type: 'string', initialValue: 'USD' }),
    defineField({ name: 'suffix', title: 'Sufijo', type: 'string', description: 'Por ejemplo: / mes' }),
    defineField({ name: 'display', title: 'Texto de visualización', type: 'string', description: 'Opcional; úsalo cuando el formato monetario automático no sea suficiente.', validation: (rule) => rule.max(40) }),
  ],
});

const guideAction = defineType({
  name: 'guideAction', title: 'Acción de guía', type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Texto', type: 'string', validation: requiredText(60) }),
    defineField({ name: 'url', title: 'URL externa o descarga', type: 'url', validation: (rule) => rule.required().custom((value) => validHttpsUrl(value) ? true : 'Usa una URL HTTPS válida.') }),
  ],
});

const sectionCopy = defineType({
  name: 'sectionCopy', title: 'Texto de sección', type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Antetítulo', type: 'string', validation: requiredText(80) }),
    defineField({ name: 'title', title: 'Título', type: 'string', validation: requiredText(100) }),
    defineField({ name: 'mutedTitle', title: 'Título destacado', type: 'string', validation: requiredText(100) }),
  ],
});

const hero = defineType({
  name: 'hero', title: 'Hero', type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Antetítulo', type: 'string', validation: requiredText(80) }),
    defineField({ name: 'titleLines', title: 'Líneas de título antes del énfasis', type: 'array', of: [nonBlankStringMember()], validation: (rule) => rule.required().min(1).max(3) }),
    defineField({ name: 'emphasizedLine', title: 'Texto enfatizado', type: 'string', validation: requiredText(80) }),
    defineField({ name: 'description', title: 'Descripción', type: 'text', rows: 3, validation: requiredText(280) }),
    defineField({ name: 'primaryCta', title: 'CTA principal', type: 'cta', validation: (rule) => rule.required() }),
    defineField({ name: 'secondaryCta', title: 'CTA secundaria', type: 'cta', validation: (rule) => rule.required() }),
    defineField({ name: 'stats', title: 'Estadísticas', type: 'array', of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'value', type: 'string', validation: requiredText(40) }), defineField({ name: 'label', type: 'string', validation: requiredText(80) })] })], validation: (rule) => rule.required().min(1).max(4) }),
    defineField({ name: 'marqueeItems', title: 'Especialidades', type: 'array', of: [nonBlankStringMember()], validation: (rule) => rule.required().min(1).max(12) }),
  ],
});

const siteSettings = defineType({
  name: 'siteSettings', title: 'Ajustes del sitio', type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nombre', type: 'string', validation: requiredText(80) }),
    defineField({ name: 'description', title: 'Descripción', type: 'text', description: 'Resume de forma descriptiva y específica la propuesta de la portada. Google puede mostrar un fragmento distinto según la búsqueda.', validation: requiredText(160) }),
    defineField({
      name: 'corporateContact', title: 'Datos de contacto corporativo', type: 'object',
      description: 'Opcional. Estos datos se usan como información corporativa del sitio.',
      fields: [
        defineField({ name: 'email', title: 'Correo electrónico', type: 'string', description: 'Opcional. Correo de contacto corporativo.', validation: (rule) => rule.email().max(254) }),
        defineField({ name: 'whatsappNumber', title: 'Número de WhatsApp', type: 'string', description: 'Opcional. Número internacional de 8 a 15 dígitos; puede incluir + al inicio.', validation: (rule) => rule.regex(/^\+?\d{8,15}$/, { name: 'número internacional' }) }),
        defineField({
          name: 'socialProfiles', title: 'Perfiles sociales', type: 'array', description: 'Opcional. Añade solo perfiles corporativos oficiales.',
          of: [defineArrayMember({ type: 'object', title: 'Perfil social', fields: [
            defineField({ name: 'platform', title: 'Plataforma', type: 'string', options: { list: [{ title: 'LinkedIn', value: 'linkedin' }, { title: 'Instagram', value: 'instagram' }, { title: 'Facebook', value: 'facebook' }, { title: 'X', value: 'x' }, { title: 'YouTube', value: 'youtube' }, { title: 'TikTok', value: 'tiktok' }] }, validation: (rule) => rule.required() }),
            defineField({ name: 'url', title: 'URL del perfil', type: 'url', description: 'Debe usar HTTPS.', validation: (rule) => rule.required().uri({ scheme: ['https'] }) }),
          ] })], validation: (rule) => rule.max(6),
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Ajustes del sitio' }) },
});

const landingPage = defineType({
  name: 'landingPage', title: 'Portada', type: 'document',
  fields: [
    defineField({ name: 'hero', type: 'hero', validation: (rule) => rule.required() }),
    defineField({ name: 'sectionCopy', title: 'Textos de secciones', type: 'object', fields: ['services', 'process', 'team', 'resources', 'faq'].map((name) => defineField({ name, title: name, type: 'sectionCopy', validation: (rule) => rule.required() })), validation: (rule) => rule.required() }),
    defineField({ name: 'processSteps', title: 'Pasos del proceso', type: 'array', of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'number', type: 'string', validation: requiredText(10) }), defineField({ name: 'title', type: 'string', validation: requiredText(80) }), defineField({ name: 'description', type: 'text', validation: requiredText(240) })] })], validation: (rule) => rule.required().min(1).max(10) }),
    defineField({ name: 'contact', title: 'Contacto', type: 'object', fields: [defineField({ name: 'description', type: 'text', validation: requiredText(280) }), defineField({ name: 'whatsappMessage', title: 'Mensaje de WhatsApp', type: 'string', validation: requiredText(280) })], validation: (rule) => rule.required() }),
  ], preview: { prepare: () => ({ title: 'Portada' }) },
});

const siteDeployment = defineType({
  name: 'siteDeployment', title: 'Actualizar sitio', type: 'document',
  fields: [
    defineField({ name: 'requestedAt', title: 'Última solicitud de actualización', type: 'datetime', readOnly: true }),
  ],
  preview: { prepare: () => ({ title: 'Actualizar sitio' }) },
});

const service = defineType({ name: 'service', title: 'Servicios descriptivos — Legacy', type: 'document', fields: [defineField({ name: 'title', type: 'string', validation: requiredText(80) }), defineField({ name: 'tier', title: 'Etiqueta', type: 'string', validation: requiredText(40) }), defineField({ name: 'description', type: 'text', validation: requiredText(280) }), defineField({ name: 'features', type: 'array', of: [nonBlankStringMember()], validation: (rule) => rule.required().min(1).max(12) }), defineField({ name: 'enabled', type: 'boolean', initialValue: true, validation: (rule) => rule.required() }), defineField({ name: 'order', type: 'number', validation: (rule) => rule.integer().min(0) })] });

const offer = defineType({ name: 'offer', title: 'Oferta', type: 'document', fields: [defineField({ name: 'title', type: 'string', validation: requiredText(80) }), defineField({ name: 'displayVariant', title: 'Variante visual', type: 'string', options: { list: [{ title: 'Tarjeta estándar', value: 'standard' }, { title: 'Mantenimiento', value: 'maintenance' }] }, initialValue: 'standard', validation: (rule) => rule.required() }), defineField({ name: 'description', type: 'text', validation: requiredText(280) }), defineField({ name: 'publicPrice', title: 'Precio público (opcional)', type: 'string', description: 'Déjalo vacío para ocultar el precio.', validation: (rule) => rule.max(40) }), defineField({ name: 'price', title: 'Precio heredado', type: 'structuredPrice', hidden: true, readOnly: true, deprecated: { reason: 'No se publica. Su limpieza requiere una migración explícita posterior.' } }), defineField({ name: 'note', type: 'string', validation: (rule) => rule.max(120).custom((value, context) => parentVariant(context) !== 'standard' || nonBlank(value) ? true : 'La oferta estándar requiere una nota.') }), defineField({ name: 'features', type: 'array', of: [nonBlankStringMember((document) => document?.displayVariant === 'standard')], hidden: ({ parent }) => parent?.displayVariant === 'maintenance', validation: (rule) => rule.custom((value, context) => parentVariant(context) !== 'standard' || Array.isArray(value) && value.length > 0 ? true : 'La oferta estándar requiere al menos una característica.') }), defineField({ name: 'included', type: 'array', of: [nonBlankStringMember((document) => document?.displayVariant === 'maintenance')], hidden: ({ parent }) => parent?.displayVariant !== 'maintenance', validation: (rule) => rule.custom((value, context) => parentVariant(context) !== 'maintenance' || Array.isArray(value) && value.length > 0 ? true : 'La oferta de mantenimiento requiere al menos un elemento incluido.') }), defineField({ name: 'excluded', type: 'array', of: [nonBlankStringMember((document) => document?.displayVariant === 'maintenance')], hidden: ({ parent }) => parent?.displayVariant !== 'maintenance', validation: (rule) => rule.custom((value, context) => parentVariant(context) !== 'maintenance' || Array.isArray(value) && value.length > 0 ? true : 'La oferta de mantenimiento requiere al menos un elemento excluido.') }), defineField({ name: 'cta', type: 'object', fields: [defineField({ name: 'label', title: 'Texto', type: 'string', validation: requiredText(60) })], hidden: ({ parent }) => parent?.displayVariant === 'maintenance', validation: (rule) => rule.custom((value, context) => parentVariant(context) !== 'standard' || value ? true : 'La oferta estándar requiere una CTA completa.') }), defineField({ name: 'featured', type: 'boolean', initialValue: false }), defineField({ name: 'enabled', type: 'boolean', initialValue: true, validation: (rule) => rule.required() }), defineField({ name: 'order', type: 'number', validation: (rule) => rule.integer().min(0) })] });

const teamMember = defineType({ name: 'teamMember', title: 'Miembro del equipo', type: 'document', fields: [defineField({ name: 'name', type: 'string', validation: requiredText(80) }), defineField({ name: 'role', type: 'string', validation: requiredText(100) }), defineField({ name: 'bio', type: 'text', validation: requiredText(500) }), defineField({ name: 'tags', type: 'array', of: [nonBlankStringMember()], validation: (rule) => rule.required().min(1).max(8) }), defineField({ name: 'image', type: 'imageWithAlt', validation: (rule) => rule.required() }), defineField({ name: 'enabled', type: 'boolean', initialValue: true, validation: (rule) => rule.required() }), defineField({ name: 'order', type: 'number', validation: (rule) => rule.integer().min(0) })] });

const faq = defineType({ name: 'faq', title: 'Pregunta frecuente', type: 'document', fields: [defineField({ name: 'question', type: 'string', validation: requiredText(160) }), defineField({ name: 'answer', type: 'text', validation: requiredText(600) }), defineField({ name: 'enabled', type: 'boolean', initialValue: true, validation: (rule) => rule.required() }), defineField({ name: 'order', type: 'number', validation: (rule) => rule.integer().min(0) })] });

const resource = defineType({ name: 'resource', title: 'Recurso', type: 'document', fields: [defineField({ name: 'resourceType', title: 'Tipo', type: 'string', options: { list: [{ title: 'Artículo', value: 'article' }, { title: 'Guía', value: 'guide' }] }, validation: (rule) => rule.required() }), defineField({ name: 'authorName', title: 'Nombre de autoría', type: 'string', description: 'Nombre público de la persona autora. Es obligatorio para artículos y opcional para guías.', validation: (rule) => rule.max(100).custom((value, context) => context.document?.resourceType !== 'article' || nonBlank(value) ? true : 'Los artículos requieren un nombre de autoría.') }), defineField({ name: 'title', type: 'string', validation: requiredText(100) }), defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (rule) => rule.required().custom(async (value, context) => { if (!value?.current) return true; const id = context.document?._id?.replace(/^drafts\./, ''); const draftId = id ? `drafts.${id}` : undefined; const existing = await context.getClient({ apiVersion: '2026-07-14' }).fetch('*[_type == "resource" && slug.current == $slug && _id != $id && _id != $draftId][0]._id', { slug: value.current, id, draftId }); return existing ? 'El slug debe ser único entre artículos y guías.' : true; }) }), defineField({ name: 'excerpt', title: 'Extracto', type: 'text', validation: requiredText(280) }), defineField({ name: 'category', title: 'Categoría', type: 'string', validation: requiredText(60) }), defineField({ name: 'publishedAt', title: 'Fecha de publicación', type: 'datetime', validation: (rule) => rule.required() }), defineField({ name: 'coverImage', title: 'Portada', type: 'imageWithAlt', validation: (rule) => rule.required() }), defineField({ name: 'body', title: 'Contenido', type: 'array', of: [defineArrayMember({ type: 'block', styles: [{ title: 'Normal', value: 'normal' }, { title: 'H2', value: 'h2' }, { title: 'H3', value: 'h3' }] }), defineArrayMember({ type: 'imageWithAlt' })], validation: (rule) => rule.required().min(1).custom(validPortableTextBody) }), defineField({ name: 'seo', type: 'editorialSeo', validation: (rule) => rule.required() }), defineField({ name: 'action', title: 'Acción opcional de guía', type: 'guideAction', hidden: ({ parent }) => parent?.resourceType !== 'guide' })], validation: (rule) => rule.custom((document: any) => document?.resourceType !== 'guide' || !document?.action || document.action.url ? true : 'La acción de una guía requiere URL.') });

export const schemaTypes = [seo, imageWithAlt, cta, structuredPrice, guideAction, sectionCopy, hero, siteSettings, landingPage, siteDeployment, service, offer, teamMember, faq, resource];
