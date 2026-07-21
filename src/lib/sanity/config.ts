import { createClient } from '@sanity/client';

const projectId = import.meta.env.SANITY_PROJECT_ID?.trim();
const dataset = import.meta.env.SANITY_DATASET?.trim();
const token = import.meta.env.SANITY_API_TOKEN?.trim();
const isValidProjectId = projectId !== undefined && /^[a-z0-9-]+$/.test(projectId);
const isValidDataset = dataset !== undefined && /^[a-z0-9_-]+$/.test(dataset);
const isValidToken = token !== undefined && token.length > 0;

export const sanityConfig = isValidProjectId && isValidDataset && isValidToken
  ? { projectId, dataset, apiVersion: '2026-07-14' }
  : null;

export const sanityClient = sanityConfig && token
  ? createClient({ ...sanityConfig, token, useCdn: false, perspective: 'published' })
  : null;
