import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabase'
import { BarChart3, Download, LoaderCircle, Printer, RefreshCw, Users } from 'lucide-react'
import './gradebook.css'

type Classroom = { id: string; name: string; stage: string; education_year: string }
type Assignment = { id: string; title: string; status: string; created_at: string; due_at: string | null }
type Member = { student_id: string; joined_at: string }
type Submission = { id: string; assignment_id: string; student_id: string; score: number | null; submitted_at: string; graded_at: string | null }
type StudentName = { id: string; display_name: string | null }
type GradeRow = { studentId: string; name: string; grades: Map<string, Submission>; average: number | null; graded: number; pending: number; awaitingGrade: number }

function csvCell(value: string | number) {
  return '"' + String(value).replace(/"/g, '""') + '"'
}

export default function TeacherGradebook() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [classroomId, setClassroomId] = useState('')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all')

  const load = useCallback(async () => {
    if (!supabase) { setError('Conecta Supabase para consultar calificaciones.'); setLoading(false); return }
    setLoading(true); setError('')
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user || user.app_metadata?.assigned_role !== 'teacher') throw new Error('Inicia sesión con una cuenta docente autorizada.')
      const { data: rooms, error: roomError } = await supabase.from('gm_classrooms')
        .select('id,name,stage,education_year').eq('teacher_id', user.id).order('created_at', { ascending: false })
      if (roomError) throw roomError
      const roomList = (rooms ?? []) as Classroom[]
      setClassrooms(roomList)
      const selected = roomList.some((room) => room.id === classroomId) ? classroomId : roomList[0]?.id ?? ''
      setClassroomId(selected)
      if (!selected) { setAssignments([]); setMembers([]); setSubmissions([]); setNames({}); return }
      const [assignmentResult, memberResult] = await Promise.all([
        supabase.from('gm_assignments').select('id,title,status,created_at,due_at').eq('classroom_id', selected).order('created_at', { ascending: false }),
        supabase.from('gm_classroom_members').select('student_id,joined_at').eq('classroom_id', selected).order('joined_at', { ascending: true }),
      ])
      if (assignmentResult.error) throw assignmentResult.error
      if (memberResult.error) throw memberResult.error
      const assignmentList = (assignmentResult.data ?? []) as Assignment[]
      const memberList = (memberResult.data ?? []) as Member[]
      setAssignments(assignmentList); setMembers(memberList)
      const ids = assignmentList.map((item) => item.id)
      const [submissionResult, profileResult] = await Promise.all([
        ids.length ? supabase.from('gm_assignment_submissions').select('id,assignment_id,student_id,score,submitted_at,graded_at').in('assignment_id', ids) : Promise.resolve({ data: [], error: null }),
        memberList.length ? supabase.from('user_profiles').select('id,display_name').in('id', memberList.map((m) => m.student_id)) : Promise.resolve({ data: [], error: null }),
      ])
      if (submissionResult.error) throw submissionResult.error
      setSubmissions((submissionResult.data ?? []) as Submission[])
      const nameMap: Record<string, string> = {}
      ;((profileResult.data ?? []) as StudentName[]).forEach((profile) => { if (profile.display_name?.trim()) nameMap[profile.id] = profile.display_name.trim() })
      setNames(nameMap)
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar el libro de calificaciones.') }
    finally { setLoading(false) }
  }, [classroomId])

  useEffect(() => { void load() }, [load])

  const rows = useMemo<GradeRow[]>(() => members.map((member) => {
    const grades = new Map(submissions.filter((item) => item.student_id === member.student_id).map((item) => [item.assignment_id, item]))
    const scored = [...grades.values()].filter((item) => item.score !== null)
    const pending = assignments.filter((item) => item.status === 'published' && !grades.has(item.id)).length
    const awaitingGrade = [...grades.values()].filter((item) => item.score === null).length
    return {
      studentId: member.student_id, name: names[member.student_id] ?? 'Estudiante ' + member.student_id.slice(0, 8),
      grades, average: scored.length ? scored.reduce((sum, item) => sum + Number(item.score), 0) / scored.length : null,
      graded: scored.length, pending, awaitingGrade,
    }
  }), [members, submissions, assignments, names])

  const visibleRows = rows.filter((row) => filter === 'all' || (filter === 'pending' ? row.pending > 0 || row.awaitingGrade > 0 : row.graded > 0))
  const gradedCount = submissions.filter((item) => item.score !== null).length
  const awaitingGradeCount = submissions.filter((item) => item.score === null).length
  const average = gradedCount ? submissions.filter((item) => item.score !== null).reduce((sum, item) => sum + Number(item.score), 0) / gradedCount : null

  const exportCsv = () => {
    const headers = ['Estudiante', ...assignments.map((item) => item.title), 'Promedio', 'Calificadas', 'Pendientes']
    const lines = [headers.map(csvCell).join(';'), ...rows.map((row) => [
      row.name, ...assignments.map((item) => {
        const grade = row.grades.get(item.id)
        return grade ? (grade.score === null ? 'Entregada, sin calificar' : grade.score) : item.status === 'published' ? 'Pendiente' : '—'
      }), row.average === null ? '—' : row.average.toFixed(2), row.graded, row.awaitingGrade, row.pending,
    ].map(csvCell).join(';'))]
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'althea-libro-calificaciones.csv'; link.click()
    URL.revokeObjectURL(url)
  }

  return <section className="teacher-gradebook" aria-labelledby="teacher-gradebook-title">
    <div className="gradebook-heading"><div><span className="section-kicker">SEGUIMIENTO ACADÉMICO</span><h2 id="teacher-gradebook-title"><BarChart3 size={23}/> Libro de calificaciones</h2><p>Consulta las notas, entregas pendientes y promedios de cada aula.</p></div><div className="gradebook-actions"><button className="secondary-button" onClick={() => window.print()} disabled={loading}><Printer size={16}/> Imprimir</button><button className="secondary-button" onClick={exportCsv} disabled={loading || !rows.length}><Download size={16}/> Exportar CSV</button><button className="secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16}/> Actualizar</button></div></div>
    {error && <p className="gradebook-message error" role="alert">{error}</p>}
    {loading ? <div className="gradebook-empty"><LoaderCircle className="gradebook-spin"/> Preparando tus calificaciones…</div> : !classrooms.length ? <div className="gradebook-empty"><Users size={28}/><strong>No tienes aulas asignadas</strong><span>Cuando tengas un aula con estudiantes, sus resultados aparecerán aquí.</span></div> : <>
      <label className="gradebook-room">Aula<select value={classroomId} onChange={(event) => setClassroomId(event.target.value)}>{classrooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {room.stage} · {room.education_year}</option>)}</select></label>
      <div className="gradebook-metrics"><article><span>Estudiantes</span><strong>{members.length}</strong></article><article><span>Tareas creadas</span><strong>{assignments.length}</strong></article><article><span>Entregas calificadas</span><strong>{gradedCount}</strong></article><article><span>Por calificar</span><strong>{awaitingGradeCount}</strong></article><article><span>Promedio del aula</span><strong>{average === null ? '—' : average.toFixed(1) + '/100'}</strong></article></div>
      <div className="gradebook-table-heading"><div><h3>Resultados por estudiante</h3><p>El promedio considera únicamente las entregas que ya tienen nota.</p></div><select aria-label="Filtrar estudiantes" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">Todos</option><option value="pending">Con pendientes</option><option value="graded">Con calificaciones</option></select></div>
      {!assignments.length || !members.length ? <div className="gradebook-empty compact">{!members.length ? 'Todavía no hay estudiantes inscritos en esta aula.' : 'Todavía no hay tareas para calcular resultados.'}</div> : <div className="gradebook-scroll"><table className="gradebook-table"><thead><tr><th>Estudiante</th>{assignments.map((item) => <th key={item.id} title={item.title}>{item.title}</th>)}<th>Promedio</th><th>Por calificar</th><th>Sin entregar</th></tr></thead><tbody>{visibleRows.map((row) => <tr key={row.studentId}><th scope="row">{row.name}</th>{assignments.map((item) => { const grade = row.grades.get(item.id); return <td key={item.id}>{grade ? grade.score === null ? <span className="gradebook-pill submitted">Entregada</span> : <strong className="gradebook-score">{Number(grade.score).toFixed(1)}</strong> : item.status === 'published' ? <span className="gradebook-pill pending">Pendiente</span> : <span className="gradebook-muted">—</span>}</td> })}<td><strong>{row.average === null ? '—' : row.average.toFixed(1)}</strong></td><td>{row.awaitingGrade}</td><td>{row.pending}</td></tr>)}</tbody></table></div>}
      <p className="gradebook-footnote">Las calificaciones son privadas para el docente autorizado y el estudiante correspondiente. Los borradores no cuentan como tareas pendientes.</p>
    </>}
  </section>
}
