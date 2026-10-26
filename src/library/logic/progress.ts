import type { Catalog, Lesson, LessonProgress, LessonStatus, ProgressMap, Topic } from '../types'

/** Proporción de ejercicios que hay que resolver para completar una lección si no se indica `minSolved`. */
export const DEFAULT_COMPLETION_RATIO = 0.7

export function requiredSolved(lesson: Pick<Lesson, 'exercises' | 'minSolved'>): number {
  const total = lesson.exercises.length
  if (total === 0) return 0
  return Math.min(total, Math.max(1, lesson.minSolved ?? Math.ceil(total * DEFAULT_COMPLETION_RATIO)))
}
export function lessonStatus(record: LessonProgress | undefined): LessonStatus { return record ? record.status : 'not_started' }

function base(lessonId: string, now: string): LessonProgress {
  return { lessonId, status: 'in_progress', attempts: 0, solved: [], revealed: [], score: null, lastStep: 0, startedAt: now, updatedAt: now }
}
const scoreOf = (solvedCount: number, total: number) => total === 0 ? null : Math.round((solvedCount / total) * 100)
const maxScore = (a: number | null, b: number | null) => a === null ? b : b === null ? a : Math.max(a, b)

function assertExercise(lesson: Lesson, exerciseId: string) {
  if (!lesson.exercises.some((e) => e.id === exerciseId)) throw new Error(`El ejercicio «${exerciseId}» no pertenece a la lección «${lesson.id}».`)
}

/** Registra una comprobación de respuesta. Nunca baja una lección completada a «en progreso». */
export function recordAttempt(prev: LessonProgress | undefined, lesson: Lesson, exerciseId: string, correct: boolean, now: string): LessonProgress {
  assertExercise(lesson, exerciseId)
  const rec = prev ?? base(lesson.id, now)
  const solved = correct && !rec.solved.includes(exerciseId) ? [...rec.solved, exerciseId] : rec.solved
  const revealed = correct ? rec.revealed.filter((id) => id !== exerciseId) : rec.revealed
  const reachedGoal = solved.length >= requiredSolved(lesson)
  const completed = rec.status === 'completed' || reachedGoal
  return {
    ...rec, attempts: rec.attempts + 1, solved, revealed,
    score: maxScore(rec.score, scoreOf(solved.length, lesson.exercises.length)),
    status: completed ? 'completed' : 'in_progress',
    completedAt: completed ? (rec.completedAt ?? now) : undefined,
    updatedAt: now,
  }
}
/** Registra que se reveló la respuesta tras agotar las pistas. No cuenta como ejercicio resuelto. */
export function recordReveal(prev: LessonProgress | undefined, lesson: Lesson, exerciseId: string, now: string): LessonProgress {
  assertExercise(lesson, exerciseId)
  const rec = prev ?? base(lesson.id, now)
  const revealed = rec.solved.includes(exerciseId) || rec.revealed.includes(exerciseId) ? rec.revealed : [...rec.revealed, exerciseId]
  return { ...rec, revealed, updatedAt: now }
}
/** Guarda el paso de la lección solo si ya existe progreso real (abrir una lección no la «inicia»). */
export function recordStep(prev: LessonProgress | undefined, step: number): LessonProgress | undefined {
  if (!prev || prev.lastStep === step) return prev
  return { ...prev, lastStep: Math.max(0, step) }
}
/** Lecciones heredadas de una sola pregunta (Secundaria/Universidad): acertar la pregunta completa la lección con 100 %. */
export function recordSimpleCompletion(prev: LessonProgress | undefined, lessonId: string, now: string): LessonProgress {
  if (prev?.status === 'completed') return prev
  const rec = prev ?? base(lessonId, now)
  return { ...rec, status: 'completed', attempts: rec.attempts + 1, score: 100, completedAt: now, updatedAt: now }
}
/** Reinicia los ejercicios resueltos/revelados (la lección completada sigue completada). */
export function resetPractice(prev: LessonProgress | undefined, now: string): LessonProgress | undefined {
  if (!prev) return prev
  return { ...prev, solved: [], revealed: [], lastStep: 0, updatedAt: now }
}

