import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { BookOpenCheck, CalendarClock, CheckCircle2, Clock3, LoaderCircle, School, Send, Users } from 'lucide-react'
import { deliverStudentAssignment, joinClassroom, listMyAssignmentSubmissions, listStudentAssignments, listStudentClassrooms, type StudentClassroom } from './studentApi'
import type { AssignmentSubmission, ClassroomAssignment } from './api'
import './student-assignments.css'

export default function StudentAssignments() {
  const [classrooms, setClassrooms] = useState<StudentClassroom[]>([])
  const [activeClassroom, setActiveClassroom] = useState('')
  const [assignments, setAssignments] = useState<ClassroomAssignment[]>([])
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([])
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [rooms, mine] = await Promise.all([listStudentClassrooms(), listMyAssignmentSubmissions()])
      setClassrooms(rooms); setSubmissions(mine)
      const selected = rooms.some((room) => room.id === activeClassroom) ? activeClassroom : rooms[0]?.id ?? ''
      setActiveClassroom(selected)
      setAssignments(selected ? await listStudentAssignments(selected) : [])
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar tu espacio de aula.') }
    finally { setLoading(false) }
  }, [activeClassroom])

  useEffect(() => { void load() }, [load])

  const selectRoom = async (id: string) => {
    setActiveClassroom(id); setError('')
    try { setAssignments(id ? await listStudentAssignments(id) : []) }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar las tareas.') }
  }

  const join = async (event: FormEvent) => {
    event.preventDefault()
    if (!joinCode.trim()) return
    setSaving(true); setError(''); setNotice('')
    try {
      const room = await joinClassroom(joinCode)
      setJoinCode('')
      setNotice('¡Te uniste al aula ' + room.name + '!')
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo encontrar el aula.') }
    finally { setSaving(false) }
  }

  const deliver = async (assignment: ClassroomAssignment) => {
    let parsed: Record<string, unknown>
    try {
      const raw = responses[assignment.id]?.trim() ?? ''
      if (!raw) throw new Error('Escribe tu respuesta antes de entregar.')
      const value: unknown = JSON.parse(raw)
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('La respuesta debe ser un objeto JSON, por ejemplo: {"respuesta":"12"}.')
      parsed = value as Record<string, unknown>
    } catch (e) { setError(e instanceof Error ? e.message : 'Revisa el formato de tu respuesta.'); return }
    setSaving(true); setError(''); setNotice('')
    try {
      await deliverStudentAssignment(assignment.id, parsed)
      setNotice('Tu tarea fue entregada correctamente.')
      setResponses((old) => ({ ...old, [assignment.id]: '' }))
      const [mine, current] = await Promise.all([listMyAssignmentSubmissions(), listStudentAssignments(activeClassroom)])
      setSubmissions(mine); setAssignments(current)
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo entregar la tarea.') }
    finally { setSaving(false) }
  }

  const submissionByAssignment = new Map(submissions.map((item) => [item.assignment_id, item]))
  return <section className="student-assignment-center" aria-labelledby="student-assignment-title">
    <div className="student-assignment-heading"><div><span className="section-kicker">APRENDE CON TU CLASE</span><h2 id="student-assignment-title"><School size={23}/> Mis aulas y tareas</h2><p>Únete a tu clase con un código, consulta actividades y envía tus respuestas.</p></div><button className="secondary-button" onClick={() => void load()} disabled={loading}><Clock3 size={16}/> Actualizar</button></div>
    {error && <p className="student-assignment-message error" role="alert">{error}</p>}
    {notice && <p className="student-assignment-message success" role="status">{notice}</p>}
    <form className="student-join-form" onSubmit={join}><label htmlFor="student-join-code">Código de tu aula</label><div><input id="student-join-code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} minLength={6} maxLength={16} placeholder="Ej. A1B2C3D4" autoComplete="off" required/><button className="primary-button" disabled={saving || joinCode.trim().length < 6}><Users size={16}/> Unirme</button></div></form>
    {loading ? <div className="student-assignment-empty"><LoaderCircle className="student-assignment-spin"/> Cargando tus aulas…</div> : !classrooms.length ? <div className="student-assignment-empty"><School size={30}/><strong>Tu recorrido comienza en el aula</strong><span>Solicita el código a tu docente e introdúcelo arriba para ver las actividades de tu clase.</span></div> : <>
      <label className="student-room-select">Aula seleccionada<select value={activeClassroom} onChange={(e) => void selectRoom(e.target.value)}>{classrooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {room.stage} · {room.education_year}</option>)}</select></label>
      <div className="student-room-summary"><School size={18}/><div><strong>{classrooms.find((room) => room.id === activeClassroom)?.name}</strong><span>{classrooms.find((room) => room.id === activeClassroom)?.stage} · {classrooms.find((room) => room.id === activeClassroom)?.education_year}</span></div><span>{assignments.length} tareas publicadas</span></div>
      <div className="student-assignment-list">{assignments.map((assignment) => {
        const submission = submissionByAssignment.get(assignment.id)
        const expired = assignment.due_at ? new Date(assignment.due_at).getTime() < Date.now() : false
        return <article key={assignment.id} className="student-assignment-card">
          <div className="student-assignment-card-heading"><div><span className="section-kicker">ACTIVIDAD DE CLASE</span><h3>{assignment.title}</h3></div><span className={submission?.score !== null && submission?.score !== undefined ? 'student-status graded' : submission ? 'student-status sent' : expired ? 'student-status closed' : 'student-status pending'}>{submission?.score !== null && submission?.score !== undefined ? 'Calificada' : submission ? 'Entregada' : expired ? 'Plazo vencido' : 'Pendiente'}</span></div>
          {assignment.instructions && <p className="student-assignment-instructions">{assignment.instructions}</p>}
          <p className="student-assignment-deadline"><CalendarClock size={15}/>{assignment.due_at ? 'Fecha límite: ' + new Date(assignment.due_at).toLocaleString() : 'Sin fecha límite'}</p>
          {submission ? <div className="student-submission-feedback"><CheckCircle2 size={17}/><div><strong>{submission.score !== null ? 'Calificación: ' + submission.score + '/100' : 'Entrega registrada'}</strong>{submission.feedback && <p>{submission.feedback}</p>}<small>Enviada el {new Date(submission.submitted_at).toLocaleString()}</small></div></div> : <div className="student-delivery-form"><label>Tu respuesta (formato JSON sencillo)<textarea rows={3} value={responses[assignment.id] ?? ''} onChange={(e) => setResponses((old) => ({ ...old, [assignment.id]: e.target.value }))} placeholder={'{"respuesta":"Escribe aquí tu solución"}'} disabled={expired}/></label><button className="primary-button" onClick={() => void deliver(assignment)} disabled={saving || expired}><Send size={16}/> Entregar tarea</button></div>}
        </article>
      })}{!assignments.length && <div className="student-assignment-empty compact"><BookOpenCheck size={26}/><strong>No hay tareas publicadas</strong><span>Cuando tu docente publique una actividad, aparecerá aquí.</span></div>}</div>
    </>}
  </section>
}
