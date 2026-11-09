import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../services/supabase'
import {
  createAssignment, gradeAssignmentSubmission, listAssignmentSubmissions,
  listClassroomAssignments, type AssignmentSubmission, type ClassroomAssignment,
} from './api'
import { BookOpenCheck, CalendarClock, CheckCircle2, ClipboardList, LoaderCircle, Plus, RefreshCw, Users } from 'lucide-react'
import './assignments.css'

type Classroom = { id: string; name: string; stage: string; education_year: string }

export default function TeacherAssignments() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [classroomId, setClassroomId] = useState('')
  const [assignments, setAssignments] = useState<ClassroomAssignment[]>([])
  const [selected, setSelected] = useState<ClassroomAssignment | null>(null)
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([])
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [score, setScore] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    if (!supabase) { setError('Conecta Supabase para gestionar tareas reales.'); setLoading(false); return }
    setLoading(true); setError('')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) { setError('Inicia sesión con tu cuenta docente.'); setLoading(false); return }
    if (user.app_metadata?.assigned_role !== 'teacher') { setError('Esta cuenta no tiene el rol docente autorizado.'); setLoading(false); return }
    const { data, error: classroomError } = await supabase.from('gm_classrooms')
      .select('id,name,stage,education_year').eq('teacher_id', user.id).order('created_at', { ascending: false })
    if (classroomError) { setError('No se pudieron cargar tus aulas. Comprueba las migraciones V23–V24 y V39. ' + classroomError.message); setLoading(false); return }
    const list = (data ?? []) as Classroom[]
    setClassrooms(list)
    const activeId = list.some((item) => item.id === classroomId) ? classroomId : list[0]?.id ?? ''
    setClassroomId(activeId)
    if (activeId) {
      const items = await listClassroomAssignments(activeId)
      setAssignments(items)
    } else setAssignments([])
    setLoading(false)
  }, [classroomId])

  useEffect(() => { void load() }, [load])

  const refreshSubmissions = async (assignment: ClassroomAssignment) => {
    setSelected(assignment)
    setError('')
    try { setSubmissions(await listAssignmentSubmissions(assignment.id)) }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar las entregas.') }
  }

  const changeClassroom = async (id: string) => {
    setClassroomId(id); setSelected(null); setSubmissions([])
    setLoading(true); setError('')
    try { setAssignments(id ? await listClassroomAssignments(id) : []) }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar las tareas.') }
    finally { setLoading(false) }
  }

  const create = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase || !classroomId || !title.trim()) return
    const classroom = classrooms.find((item) => item.id === classroomId)
    if (!classroom) return
    setSaving(true); setError(''); setNotice('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('La sesión expiró. Vuelve a iniciar sesión.')
      await createAssignment({
        classroom_id: classroom.id, teacher_id: user.id, title: title.trim(),
        instructions: instructions.trim(), stage: classroom.stage,
        education_year: classroom.education_year, lesson_ids: [],
        due_at: dueAt ? new Date(dueAt).toISOString() : null, status: 'draft',
      })
      setTitle(''); setInstructions(''); setDueAt('')
      setNotice('Borrador creado. Publícalo cuando esté listo para tus estudiantes.')
      setAssignments(await listClassroomAssignments(classroomId))
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo crear la tarea.') }
    finally { setSaving(false) }
  }

  const publish = async (assignment: ClassroomAssignment) => {
    if (!supabase) return
    setSaving(true); setError(''); setNotice('')
    const { error: updateError } = await supabase.from('gm_assignments')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .eq('id', assignment.id)
    if (updateError) setError(updateError.message)
    else { setNotice('Tarea publicada para los estudiantes del aula.'); await changeClassroom(classroomId) }
    setSaving(false)
  }

  const grade = async (submission: AssignmentSubmission) => {
    const value = Number(score[submission.id])
    if (!Number.isFinite(value) || value < 0 || value > 100) { setError('La nota debe estar entre 0 y 100.'); return }
    setSaving(true); setError(''); setNotice('')
    try {
      await gradeAssignmentSubmission(submission.id, value, feedback[submission.id] || undefined)
      if (selected) await refreshSubmissions(selected)
      setNotice('Entrega calificada correctamente.')
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la calificación.') }
    finally { setSaving(false) }
  }

  return <section className="assignment-center" aria-labelledby="assignment-center-title">
    <div className="assignment-center-heading">
      <div><span className="section-kicker">TRABAJO CON TUS AULAS</span><h2 id="assignment-center-title"><ClipboardList size={23}/> Centro de tareas</h2><p>Crea actividades, publícalas y revisa las entregas de tus estudiantes.</p></div>
      <button className="secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16}/> Actualizar</button>
    </div>
    {error && <p className="assignment-message error" role="alert">{error}</p>}
    {notice && <p className="assignment-message success" role="status">{notice}</p>}
    {loading ? <div className="assignment-empty"><LoaderCircle className="assignment-spin"/> Cargando tus aulas…</div> : !classrooms.length ? <div className="assignment-empty"><Users size={28}/><strong>Aún no tienes aulas asignadas</strong><span>Solicita al administrador que te asigne el rol docente y cree tu primera aula.</span></div> : <>
      <label className="assignment-classroom-select">Aula activa<select value={classroomId} onChange={(e) => void changeClassroom(e.target.value)}>{classrooms.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.stage} · {c.education_year}</option>)}</select></label>
      <div className="assignment-layout">
        <div className="assignment-create-card">
          <h3><Plus size={18}/> Nueva tarea</h3>
          <form onSubmit={create}>
            <label>Título<input value={title} onChange={(e) => setTitle(e.target.value)} minLength={3} maxLength={140} required placeholder="Ej. Práctica de fracciones"/></label>
            <label>Instrucciones<textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={10000} rows={4} placeholder="Explica qué deben hacer los estudiantes…"/></label>
            <label>Fecha límite (opcional)<input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)}/></label>
            <p className="assignment-context"><BookOpenCheck size={15}/> {classrooms.find((c) => c.id === classroomId)?.stage} · {classrooms.find((c) => c.id === classroomId)?.education_year}</p>
            <button className="primary-button" type="submit" disabled={saving || !title.trim()}>{saving ? <LoaderCircle className="assignment-spin"/> : <Plus size={16}/>} Guardar borrador</button>
          </form>
        </div>
        <div className="assignment-list-card">
          <h3><CalendarClock size={18}/> Tareas del aula <span>{assignments.length}</span></h3>
          {!assignments.length ? <p className="assignment-empty compact">Todavía no has creado tareas para esta aula.</p> : <div className="assignment-list">{assignments.map((item) => <article className={selected?.id === item.id ? 'selected' : ''} key={item.id}>
            <button className="assignment-item-main" onClick={() => void refreshSubmissions(item)}><strong>{item.title}</strong><span>{item.status === 'draft' ? 'Borrador' : item.status === 'published' ? 'Publicada' : 'Cerrada'} · {item.due_at ? new Date(item.due_at).toLocaleString() : 'Sin fecha límite'}</span></button>
            <div className="assignment-item-actions">{item.status === 'draft' && <button className="secondary-button" disabled={saving} onClick={() => void publish(item)}>Publicar</button>}<button className="secondary-button" onClick={() => void refreshSubmissions(item)}>Entregas</button></div>
          </article>)}</div>}
        </div>
      </div>
      {selected && <div className="assignment-submissions">
        <div className="assignment-submissions-heading"><div><span className="section-kicker">REVISIÓN DOCENTE</span><h3>Entregas: {selected.title}</h3></div><span>{submissions.length} entregas</span></div>
        {!submissions.length ? <p className="assignment-empty compact">Aún no hay entregas para esta tarea.</p> : <div className="assignment-submission-list">{submissions.map((submission) => <article key={submission.id}>
          <div><strong>Estudiante · {submission.student_id.slice(0, 8)}</strong><small>Enviada: {new Date(submission.submitted_at).toLocaleString()}</small><pre>{JSON.stringify(submission.response, null, 2)}</pre>{submission.score !== null && <p className="assignment-grade-result"><CheckCircle2 size={16}/> Nota: {submission.score}/100 {submission.feedback ? '· ' + submission.feedback : ''}</p>}</div>
          {submission.score === null && <form onSubmit={(e) => { e.preventDefault(); void grade(submission) }}><label>Nota (0–100)<input type="number" min="0" max="100" step="0.5" required value={score[submission.id] ?? ''} onChange={(e) => setScore((old) => ({ ...old, [submission.id]: e.target.value }))}/></label><label>Retroalimentación<textarea rows={2} maxLength={5000} value={feedback[submission.id] ?? ''} onChange={(e) => setFeedback((old) => ({ ...old, [submission.id]: e.target.value }))}/></label><button className="primary-button" disabled={saving}>Guardar nota</button></form>}
        </article>)}</div>}
      </div>}
    </>}
  </section>
}
