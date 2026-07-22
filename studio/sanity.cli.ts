import { defineCliConfig } from 'sanity/cli';
import { validateStudioEnvironment } from '../deployment-environment';

const { projectId, dataset } = validateStudioEnvironment({
  deployEnv: process.env.DEPLOY_ENV,
  branch: process.env.CF_PAGES_BRANCH,
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
});

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  deployment: {
    appId: 'uwxzumhj03b4mbzpwdkcoeej',
  },
});
