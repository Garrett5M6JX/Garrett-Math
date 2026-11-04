import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { RefreshCw, ShieldCheck, UserPlus, UserRoundX } from 'lucide-react'

type Member = { user_id: string; email: string; role_id: string; assigned_at: string }
const roles = [
 { id: 'content_editor', name: 'Editor de contenido', detail: 'Gestiona contenido y lecciones' },
 { id: 'teacher_coordinator', name: 'Coordinador docente', detail: 'Permisos docentes (módulo futuro)' },
 { id: 'analytics_viewer', name: 'Analista', detail: 'Consulta informes (módulo futuro)' },
]

export default function AdminPermissions() {
 const [members,setMembers]=useState<Member[]>([])
 const [email,setEmail]=useState('')
 const [role,setRole]=useState(roles[0].id)
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const [message,setMessage]=useState('')
 const load=useCallback(async()=>{
  if(!supabase)return
  setLoading(true);setError('')
  const {data,error:e}=await supabase.rpc('gm_admin_list_members')
  if(e)setError(e.message)
  else setMembers((data||[]) as Member[])
  setLoading(false)
 },[])
 useEffect(()=>{void load()},[load])
 const assign=async()=>{
  if(!supabase||!email.trim())return
  setLoading(true);setError('');setMessage('')
  const {error:e}=await supabase.rpc('gm_admin_set_member_role',{p_email:email.trim(),p_role_id:role})
  if(e)setError(e.message)
  else{setMessage('Rol asignado correctamente.');setEmail('');await load()}
  setLoading(false)
 }
 const revoke=async(member:Member)=>{
  if(!supabase||!confirm('¿Retirar el acceso administrativo delegado a '+member.email+'?'))return
  setLoading(true);setError('')
  const {error:e}=await supabase.rpc('gm_admin_set_member_role',{p_email:member.email,p_role_id:null})
  if(e)setError(e.message)
  else{setMessage('Acceso delegado retirado.');await load()}
  setLoading(false)
 }
 return <section className="admin-panel">
  <div className="admin-toolbar"><div><h2>Administradores delegados</h2><p>Solo el superadministrador puede asignar o retirar estos roles. Las operaciones se validan en Supabase.</p></div><button className="admin-button secondary" disabled={loading} onClick={()=>void load()}><RefreshCw size={16}/> Actualizar</button></div>
  {error&&<div className="admin-alert error" role="alert">{error}</div>}
  {message&&<div className="admin-alert success" role="status">{message}</div>}
  <div className="admin-editor">
   <h3><UserPlus size={17}/> Asignar acceso</h3>
   <div className="admin-form-grid">
    <label>Correo de una cuenta existente<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="docente@ejemplo.com"/></label>
    <label>Rol<select value={role} onChange={e=>setRole(e.target.value)}>{roles.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
   </div>
   <p className="admin-muted">{roles.find(x=>x.id===role)?.detail}. Los permisos docentes y analíticos se activarán al desarrollar sus módulos.</p>
   <button className="admin-button" disabled={loading||!email.trim()} onClick={()=>void assign()}><ShieldCheck size={16}/> Asignar rol</button>
  </div>
  <h3>Accesos actuales</h3>
  {loading?<p>Cargando…</p>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Correo</th><th>Rol</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>{members.map(m=><tr key={m.user_id}><td>{m.email}</td><td>{roles.find(x=>x.id===m.role_id)?.name||m.role_id}</td><td>{new Date(m.assigned_at).toLocaleDateString('es-ES')}</td><td><button className="admin-button secondary" onClick={()=>void revoke(m)}><UserRoundX size={14}/> Retirar</button></td></tr>)}</tbody></table>{!members.length&&<p className="admin-empty">Todavía no hay administradores delegados.</p>}</div>}
 </section>
}
