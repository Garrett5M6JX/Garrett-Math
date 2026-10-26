import type { Difficulty, LessonStatus } from './types'
import type { TopicStatus } from './logic/progress'

export const difficultyLabel: Record<Difficulty, string> = { 1: 'Inicial', 2: 'Intermedio', 3: 'Avanzado' }
export const lessonStatusLabel: Record<LessonStatus, string> = { not_started: 'Sin empezar', in_progress: 'En progreso', completed: 'Completada' }
export const topicStatusLabel: Record<TopicStatus, string> = { planned: 'En preparación', not_started: 'Sin empezar', in_progress: 'En progreso', completed: 'Completado' }
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
/** Devuelve una fecha legible o null si el dato no es real (p. ej. progreso migrado sin fecha). */
export function formatActivity(iso: string | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2020) return null
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}
