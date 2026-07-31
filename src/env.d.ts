/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DEPLOY_ENV?: 'local' | 'preview' | 'production';
  readonly CF_PAGES_BRANCH?: string;
  readonly SANITY_PROJECT_ID?: string;
  readonly SANITY_DATASET?: string;
  readonly SANITY_API_TOKEN?: string;
  readonly PUBLIC_CONTACT_FORM_ENABLED?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface Window {
  turnstile?: {
    render: (container: HTMLElement, options: Record<string, unknown>) => string;
    reset: (widgetId: string) => void;
  };
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