const later = (a: string, b: string) => (a >= b ? a : b)
const earlier = (a: string, b: string) => (a <= b ? a : b)
export function mergeRecord(a: LessonProgress, b: LessonProgress): LessonProgress {
  const newer = a.updatedAt >= b.updatedAt ? a : b
  const solved = Array.from(new Set([...a.solved, ...b.solved]))
  const completed = a.status === 'completed' || b.status === 'completed'
  const completedAts = [a, b].filter((r) => r.status === 'completed').map((r) => r.completedAt ?? r.updatedAt)
  return {
    lessonId: a.lessonId, status: completed ? 'completed' : 'in_progress',
    attempts: Math.max(a.attempts, b.attempts), solved,
    revealed: Array.from(new Set([...a.revealed, ...b.revealed])).filter((id) => !solved.includes(id)),
    score: maxScore(a.score, b.score), lastStep: newer.lastStep,
    startedAt: earlier(a.startedAt, b.startedAt), updatedAt: later(a.updatedAt, b.updatedAt),
    completedAt: completed ? completedAts.reduce((acc, v) => earlier(acc, v)) : undefined,
  }
}
/** Fusiona dos mapas de progreso sin perder avance de ninguno. */
export function mergeProgress(a: ProgressMap, b: ProgressMap): ProgressMap {
  const result: ProgressMap = { ...a }
  for (const [id, rec] of Object.entries(b)) result[id] = result[id] ? mergeRecord(result[id], rec) : rec
  return result
}
/** `true` si `next` aporta información que `remote` no tiene (hay que subirla). */
export function needsUpload(next: LessonProgress, remote: LessonProgress | undefined): boolean {
  if (!remote) return true
  if (next.status === 'completed' && remote.status !== 'completed') return true
  return (next.score ?? -1) > (remote.score ?? -1)
}

// ───────── Conversión con la tabla learning_progress (user_id, lesson_id, status, score, updated_at) ─────────
export type RemoteProgressRow = { lesson_id: string; status: string; score: number | string | null; updated_at: string }
export function fromRemoteRow(row: RemoteProgressRow): LessonProgress | null {
  if (row.status !== 'in_progress' && row.status !== 'completed') return null
  const score = row.score === null || row.score === undefined ? null : Number(row.score)
  return {
    lessonId: row.lesson_id, status: row.status, attempts: 0, solved: [], revealed: [],
    score: score !== null && Number.isFinite(score) ? score : null, lastStep: 0,
    startedAt: row.updated_at, updatedAt: row.updated_at, completedAt: row.status === 'completed' ? row.updated_at : undefined,
  }
}
export function toRemoteRow(userId: string, rec: LessonProgress) {
  return { user_id: userId, lesson_id: rec.lessonId, status: rec.status, score: rec.score, updated_at: rec.updatedAt }
}
/** Lectura segura del JSON local: descarta entradas mal formadas en lugar de romper la aplicación. */
export function parseProgressMap(raw: unknown): ProgressMap {
  const result: ProgressMap = {}
  if (!raw || typeof raw !== 'object') return result
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    const v = value as Partial<LessonProgress> | null
    if (!v || typeof v !== 'object' || (v.status !== 'in_progress' && v.status !== 'completed')) continue
    const strings = (x: unknown) => Array.isArray(x) ? x.filter((i): i is string => typeof i === 'string') : []
    const now = new Date(0).toISOString()
    result[id] = {
      lessonId: id, status: v.status, attempts: Number.isFinite(v.attempts) ? Math.max(0, Number(v.attempts)) : 0,
      solved: strings(v.solved), revealed: strings(v.revealed),
      score: typeof v.score === 'number' && Number.isFinite(v.score) ? Math.min(100, Math.max(0, v.score)) : null,
      lastStep: Number.isInteger(v.lastStep) ? Math.max(0, Number(v.lastStep)) : 0,
      startedAt: typeof v.startedAt === 'string' ? v.startedAt : now, updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : now,
      completedAt: typeof v.completedAt === 'string' ? v.completedAt : undefined,
    }
  }
  return result
}

