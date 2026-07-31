import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONTACT_SERVICE_OPTIONS,
  PRIVACY_NOTICE_VERSION,
  PRIVACY_POLICY_VERSION,
  validateContactSubmission,
} from '../contact-workflow.ts';
import { onRequest } from '../functions/api/contact.ts';

const validSubmission = {
  name: 'Daniela Ortiz',
  email: 'DANIELA@example.com',
  service: CONTACT_SERVICE_OPTIONS[0],
  message: 'Necesito información para desarrollar una web profesional.',
  turnstileToken: 'verified-token',
  website: '',
};

test('normalizes and accepts the bounded contact contract with a CMS-derived service title', () => {
  const result = validateContactSubmission({ ...validSubmission, service: '  Estrategia Digital para Clínicas  ' });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.email, 'daniela@example.com');
    assert.equal(result.value.service, 'Estrategia Digital para Clínicas');
  }
});

test('rejects empty or oversized services, honeypot values, and oversized messages', () => {
  assert.equal(validateContactSubmission({ ...validSubmission, service: '  ' }).ok, false);
  assert.equal(validateContactSubmission({ ...validSubmission, service: 'x'.repeat(81) }).ok, false);
  assert.equal(validateContactSubmission({ ...validSubmission, website: 'spam.example' }).ok, false);
  assert.equal(validateContactSubmission({ ...validSubmission, message: 'x'.repeat(2001) }).ok, false);
});

test('endpoint fails closed before any external request when server activation is absent', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error('External fetch must not run');
  };

  try {
    const response = await onRequest({
      request: new Request('https://tunorteweb.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://tunorteweb.com' },
        body: JSON.stringify(validSubmission),
      }),
      env: {},
    });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, message: 'El formulario no está disponible.' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('enabled endpoint validates Turnstile and sends versioned evidence through mocked fetches', async () => {
  const originalFetch = globalThis.fetch;
  const requests: Request[] = [];
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    requests.push(request);

    if (request.url.includes('/siteverify')) {
      return Response.json({ success: true, hostname: 'tunorteweb.com', action: 'contact' });
    }
    return Response.json({ id: 'mock-message-id' });
  };

  try {
    const response = await onRequest({
      request: new Request('https://tunorteweb.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://tunorteweb.com' },
        body: JSON.stringify(validSubmission),
      }),
      env: {
        CONTACT_FORM_ENABLED: 'true',
        CONTACT_ALLOWED_HOSTNAMES: 'tunorteweb.com',
        TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
        RESEND_API_KEY: 'test-resend-key',
        CONTACT_FROM_EMAIL: 'TuNorte <contact@example.com>',
        CONTACT_TO_EMAIL: 'private-destination@example.com',
      },
    });

    assert.equal(response.status, 200);
    assert.equal(requests.length, 2);
    assert.equal(requests[0]?.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(requests[1]?.url, 'https://api.resend.com/emails');

    const emailRequest = (await requests[1]?.json()) as { text?: string };
    assert.match(emailRequest.text ?? '', new RegExp(`Versión de la política de privacidad: ${PRIVACY_POLICY_VERSION}`));
    assert.match(emailRequest.text ?? '', new RegExp(`Versión del aviso de envío: ${PRIVACY_NOTICE_VERSION.replace('.', '\\.')}`));
    assert.match(emailRequest.text ?? '', /Fecha y hora UTC: \d{4}-\d{2}-\d{2}T/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
