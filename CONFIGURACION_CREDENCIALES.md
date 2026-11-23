# Configuración de credenciales

Nunca confirmar `.env` en Git. Copiar `.env.example` a `.env`, completar allí y limitar permisos del archivo al usuario del servicio. Reiniciar web y worker después de cambiar variables.

## Secretos internos

Ejecutar `npm run credentials:generate`. Genera valores criptográficamente aleatorios; son válidos para pruebas o producción si se guardan de forma segura.

| Variable | Función | Comprobación | Error frecuente |
|---|---|---|---|
| `SESSION_SECRET` | HMAC de sesiones y desafíos de segundo factor | iniciar sesión y abrir `/dashboard` | cambiarla invalida todas las sesiones |
| `ENCRYPTION_KEY` | AES-256-GCM de secretos TOTP | ejecutar `npm test` y la carga inicial | perderla impide descifrar TOTP existentes |
| `INTEGRATION_KEY_PEPPER` | HMAC de credenciales de sitios | crear una credencial y consultar la API | rotarla invalida todas las credenciales |
| `CRON_SECRET` | reservado para invocaciones autenticadas de cron HTTP | no se usa si el worker es persistente | reutilizar un secreto externo |
| `WHATSAPP_VERIFY_TOKEN` | desafío de alta del webhook Meta | Meta debe aceptar la URL | confundirlo con el access token |

Cada valor debe tener al menos 32 bytes. Guardar una copia cifrada fuera del servidor. No usar valores fijos del ejemplo.

## Aplicación y base de datos

### `DATABASE_URL`

1. Pertenece a PostgreSQL y conecta Prisma, web, worker y respaldo.
2. Crear una base y un usuario exclusivo, sin privilegios de superusuario.
3. Formato: `postgresql://USUARIO:CLAVE@HOST:5432/BASE?schema=public`.
4. Colocarla en `.env` tanto en pruebas como producción; usar bases distintas.
5. Verificar con `npx prisma migrate status` y `/api/health`.
6. Errores frecuentes: no codificar caracteres especiales de la clave, firewall cerrado o SSL obligatorio sin parámetros.
7. Seguridad: restringir red, exigir TLS fuera de la red privada y rotar la clave ante exposición.

### `APP_URL`, `APP_TIMEZONE`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`

`APP_URL` es la URL HTTPS pública; `APP_TIMEZONE` debe permanecer en `America/Argentina/Buenos_Aires`. Las variables `BOOTSTRAP_*` sólo se usan con `npm run db:seed`. Crear una contraseña temporal larga, ejecutar la carga, eliminarla del entorno y rotar la contraseña según el procedimiento operativo. La carga no reemplaza un dueño existente.

## Mercado Pago Argentina

Variables: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `MERCADOPAGO_BACK_URL` y `MERCADOPAGO_MODE`.

1. Servicio: Mercado Pago Developers, producto Suscripciones.
2. Ingresar en [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app), crear una aplicación propia y habilitar Suscripciones.
3. En Credenciales, copiar el Access Token de prueba para sandbox o el de producción luego de aprobar la aplicación. Colocarlo en `MERCADOPAGO_ACCESS_TOKEN`.
4. En Webhooks, configurar `https://TU_DOMINIO/api/webhooks/mercadopago`, habilitar `payments`, `subscription_preapproval` y `subscription_authorized_payment`, revelar la clave de firma y colocarla en `MERCADOPAGO_WEBHOOK_SECRET`.
5. Establecer `MERCADOPAGO_BACK_URL=https://TU_DOMINIO/suscripciones/resultado` y `MERCADOPAGO_MODE=sandbox` o `production` de acuerdo con las credenciales.
6. Verificar primero con el simulador del panel: debe responder 200 y crear un `WebhookEvent` con firma válida. Después crear una suscripción de prueba y comprobar autorización y pago como eventos distintos.
7. Errores frecuentes: mezclar credenciales de prueba/producción, no habilitar el tópico `payments`, copiar la clave de aplicación en lugar de la clave del webhook o usar HTTP.
8. Seguridad: token sólo en servidor, permisos mínimos, rotación desde el panel y nunca incluirlo en capturas o logs.

