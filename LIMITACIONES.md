# Limitaciones y estado honesto

Fecha de revisión: 23/11/2026.

## Requieren configuración o verificación externa

- El entorno de construcción no tenía Docker ni un servidor PostgreSQL disponible. El esquema y la migración se validaron/generaron con Prisma, pero `migrate deploy` debe ejecutarse contra una base real antes de aceptar datos.
- Mercado Pago está implementado contra endpoints oficiales, pero no se ejecutó con credenciales del titular. Estados, cargos, impuestos, reintentos y cambio de fecha deben validarse en sandbox y producción controlada.
- WhatsApp Cloud API tiene envío, cola y webhook, pero las plantillas deben crearse y aprobarse en la cuenta del titular.
- S3 y el respaldo están implementados, pero deben probarse contra los dos proveedores elegidos.
- La cotización automática es una sugerencia de un agregador configurable, no una fuente contable oficial; cada gasto congela la cotización usada y admite revisión manual.

## Límites del proveedor y del negocio

- Pausar una suscripción no garantiza que un cobro ya iniciado se detenga. La plataforma exige verificación y abre incidencia ante diferencia.
- Alinear después de una regularización tardía la renovación remota con el nuevo período local depende de lo que Mercado Pago admita para esa suscripción. No se simula una alineación inexistente.
- Un webhook puede retrasarse o repetirse. La conciliación reduce el riesgo, no elimina una indisponibilidad total del proveedor.
- WhatsApp puede rechazar plantillas o demorar entregas; nunca bloquea la operación financiera.
- La revocación inmediata no es garantizable en un servidor remoto desconectado o modificado para omitir controles.

## Alcance pendiente antes de declararlo listo para clientes reales

- Completar pantallas de edición detallada para todas las operaciones ya disponibles por API (suspensión, precio, rotación, pago de liquidación y gasto).
- Implementar interfaz y flujo asistido para administradores secundarios y permisos granulares; el modelo y la aplicación de permisos en API existen.
- Agregar el procedimiento automatizado y con doble control para recuperación de OWNER.
- Incorporar ajustes de reembolso/contracargo en la interfaz y terminar los gráficos mensuales del panel financiero.
- Ejecutar pruebas de integración con PostgreSQL real, Mercado Pago sandbox, Meta, ambos buckets y restauración.
- Añadir monitoreo operativo y alertas fuera del propio servidor.

Por lo anterior, esta entrega es una base funcional y compilable de preproducción, no debe describirse todavía como “100 % funcional en producción”.
