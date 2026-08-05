import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PRIVACY_NOTICE_VERSION, PRIVACY_POLICY_VERSION } from '../contact-workflow.ts';

const source = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('privacy versions identify the updated public policy and short-form notice', () => {
  assert.equal(PRIVACY_POLICY_VERSION, '2026-08-06');
  assert.equal(PRIVACY_NOTICE_VERSION, '2026-08-06.1');
});

test('contact notice explains every required field and the consequence of omission', async () => {
  const contact = await source('src/components/sections/ContactSection.astro');

  assert.match(contact, /Nombre, correo, servicio de interés y mensaje son obligatorios\./);
  assert.match(contact, /Si no los proporcionas, no podremos enviar ni atender tu consulta\./);
  assert.match(contact, /PUBLIC_CONTACT_FORM_ENABLED === 'true'/);
  assert.match(contact, /action=\{isRealSubmitEnabled \? '\/api\/contact' : undefined\}/);
});

test('policy describes current operation, providers, deadlines, and escalation without claiming external completion', async () => {
  const policy = await source('src/pages/privacidad/index.astro');

  assert.match(policy, /Daniela Alexandra Ortiz Paz/);
  assert.match(policy, /Sanity y su CDN de imágenes/);
  assert.match(policy, /puede estar activo en producción/);
  assert.match(policy, /no afirma que esos controles externos o administrativos ya se hayan completado/);
  assert.match(policy, /20 días hábiles/);
  assert.match(policy, /10 días hábiles/);
  assert.match(policy, /www\.gob\.pe\/9269-/);
  assert.doesNotMatch(policy, /Antes de activar el formulario público/);
});

test('static Pages headers enforce the expected CSP and permissions without HSTS', async () => {
  const headers = await source('public/_headers');
  const csp = headers.split('\n').find((line) => line.includes('Content-Security-Policy:')) ?? '';

  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self' 'unsafe-inline' https:\/\/challenges\.cloudflare\.com/);
  assert.match(csp, /connect-src 'self' https:\/\/challenges\.cloudflare\.com/);
  assert.match(csp, /frame-src https:\/\/challenges\.cloudflare\.com/);
  assert.match(csp, /img-src 'self' data: https:\/\/cdn\.sanity\.io/);
  assert.match(csp, /object-src 'none'/);
  assert.match(headers, /Permissions-Policy:/);
  assert.doesNotMatch(headers, /Strict-Transport-Security/i);
});
