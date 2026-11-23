"use client";
import { FormEvent, useState } from "react";
import { auditRows } from "./demo-data";
import { useDemo } from "./demo-context";

const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const statusClass = (value: string) => ["ACTIVE", "APPROVED", "AUTHORIZED", "PAID", "SUCCESS"].includes(value) ? "ok" : ["REJECTED", "SUSPENDED", "INCIDENT", "INACTIVE"].includes(value) ? "bad" : "warn";
const Badge = ({ value }: { value: string }) => <span className={`badge ${statusClass(value)}`}>{value}</span>;
const Head = ({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) => <div className="page-head"><div><h1 className="page-title">{title}</h1><p className="page-subtitle">{subtitle}</p></div>{action}</div>;
const Simulated = () => <span className="simulated-label">SIMULADO</span>;

export type DemoModule = "dashboard" | "clientes" | "servicios" | "pagos" | "vendedores" | "liquidaciones" | "gastos" | "documentos" | "auditoria" | "configuracion";
export function DemoScreen({ module }: { module: DemoModule }) {
  switch (module) {
    case "dashboard": return <Dashboard/>;
    case "clientes": return <Clients/>;
    case "servicios": return <Services/>;
    case "pagos": return <Payments/>;
    case "vendedores": return <Sellers/>;
    case "liquidaciones": return <Settlements/>;
    case "gastos": return <Expenses/>;
    case "documentos": return <Documents/>;
    case "auditoria": return <Audit/>;
    case "configuracion": return <Settings/>;
  }
}

function Dashboard() {
  const { clients, services, payments } = useDemo();
  const approved = payments.filter(row => row.status === "APPROVED");
  const gross = approved.reduce((sum, row) => sum + row.gross, 0);
  const net = approved.reduce((sum, row) => sum + (row.net ?? 0), 0);
  const attention = services.filter(row => !["ACTIVE"].includes(row.status)).length;
  return <div className="content"><Head title="Resumen del negocio" subtitle="Información operativa y financiera del mes actual."/>
    <section className="grid-stats">
      <div className="stat"><div className="stat-label">Ingresos brutos acreditados</div><div className="stat-value">{ars.format(gross)}</div><div className="stat-detail">Neto: {ars.format(net)}</div></div>
      <div className="stat"><div className="stat-label">Clientes activos</div><div className="stat-value">{clients.filter(row => row.status === "ACTIVE").length}</div><div className="stat-detail">Con ficha comercial vigente</div></div>
      <div className="stat"><div className="stat-label">Servicios activos</div><div className="stat-value">{services.filter(row => row.status === "ACTIVE").length}</div><div className="stat-detail">Acceso autorizado</div></div>
      <div className="stat"><div className="stat-label">Requieren atención</div><div className="stat-value">{attention}</div><div className="stat-detail">En tolerancia, suspendidos o con incidencia</div></div>
    </section>
    <section className="split"><div className="card"><h2>Actividad financiera reciente</h2><div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Servicio</th><th>Importe</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{payments.slice(0,5).map(row => <tr key={row.id}><td>{row.client}</td><td>{row.service}</td><td>{ars.format(row.gross)}</td><td><Badge value={row.status}/></td><td>{row.date}</td></tr>)}</tbody></table></div></div>
      <div className="card"><h2>Incidencias abiertas</h2><div style={{padding:"12px 0",borderBottom:"1px solid var(--border)"}}><Badge value="CRITICAL"/><div style={{fontWeight:700,marginTop:8}}>Reportes BI con demoras</div><div className="stat-detail">El procesamiento nocturno superó el tiempo esperado.</div></div><div style={{padding:"12px 0"}}><Badge value="WARNING"/><div style={{fontWeight:700,marginTop:8}}>Pago pendiente de conciliación</div><div className="stat-detail">Mercado del Puerto requiere revisión administrativa.</div></div></div>
    </section>
  </div>;
}

function Clients() {
  const { clients, sellers, addClient } = useDemo(); const [open, setOpen] = useState(false); const [query, setQuery] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); addClient({ name: String(data.get("name")), seller: String(data.get("seller")), contact: String(data.get("contact")) }); event.currentTarget.reset(); setOpen(false); }
  const filtered = clients.filter(row => row.name.toLowerCase().includes(query.toLowerCase()));
  return <div className="content"><Head title="Clientes" subtitle="Fichas comerciales, asignaciones y servicios." action={<button className="button" onClick={() => setOpen(value => !value)}>Nuevo cliente</button>}/>
    {open && <form className="card demo-form" onSubmit={submit}><div className="demo-form-title"><h2>Nuevo cliente</h2><Simulated/></div><div className="form-grid"><div className="field"><label>Nombre comercial</label><input name="name" required/></div><div className="field"><label>Contacto</label><input name="contact" type="email" required/></div><div className="field"><label>Vendedor</label><select name="seller"><option>Sin asignar</option>{sellers.map(row => <option key={row.id}>{row.name}</option>)}</select></div></div><div className="form-actions"><button type="button" className="button secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button">Guardar simulación</button></div></form>}
    <div className="toolbar"><input className="search" placeholder="Buscar cliente…" value={query} onChange={event => setQuery(event.target.value)}/></div>
    <div className="table-wrap"><table><thead><tr><th>Nombre comercial</th><th>Servicios</th><th>Vendedor</th><th>Estado</th><th>Contacto</th></tr></thead><tbody>{filtered.map(row => <tr key={row.id}><td><strong>{row.name}</strong></td><td>{row.services}</td><td>{row.seller}</td><td><Badge value={row.status}/></td><td>{row.contact}</td></tr>)}</tbody></table></div>
  </div>;
}

