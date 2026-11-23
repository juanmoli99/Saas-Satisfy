import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { ars, date, statusClass } from "@/lib/format";

export default async function Dashboard() {
  const user = (await currentUser())!;
  const sellerWhere = user.role === "SELLER" ? { client: { sellerId: user.id } } : {};
  const clientWhere = user.role === "SELLER" ? { sellerId: user.id } : {};
  const [clients, activeServices, suspended, payments, recent, incidents] = await Promise.all([
    db.client.count({where:{...clientWhere,status:"ACTIVE"}}), db.service.count({where:{...sellerWhere,status:"ACTIVE"}}),
    db.service.count({where:{...sellerWhere,status:{in:["SUSPENDED","GRACE","INCIDENT"]}}}),
    db.payment.aggregate({where:{...sellerWhere,status:"APPROVED",effectiveAt:{gte:new Date(new Date().getFullYear(),new Date().getMonth(),1)}},_sum:{grossAmount:true,netAmount:true}}),
    db.payment.findMany({where:{...sellerWhere},orderBy:{createdAt:"desc"},take:7,include:{client:true,service:true}}),
    user.role === "SELLER" ? Promise.resolve([]) : db.incident.findMany({where:{status:"OPEN"},orderBy:{createdAt:"desc"},take:5})
  ]);
  return <div className="content"><div className="page-head"><div><h1 className="page-title">Resumen del negocio</h1><p className="page-subtitle">Información operativa y financiera del mes actual.</p></div></div>
    <section className="grid-stats">
      <div className="stat"><div className="stat-label">Ingresos brutos acreditados</div><div className="stat-value">{ars.format(Number(payments._sum.grossAmount ?? 0))}</div><div className="stat-detail">Neto: {ars.format(Number(payments._sum.netAmount ?? 0))}</div></div>
      <div className="stat"><div className="stat-label">Clientes activos</div><div className="stat-value">{clients}</div><div className="stat-detail">Con ficha comercial vigente</div></div>
      <div className="stat"><div className="stat-label">Servicios activos</div><div className="stat-value">{activeServices}</div><div className="stat-detail">Acceso autorizado</div></div>
      <div className="stat"><div className="stat-label">Requieren atención</div><div className="stat-value">{suspended}</div><div className="stat-detail">En tolerancia, suspendidos o con incidencia</div></div>
    </section>
    <section className="split"><div className="card"><h2>Actividad financiera reciente</h2>{recent.length ? <div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Servicio</th><th>Importe</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{recent.map(p=><tr key={p.id}><td>{p.client.businessName}</td><td>{p.service.name}</td><td>{ars.format(Number(p.grossAmount))}</td><td><span className={`badge ${statusClass(p.status)}`}>{p.status}</span></td><td>{date.format(p.createdAt)}</td></tr>)}</tbody></table></div>:<div className="empty">Todavía no hay movimientos.</div>}</div>
      <div className="card"><h2>Incidencias abiertas</h2>{incidents.length ? incidents.map(i=><div key={i.id} style={{padding:"12px 0",borderBottom:"1px solid var(--border)"}}><span className={`badge ${i.severity === "CRITICAL" ? "bad":"warn"}`}>{i.severity}</span><div style={{fontWeight:700,marginTop:8}}>{i.title}</div><div className="stat-detail">{i.detail}</div></div>):<div className="empty">Sin incidencias abiertas.</div>}</div>
    </section>
  </div>;
}
