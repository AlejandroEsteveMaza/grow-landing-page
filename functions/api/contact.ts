import {
  PRIVACY_NOTICE_VERSION,
  PRIVACY_POLICY_VERSION,
  RESEND_TIMEOUT_MS,
  TURNSTILE_ACTION,
  TURNSTILE_TIMEOUT_MS,
  validateContactSubmission,
} from '../../contact-workflow.ts';

interface Env {
  CONTACT_FORM_ENABLED?: string;
  CONTACT_ALLOWED_HOSTNAMES?: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

interface TurnstileResult {
  success?: boolean;
  hostname?: string;
  action?: string;
}

const jsonResponse = (status: number, message: string, extraHeaders: HeadersInit = {}) =>
  Response.json(
    { ok: status >= 200 && status < 300, message },
    {
      status,
      headers: { 'Cache-Control': 'no-store', ...extraHeaders },
    },
  );

const configuredHostnames = (value: string | undefined) =>
  value
    ?.split(',')
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean) ?? [];

const verifyTurnstile = async (secret: string, token: string, hostname: string, remoteIp: string | null, idempotencyKey: string) => {
  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  body.set('idempotency_key', idempotencyKey);
  if (remoteIp) body.set('remoteip', remoteIp);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TURNSTILE_TIMEOUT_MS);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: controller.signal,
    });
    if (!response.ok) return false;

    const result = (await response.json()) as TurnstileResult;
    return result.success === true && result.hostname?.toLowerCase() === hostname && result.action === TURNSTILE_ACTION;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

export const onRequest = async ({ request, env }: PagesContext): Promise<Response> => {
  if (env.CONTACT_FORM_ENABLED !== 'true') {
    return jsonResponse(503, 'El formulario no está disponible.');
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, 'Método no permitido.', { Allow: 'POST' });
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get('Origin');
  const allowedHostnames = configuredHostnames(env.CONTACT_ALLOWED_HOSTNAMES);
  const hostname = requestUrl.hostname.toLowerCase();
  if (origin !== requestUrl.origin || !allowedHostnames.includes(hostname)) {
    return jsonResponse(403, 'Solicitud no permitida.');
  }

  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    return jsonResponse(415, 'Formato no permitido.');
  }

  const { TURNSTILE_SECRET_KEY, RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL } = env;
  if (!TURNSTILE_SECRET_KEY || !RESEND_API_KEY || !CONTACT_FROM_EMAIL || !CONTACT_TO_EMAIL) {
    return jsonResponse(503, 'El formulario no está disponible.');
  }

  const declaredLength = Number(request.headers.get('Content-Length') ?? '0');
  if (!Number.isFinite(declaredLength) || declaredLength > 16_000) {
    return jsonResponse(413, 'La solicitud es demasiado extensa.');
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 16_000) return jsonResponse(413, 'La solicitud es demasiado extensa.');
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse(400, 'No se pudo procesar la consulta.');
  }

  const submission = validateContactSubmission(body);
  if (!submission.ok) return jsonResponse(400, 'Revisa los datos de la consulta.');

  const turnstileValid = await verifyTurnstile(
    TURNSTILE_SECRET_KEY,
    submission.value.turnstileToken,
    hostname,
    request.headers.get('CF-Connecting-IP'),
    submission.value.submissionId,
  );
  if (!turnstileValid) return jsonResponse(400, 'No se pudo verificar la consulta. Inténtalo de nuevo.');

  const text = [
    'Nueva consulta desde tunorteweb.com',
    '',
    `Nombre: ${submission.value.name}`,
    `Email: ${submission.value.email}`,
    `Servicio: ${submission.value.service}`,
    '',
    'Mensaje:',
    submission.value.message,
    '',
    'Evidencia de la solicitud:',
    `Fecha y hora UTC: ${submission.value.submittedAt}`,
    `Versión de la política de privacidad: ${PRIVACY_POLICY_VERSION}`,
    `Versión del aviso de envío: ${PRIVACY_NOTICE_VERSION}`,
    'Acción afirmativa: envío de la consulta mediante el botón del formulario.',
  ].join('\n');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);

    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `contact-form/${submission.value.submissionId}`,
        },
        body: JSON.stringify({
          from: CONTACT_FROM_EMAIL,
          to: [CONTACT_TO_EMAIL],
          subject: `Nueva consulta: ${submission.value.service}`,
          text,
        }),
        signal: controller.signal,
      });

      if (!resendResponse.ok) return jsonResponse(502, 'No se pudo enviar la consulta. Inténtalo más tarde.');
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return jsonResponse(502, 'No se pudo enviar la consulta. Inténtalo más tarde.');
  }

  return jsonResponse(200, 'Consulta enviada. Te responderemos lo antes posible.');
};
