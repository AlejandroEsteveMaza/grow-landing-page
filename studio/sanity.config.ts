import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { validateStudioEnvironment } from '../deployment-environment';
import { schemaTypes } from './schemaTypes';
import { structure } from './structure';

const { projectId, dataset } = validateStudioEnvironment({
  deployEnv: process.env.DEPLOY_ENV,
  branch: process.env.CF_PAGES_BRANCH,
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
});

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
