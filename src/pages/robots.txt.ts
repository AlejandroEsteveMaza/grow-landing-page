import type { APIRoute } from 'astro';
import { deploymentEnvironment } from '../lib/deployment';

export const GET = (() => {
  const body = deploymentEnvironment === 'production'
    ? 'User-agent: *\nAllow: /\n\nSitemap: https://tunorteweb.com/sitemap-index.xml\n'
    : 'User-agent: *\nDisallow: /\n';

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}) satisfies APIRoute;
