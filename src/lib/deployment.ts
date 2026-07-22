import { CF_PAGES_BRANCH, DEPLOY_ENV } from 'astro:env/server';
import { resolveDeploymentEnvironment } from '../../deployment-environment';

export const deploymentEnvironment = resolveDeploymentEnvironment({
  deployEnv: DEPLOY_ENV,
  branch: CF_PAGES_BRANCH,
}).environment;
