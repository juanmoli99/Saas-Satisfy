# Base de datos

PostgreSQL es la fuente de verdad. El esquema está en `prisma/schema.prisma` y la migración inicial en `prisma/migrations/0001_init/migration.sql`.

## Relaciones principales

```text
User(SELLER) 1 ── N Client 1 ── N Service 1 ── N Subscription
                     │              ├── N ServicePeriod ── 0..1 Payment
                     │              ├── N IntegrationCredential
                     │              ├── N Expense
                     │              └── N Document
                     └── N Payment 1 ── 0..1 Commission N ── 1 User(SELLER)

Settlement 1 ── N SettlementItem N ── 1 Commission
ExpenseRecurrence 1 ── N Expense
```

## Integridad financiera

- `Payment.providerPaymentId` evita importar dos veces un pago del proveedor.
- `Payment.idempotencyKey` evita duplicar una operación local.
- `Commission.paymentId` es único: un pago no genera dos comisiones.
- `ServicePeriod.paymentId` es único: un pago completo habilita un período.
- `Settlement(sellerId, month)` es único.
- Los importes usan `Decimal`, nunca punto flotante de la base.
- Clientes, pagos, períodos, comisiones y liquidaciones usan eliminación restringida.

## Historial

La asignación de vendedores tiene tabla histórica. Los porcentajes y precios futuros también tienen entidades propias; al aplicarse no reescriben comisiones ni períodos pasados. La auditoría guarda antes/después redactado y no tiene endpoints de modificación.

## Migraciones

Desarrollo:

```bash
npx prisma migrate dev --name descripcion
```

Producción:

```bash
npx prisma migrate deploy
```

No usar `db push` en producción. Antes de una migración destructiva, ejecutar y verificar el respaldo.
