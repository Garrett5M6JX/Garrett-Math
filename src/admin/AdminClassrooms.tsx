import { useCallback,useEffect,useState } from 'react'
import { supabase } from '../services/supabase'
import { RefreshCw,School,Plus } from 'lucide-react'

type Teacher={user_id:string;email:string;display_name:string;classroom_count:number}
type Classroom={id:string;teacher_id:string;name:string;stage:string;education_year:string;join_code:string;created_at:string}
const stages=['Preescolar','Primaria','Secundaria','Universidad']
export default function AdminClassrooms(){
 const [teachers,setTeachers]=useState<Teacher[]>([])
 const [classrooms,setClassrooms]=useState<Classroom[]>([])
 const [teacherId,setTeacherId]=useState('')
 const [name,setName]=useState('')
 const [stage,setStage]=useState('Primaria')
 const [year,setYear]=useState('1.º grado')
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const [message,setMessage]=useState('')
 const load=useCallback(async()=>{
  if(!supabase)return
  setLoading(true);setError('')
  const [t,c]=await Promise.all([
   supabase.rpc('gm_admin_list_teachers'),
   supabase.from('gm_classrooms').select('id,teacher_id,name,stage,education_year,join_code,created_at').order('created_at',{ascending:false}).limit(200)
  ])
  if(t.error)setError(t.error.message);else{const list=(t.data||[]) as Teacher[];setTeachers(list);if(!teacherId&&list[0])setTeacherId(list[0].user_id)}
  if(c.error)setError(current=>current?current+' · '+c.error!.message:c.error!.message);else setClassrooms((c.data||[]) as Classroom[])
  setLoading(false)
 },[teacherId])
 useEffect(()=>{void load()},[load])
 const create=async()=>{
  if(!supabase||!teacherId||!name.trim()||!year.trim())return
  setLoading(true);setError('');setMessage('')
  const {data,error:e}=await supabase.rpc('gm_admin_create_classroom',{p_teacher_id:teacherId,p_name:name.trim(),p_stage:stage,p_education_year:year.trim()})
  if(e)setError(e.message)
  else{setMessage('Aula creada. Código de acceso: '+String(data));setName('');await load()}
  setLoading(false)
 }
 return <section className="admin-panel">
  <div className="admin-toolbar"><div><h2><School size={19}/> Docentes y aulas</h2><p>Consulta cuentas con rol docente y crea aulas vinculadas a un docente.</p></div><button className="admin-button secondary" disabled={loading} onClick={()=>void load()}><RefreshCw size={16}/> Actualizar</button></div>
  {error&&<div className="admin-alert error" role="alert">{error}</div>}{message&&<div className="admin-alert success" role="status">{message}</div>}
  <div className="admin-stats"><article><span>Docentes autorizados</span><strong>{teachers.length}</strong></article><article><span>Aulas creadas</span><strong>{classrooms.length}</strong></article></div>
  <div className="admin-editor"><h3><Plus size={17}/> Crear aula</h3>
   {!teachers.length?<p className="admin-muted">No hay cuentas con rol docente asignado. La asignación del rol debe realizarse desde un proceso administrativo seguro de Supabase; no se concede desde el navegador.</p>:<>
    <div className="admin-form-grid">
     <label>Docente<select value={teacherId} onChange={e=>setTeacherId(e.target.value)}>{teachers.map(t=><option key={t.user_id} value={t.user_id}>{t.display_name} · {t.email}</option>)}</select></label>
     <label>Nombre del aula<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ej. Matemáticas 1.º A"/></label>
     <label>Etapa<select value={stage} onChange={e=>setStage(e.target.value)}>{stages.map(x=><option key={x}>{x}</option>)}</select></label>
     <label>Grado / año<input value={year} onChange={e=>setYear(e.target.value)} placeholder="Ej. 1.º grado"/></label>
    </div>
    <button className="admin-button" disabled={loading||!name.trim()||!teacherId} onClick={()=>void create()}><Plus size={16}/> Crear aula y generar código</button>
   </>}
  </div>
  <h3>Cuentas docentes</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Docente</th><th>Correo</th><th>Aulas</th></tr></thead><tbody>{teachers.map(t=><tr key={t.user_id}><td>{t.display_name}</td><td>{t.email}</td><td>{t.classroom_count}</td></tr>)}</tbody></table>{!teachers.length&&<p className="admin-empty">No hay docentes registrados.</p>}</div>
  <h3>Aulas</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Aula</th><th>Docente</th><th>Etapa</th><th>Grado</th><th>Código</th></tr></thead><tbody>{classrooms.map(c=><tr key={c.id}><td>{c.name}</td><td>{teachers.find(t=>t.user_id===c.teacher_id)?.email||c.teacher_id.slice(0,8)}</td><td>{c.stage}</td><td>{c.education_year}</td><td><code>{c.join_code}</code></td></tr>)}</tbody></table>{!classrooms.length&&<p className="admin-empty">Todavía no hay aulas.</p>}</div>
 </section>
}
