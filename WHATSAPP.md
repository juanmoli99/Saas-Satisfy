# WhatsApp Business Cloud API

Se usa exclusivamente la API oficial. El envío es `POST https://graph.facebook.com/{VERSION}/{PHONE_NUMBER_ID}/messages`, como muestra la [documentación de Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview).

## Webhook

Configurar `/api/webhooks/whatsapp`. El GET comprueba `hub.verify_token`; el POST valida `X-Hub-Signature-256` con el App Secret antes de analizar el cuerpo. Los estados actualizan `SENT`, `DELIVERED`, `READ` o `FAILED`.

## Cola

Cada mensaje tiene clave de deduplicación. El worker toma lotes, envía plantillas y aplica reintento exponencial hasta seis intentos. Un error no afecta pagos, períodos ni suspensiones. Los clientes sólo se encolan si `whatsappOptInAt` está registrado.

## Plantillas a crear

Crear en WhatsApp Manager, categoría Utility, idioma `es_AR`, y esperar estado Approved. Nombres esperados:

| Nombre | Variables sugeridas |
|---|---|
| `proximo_cobro` | cliente, servicio, fecha, importe |
| `pago_acreditado` | cliente, servicio, importe, vigencia |
| `pago_rechazado` | cliente, servicio, fin de tolerancia |
| `ultimo_aviso_suspension` | cliente, servicio |
| `servicio_suspendido` | cliente, servicio |
| `servicio_rehabilitado` | cliente, servicio, vigencia |
| `cambio_precio` | cliente, servicio, importe, fecha |
| `servicio_cancelado` | cliente, servicio |
| `gasto_vencido` | concepto, importe |
| `falla_respaldo` | detalle corto |

Meta permite listar y crear plantillas desde el WABA con permisos de administración; consultar la [referencia oficial de plantillas](https://developers.facebook.com/docs/graph-api/reference/whats-app-business-account/message_templates/).

## Operación

- Guardar prueba del consentimiento y permitir retiro.
- Los recordatorios previos y avisos de tolerancia usan claves únicas por servicio/período.
- No insertar teléfonos ni cuerpos completos en logs.
- Revisar plantillas rechazadas y calidad del número.
- Mantener la versión Graph y actualizar antes de su fecha de retiro.

La entrega final depende de Meta, del estado de la plantilla y del teléfono; `SENT` no equivale a `DELIVERED`.
