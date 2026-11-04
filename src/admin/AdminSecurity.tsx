import { useCallback,useEffect,useMemo,useState } from 'react'
import { supabase } from '../services/supabase'
import { Activity,RefreshCw,Search,ShieldCheck,Clock3,AlertTriangle } from 'lucide-react'
type AuditRow={id:number;actor_id:string|null;action:string;entity_type:string;entity_id:string|null;summary:string|null;created_at:string}
export default function AdminSecurity(){
 const [rows,setRows]=useState<AuditRow[]>([])
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const [query,setQuery]=useState('')
 const [action,setAction]=useState('all')
 const [assurance,setAssurance]=useState<string>('consultando')
 const load=useCallback(async()=>{
  if(!supabase)return
  setLoading(true);setError('')
  const [audit,aal]=await Promise.all([
   supabase.from('audit_log').select('id,actor_id,action,entity_type,entity_id,summary,created_at').order('created_at',{ascending:false}).limit(200),
   supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  ])
  if(audit.error)setError(audit.error.message);else setRows((audit.data||[]) as AuditRow[])
  if(aal.error)setAssurance('No disponible');else setAssurance(aal.data.currentLevel||'sin MFA')
  setLoading(false)
 },[])
 useEffect(()=>{void load()},[load])
 const actions=useMemo(()=>Array.from(new Set(rows.map(x=>x.action))).sort(),[rows])
 const filtered=useMemo(()=>rows.filter(r=>(action==='all'||r.action===action)&&[r.action,r.entity_type,r.entity_id,r.summary,r.actor_id].join(' ').toLowerCase().includes(query.toLowerCase())),[rows,action,query])
 return <section className="admin-panel">
  <div className="admin-toolbar"><div><h2><ShieldCheck size={19}/> Seguridad y auditoría</h2><p>Consulta eventos registrados y revisa el nivel de autenticación de tu sesión. Esta vista no modifica permisos.</p></div><button className="admin-button secondary" disabled={loading} onClick={()=>void load()}><RefreshCw size={16}/> Actualizar</button></div>
  <div className="admin-stats"><article><Activity/><span>Eventos consultados</span><strong>{rows.length}</strong></article><article><ShieldCheck/><span>Nivel de sesión (AAL)</span><strong>{assurance.toUpperCase()}</strong></article><article><Clock3/><span>Último evento</span><strong>{rows[0]?new Date(rows[0].created_at).toLocaleDateString('es-ES'):'—'}</strong></article></div>
  <div className="admin-note"><AlertTriangle size={17}/> La auditoría solo muestra eventos que las operaciones hayan escrito en `audit_log`; no representa un registro universal de cada acción.</div>
  {error&&<div className="admin-alert error" role="alert">{error}</div>}
  <div className="admin-content-tools"><label><Search size={15}/> Buscar<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Acción, usuario, entidad…"/></label><label>Tipo de evento<select value={action} onChange={e=>setAction(e.target.value)}><option value="all">Todos</option>{actions.map(x=><option key={x}>{x}</option>)}</select></label></div>
  <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Fecha</th><th>Acción</th><th>Entidad</th><th>Actor</th><th>Detalle</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td>{new Date(r.created_at).toLocaleString('es-ES')}</td><td><code>{r.action}</code></td><td>{r.entity_type} {r.entity_id||''}</td><td><code>{r.actor_id||'Sistema'}</code></td><td>{r.summary||'—'}</td></tr>)}</tbody></table>{!filtered.length&&<p className="admin-empty">{loading?'Cargando eventos…':'No hay eventos que coincidan con el filtro.'}</p>}</div>
 </section>
}
