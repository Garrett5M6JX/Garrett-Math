import { useCallback, useEffect, useState } from 'react'
import { History, RefreshCw, RotateCcw } from 'lucide-react'
import { supabase } from '../services/supabase'

type Revision={id:number;version:number;snapshot:any;changed_by:string|null;created_at:string}

export default function AdminLessonHistory({lessonId,onRestored}:{lessonId:string;onRestored:(snapshot:any)=>void}){
 const [items,setItems]=useState<Revision[]>([])
 const [loading,setLoading]=useState(false)
 const [restoring,setRestoring]=useState<number|null>(null)
 const [error,setError]=useState('')
 const [message,setMessage]=useState('')
 const load=useCallback(async()=>{
  if(!supabase)return
  setLoading(true);setError('')
  const {data,error:e}=await supabase.from('gm_lesson_versions').select('id,version,snapshot,changed_by,created_at').eq('lesson_id',lessonId).order('version',{ascending:false}).limit(30)
  if(e)setError('No se pudo cargar el historial. Comprueba que aplicaste la migración V32 y que tu cuenta tiene permiso content.manage.')
  else setItems((data||[]) as Revision[])
  setLoading(false)
 },[lessonId])
 useEffect(()=>{void load()},[load])
 const restore=async(item:Revision)=>{
  if(!supabase||!item.snapshot)return
  if(!confirm('¿Recuperar esta versión? El contenido actual se conservará en el historial y la versión recuperada quedará como BORRADOR.'))return
  setRestoring(item.id);setError('');setMessage('')
  const s=item.snapshot
  const {error:e}=await supabase.from('gm_lessons').update({
   topic_id:s.topic_id,title:s.title,sort_order:s.sort_order,data:s.data||{},status:'borrador',updated_at:new Date().toISOString()
  }).eq('id',lessonId)
  if(e)setError('No se pudo recuperar la versión: '+e.message)
  else{setMessage('Versión recuperada como borrador.');onRestored(s);await load()}
  setRestoring(null)
 }
 return <section className="admin-history">
  <div className="admin-toolbar"><div><h4><History size={16}/> Historial de versiones</h4><p>Se guarda una copia antes de cada modificación. Puedes recuperar cualquiera como borrador.</p></div><button className="admin-button secondary" disabled={loading} onClick={()=>void load()}><RefreshCw size={15}/> Actualizar</button></div>
  {error&&<div className="admin-alert error" role="alert">{error}</div>}
  {message&&<div className="admin-alert success" role="status">{message}</div>}
  {loading?<p className="admin-muted">Cargando historial…</p>:items.length===0?<p className="admin-empty">Todavía no hay versiones anteriores. Se crearán automáticamente al guardar cambios.</p>:
   <div className="admin-history-list">{items.map(item=><article key={item.id} className="admin-history-item"><div><strong>Versión {item.version}</strong><small>{new Date(item.created_at).toLocaleString('es-ES')}</small><small>{item.snapshot?.status==='publicado'?'Publicado':item.snapshot?.status==='revisado'?'Revisado':'Borrador / '+(item.snapshot?.status||'sin estado')}</small></div><button className="admin-button secondary" disabled={restoring!==null} onClick={()=>void restore(item)}><RotateCcw size={14}/>{restoring===item.id?'Recuperando…':'Recuperar'}</button></article>)}</div>}
 </section>
}