function Services() {
  const { services, clients, addService, toggleService, createSubscription } = useDemo(); const [open, setOpen] = useState(false); const [query, setQuery] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); addService({ client: String(data.get("client")), name: String(data.get("name")), price: Number(data.get("price")) }); event.currentTarget.reset(); setOpen(false); }
  const filtered = services.filter(row => `${row.client} ${row.name}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="content"><Head title="Servicios" subtitle="Suscripciones independientes y control comercial." action={<button className="button" onClick={() => setOpen(value => !value)}>Nuevo servicio</button>}/>
    {open && <form className="card demo-form" onSubmit={submit}><div className="demo-form-title"><h2>Nuevo servicio</h2><Simulated/></div><div className="form-grid"><div className="field"><label>Cliente</label><select name="client" required>{clients.map(row => <option key={row.id}>{row.name}</option>)}</select></div><div className="field"><label>Servicio</label><input name="name" required/></div><div className="field"><label>Precio mensual ARS</label><input name="price" type="number" min="1" required/></div></div><div className="form-actions"><button type="button" className="button secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button">Guardar simulación</button></div></form>}
    <div className="toolbar"><input className="search" placeholder="Buscar cliente o servicio…" value={query} onChange={event => setQuery(event.target.value)}/></div>
    <div className="table-wrap"><table><thead><tr><th>Cliente / servicio</th><th>Precio mensual</th><th>Estado</th><th>Suscripción</th><th>Acciones simuladas</th></tr></thead><tbody>{filtered.map(row => <tr key={row.id}><td><strong>{row.client}</strong><div className="stat-detail">{row.name}</div></td><td>{ars.format(row.price)}</td><td><Badge value={row.status}/></td><td><Badge value={row.subscription}/></td><td><div className="table-actions">{row.subscription === "Sin crear" && <button className="button secondary compact" onClick={() => createSubscription(row.id)}>Crear suscripción</button>}<button className={`button compact ${row.status === "SUSPENDED" ? "" : "danger"}`} onClick={() => toggleService(row.id)}>{row.status === "SUSPENDED" ? "Reactivar" : "Suspender"}</button></div></td></tr>)}</tbody></table></div>
  </div>;
}

function Payments() {
  const { payments, services, addPayment } = useDemo(); const [open, setOpen] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const service = services.find(row => row.id === Number(data.get("service")))!; addPayment({ client: service.client, service: service.name, provider: "EXTERNAL", gross: Number(data.get("gross")) }); event.currentTarget.reset(); setOpen(false); }
  return <div className="content"><Head title="Pagos" subtitle="Cobros acreditados, pendientes, rechazados y externos." action={<button className="button" onClick={() => setOpen(value => !value)}>Registrar pago externo</button>}/>
    {open && <form className="card demo-form" onSubmit={submit}><div className="demo-form-title"><h2>Pago externo</h2><Simulated/></div><div className="form-grid"><div className="field"><label>Cliente / servicio</label><select name="service">{services.map(row => <option value={row.id} key={row.id}>{row.client} / {row.name}</option>)}</select></div><div className="field"><label>Importe bruto ARS</label><input name="gross" type="number" min="1" required/></div></div><div className="form-actions"><button type="button" className="button secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button">Acreditar simulación</button></div></form>}
    <div className="table-wrap"><table><thead><tr><th>Cliente / servicio</th><th>Proveedor</th><th>Bruto</th><th>Neto</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{payments.map(row => <tr key={row.id}><td><strong>{row.client}</strong><div className="stat-detail">{row.service}</div></td><td>{row.provider}</td><td>{ars.format(row.gross)}</td><td>{row.net ? ars.format(row.net) : "A conciliar"}</td><td><Badge value={row.status}/></td><td>{row.date}</td></tr>)}</tbody></table></div>
  </div>;
}

function Sellers() {
  const { sellers, addSeller } = useDemo(); const [open, setOpen] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); addSeller({ name: String(data.get("name")), email: String(data.get("email")), rate: Number(data.get("rate")) }); event.currentTarget.reset(); setOpen(false); }
  return <div className="content"><Head title="Vendedores" subtitle="Asignaciones, porcentajes y comisiones recurrentes." action={<button className="button" onClick={() => setOpen(value => !value)}>Nuevo vendedor</button>}/>
    {open && <form className="card demo-form" onSubmit={submit}><div className="demo-form-title"><h2>Nuevo vendedor</h2><Simulated/></div><div className="form-grid"><div className="field"><label>Nombre</label><input name="name" required/></div><div className="field"><label>Correo</label><input name="email" type="email" required/></div><div className="field"><label>Comisión (%)</label><input name="rate" type="number" min="0" max="100" required/></div></div><div className="form-actions"><button type="button" className="button secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button">Guardar simulación</button></div></form>}
    <div className="table-wrap"><table><thead><tr><th>Vendedor</th><th>Clientes</th><th>Porcentaje</th><th>Comisiones abiertas</th><th>Estado</th></tr></thead><tbody>{sellers.map(row => <tr key={row.id}><td><strong>{row.name}</strong><div className="stat-detail">{row.email}</div></td><td>{row.clients}</td><td>{row.rate}%</td><td>{ars.format(row.open)}</td><td><Badge value={row.status}/></td></tr>)}</tbody></table></div>
  </div>;
}

function Settlements() {
  const { settlements, paySettlement } = useDemo();
  return <div className="content"><Head title="Liquidaciones" subtitle="Comisiones agrupadas por mes de acreditación en Argentina."/><div className="table-wrap"><table><thead><tr><th>Mes</th><th>Vendedor</th><th>Comisiones</th><th>Total</th><th>Estado</th><th>Acción simulada</th></tr></thead><tbody>{settlements.map(row => <tr key={row.id}><td>{row.month}</td><td>{row.seller}</td><td>{row.commissions}</td><td>{ars.format(row.total)}</td><td><Badge value={row.status}/></td><td>{row.status !== "PAID" ? <button className="button secondary compact" onClick={() => paySettlement(row.id)}>Marcar pagada</button> : "—"}</td></tr>)}</tbody></table></div></div>;
}

function Expenses() {
  const { expenses, addExpense } = useDemo(); const [open, setOpen] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); addExpense({ concept: String(data.get("concept")), category: String(data.get("category")), scope: "General", currency: String(data.get("currency")), expected: Number(data.get("expected")), due: String(data.get("due")) }); event.currentTarget.reset(); setOpen(false); }
  return <div className="content"><Head title="Gastos" subtitle="Obligaciones generales y costos por servicio en ARS o USD." action={<button className="button" onClick={() => setOpen(value => !value)}>Nuevo gasto</button>}/>
    {open && <form className="card demo-form" onSubmit={submit}><div className="demo-form-title"><h2>Nuevo gasto</h2><Simulated/></div><div className="form-grid"><div className="field"><label>Concepto</label><input name="concept" required/></div><div className="field"><label>Categoría</label><select name="category"><option>INFRAESTRUCTURA</option><option>SOFTWARE</option><option>OTROS</option></select></div><div className="field"><label>Moneda</label><select name="currency"><option>ARS</option><option>USD</option></select></div><div className="field"><label>Importe</label><input name="expected" type="number" min="1" required/></div><div className="field"><label>Vencimiento</label><input name="due" placeholder="dd/mm/aaaa" required/></div></div><div className="form-actions"><button type="button" className="button secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button">Guardar simulación</button></div></form>}
    <div className="table-wrap"><table><thead><tr><th>Concepto</th><th>Ámbito</th><th>Previsto</th><th>Equivalente ARS</th><th>Vencimiento</th><th>Estado</th></tr></thead><tbody>{expenses.map(row => <tr key={row.id}><td><strong>{row.concept}</strong><div className="stat-detail">{row.category}</div></td><td>{row.scope}</td><td>{row.currency} {row.expected.toLocaleString("es-AR")}</td><td>{row.ars ? ars.format(row.ars) : "Pendiente de cotización"}</td><td>{row.due}</td><td><Badge value={row.status}/></td></tr>)}</tbody></table></div>
  </div>;
}

function Documents() {
  const { documents, clients, addDocument } = useDemo(); const [open, setOpen] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const file = data.get("file"); addDocument({ file: file instanceof File && file.name ? file.name : "archivo-demo.pdf", client: String(data.get("client")), category: String(data.get("category")) }); event.currentTarget.reset(); setOpen(false); }
  return <div className="content"><Head title="Documentación" subtitle="Archivos privados con validación de contenido." action={<button className="button" onClick={() => setOpen(value => !value)}>Subir documento</button>}/>
    {open && <form className="card demo-form" onSubmit={submit}><div className="demo-form-title"><h2>Subir documento</h2><Simulated/></div><div className="alert demo-notice">El archivo no se transmite ni almacena; sólo se usa el nombre para representar el resultado.</div><div className="form-grid"><div className="field"><label>Cliente</label><select name="client">{clients.map(row => <option key={row.id}>{row.name}</option>)}</select></div><div className="field"><label>Categoría</label><select name="category"><option>CONTRATO</option><option>ALTA</option><option>COMPROBANTE</option></select></div><div className="field"><label>Archivo</label><input name="file" type="file" accept=".pdf,.png,.jpg" required/></div></div><div className="form-actions"><button type="button" className="button secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button">Simular carga</button></div></form>}
    <div className="table-wrap"><table><thead><tr><th>Archivo</th><th>Cliente</th><th>Categoría</th><th>Tamaño</th><th>Fecha</th></tr></thead><tbody>{documents.map(row => <tr key={row.id}><td><strong>{row.file}</strong></td><td>{row.client}</td><td>{row.category}</td><td>{row.size}</td><td>{row.date}</td></tr>)}</tbody></table></div>
  </div>;
}

function Audit() {
  return <div className="content"><Head title="Auditoría" subtitle="Registro inmutable desde la interfaz; los secretos se redactan."/><div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Origen / usuario</th><th>Módulo</th><th>Acción</th><th>Registro</th><th>Resultado</th></tr></thead><tbody>{auditRows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cellIndex === 5 ? <Badge value={cell}/> : cell}</td>)}</tr>)}</tbody></table></div></div>;
}

function Settings() {
  const { announce } = useDemo(); const [grace, setGrace] = useState(5); const [reference, setReference] = useState("oficial");
  function submit(event: FormEvent) { event.preventDefault(); announce("configuración actualizada"); }
  return <div className="content"><Head title="Configuración" subtitle="Reglas generales e integraciones externas."/><section className="split"><form className="card" onSubmit={submit}><div className="demo-form-title"><h2>Reglas comerciales</h2><Simulated/></div><div className="field"><label>Días generales de tolerancia</label><input type="number" min="0" max="30" value={grace} onChange={event => setGrace(Number(event.target.value))}/></div><div className="field" style={{marginTop:16}}><label>Referencia del tipo de cambio</label><select value={reference} onChange={event => setReference(event.target.value)}><option value="oficial">Oficial</option><option value="mep">MEP</option><option value="manual">Manual</option></select></div><div className="form-actions"><button className="button">Guardar simulación</button></div></form>
    <div className="card"><h2>Integraciones</h2><p>Mercado Pago <span className="badge warn">DESHABILITADO EN DEMO</span></p><p>WhatsApp Cloud API <span className="badge warn">DESHABILITADO EN DEMO</span></p><p>Almacenamiento S3 <span className="badge warn">DESHABILITADO EN DEMO</span></p><p className="stat-detail">Esta versión no contiene credenciales ni realiza conexiones externas.</p></div></section>
    <div className="card" style={{marginTop:18}}><h2>Últimos respaldos</h2><div className="empty">No aplica: la demostración no contiene una base de datos ni almacenamiento persistente.</div></div>
  </div>;
}
