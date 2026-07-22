/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DEPLOY_ENV?: 'local' | 'preview' | 'production';
  readonly CF_PAGES_BRANCH?: string;
  readonly SANITY_PROJECT_ID?: string;
  readonly SANITY_DATASET?: string;
  readonly SANITY_API_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
