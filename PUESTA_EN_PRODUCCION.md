# Puesta en producción

## Preparación del VPS

1. Crear un usuario sin privilegios, deshabilitar login SSH por contraseña y mantener actualizaciones automáticas de seguridad.
2. Abrir sólo 22 desde IP administrativa y 80/443 al público. PostgreSQL no debe exponerse.
3. Instalar Docker Engine con Compose y un proxy como Caddy. Configurar DNS del subdominio administrativo.
4. Copiar el repositorio sin `.env`, crear `.env` directamente en el servidor con permisos `600` y seguir `CONFIGURACION_CREDENCIALES.md`.

## Despliegue

```bash
docker compose build
docker compose run --rm app npx prisma migrate deploy
docker compose run --rm app npm run db:seed
docker compose up -d app worker postgres
curl -fsS https://admin.tu-dominio.com/api/health
```

Caddy debe dirigir HTTPS a `app:3000`, activar HSTS después de verificar el dominio y limitar el tamaño de solicitud a algo apenas superior a 20 MB.

Ejemplo conceptual:

```caddy
admin.tu-dominio.com {
  encode zstd gzip
  reverse_proxy app:3000
  request_body { max_size 22MB }
}
```

## Respaldo de las 03:00

En el host, con zona horaria Argentina:

```cron
CRON_TZ=America/Argentina/Buenos_Aires
0 3 * * * cd /opt/gestion-saas && docker compose run --rm app npm run backup >> /var/log/gestion-backup.log 2>&1
```

Verificar que el sistema cron soporte `CRON_TZ`; si no, establecer la zona del host o usar un timer systemd con `OnCalendar=*-*-* 03:00:00 America/Argentina/Buenos_Aires`.

## Lista de salida

- Migraciones aplicadas y dueño inicial con TOTP guardado.
- HTTPS válido; cookies `Secure`; puerto PostgreSQL cerrado.
- Webhooks de Mercado Pago y WhatsApp verificados.
- Primera suscripción de prueba conciliada sin dinero real.
- Bucket de documentos privado y descarga autorizada.
- Respaldo cifrado exitoso y restauración ensayada.
- Hora del servidor sincronizada por NTP.
- Alertas por fallas de backup, webhooks e incidencias críticas.
- Retiro de `BOOTSTRAP_ADMIN_PASSWORD` del entorno.

## Actualizaciones

Construir imagen, ejecutar pruebas, generar respaldo, desplegar migraciones aditivas y luego reemplazar web/worker. Para cambios incompatibles usar estrategia expandir/migrar/contraer. No ejecutar dos versiones del worker que interpreten distinto un estado financiero.