La integración no se considera operativa hasta completar esas pruebas con la cuenta del titular.

## WhatsApp Business Cloud API

Variables: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_GRAPH_VERSION` y `WHATSAPP_ADMIN_PHONE`.

1. Servicio: Meta for Developers / WhatsApp Business Platform.
2. Crear una app tipo Business, agregar WhatsApp y vincular una cuenta comercial. En WhatsApp > API Setup obtener Phone Number ID y WABA ID.
3. Para pruebas se admite el token temporal. Para producción crear un usuario del sistema en Business Manager, asignar la app y generar un token con `whatsapp_business_messaging` y, si se administran plantillas por API, `whatsapp_business_management`.
4. Copiar el secreto de la app desde Settings > Basic a `WHATSAPP_APP_SECRET`; se usa para validar `X-Hub-Signature-256`.
5. Configurar callback `https://TU_DOMINIO/api/webhooks/whatsapp`, usar exactamente `WHATSAPP_VERIFY_TOKEN` y suscribir el campo `messages`.
6. `WHATSAPP_GRAPH_VERSION` queda fijada a `v27.0`; revisar la versión antes de su retiro. `WHATSAPP_ADMIN_PHONE` lleva código de país y área sin `+` ni espacios.
7. Verificar enviando la plantilla `hello_world` en pruebas, comprobando el ID de mensaje y luego los estados `sent`, `delivered` o `read` en la base.
8. Errores frecuentes: token temporal vencido, número no agregado a destinatarios de prueba, plantilla no aprobada, idioma distinto o webhook sin el campo `messages`.
9. Seguridad: registrar consentimiento, usar plantillas Utility aprobadas, eliminar teléfonos de logs y rotar el usuario del sistema ante exposición.

## Almacenamiento privado

Variables operativas: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`.

1. Crear un bucket privado sin acceso público en Cloudflare R2, Backblaze B2, AWS S3 u otro servicio S3 compatible.
2. Crear una clave limitada a listar, leer, escribir y borrar únicamente ese bucket.
3. Copiar endpoint, región, nombre y par de claves. `S3_FORCE_PATH_STYLE=true` sólo si el proveedor lo exige.
4. Verificar adjuntando y descargando un PDF pequeño desde Documentos.
5. Errores frecuentes: endpoint con nombre de bucket duplicado, CORS innecesario (la carga pasa por el servidor), política sin `DeleteObject` o reloj del servidor incorrecto.
6. Seguridad: cifrado del proveedor habilitado, bucket privado, claves distintas de las de respaldo y lifecycle sólo si respeta obligaciones legales.

## Respaldo externo

Variables: `BACKUP_S3_ENDPOINT`, `BACKUP_S3_REGION`, `BACKUP_S3_BUCKET`, `BACKUP_S3_ACCESS_KEY_ID`, `BACKUP_S3_SECRET_ACCESS_KEY`, `BACKUP_ENCRYPTION_PASSPHRASE` y `PG_DUMP_PATH`.

Crear el bucket en otra cuenta o, preferentemente, otro proveedor. La clave necesita `PutObject`, `CopyObject` y `DeleteObject` sólo sobre ese bucket. Generar una frase de al menos 24 caracteres aleatorios y guardarla fuera de ambos proveedores; no es recuperable. `PG_DUMP_PATH` identifica el binario compatible con la versión del servidor.

Verificar con `npm run backup`, confirmar un `BackupRun SUCCESS` y realizar una restauración de ensayo. Los errores más comunes son permisos de copia, `pg_dump` más antiguo que el servidor y falta de espacio temporal.

## Cotizaciones

`EXCHANGE_RATE_PROVIDER` identifica la integración y `EXCHANGE_RATE_API_URL` apunta a la fuente de sugerencias. La configuración entregada consulta ArgentinaDatos. No lleva secreto. Verificar que el worker cree registros `ExchangeRate`; el importe usado siempre se congela en cada gasto y puede corregirse manualmente. Si cambia el contrato JSON, la tarea falla sin recalcular históricos.
