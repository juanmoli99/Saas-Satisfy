# Seguridad

## Controles implementados

- Contraseñas Argon2id con 64 MiB, tres iteraciones y paralelismo uno.
- TOTP obligatorio; secreto cifrado con AES-256-GCM.
- Sesión opaca en cookie HttpOnly, SameSite Strict y Secure en producción.
- Una sesión por usuario, revocación en base y 60 minutos máximos de inactividad.
- Límite por cuenta e IP en el login y desafío TOTP de cinco minutos.
- Autorización granular en API; vendedores reciben consultas reducidas sin contacto, documentos ni datos técnicos.
- CSRF por token de sesión y comprobación Same Origin.
- Zod en entradas, Prisma parametrizado y restricciones PostgreSQL contra duplicados.
- Cabeceras CSP, frame denial, nosniff y política de permisos.
- Webhooks firmados, idempotencia y nueva lectura desde el proveedor.
- Documentos privados, autorización en descarga, máximo 20 MB y magic bytes.
- Secretos redactados en auditoría; nunca se guardan claves de integración en claro.
- Credenciales de servicio por servicio, rotables y sin tokens autónomos de larga duración.

## Operación obligatoria

HTTPS, firewall, NTP, actualizaciones del sistema y base no expuesta son requisitos del despliegue. Usar un gestor de secretos o archivo `600`, rotar claves ante incidentes y revisar `npm audit` en cada actualización. No guardar datos de tarjeta.

## Cuenta principal y recuperación

La cuenta OWNER no tiene endpoints de eliminación o degradación. La URI TOTP inicial se muestra una vez. Guardar contraseña y semilla TOTP en dos custodias cifradas separadas. La recuperación de emergencia es operativa: acceso al servidor/base por dos responsables, respaldo previo, generación de un nuevo secreto mediante un script auditado y revocación de sesiones. No exponer una recuperación pública.

Administradores y vendedores no pueden iniciar recuperación autónoma. Un OWNER debe ejecutar el procedimiento, entregar nuevas credenciales una sola vez y forzar cambio operacional.

## Amenazas residuales

- Un administrador del servidor puede leer memoria o reemplazar código; separar cuentas y registrar despliegues.
- S3 compatible puede variar en garantías; verificar cifrado, región y políticas.
- La CSP admite estilos inline por la construcción actual. Retirarlos con nonces sería un endurecimiento futuro.
- La revocación de un sitio remoto depende de que ese sitio consulte la API y esté conectado.

## Respuesta a incidentes

1. Aislar web/worker sin borrar evidencia.
2. Revocar tokens externos y sesiones.
3. Preservar logs, auditoría y respaldo válido.
4. Determinar servicios y datos afectados.
5. Rotar claves empezando por proveedor y base; `ENCRYPTION_KEY` requiere una migración controlada, no reemplazo directo.
6. Conciliar Mercado Pago antes de reactivar automatizaciones.
