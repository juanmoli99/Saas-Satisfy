# Pruebas

## Ejecutadas sin credenciales

```bash
npm run typecheck
npm test
npx prisma validate
npm run build
npm run lint
```

Las pruebas cubren comisión sobre neto con redondeo, ausencia de neto, rechazo de pagos parciales, encadenamiento de períodos, regularización tardía, autorización remota, suspensión tras tolerancia y cifrado autenticado de secretos.

La migración se genera desde el esquema y se valida sintácticamente. Para probarla contra PostgreSQL real:

```bash
docker compose up -d postgres
npx prisma migrate deploy
npm run db:seed
```

## Matriz externa obligatoria

### Mercado Pago sandbox

- Crear suscripción pendiente y abrir enlace.
- Comprobar que autorización sin pago no active servicio.
- Aprobar primer pago y verificar un solo Payment, Period y Commission.
- Repetir webhook y confirmar que no duplica.
- Rechazo, tolerancia, último aviso y suspensión.
- Pausa manual, reversión y cancelación al fin de período.
- Cambio de importe y error de sincronización.
- Reembolso/contracargo y ajuste manual auditado.

### WhatsApp

- Verificación GET y firma POST inválida/válida.
- Plantilla aprobada, error temporal y reintento.
- Estados sent/delivered/read/failed.
- Opt-out: no debe encolar nuevos mensajes.

### Respaldo

- Backup con documentos, checksum y una sola clave current.
- Cortar red durante la subida: debe quedar el current anterior.
- Restaurar en base y bucket nuevos, conciliar antes del worker.

### Seguridad

- Reutilización de sesión tras login desde otro equipo.
- Inactividad de 60 minutos.
- Fuerza bruta, CSRF, IDOR en documentos y vendedor accediendo contactos.
- Credencial de servicio revocada y transición de 1/168 horas.

Los resultados externos deben agregarse con fecha, cuenta de prueba y evidencia, sin copiar tokens.
