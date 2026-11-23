export type Client = { id: number; name: string; services: number; seller: string; status: string; contact: string };
export type Service = { id: number; client: string; name: string; price: number; status: string; subscription: string };
export type Payment = { id: number; client: string; service: string; provider: string; gross: number; net: number | null; status: string; date: string };
export type Seller = { id: number; name: string; email: string; clients: number; rate: number; open: number; status: string };
export type Settlement = { id: number; month: string; seller: string; commissions: number; total: number; status: string };
export type Expense = { id: number; concept: string; category: string; scope: string; currency: string; expected: number; ars: number | null; due: string; status: string };
export type Document = { id: number; file: string; client: string; category: string; size: string; date: string };

export const initialClients: Client[] = [
  { id: 1, name: "Estudio Norte", services: 2, seller: "Sofía Benítez", status: "ACTIVE", contact: "administracion@estudionorte.com" },
  { id: 2, name: "Mercado del Puerto", services: 1, seller: "Martín Acosta", status: "ACTIVE", contact: "+54 9 11 5555-1180" },
  { id: 3, name: "Clínica Horizonte", services: 2, seller: "Sofía Benítez", status: "ACTIVE", contact: "pagos@horizonte.test" },
  { id: 4, name: "Logística Delta", services: 1, seller: "Martín Acosta", status: "INACTIVE", contact: "cuentas@delta.test" },
  { id: 5, name: "Punto Creativo", services: 1, seller: "Sin asignar", status: "ACTIVE", contact: "+54 9 341 555-8200" },
];

export const initialServices: Service[] = [
  { id: 1, client: "Estudio Norte", name: "Gestión documental", price: 72000, status: "ACTIVE", subscription: "AUTHORIZED" },
  { id: 2, client: "Estudio Norte", name: "Portal de clientes", price: 48000, status: "ACTIVE", subscription: "AUTHORIZED" },
  { id: 3, client: "Mercado del Puerto", name: "Control de stock", price: 95000, status: "GRACE", subscription: "PAST_DUE" },
  { id: 4, client: "Clínica Horizonte", name: "Agenda profesional", price: 128000, status: "ACTIVE", subscription: "AUTHORIZED" },
  { id: 5, client: "Clínica Horizonte", name: "Reportes BI", price: 84000, status: "INCIDENT", subscription: "AUTHORIZED" },
  { id: 6, client: "Logística Delta", name: "Seguimiento de flota", price: 156000, status: "SUSPENDED", subscription: "PAUSED" },
  { id: 7, client: "Punto Creativo", name: "CRM comercial", price: 61000, status: "ACTIVE", subscription: "Sin crear" },
];

export const initialPayments: Payment[] = [
  { id: 1, client: "Clínica Horizonte", service: "Agenda profesional", provider: "MERCADOPAGO", gross: 128000, net: 122752, status: "APPROVED", date: "21/11/2026" },
  { id: 2, client: "Estudio Norte", service: "Gestión documental", provider: "MERCADOPAGO", gross: 72000, net: 69048, status: "APPROVED", date: "19/11/2026" },
  { id: 3, client: "Mercado del Puerto", service: "Control de stock", provider: "MERCADOPAGO", gross: 95000, net: null, status: "PENDING", date: "17/11/2026" },
  { id: 4, client: "Punto Creativo", service: "CRM comercial", provider: "EXTERNAL", gross: 61000, net: 61000, status: "APPROVED", date: "12/11/2026" },
  { id: 5, client: "Logística Delta", service: "Seguimiento de flota", provider: "MERCADOPAGO", gross: 156000, net: null, status: "REJECTED", date: "08/11/2026" },
];

export const initialSellers: Seller[] = [
  { id: 1, name: "Sofía Benítez", email: "sofia@demo.local", clients: 2, rate: 12, open: 31200, status: "ACTIVE" },
  { id: 2, name: "Martín Acosta", email: "martin@demo.local", clients: 2, rate: 10, open: 25100, status: "ACTIVE" },
  { id: 3, name: "Lucía Ramos", email: "lucia@demo.local", clients: 0, rate: 8, open: 0, status: "INACTIVE" },
];

export const initialSettlements: Settlement[] = [
  { id: 1, month: "01/11/2026", seller: "Sofía Benítez", commissions: 4, total: 31200, status: "GENERATED" },
  { id: 2, month: "01/11/2026", seller: "Martín Acosta", commissions: 3, total: 25100, status: "GENERATED" },
  { id: 3, month: "01/10/2026", seller: "Sofía Benítez", commissions: 5, total: 39720, status: "PAID" },
  { id: 4, month: "01/10/2026", seller: "Martín Acosta", commissions: 4, total: 28800, status: "PAID" },
];

export const initialExpenses: Expense[] = [
  { id: 1, concept: "Servidor de aplicaciones", category: "INFRAESTRUCTURA", scope: "General", currency: "USD", expected: 85, ars: 123250, due: "28/11/2026", status: "PENDING" },
  { id: 2, concept: "Licencias de soporte", category: "SOFTWARE", scope: "Clínica Horizonte / Agenda profesional", currency: "ARS", expected: 42000, ars: 42000, due: "25/11/2026", status: "PENDING" },
  { id: 3, concept: "Dominio anual", category: "INFRAESTRUCTURA", scope: "Estudio Norte / Portal de clientes", currency: "USD", expected: 18, ars: 26100, due: "12/11/2026", status: "PAID" },
];

export const initialDocuments: Document[] = [
  { id: 1, file: "contrato-estudio-norte.pdf", client: "Estudio Norte", category: "CONTRATO", size: "0,84 MB", date: "15/11/2026" },
  { id: 2, file: "alta-agenda-profesional.pdf", client: "Clínica Horizonte / Agenda profesional", category: "ALTA", size: "0,42 MB", date: "05/11/2026" },
  { id: 3, file: "comprobante-dominio.pdf", client: "Estudio Norte / Portal de clientes", category: "COMPROBANTE", size: "0,18 MB", date: "02/11/2026" },
];

export const auditRows = [
  ["23/11/2026", "Administrador Demo", "SERVICES", "COMMERCIAL_ACTION", "Service · 9f31a842", "SUCCESS"],
  ["21/11/2026", "SYSTEM", "PAYMENTS", "WEBHOOK_APPROVED", "Payment · c12d77e0", "SUCCESS"],
  ["19/11/2026", "Administrador Demo", "CLIENTS", "UPDATE", "Client · 87b210fe", "SUCCESS"],
  ["17/11/2026", "WORKER", "NOTIFICATIONS", "REMINDER_QUEUED", "Notification · e901fa11", "SUCCESS"],
  ["15/11/2026", "Administrador Demo", "DOCUMENTS", "UPLOAD", "Document · 63abde09", "SUCCESS"],
  ["08/11/2026", "MERCADOPAGO", "PAYMENTS", "WEBHOOK_REJECTED", "Payment · 40c8a7d2", "SUCCESS"],
];
