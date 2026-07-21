import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';
import { structure } from './structure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;

if (!projectId || !dataset) {
  throw new Error('Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET before starting Sanity Studio.');
}

export default defineConfig({
  name: 'tunorte',
  title: 'TuNorte Content Studio',
  projectId,
  dataset,
  basePath: '/admin',
  plugins: [structureTool({ structure })],
  document: {
    newDocumentOptions: (previous) => previous.filter((template) => template.templateId !== 'siteSettings' && template.templateId !== 'landingPage'),
  },
  schema: { types: schemaTypes },
});
