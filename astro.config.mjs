// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
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
