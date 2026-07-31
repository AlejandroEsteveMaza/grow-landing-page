# Activación segura del formulario de contacto

El formulario real está cerrado por defecto. Su activación exige aprobación legal y registral, configuración pública durante el build y configuración secreta independiente en Cloudflare Pages Functions.

## Secuencia de activación

1. Obtén aprobación documentada sobre identificación y domicilio de la responsable, registro del banco de datos de consultas, flujos internacionales, proveedores, salvaguardas y procedimiento ARCO. Revisa específicamente si el uso previsto de Gmail ofrece garantías suficientes.
2. Configura y verifica Turnstile y el dominio remitente de Resend sin guardar valores en el repositorio.
3. Añade las variables de servidor y valida primero en Preview. Mantén `CONTACT_FORM_ENABLED` distinto de `true` durante esta preparación.
4. Añade las variables públicas de build. El cliente solo muestra el envío real cuando `PUBLIC_CONTACT_FORM_ENABLED=true` y existe una clave pública de Turnstile con formato válido.
5. Como último paso, establece `CONTACT_FORM_ENABLED=true` en el mismo entorno. Ambos indicadores deben estar activos; ninguno sustituye al otro.
6. Verifica un envío controlado, la evidencia de versiones, el procedimiento de borrado a seis meses y la alternativa por correo antes de autorizar Production.

La activación técnica no acredita por sí sola el cumplimiento de la Ley N.º 29733 ni del Decreto Supremo N.º 016-2024-JUS.

## Variables

| Variable | Ámbito | Sensible | Función |
| --- | --- | --- | --- |
| `PUBLIC_CONTACT_FORM_ENABLED` | Build público | No | Habilita la interfaz real solo con el valor exacto `true`. |
| `PUBLIC_TURNSTILE_SITE_KEY` | Build público | No | Clave pública del widget de Turnstile. |
| `CONTACT_FORM_ENABLED` | Pages Function | No | Habilita el endpoint solo con el valor exacto `true`. |
| `CONTACT_ALLOWED_HOSTNAMES` | Pages Function | No | Lista separada por comas de hosts autorizados, sin protocolo ni ruta. |
| `TURNSTILE_SECRET_KEY` | Pages Function | Sí | Valida el token con Cloudflare. |
| `RESEND_API_KEY` | Pages Function | Sí | Autoriza el envío transaccional. |
| `CONTACT_FROM_EMAIL` | Pages Function | Configuración | Remitente verificado en Resend. |
| `CONTACT_TO_EMAIL` | Pages Function | Sí | Destino privado de las consultas; nunca debe publicarse. |

No añadas valores reales a archivos `.env`, documentación, logs, variables `PUBLIC_` ni control de versiones. Las variables públicas pertenecen al build de Astro; las variables de servidor pertenecen al entorno de Pages Functions.

## Controles que deben permanecer

- La función rechaza la petición antes de llamar a terceros si el indicador de servidor no está activo.
- El endpoint acepta solo JSON por `POST`, con origen y host autorizados, límites estrictos, servicio permitido y honeypot vacío.
- Turnstile se verifica en servidor, incluida la acción `contact` y el host esperado.
- El mensaje se envía como texto y no se registra PII en consola ni en una base de datos propia.
- Cada mensaje incluye fecha UTC, versión de política y versión del aviso como evidencia del envío.
- Los builds desactivados no contienen controles con nombre, acción de formulario ni script de envío real.

## Verificación local sin entregas

```bash
npm test
npm run check
npm run build
rg -n "api/contact|challenges.cloudflare.com/turnstile|PUBLIC_TURNSTILE_SITE_KEY" dist
```

La última orden no debe encontrar una ruta activa ni el cargador de Turnstile en un build por defecto. `npm test` prueba que el endpoint desactivado responde `503` sin ejecutar ninguna llamada externa.
