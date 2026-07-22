import { createClient } from '@sanity/client';
import { CF_PAGES_BRANCH, DEPLOY_ENV, SANITY_API_TOKEN, SANITY_DATASET, SANITY_PROJECT_ID } from 'astro:env/server';
import { validateWebsiteEnvironment } from '../../../deployment-environment';

export const deployment = validateWebsiteEnvironment({
  deployEnv: DEPLOY_ENV,
  branch: CF_PAGES_BRANCH,
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_API_TOKEN,
});

export const sanityConfig = deployment.sanity
  ? { projectId: deployment.sanity.projectId, dataset: deployment.sanity.dataset, apiVersion: '2026-07-14' }
  : null;

export const sanityClient = sanityConfig && deployment.sanity
  ? createClient({ ...sanityConfig, token: deployment.sanity.token, useCdn: false, perspective: 'published' })
  : null;
