# Respaldos

`npm run backup` crea a las 03:00 de Argentina una copia de PostgreSQL en formato custom y todos los objetos del bucket documental.

## Algoritmo

1. Crea directorio temporal.
2. Ejecuta `pg_dump -Fc` sin exponer la contraseña en argumentos.
3. Descarga documentos y genera manifiesto.
4. Empaqueta con `tar.gz`.
5. Cifra AES-256-GCM con clave derivada por scrypt y salt/IV aleatorios.
6. Descifra localmente y ejecuta `tar -tzf` para comprobar integridad.
7. Sube un objeto temporal al bucket externo.
8. Reemplaza `backup/current.enc` únicamente después de verificar y subir.
9. Borra el temporal; queda una sola copia vigente.
10. Registra checksum SHA-256, tamaño y resultado. Ante falla conserva la copia anterior y encola WhatsApp.

## Restauración

1. Detener web y worker; mantener una página de mantenimiento neutra.
2. Descargar `backup/current.enc` y verificar que el SHA-256 coincida con `BackupRun`.
3. Usar la misma lógica de descifrado del script o una utilidad interna aislada con `BACKUP_ENCRYPTION_PASSPHRASE`.
4. Extraer y restaurar en una base vacía:

```bash
createdb gestion_saas_restore
pg_restore --clean --if-exists --no-owner --dbname gestion_saas_restore database.dump
```

5. Restaurar objetos al bucket operativo respetando sus claves.
6. Ejecutar pruebas de conteo e integridad, apuntar la aplicación a la base restaurada y mantener el worker detenido.
7. Conciliar manualmente todas las suscripciones y pagos recientes con Mercado Pago.
8. Resolver diferencias y recién entonces reactivar worker y cobros automáticos.

Ensayar trimestralmente en un entorno aislado. Una copia única satisface la regla solicitada, pero ofrece menor protección frente a corrupción tardíamente descubierta; esta limitación está aceptada y documentada.
