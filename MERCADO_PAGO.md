# Mercado Pago

## Modelo implementado

Cada servicio crea una suscripción sin plan asociado mediante `POST /preapproval`, con frecuencia mensual, ARS, referencia externa única y enlace de autorización. La autorización actualiza `Subscription`, pero **no** activa el servicio. Sólo un pago `approved`, recuperado desde `/v1/payments/{id}`, crea el período.

La documentación oficial distingue preapproval de authorized payment y describe el flujo del primer pago: [Suscripciones](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/overview). Pausa, cancelación, reactivación, monto y fecha de facturación dependen de `PUT /preapproval/{id}`: [gestión oficial](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/subscription-management).

## Webhooks

URL: `/api/webhooks/mercadopago`. Tópicos: `payments`, `subscription_preapproval`, `subscription_authorized_payment`.

1. Valida `x-signature` HMAC con `x-request-id`, `data.id` y timestamp.
2. Persiste una clave única del evento.
3. Devuelve 200.
4. Recupera el recurso por API oficial.
5. Inserta o actualiza de forma idempotente.

Mercado Pago solicita 200/201 y recomienda obtener después el recurso notificado: [webhooks oficiales](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/additional-content/your-integrations/notifications/webhooks).

## Conciliación

El worker consulta cada preapproval vigente y `GET /authorized_payments/search?preapproval_id=...`, endpoint oficial para buscar facturas por suscripción. Los pagos desconocidos se vuelven a obtener desde Payments. Una diferencia de importe, una relación local ausente o un error genera incidencia y no inventa un período.

El neto usa `transaction_details.net_received_amount` cuando el proveedor lo entrega. Si no existe, la comisión queda pendiente de cálculo. Los cargos se guardan por separado y no se restan dos veces.

## Suspensiones y calendario

- Suspensión manual: pausa primero el preapproval, vuelve a verificar `paused` y programa el bloqueo al final del período abonado.
- Cancelación: confirma `cancelled` y conserva acceso hasta el vencimiento.
- Reversión previa: exige que Mercado Pago confirme `authorized`.
- Reactivación efectiva: cancela la anterior y requiere crear otra suscripción y acreditar su primer pago.
- Regularización tardía: el período local nace en la acreditación. Si el calendario remoto no puede alinearse sin riesgo, debe abrirse una incidencia; no se fabrican cobros.

## Precios

Los cambios se registran con fecha efectiva. El worker intenta modificar `auto_recurring.transaction_amount`, verifica la respuesta y sólo entonces actualiza el precio local. Ante falla conserva el precio anterior y crea incidencia.

## Pruebas pendientes del titular

Sin credenciales no se validaron respuestas reales, cargos, impuestos, calendario ni reintentos. Antes de producción ejecutar autorización, primer pago, rechazo, pausa, reversión, cancelación, cambio de monto, reembolso y contracargo con credenciales de prueba; luego una operación mínima controlada en producción.
