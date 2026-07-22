export type DeployEnvironment = 'local' | 'preview' | 'production';

interface DeploymentTargetInput {
  deployEnv?: string | undefined;
  branch?: string | undefined;
  dataset?: string | undefined;
}

interface WebsiteEnvironmentInput extends DeploymentTargetInput {
  projectId?: string | undefined;
  token?: string | undefined;
}

interface StudioEnvironmentInput extends DeploymentTargetInput {
  projectId?: string | undefined;
}

interface SanityCredentials {
  projectId: string;
  dataset: string;
  token: string;
}

const projectIdPattern = /^[a-z0-9-]+$/;
const datasetPattern = /^[a-z0-9_-]+$/;

const trimmed = (value: string | undefined): string | undefined => value?.trim() || undefined;

const deploymentTarget = ({ deployEnv, branch, dataset }: DeploymentTargetInput): {
  environment: DeployEnvironment;
  branch: string | undefined;
  dataset: string | undefined;
  errors: string[];
} => {
  const normalizedBranch = trimmed(branch);
  const environment = trimmed(deployEnv) ?? (normalizedBranch === 'main' ? 'production' : normalizedBranch ? 'preview' : 'local');
  if (environment !== 'local' && environment !== 'preview' && environment !== 'production') {
    throw new Error('DEPLOY_ENV must be one of: local, preview, production.');
  }

  const normalizedDataset = trimmed(dataset);
  const errors: string[] = [];

  if (environment === 'production') {
    if (normalizedBranch && normalizedBranch !== 'main') errors.push('production deployments require CF_PAGES_BRANCH=main');
    if (normalizedDataset !== 'production') errors.push('production deployments require the production Sanity dataset');
  }

  if (environment === 'preview') {
    if (normalizedBranch === 'main') errors.push('preview deployments cannot use CF_PAGES_BRANCH=main');
    if (normalizedDataset !== 'development') errors.push('preview deployments require the development Sanity dataset');
  }

  return { environment, branch: normalizedBranch, dataset: normalizedDataset, errors };
};

export const validateWebsiteEnvironment = (input: WebsiteEnvironmentInput): {
  environment: DeployEnvironment;
  branch: string | undefined;
  sanity: SanityCredentials | null;
} => {
  const target = deploymentTarget(input);
  const projectId = trimmed(input.projectId);
  const token = trimmed(input.token);
  const validProjectId = Boolean(projectId && projectIdPattern.test(projectId));
  const validDataset = Boolean(target.dataset && datasetPattern.test(target.dataset));
  const validToken = Boolean(token);

  if (target.environment === 'local') {
    return {
      environment: target.environment,
      branch: target.branch,
      sanity: validProjectId && validDataset && validToken
        ? { projectId: projectId!, dataset: target.dataset!, token: token! }
        : null,
    };
  }

  if (!validProjectId) target.errors.push('SANITY_PROJECT_ID is required and must be valid');
  if (!validDataset) target.errors.push('SANITY_DATASET is required and must be valid');
  if (!validToken) target.errors.push('SANITY_API_TOKEN is required');
  if (target.errors.length) throw new Error(`Invalid deployment environment: ${target.errors.join('; ')}.`);

  return {
    environment: target.environment,
    branch: target.branch,
    sanity: { projectId: projectId!, dataset: target.dataset!, token: token! },
  };
};

export const validateStudioEnvironment = (input: StudioEnvironmentInput): {
  environment: DeployEnvironment;
  branch: string | undefined;
  projectId: string;
  dataset: string;
} => {
  const target = deploymentTarget(input);
  const projectId = trimmed(input.projectId);

  if (!projectId || !projectIdPattern.test(projectId)) target.errors.push('SANITY_STUDIO_PROJECT_ID is required and must be valid');
  if (!target.dataset || !datasetPattern.test(target.dataset)) target.errors.push('SANITY_STUDIO_DATASET is required and must be valid');
  if (target.errors.length) throw new Error(`Invalid Studio deployment environment: ${target.errors.join('; ')}.`);

  return {
    environment: target.environment,
    branch: target.branch,
    projectId: projectId!,
    dataset: target.dataset!,
  };
};
