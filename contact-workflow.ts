export const PRIVACY_POLICY_VERSION = '2026-07-28';
export const PRIVACY_NOTICE_VERSION = '2026-07-28.1';
export const TURNSTILE_ACTION = 'contact';

export const CONTACT_SERVICE_OPTIONS = [
  'Landing Profesional',
  'Web Corporativa Completa',
  'Plan Web Segura',
  'Otro / Tengo dudas',
] as const;

export interface ContactSubmission {
  name: string;
  email: string;
  service: string;
  message: string;
  turnstileToken: string;
  website: string;
}

type ValidationResult = { ok: true; value: ContactSubmission } | { ok: false };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateContactSubmission = (input: unknown): ValidationResult => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false };

  const candidate = input as Record<string, unknown>;
  const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const email = typeof candidate.email === 'string' ? candidate.email.trim().toLowerCase() : '';
  const service = typeof candidate.service === 'string' ? candidate.service.trim() : '';
  const message = typeof candidate.message === 'string' ? candidate.message.trim() : '';
  const turnstileToken = typeof candidate.turnstileToken === 'string' ? candidate.turnstileToken : '';
  const website = typeof candidate.website === 'string' ? candidate.website : '';

  if (
    name.length < 2 ||
    name.length > 80 ||
    /[\r\n]/.test(name) ||
    email.length > 254 ||
    !EMAIL_PATTERN.test(email) ||
    /[\r\n]/.test(email) ||
    service.length < 1 ||
    service.length > 80 ||
    /[\r\n]/.test(service) ||
    message.length < 20 ||
    message.length > 2000 ||
    turnstileToken.length < 1 ||
    turnstileToken.length > 2048 ||
    website !== ''
  ) {
    return { ok: false };
  }

  return {
    ok: true,
    value: { name, email, service, message, turnstileToken, website },
  };
};
