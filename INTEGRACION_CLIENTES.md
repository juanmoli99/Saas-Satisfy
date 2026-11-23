# Integración con sistemas de clientes

Cada servicio tiene su propia credencial. El secreto se muestra una vez, se almacena localmente en el servidor del cliente y nunca se envía al navegador.

## Contrato

```http
GET /api/v1/service-access HTTP/1.1
Host: admin.tu-dominio.com
Authorization: Bearer svc_IDENTIFICADOR.SECRETO
Accept: application/json
```

Respuesta habilitada:

```json
{
  "allowed": true,
  "serviceId": "...",
  "status": "active",
  "revision": 12,
  "checkedAt": "2026-11-23T16:00:00.000Z",
  "recheckAfterSeconds": 60
}
```

Credencial inválida devuelve 401. Servicio bloqueado devuelve 403 sin explicar públicamente el motivo comercial. Todas las respuestas llevan `Cache-Control: no-store`.

## Patrón obligatorio

1. El sitio valida su usuario local.
2. Antes de crear la sesión consulta la API central.
3. Guarda como máximo 60 segundos el resultado positivo y la `revision`.
4. En cada solicitud, middleware global protege tanto rutas privadas como endpoints y páginas públicas sujetas al servicio.
5. Las sesiones locales duran como máximo 24 horas, pero no sustituyen la revalidación comercial.
6. Ante timeout o error central, aplicar política **fail closed** para operaciones protegidas. Puede mostrarse un mensaje neutro de indisponibilidad.

Ejemplo Node/Express:

```js
export async function serviceGate(req, res, next) {
  try {
    const response = await fetch(`${process.env.GESTION_URL}/api/v1/service-access`, {
      headers: { Authorization: `Bearer ${process.env.GESTION_SERVICE_KEY}` },
      signal: AbortSignal.timeout(3000),
      cache: "no-store"
    });
    if (!response.ok) return res.sendStatus(403);
    next();
  } catch {
    res.sendStatus(503);
  }
}

app.use(serviceGate); // antes de rutas públicas y privadas sujetas al servicio
```

Ejemplo PHP:

```php
$ch = curl_init(getenv('GESTION_URL').'/api/v1/service-access');
curl_setopt_array($ch, [
  CURLOPT_HTTPHEADER => ['Authorization: Bearer '.getenv('GESTION_SERVICE_KEY')],
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 3,
]);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($code !== 200) { http_response_code($code === 403 ? 403 : 503); exit; }
```

## Rotación

Rotación inmediata revoca las claves anteriores. Rotación con transición admite 1–168 horas; ambas funcionan durante la ventana y el worker revoca automáticamente la anterior. Probar la nueva antes de retirar la vieja.

## Límite técnico

Un servidor remoto desconectado no puede recibir una revocación inmediata. Esta implementación reduce la ventana mediante consultas frecuentes, no entrega tokens autónomos y falla cerrada ante indisponibilidad. La garantía máxima es el intervalo de caché local más el tiempo de red. Una copia maliciosa del sitio que omita el middleware no puede ser controlada desde la plataforma; el despliegue del cliente debe auditarse.
