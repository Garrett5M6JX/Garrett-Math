import { useCallback,useEffect,useState } from 'react'
import { supabase } from '../services/supabase'
import { BarChart3,RefreshCw,Users,BookOpen,GraduationCap,School,CheckCircle2 } from 'lucide-react'
type Stats={users:number;families:number;progress_records:number;completed_lessons:number;teachers:number;classrooms:number;published_lessons:number;draft_lessons:number}
const number=(value:number)=>new Intl.NumberFormat('es-ES').format(value||0)
export default function AdminAnalytics(){
 const [stats,setStats]=useState<Stats|null>(null)
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const load=useCallback(async()=>{
  if(!supabase)return
  setLoading(true);setError('')
  const {data,error:e}=await supabase.rpc('gm_admin_get_platform_stats')
  if(e)setError(e.message);else setStats(data as Stats)
  setLoading(false)
 },[])
 useEffect(()=>{void load()},[load])
 const cards=[
  {label:'Usuarios registrados',value:stats?.users,icon:Users},
  {label:'Perfiles familiares',value:stats?.families,icon:Users},
  {label:'Docentes',value:stats?.teachers,icon:GraduationCap},
  {label:'Aulas',value:stats?.classrooms,icon:School},
  {label:'Registros de progreso',value:stats?.progress_records,icon:BarChart3},
  {label:'Lecciones completadas',value:stats?.completed_lessons,icon:CheckCircle2},
  {label:'Lecciones publicadas',value:stats?.published_lessons,icon:BookOpen},
  {label:'Lecciones en revisión/borrador',value:stats?.draft_lessons,icon:BookOpen},
 ]
 return <section className="admin-panel">
  <div className="admin-toolbar"><div><h2><BarChart3 size={19}/> Estadísticas de Garrett Math</h2><p>Indicadores agregados de uso y contenido. No se muestran correos, nombres ni datos individuales de estudiantes.</p></div><button className="admin-button secondary" disabled={loading} onClick={()=>void load()}><RefreshCw size={16}/> Actualizar</button></div>
  {error&&<div className="admin-alert error" role="alert">{error}</div>}
  {loading&&!stats?<p>Consultando estadísticas…</p>:<div className="admin-stats admin-analytics-grid">{cards.map(card=><article key={card.label}><card.icon/><span>{card.label}</span><strong>{stats?number(card.value||0):'—'}</strong></article>)}</div>}
  <p className="admin-muted">Las cifras se calculan directamente en Supabase al actualizar. No se recopilan datos nuevos ni se crean perfiles de seguimiento adicionales.</p>
 </section>
}