// ───────── Agregados ─────────
export type Aggregate = { total: number; completed: number; inProgress: number; percent: number }
export function aggregate(lessons: Lesson[], map: ProgressMap): Aggregate {
  const total = lessons.length
  let completed = 0; let inProgress = 0
  for (const lesson of lessons) { const s = lessonStatus(map[lesson.id]); if (s === 'completed') completed++; else if (s === 'in_progress') inProgress++ }
  return { total, completed, inProgress, percent: total === 0 ? 0 : Math.round((completed / total) * 100) }
}
export type TopicStatus = 'planned' | 'not_started' | 'in_progress' | 'completed'
export function topicStatus(agg: Aggregate): TopicStatus {
  if (agg.total === 0) return 'planned'
  if (agg.completed === agg.total) return 'completed'
  return agg.completed + agg.inProgress > 0 ? 'in_progress' : 'not_started'
}
export const lessonsOfTopic = (catalog: Catalog, topicId: string) => catalog.lessonsByTopic.get(topicId) ?? []
export const lessonsOfUnit = (catalog: Catalog, unitId: string) => (catalog.topicsByUnit.get(unitId) ?? []).flatMap((t) => lessonsOfTopic(catalog, t.id))
export const lessonsOfGrade = (catalog: Catalog, gradeId: string) => (catalog.unitsByGrade.get(gradeId) ?? []).flatMap((u) => lessonsOfUnit(catalog, u.id))
export const lessonsOfStage = (catalog: Catalog, stageId: string) => (catalog.gradesByStage.get(stageId) ?? []).flatMap((g) => lessonsOfGrade(catalog, g.id))
export const topicAggregate = (catalog: Catalog, topic: Topic, map: ProgressMap) => aggregate(lessonsOfTopic(catalog, topic.id), map)

/** Todas las lecciones en el orden pedagógico del catálogo (grado → unidad → tema → lección). */
export function lessonSequence(catalog: Catalog): Lesson[] {
  return catalog.topics.flatMap((t) => lessonsOfTopic(catalog, t.id))
}
/** Lección en progreso con actividad más reciente. */
export function continueLesson(catalog: Catalog, map: ProgressMap): Lesson | undefined {
  const active = Object.values(map).filter((r) => r.status === 'in_progress' && catalog.lessonById.has(r.lessonId)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  return active ? catalog.lessonById.get(active.lessonId) : undefined
}
const gradeIdOfLesson = (catalog: Catalog, lesson: Lesson) => catalog.unitById.get(catalog.topicById.get(lesson.topicId)?.unitId ?? '')?.gradeId
/**
 * Primera lección sin empezar, preferentemente del grado indicado. Solo se exigen los prerrequisitos de lección del
 * MISMO grado: los de grados anteriores son una recomendación, no un bloqueo (el estudiante puede no haberlos cursado aquí).
 */
export function suggestNextLesson(catalog: Catalog, map: ProgressMap, gradeId?: string): Lesson | undefined {
  const pending = lessonSequence(catalog).filter((l) => lessonStatus(map[l.id]) === 'not_started')
  const ready = (l: Lesson) => (l.prerequisites ?? []).every((id) => {
    const pre = catalog.lessonById.get(id)
    return !pre || gradeIdOfLesson(catalog, pre) !== gradeIdOfLesson(catalog, l) || lessonStatus(map[id]) === 'completed'
  })
  const inGrade = gradeId ? pending.filter((l) => gradeIdOfLesson(catalog, l) === gradeId) : []
  return inGrade.find(ready) ?? inGrade[0] ?? pending.find(ready) ?? pending[0]
}
