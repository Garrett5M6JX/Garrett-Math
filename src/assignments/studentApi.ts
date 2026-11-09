import { supabase } from '../services/supabase'
import { submitAssignment, type AssignmentSubmission, type ClassroomAssignment } from './api'

export type StudentClassroom = {
  id: string
  name: string
  stage: string
  education_year: string
  joined_at: string
}

function client() {
  if (!supabase) throw new Error('Althea no está conectada a Supabase.')
  return supabase
}

export async function joinClassroom(joinCode: string): Promise<Omit<StudentClassroom, 'joined_at'>> {
  const { data, error } = await client().rpc('gm_join_classroom', { p_join_code: joinCode.trim() })
  if (error) throw error
  return data as Omit<StudentClassroom, 'joined_at'>
}

export async function listStudentClassrooms(): Promise<StudentClassroom[]> {
  const db = client()
  const { data: { user }, error: authError } = await db.auth.getUser()
  if (authError) throw authError
  if (!user) throw new Error('Inicia sesión para consultar tus aulas.')
  const { data, error } = await db.from('gm_classroom_members')
    .select('joined_at,gm_classrooms!inner(id,name,stage,education_year)')
    .eq('student_id', user.id).order('joined_at', { ascending: false })
  if (error) throw error
  type MembershipRow = { joined_at: string; gm_classrooms: { id: string; name: string; stage: string; education_year: string } }
  return ((data ?? []) as unknown as MembershipRow[]).map((row) => ({
    id: row.gm_classrooms.id, name: row.gm_classrooms.name,
    stage: row.gm_classrooms.stage, education_year: row.gm_classrooms.education_year,
    joined_at: row.joined_at,
  }))
}

export async function listStudentAssignments(classroomId: string): Promise<ClassroomAssignment[]> {
  const db = client()
  const { data, error } = await db.from('gm_assignments').select('*')
    .eq('classroom_id', classroomId).eq('status', 'published').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ClassroomAssignment[]
}

export async function listMyAssignmentSubmissions(): Promise<AssignmentSubmission[]> {
  const db = client()
  const { data: { user }, error: authError } = await db.auth.getUser()
  if (authError) throw authError
  if (!user) throw new Error('Inicia sesión para consultar tus entregas.')
  const { data, error } = await db.from('gm_assignment_submissions').select('*')
    .eq('student_id', user.id).order('submitted_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AssignmentSubmission[]
}

export async function deliverStudentAssignment(assignmentId: string, response: Record<string, unknown>) {
  return submitAssignment(assignmentId, response)
}
