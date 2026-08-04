import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { esESLocale } from '@sanity/locale-es-es';
import { validateStudioEnvironment } from '../deployment-environment';
import { siteDeploymentAction } from './actions/siteDeploymentAction';
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
  plugins: [structureTool({ structure }), esESLocale()],
  document: {
    newDocumentOptions: (previous) => previous.filter((template) => !['siteSettings', 'landingPage', 'siteDeployment'].includes(template.templateId)),
    actions: (previous, context) => context.schemaType === 'siteDeployment' ? [siteDeploymentAction] : previous,
  },
  schema: { types: schemaTypes },
});
