import { useCallback,useEffect,useState } from 'react'
import { supabase } from '../services/supabase'
import { Settings2,RefreshCw,Save,ShieldCheck } from 'lucide-react'
type Setting={setting_key:string;setting_value:unknown;description:string|null;updated_at:string|null}
const defaults:Setting[]=[
 {setting_key:'platform.name',setting_value:'Garrett Math',description:'Nombre visible de la plataforma',updated_at:null},
 {setting_key:'platform.announcement',setting_value:'',description:'Aviso general opcional para los usuarios',updated_at:null},
 {setting_key:'learning.default_stage',setting_value:'Primaria',description:'Etapa inicial sugerida para nuevos recorridos',updated_at:null},
 {setting_key:'security.session_idle_minutes',setting_value:20,description:'Minutos de inactividad para la interfaz administrativa',updated_at:null}
]
export default function AdminPlatformSettings(){
 const [rows,setRows]=useState<Setting[]>(defaults),[loading,setLoading]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('')
 const load=useCallback(async()=>{if(!supabase)return;setLoading(true);setError('');const {data,error:e}=await supabase.from('gm_platform_settings').select('setting_key,setting_value,description,updated_at').order('setting_key');if(e){setError(e.message.includes('gm_platform_settings')?'Falta aplicar supabase/admin_v28_v29_v30.sql en Supabase.':e.message)}else{const stored=(data||[]) as Setting[];setRows(defaults.map(d=>stored.find(s=>s.setting_key===d.setting_key)||d))}setLoading(false)},[])
 useEffect(()=>{void load()},[load])
 const change=(key:string,value:unknown)=>setRows(old=>old.map(r=>r.setting_key===key?{...r,setting_value:value}:r))
 const save=async()=>{if(!supabase)return;setSaving(true);setError('');setMessage('');const {data:{user}}=await supabase.auth.getUser();if(!user){setError('La sesión expiró.');setSaving(false);return}const payload=rows.map(r=>({setting_key:r.setting_key,setting_value:r.setting_value,description:r.description,updated_by:user.id,updated_at:new Date().toISOString()}));const {error:e}=await supabase.from('gm_platform_settings').upsert(payload,{onConflict:'setting_key'});if(e)setError(e.message);else setMessage('Configuración guardada correctamente.');setSaving(false)}
 return <section className="admin-panel"><div className="admin-toolbar"><div><h2><Settings2 size={19}/> Configuración global</h2><p>Preferencias generales de la plataforma. Los secretos y credenciales se administran exclusivamente en Vercel.</p></div><button className="admin-button secondary" disabled={loading} onClick={()=>void load()}><RefreshCw size={15}/> Actualizar</button></div>
 {error&&<div className="admin-alert error" role="alert">{error}</div>}{message&&<div className="admin-alert success" role="status">{message}</div>}
 <div className="admin-global-settings">
 <label>Nombre de la plataforma<input value={String(rows.find(r=>r.setting_key==='platform.name')?.setting_value??'')} onChange={e=>change('platform.name',e.target.value)} maxLength={80}/><small>Nombre institucional que se utilizará en componentes compatibles.</small></label>
 <label>Aviso general<textarea rows={3} value={String(rows.find(r=>r.setting_key==='platform.announcement')?.setting_value??'')} onChange={e=>change('platform.announcement',e.target.value)} maxLength={300} placeholder="Deja vacío si no hay avisos."/></label>
 <label>Etapa inicial sugerida<select value={String(rows.find(r=>r.setting_key==='learning.default_stage')?.setting_value??'Primaria')} onChange={e=>change('learning.default_stage',e.target.value)}><option>Preescolar</option><option>Primaria</option><option>Secundaria</option><option>Universidad</option></select></label>
 <label>Tiempo de inactividad administrativa<select value={String(rows.find(r=>r.setting_key==='security.session_idle_minutes')?.setting_value??20)} onChange={e=>change('security.session_idle_minutes',Number(e.target.value))}><option value="5">5 minutos</option><option value="10">10 minutos</option><option value="20">20 minutos</option><option value="30">30 minutos</option><option value="60">60 minutos</option></select></label>
 </div>
 <div className="admin-note"><ShieldCheck size={17}/> Los cambios se guardan en Supabase y se aplican solo en las pantallas que consuman estas preferencias. No cambian contraseñas, roles, claves API ni políticas de seguridad.</div>
 <button className="admin-button" disabled={saving||loading} onClick={()=>void save()}><Save size={16}/>{saving?'Guardando…':'Guardar configuración'}</button>
 </section>
}
