// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { resolveDeploymentEnvironment } from './deployment-environment.ts';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const { environment } = resolveDeploymentEnvironment({ deployEnv: env.DEPLOY_ENV, branch: env.CF_PAGES_BRANCH });

// https://astro.build/config
export default defineConfig({
  site: 'https://tunorteweb.com',
  output: 'static',
  integrations: environment === 'production' ? [sitemap()] : [],
  env: {
    schema: {
      DEPLOY_ENV: envField.enum({ context: 'server', access: 'public', values: ['local', 'preview', 'production'], optional: true }),
      CF_PAGES_BRANCH: envField.string({ context: 'server', access: 'public', optional: true }),
      SANITY_PROJECT_ID: envField.string({ context: 'server', access: 'public', optional: true }),
      SANITY_DATASET: envField.string({ context: 'server', access: 'public', optional: true }),
      SANITY_API_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
