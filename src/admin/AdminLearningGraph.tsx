import { useMemo,useState } from 'react'
import { rawCatalog } from '../library/catalog/data'
import { buildCatalog } from '../library/catalog/build'
import { Network,BookOpen,ArrowRight,GitBranch } from 'lucide-react'
const catalog=buildCatalog(rawCatalog)
export default function AdminLearningGraph(){
 const [stage,setStage]=useState('all')
 const [selected,setSelected]=useState(rawCatalog.topics[0]?.id||'')
 const topics=useMemo(()=>rawCatalog.topics.filter(t=>stage==='all'||catalog.gradeById.get(catalog.unitById.get(t.unitId)?.gradeId||'')?.stageId===stage),[stage])
 const current=rawCatalog.topics.find(t=>t.id===selected)
 const prereqs=current?.prerequisites.map(id=>rawCatalog.topics.find(t=>t.id===id)).filter(Boolean)||[]
 const dependents=rawCatalog.topics.filter(t=>t.prerequisites.includes(selected))
 const lessons=current?rawCatalog.lessons.filter(l=>l.topicId===current.id):[]
 return <section className="admin-panel">
  <div className="admin-toolbar"><div><h2><Network size={19}/> Mapa de aprendizaje</h2><p>Explora las relaciones de prerrequisitos del catálogo. Esta versión es de consulta: todavía no edita conexiones.</p></div><span className="admin-status">{topics.length} temas</span></div>
  <div className="admin-content-tools"><label>Etapa educativa<select value={stage} onChange={e=>{setStage(e.target.value);const first=rawCatalog.topics.find(t=>e.target.value==='all'||catalog.gradeById.get(catalog.unitById.get(t.unitId)?.gradeId||'')?.stageId===e.target.value);if(first)setSelected(first.id)}}><option value="all">Todas las etapas</option>{rawCatalog.stages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Tema seleccionado<select value={selected} onChange={e=>setSelected(e.target.value)}>{topics.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label></div>
  {current?<><div className="admin-graph-focus"><span className="admin-graph-kicker">TEMA SELECCIONADO</span><h3>{current.title}</h3><p>{current.description}</p><div className="admin-graph-meta"><span>Dificultad {current.difficulty}/3</span><span>{lessons.length} lecciones asociadas</span><span>{current.tags.length} etiquetas</span></div></div>
   <div className="admin-graph-columns"><div><h3><GitBranch size={16}/> Prerrequisitos</h3>{prereqs.length?prereqs.map(t=><button key={t!.id} className="admin-graph-node" onClick={()=>setSelected(t!.id)}><span>{t!.title}</span><ArrowRight size={15}/></button>):<p className="admin-muted">Este tema no declara prerrequisitos.</p>}</div><div><h3><Network size={16}/> Temas que dependen de este</h3>{dependents.length?dependents.map(t=><button key={t.id} className="admin-graph-node" onClick={()=>setSelected(t.id)}><span>{t.title}</span><ArrowRight size={15}/></button>):<p className="admin-muted">No hay temas posteriores conectados.</p>}</div></div>
   <div className="admin-graph-lessons"><h3><BookOpen size={16}/> Lecciones del tema</h3>{lessons.length?lessons.map(l=><div key={l.id}><strong>{l.title}</strong><span>{l.reviewStatus==='revisado'?'Revisada':'Pendiente de revisión'}</span></div>):<p className="admin-muted">El tema está en el mapa curricular, pero todavía no tiene lecciones desarrolladas.</p>}</div>
  </>:<p className="admin-empty">No hay temas para esta etapa.</p>}
  <p className="admin-muted">Fuente: catálogo curricular local. Las conexiones se validan contra referencias existentes y ciclos al validar el catálogo.</p>
 </section>
}
