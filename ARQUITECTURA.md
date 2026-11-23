# Arquitectura

## Decisión

Se eligió un monolito modular con procesos separados. La aplicación HTTP y el worker comparten código y PostgreSQL, pero se ejecutan como servicios independientes. Para la escala inicial evita microservicios, colas pagas y consistencia distribuida innecesaria.

```text
Navegador administrativo
        │ HTTPS
        ▼
Next.js (UI + API) ───────────────► S3 privado de documentos
        │                                  │
        ▼                                  │ destino distinto
PostgreSQL ◄──────── Worker ───────────────► S3 de respaldo
   ▲                    │
   │                    ├── Mercado Pago API / webhooks
   │                    ├── WhatsApp Cloud API / webhooks
   │                    └── fuente de cotización sugerida
   │
Sistemas de clientes ── HTTPS `/api/v1/service-access`
```

## Límites modulares

- `src/app`: interfaz y endpoints HTTP.
- `src/domain`: reglas financieras y comerciales puras.
- `src/lib`: autenticación, cifrado, proveedores, almacenamiento y auditoría.
- `src/worker`: conciliación y tareas periódicas.
- `prisma`: modelo y migraciones.
- `scripts`: inicialización, secretos y respaldo.

Las restricciones críticas existen además en la base: claves únicas por pago de proveedor e idempotencia, una comisión por pago, un período por pago y una liquidación por vendedor/mes.

## Procesamiento externo

Los webhooks se autentican, se persisten con clave única, reciben respuesta y se procesan de forma idempotente. El webhook no se considera fuente financiera suficiente: el backend vuelve a obtener el recurso mediante la API oficial. El worker reconcilia además las facturas de suscripción.

WhatsApp es una cola secundaria: una falla registra y reintenta el mensaje, sin revertir pagos ni bloquear operaciones principales.

## Infraestructura comparada (consulta 23/11/2026)

### Alternativa elegida: VPS administrado por el propietario

- Hetzner CX23: USD 6,49/mes sin IPv4, 2 vCPU, 4 GB RAM y 40 GB NVMe; los precios no incluyen IVA. Fuente: [ajuste oficial de precios de Hetzner](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/).
- Un bucket S3 económico para documentos y otro proveedor/cuenta para la única copia vigente.
- Costo estimado total: USD 8–15/mes según objetos, IPv4, impuestos y tráfico.

Ventajas: entra holgadamente en presupuesto y admite web, worker y PostgreSQL. Costos: hay que mantener el sistema operativo, firewall, parches, monitoreo y restauraciones.

### Alternativa administrada: Railway

Railway Hobby tiene un mínimo de USD 5 que se acredita al uso, con cobro adicional por recursos. Fuente: [precios oficiales de Railway](https://railway.com/pricing). Ejecutar web, worker y PostgreSQL suele ubicarse aproximadamente entre USD 15 y 30 con carga baja, pero es variable.

Ventajas: menor operación y despliegues simples. Costos: menor previsibilidad, límites del plan y riesgo de superar USD 30.

Render se evaluó, pero separar web, worker y PostgreSQL pago tiende a superar o tensionar el presupuesto; su almacenamiento PostgreSQL se factura aparte. Fuente: [precios oficiales de Render](https://render.com/pricing).

## Escalabilidad

El primer salto recomendado es mover PostgreSQL a un servicio administrado, mantener una sola instancia de worker gracias a los bloqueos en base y escalar horizontalmente sólo la aplicación HTTP. Las credenciales de servicio y el control de acceso no dependen de afinidad de sesión.
