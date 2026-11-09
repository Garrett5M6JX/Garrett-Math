import { supabase } from '../services/supabase'

export type AssignmentStatus = 'draft' | 'published' | 'closed'
export type ClassroomAssignment = {
  id: string
  classroom_id: string
  teacher_id: string
  title: string
  instructions: string
  stage: string
  education_year: string
  lesson_ids: string[]
  due_at: string | null
  status: AssignmentStatus
  created_at: string
  updated_at: string
}
export type AssignmentSubmission = {
  id: string
  assignment_id: string
  student_id: string
  response: Record<string, unknown>
  submitted_at: string
  score: number | null
  feedback: string | null
  graded_by: string | null
  graded_at: string | null
}
export type NewAssignment = Pick<ClassroomAssignment,
  'classroom_id' | 'teacher_id' | 'title' | 'instructions' | 'stage' | 'education_year' | 'lesson_ids' | 'due_at'
> & { status?: AssignmentStatus }

function client() {
  if (!supabase) throw new Error('Althea no está conectada a Supabase. Inicia la configuración antes de usar tareas.')
  return supabase
}

/** La política RLS confirma que el docente sea propietario del aula y que su rol esté autorizado. */
export async function createAssignment(input: NewAssignment): Promise<ClassroomAssignment> {
  const { data, error } = await client().from('gm_assignments').insert({
    ...input, status: input.status ?? 'draft',
  }).select('*').single()
  if (error) throw error
  return data as ClassroomAssignment
}

export async function listClassroomAssignments(classroomId: string): Promise<ClassroomAssignment[]> {
  const { data, error } = await client().from('gm_assignments').select('*')
    .eq('classroom_id', classroomId).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ClassroomAssignment[]
}

/** El envío pasa por RPC: valida matrícula, publicación, plazo y bloqueo tras calificación. */
export async function submitAssignment(
  assignmentId: string, response: Record<string, unknown>,
): Promise<string> {
  const { data, error } = await client().rpc('gm_submit_assignment', {
    p_assignment_id: assignmentId, p_response: response,
  })
  if (error) throw error
  return String(data)
}

/** Solo el docente propietario o un administrador autorizado puede calificar. */
export async function gradeAssignmentSubmission(
  submissionId: string, score: number, feedback?: string,
): Promise<void> {
  const { error } = await client().rpc('gm_grade_assignment_submission', {
    p_submission_id: submissionId, p_score: score, p_feedback: feedback ?? null,
  })
  if (error) throw error
}

export async function listAssignmentSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
  const { data, error } = await client().from('gm_assignment_submissions').select('*')
    .eq('assignment_id', assignmentId).order('submitted_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AssignmentSubmission[]
}
