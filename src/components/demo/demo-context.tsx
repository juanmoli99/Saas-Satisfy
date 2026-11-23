"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { Client, Document, Expense, initialClients, initialDocuments, initialExpenses, initialPayments, initialSellers, initialServices, initialSettlements, Payment, Seller, Service, Settlement } from "./demo-data";

type DemoContextValue = {
  clients: Client[]; services: Service[]; payments: Payment[]; sellers: Seller[]; settlements: Settlement[]; expenses: Expense[]; documents: Document[];
  addClient: (row: Omit<Client, "id" | "services" | "status">) => void;
  addService: (row: Omit<Service, "id" | "status" | "subscription">) => void;
  addPayment: (row: Omit<Payment, "id" | "net" | "status" | "date">) => void;
  addSeller: (row: Omit<Seller, "id" | "clients" | "open" | "status">) => void;
  addExpense: (row: Omit<Expense, "id" | "ars" | "status">) => void;
  addDocument: (row: Omit<Document, "id" | "size" | "date">) => void;
  toggleService: (id: number) => void; createSubscription: (id: number) => void; paySettlement: (id: number) => void;
  toast: string; announce: (message: string) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);
const nextId = <T extends { id: number }>(rows: T[]) => Math.max(0, ...rows.map(row => row.id)) + 1;

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState(initialClients);
  const [services, setServices] = useState(initialServices);
  const [payments, setPayments] = useState(initialPayments);
  const [sellers, setSellers] = useState(initialSellers);
  const [settlements, setSettlements] = useState(initialSettlements);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [documents, setDocuments] = useState(initialDocuments);
  const [toast, setToast] = useState("");
  function announce(message: string) { setToast(`Simulación: ${message}. No se guardaron datos ni se ejecutaron integraciones.`); window.setTimeout(() => setToast(""), 4200); }
  const value = useMemo<DemoContextValue>(() => ({
    clients, services, payments, sellers, settlements, expenses, documents, toast, announce,
    addClient: row => { setClients(current => [{ ...row, id: nextId(current), services: 0, status: "ACTIVE" }, ...current]); announce("cliente agregado"); },
    addService: row => { setServices(current => [{ ...row, id: nextId(current), status: "ACTIVE", subscription: "Sin crear" }, ...current]); announce("servicio agregado"); },
    addPayment: row => { setPayments(current => [{ ...row, id: nextId(current), net: row.gross, status: "APPROVED", date: "23/11/2026" }, ...current]); announce("pago externo acreditado"); },
    addSeller: row => { setSellers(current => [{ ...row, id: nextId(current), clients: 0, open: 0, status: "ACTIVE" }, ...current]); announce("vendedor agregado"); },
    addExpense: row => { setExpenses(current => [{ ...row, id: nextId(current), ars: row.currency === "ARS" ? row.expected : null, status: "PENDING" }, ...current]); announce("gasto agregado"); },
    addDocument: row => { setDocuments(current => [{ ...row, id: nextId(current), size: "0,36 MB", date: "23/11/2026" }, ...current]); announce("carga de documento completada"); },
    toggleService: id => { setServices(current => current.map(row => row.id === id ? { ...row, status: row.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" } : row)); announce("estado comercial actualizado"); },
    createSubscription: id => { setServices(current => current.map(row => row.id === id ? { ...row, subscription: "AUTHORIZED" } : row)); announce("suscripción creada"); },
    paySettlement: id => { setSettlements(current => current.map(row => row.id === id ? { ...row, status: "PAID" } : row)); announce("liquidación marcada como pagada"); },
  }), [clients, services, payments, sellers, settlements, expenses, documents, toast]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo debe utilizarse dentro de DemoProvider");
  return value;
}
