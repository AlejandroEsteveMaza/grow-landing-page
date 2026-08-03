import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem().title('Ajustes del sitio').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem().title('Portada').child(S.document().schemaType('landingPage').documentId('landingPage')),
      S.listItem().title('Actualizar sitio').child(S.document().schemaType('siteDeployment').documentId('siteDeployment')),
      S.divider(),
      S.documentTypeListItem('service').title('Servicios descriptivos — Legacy'),
      S.documentTypeListItem('offer').title('Ofertas'),
      S.documentTypeListItem('teamMember').title('Equipo'),
      S.documentTypeListItem('faq').title('Preguntas frecuentes'),
      S.documentTypeListItem('resource').title('Recursos'),
    ]);
