# Safe contact form operations

The repository keeps two independent technical controls that fail closed when configuration is missing. Production may have both controls enabled; that technical state does not prove that external legal, registration, or contractual controls are complete.

## State and configuration changes

1. Before changing an environment, record its current state without copying secret values and confirm whether the target is Preview or Production.
2. Keep documented evidence for the controller's required identity and domicile, data-bank analysis and registration, international flows, providers, safeguards, the ARCO procedure, and six-month deletion. Review specifically whether the intended Gmail use provides sufficient safeguards. These external controls remain subject to evidence and are not presumed complete because Production is enabled.
3. Configure and verify Turnstile and the Resend sending domain without storing values in the repository.
4. Validate in Preview first. The client only renders real submission when `PUBLIC_CONTACT_FORM_ENABLED=true` and a validly formatted public Turnstile key exists.
5. The endpoint only processes messages when `CONTACT_FORM_ENABLED=true` in the same environment. Both flags must be enabled; neither replaces the other.
6. After an authorized change, verify version evidence, the six-month deletion procedure, and the email alternative. Do not use the public form for testing without explicit authorization.

Technical activation alone does not establish compliance with Law No. 29733 or Supreme Decree No. 016-2024-JUS.

## ARCO and revocation requests

1. Record the receipt date of mail sent to `contacto@tunorteweb.com` and confirm the requested right without requesting excessive data.
2. Verify identity only to the extent reasonably necessary. If information is missing, request the specific correction.
3. Respond to access requests within 20 business days and rectification, cancellation, or opposition requests within 10 business days. Apply revocation prospectively and confirm it within an operational maximum of 10 business days, recording any processing that continues under another legal basis.
4. Retain the request, response, and actions taken. If a request is denied in whole or part, explain why and identify the ANPD complaint route.

Official sources checked on August 6, 2026: [ANPD guidance on ARCO rights](https://www.gob.pe/9270-que-son-los-derechos-arco) and the [complaint procedure, including response deadlines](https://www.gob.pe/9269-iniciar-procedimiento-para-el-ejercicio-de-derechos-de-acceso-rectificacion-cancelacion-y-oposicion).

## Pending commercial content in Sanity

Production publishes the Sanity-managed claim “Cumplimiento legal desde el inicio (aviso legal, privacidad y cookies).” An authorized editor must remove or qualify it to describe concrete deliverables without promising absolute legal compliance. That correction requires a dataset mutation and is outside this repository change.

## Variables

| Variable | Scope | Sensitive | Purpose |
| --- | --- | --- | --- |
| `PUBLIC_CONTACT_FORM_ENABLED` | Public build | No | Enables the real interface only for the exact value `true`. |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public build | No | Public Turnstile widget key. |
| `CONTACT_FORM_ENABLED` | Pages Function | No | Enables the endpoint only for the exact value `true`. |
| `CONTACT_ALLOWED_HOSTNAMES` | Pages Function | No | Comma-separated allowed hosts without protocol or path. |
| `TURNSTILE_SECRET_KEY` | Pages Function | Yes | Validates the token with Cloudflare. |
| `RESEND_API_KEY` | Pages Function | Yes | Authorizes transactional delivery. |
| `CONTACT_FROM_EMAIL` | Pages Function | Configuration | Verified Resend sender. |
| `CONTACT_TO_EMAIL` | Pages Function | Yes | Private inquiry destination; never publish it. |

Do not add real values to `.env` files, documentation, logs, `PUBLIC_` variables, or version control. Public variables belong to the Astro build; server variables belong to the Pages Functions environment.

## Controls that must remain

- The function rejects the request before calling third parties when the server flag is not enabled.
- The endpoint only accepts JSON over `POST`, with allowed origin and host, strict limits, an allowed service, and an empty honeypot.
- Turnstile is verified on the server, including the `contact` action and expected host.
- The message is sent as text and PII is not logged to the console or stored in a first-party database.
- Every message includes the UTC date, policy version, and notice version as submission evidence.
- Disabled builds contain no named controls, form action, or real-submission script.

## Local verification without delivery

```bash
npm test
npm run check
npm run build
rg -n "api/contact|challenges.cloudflare.com/turnstile|PUBLIC_TURNSTILE_SITE_KEY" dist
```

The final command must not find an active route or Turnstile loader in a default build. `npm test` proves that the disabled endpoint returns `503` without making an external request.
