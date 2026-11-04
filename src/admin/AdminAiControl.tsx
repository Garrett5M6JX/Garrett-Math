import { useCallback,useEffect,useState } from 'react'
import { supabase } from '../services/supabase'
import { Brain,RefreshCw,ShieldCheck,Settings2,Activity,ExternalLink } from 'lucide-react'
type Stats={enabled:boolean;model:string;maxPerMinute:number;maxPerDay:number;geminiConfigured:boolean;stats?:{requests_24h?:number;requests_7d?:number;active_users_7d?:number}}
export default function AdminAiControl(){
 const [data,setData]=useState<Stats|null>(null)
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const load=useCallback(async()=>{
  if(!supabase)return
  setLoading(true);setError('')
  try{
   const {data:{session},error:sessionError}=await supabase.auth.getSession()
   if(sessionError||!session?.access_token)throw Error('La sesión expiró. Inicia sesión nuevamente.')
   const response=await fetch('/api/garrett-ai-admin',{headers:{Authorization:'Bearer '+session.access_token},cache:'no-store'})
   const result=await response.json()
   if(!response.ok)throw Error(result.error||'No se pudo consultar Garrett AI.')
   setData(result as Stats)
  }catch(e){setError(e instanceof Error?e.message:'Error consultando Garrett AI.')}
  finally{setLoading(false)}
 },[])
 useEffect(()=>{void load()},[load])
 return <section className="admin-panel">
  <div className="admin-toolbar"><div><h2><Brain size={19}/> Centro de control de Garrett AI</h2><p>Estado del servicio, modelo, límites y consumo agregado. Las claves nunca se muestran.</p></div><button className="admin-button secondary" disabled={loading} onClick={()=>void load()}><RefreshCw size={16}/> Actualizar</button></div>
  {error&&<div className="admin-alert error" role="alert">{error}</div>}
  {loading&&!data?<p>Consultando configuración segura…</p>:data&&<>
   <div className="admin-stats"><article><Activity/><span>Servicio</span><strong>{data.enabled&&data.geminiConfigured?'Activo':'Inactivo'}</strong></article><article><Brain/><span>Modelo activo</span><strong>{data.model}</strong></article><article><span>Solicitudes · 24 h</span><strong>{data.stats?.requests_24h??0}</strong></article><article><span>Solicitudes · 7 días</span><strong>{data.stats?.requests_7d??0}</strong></article><article><span>Usuarios activos · 7 días</span><strong>{data.stats?.active_users_7d??0}</strong></article><article><span>Límites por usuario</span><strong>{data.maxPerMinute}/min · {data.maxPerDay}/día</strong></article></div>
   <div className="admin-editor"><h3><Settings2 size={17}/> Configuración del servicio</h3><p>Para cambiar los valores, entra en Vercel → Garrett Math → Settings → Environment Variables. Después realiza un nuevo despliegue.</p><div className="admin-ai-env"><code>GARRETT_AI_ENABLED</code><span>Activar o pausar el servicio</span><code>GEMINI_MODEL</code><span>Modelo de Gemini</span><code>GARRETT_AI_MAX_PER_MINUTE</code><span>Límite por minuto y usuario</span><code>GARRETT_AI_MAX_PER_DAY</code><span>Límite diario por usuario</span><code>GEMINI_API_KEY</code><span>Secreto del servidor; nunca copiar aquí ni compartirlo</span></div></div>
   <div className="admin-note"><ShieldCheck size={17}/> Este panel es de solo lectura. No se permite cambiar secretos ni ejecutar acciones privilegiadas desde el navegador.</div>
   <a className="admin-external-link" href="https://vercel.com" target="_blank" rel="noreferrer">Abrir Vercel para administrar variables <ExternalLink size={14}/></a>
  </>}
 </section>
}
