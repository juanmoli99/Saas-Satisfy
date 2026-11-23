# Gestión SaaS

Plataforma administrativa privada para gestionar clientes, servicios web, suscripciones mensuales, cobros, vendedores, comisiones, gastos, documentación y autorización remota de sistemas.

## Estado verificable

La base entregada es ejecutable y contiene frontend responsive, API, modelo PostgreSQL, migración, worker, webhooks firmados, pruebas y despliegue con contenedores. Las integraciones externas quedan en modo pendiente hasta cargar credenciales y probarlas con cuentas reales o de prueba; consultar [LIMITACIONES.md](LIMITACIONES.md).

## Tecnologías

- Next.js 16, React 19 y TypeScript estricto.
- PostgreSQL y Prisma 6.
- Argon2id, TOTP, sesiones opacas revocables y AES-256-GCM.
- S3 privado para documentos y un destino S3 independiente para respaldos.
- Worker idempotente para conciliación, tolerancia, suspensiones, notificaciones, gastos, precios y liquidaciones.
- Vitest para reglas financieras y de autorización.

## Inicio local

Requisitos: Node.js 22 o superior, PostgreSQL 15 o superior y, para respaldos, `pg_dump` y `tar`.

```bash
cp .env.example .env
npm install
npm run credentials:generate
# Copiar los valores generados a .env
npm run db:generate
npm run db:dev
npm run db:seed
npm run dev
```

En otra terminal:

```bash
npm run worker
```

La carga inicial muestra una sola vez la URI TOTP de la cuenta principal. Guardarla en un gestor seguro. La aplicación queda en `http://localhost:3000`.

## Comandos

| Comando | Función |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run build` | cliente Prisma y compilación productiva |
| `npm run worker` | tareas y conciliación |
| `npm test` | pruebas automatizadas |
| `npm run typecheck` | tipos estrictos |
| `npm run lint` | análisis estático |
| `npm run backup` | respaldo cifrado y reemplazo seguro |
| `npm run db:migrate` | migraciones de producción |

## Documentación

- [Arquitectura](ARQUITECTURA.md)
- [Base de datos](BASE_DE_DATOS.md)
- [Credenciales](CONFIGURACION_CREDENCIALES.md)
- [Producción](PUESTA_EN_PRODUCCION.md)
- [Integración con sistemas de clientes](INTEGRACION_CLIENTES.md)
- [Mercado Pago](MERCADO_PAGO.md)
- [WhatsApp](WHATSAPP.md)
- [Seguridad](SEGURIDAD.md)
- [Respaldos](RESPALDOS.md)
- [Pruebas](PRUEBAS.md)
- [Limitaciones verificadas](LIMITACIONES.md)
