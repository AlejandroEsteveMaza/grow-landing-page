import { createClient } from '@sanity/client';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = import.meta.env.PUBLIC_SANITY_DATASET?.trim();
const isValidProjectId = projectId !== undefined && /^[a-z0-9-]+$/.test(projectId);
const isValidDataset = dataset !== undefined && /^[a-z0-9_-]+$/.test(dataset);

export const sanityConfig = isValidProjectId && isValidDataset
  ? { projectId, dataset, apiVersion: '2026-07-14' }
  : null;

export const sanityClient = sanityConfig
  ? createClient({ ...sanityConfig, useCdn: false, perspective: 'published' })
  : null;
