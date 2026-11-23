"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client-api";

export function ClientCreateForm({ sellers }: { sellers: {id:string;displayName:string}[] }) {
  const router=useRouter(); const [open,setOpen]=useState(false); const [error,setError]=useState("");
  async function submit(fd:FormData){setError("");try{await apiFetch("/api/clients",{method:"POST",body:JSON.stringify({businessName:fd.get("businessName"),email:fd.get("email"),whatsapp:fd.get("whatsapp"),whatsappConsent:fd.get("consent")==="on",sellerId:fd.get("sellerId")||null})});setOpen(false);router.refresh()}catch(e){setError(e instanceof Error?e.message:"Error")}}
  return <>{<button className="button" onClick={()=>setOpen(!open)}>+ Nuevo cliente</button>}{open&&<div className="card" style={{marginBottom:20,width:"100%"}}><h2>Alta de cliente</h2><form action={submit}><div className="form-grid"><div className="field"><label>Nombre comercial</label><input name="businessName" required minLength={2}/></div><div className="field"><label>Correo</label><input name="email" type="email"/></div><div className="field"><label>WhatsApp</label><input name="whatsapp" placeholder="54911…"/></div><div className="field"><label>Vendedor</label><select name="sellerId"><option value="">Sin asignar</option>{sellers.map(s=><option value={s.id} key={s.id}>{s.displayName}</option>)}</select></div></div><label style={{display:"block",marginTop:14,fontSize:13}}><input type="checkbox" name="consent"/> El cliente otorgó consentimiento para notificaciones</label>{error&&<div className="alert" style={{marginTop:12}}>{error}</div>}<div className="form-actions"><button type="button" className="button secondary" onClick={()=>setOpen(false)}>Cancelar</button><button className="button">Guardar</button></div></form></div>}</>;
}
