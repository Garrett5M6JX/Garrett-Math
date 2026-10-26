import type { Catalog, ExerciseType, Lesson, LessonStatus, ProgressMap, Topic } from '../types'
import { normalizeText, stem, tokenize } from './text'
import { aggregate, lessonsOfTopic, topicStatus } from './progress'

export type LibraryFilters = {
  q: string
  stage?: string
  grade?: string
  area?: string
  unit?: string
  difficulty?: 1 | 2 | 3
  activity?: ExerciseType
  status?: LessonStatus
  favoritesOnly?: boolean
  /** Incluir temas «en preparación» (sin lecciones). Por defecto, no. */
  includePlanned?: boolean
}
export const emptyFilters: LibraryFilters = { q: '' }

export type TopicResult = { topic: Topic; score: number; matchedLessons: Lesson[]; available: boolean }
export type SearchContext = { progress?: ProgressMap; favorites?: ReadonlySet<string> }

const W = { title: 10, tags: 6, lessonTitle: 5, description: 3, lessonObjective: 2, context: 2 }

function words(text: string): string[] { return normalizeText(text).split(' ').filter(Boolean).map(stem) }
function bestMatch(token: string, fieldWords: string[]): 'exact' | 'prefix' | null {
  if (fieldWords.includes(token)) return 'exact'
  return fieldWords.some((w) => w.startsWith(token) && token.length >= 3) ? 'prefix' : null
}
function scoreText(tokens: string[], text: string, weight: number): number[] {
  const fieldWords = words(text)
  return tokens.map((t) => { const m = bestMatch(t, fieldWords); return m === 'exact' ? weight + 2 : m === 'prefix' ? weight : 0 })
}

/** Filtros estructurales (sin texto). */
export function topicPassesFilters(catalog: Catalog, topic: Topic, f: LibraryFilters, ctx: SearchContext = {}): boolean {
  const unit = catalog.unitById.get(topic.unitId)
  const grade = unit ? catalog.gradeById.get(unit.gradeId) : undefined
  if (!unit || !grade) return false
  const lessons = lessonsOfTopic(catalog, topic.id)
  if (lessons.length === 0 && !f.includePlanned) return false
  if (f.stage && grade.stageId !== f.stage) return false
  if (f.grade && grade.id !== f.grade) return false
  if (f.area && unit.areaId !== f.area) return false
  if (f.unit && unit.id !== f.unit) return false
  if (f.difficulty && topic.difficulty !== f.difficulty) return false
  if (f.activity && !lessons.some((l) => l.exercises.some((e) => e.type === f.activity))) return false
  if (f.favoritesOnly && !ctx.favorites?.has(topic.id)) return false
  if (f.status) {
    const status = topicStatus(aggregate(lessons, ctx.progress ?? {}))
    if (status === 'planned') return false
    if (f.status === 'not_started' ? status !== 'not_started' : f.status === 'in_progress' ? status !== 'in_progress' : status !== 'completed') return false
  }
  return true
}

/**
 * Busca temas por título, etiquetas, descripción y lecciones. Todos los términos deben coincidir (AND), sin tildes
 * y tolerando plurales y prefijos. Sin texto devuelve todos los temas que cumplen los filtros en orden curricular.
 */
export function searchTopics(catalog: Catalog, filters: LibraryFilters, ctx: SearchContext = {}): TopicResult[] {
  const tokens = tokenize(filters.q)
  const results: TopicResult[] = []
  for (const topic of catalog.topics) {
    if (!topicPassesFilters(catalog, topic, filters, ctx)) continue
    const lessons = lessonsOfTopic(catalog, topic.id)
    const available = lessons.length > 0
    if (tokens.length === 0) { results.push({ topic, score: 0, matchedLessons: [], available }); continue }
    const unit = catalog.unitById.get(topic.unitId)
    const grade = unit ? catalog.gradeById.get(unit.gradeId) : undefined
    const area = unit ? catalog.areaById.get(unit.areaId) : undefined
    const matched = new Set<string>()
    let total = 0
    let ok = true
    const perToken = tokens.map(() => 0)
    const add = (scores: number[]) => scores.forEach((s, i) => { if (s > perToken[i]) perToken[i] = s })
    add(scoreText(tokens, topic.title, W.title))
    add(scoreText(tokens, topic.tags.join(' '), W.tags))
    add(scoreText(tokens, topic.description, W.description))
    add(scoreText(tokens, `${unit?.title ?? ''} ${area?.name ?? ''} ${grade?.name ?? ''}`, W.context))
    for (const lesson of lessons) {
      const lessonScores = [scoreText(tokens, lesson.title, W.lessonTitle), scoreText(tokens, lesson.tags.join(' '), W.tags), scoreText(tokens, lesson.objective, W.lessonObjective)]
      const perLesson = tokens.map((_, i) => Math.max(...lessonScores.map((s) => s[i])))
      if (perLesson.some((s) => s > 0)) matched.add(lesson.id)
      add(perLesson)
    }
    for (const s of perToken) { if (s === 0) { ok = false; break } total += s }
    if (ok) results.push({ topic, score: total, matchedLessons: lessons.filter((l) => matched.has(l.id)), available })
  }
  const rank = new Map(catalog.topics.map((t, i) => [t.id, i]))
  return results.sort((a, b) => b.score - a.score || Number(b.available) - Number(a.available) || (rank.get(a.topic.id) ?? 0) - (rank.get(b.topic.id) ?? 0))
}

// ───────── Filtros ⇄ URL ─────────
const ACTIVITIES: ExerciseType[] = ['choice', 'number', 'fraction', 'order']
export function filtersToSearch(f: LibraryFilters): string {
  const p = new URLSearchParams()
  if (f.q.trim()) p.set('q', f.q.trim())
  if (f.stage) p.set('etapa', f.stage)
  if (f.grade) p.set('grado', f.grade)
  if (f.area) p.set('area', f.area)
  if (f.unit) p.set('unidad', f.unit)
  if (f.difficulty) p.set('dificultad', String(f.difficulty))
  if (f.activity) p.set('tipo', f.activity)
  if (f.status) p.set('estado', f.status)
  if (f.favoritesOnly) p.set('favoritos', '1')
  if (f.includePlanned) p.set('planificados', '1')
  const s = p.toString()
  return s ? `?${s}` : ''
}
/** Lee filtros de la URL. Descarta valores desconocidos y mantiene la coherencia grado ↔ etapa y unidad ↔ grado/área. */
export function filtersFromSearch(search: string, catalog?: Catalog): LibraryFilters {
  const p = new URLSearchParams(search)
  const f: LibraryFilters = { q: (p.get('q') ?? '').slice(0, 100) }
  const stage = p.get('etapa'); const grade = p.get('grado'); const area = p.get('area'); const unit = p.get('unidad')
  const diff = Number(p.get('dificultad')); const act = p.get('tipo'); const st = p.get('estado')
  if (stage && (!catalog || catalog.stageById.has(stage))) f.stage = stage
  if (grade && (!catalog || catalog.gradeById.has(grade))) f.grade = grade
  if (area && (!catalog || catalog.areaById.has(area))) f.area = area
  if (unit && (!catalog || catalog.unitById.has(unit))) f.unit = unit
  if (diff === 1 || diff === 2 || diff === 3) f.difficulty = diff
  if (act && (ACTIVITIES as string[]).includes(act)) f.activity = act as ExerciseType
  if (st === 'not_started' || st === 'in_progress' || st === 'completed') f.status = st
  if (p.get('favoritos') === '1') f.favoritesOnly = true
  if (p.get('planificados') === '1') f.includePlanned = true
  if (catalog) {
    const g = f.grade ? catalog.gradeById.get(f.grade) : undefined
    if (g && f.stage && g.stageId !== f.stage) delete f.grade
    const u = f.unit ? catalog.unitById.get(f.unit) : undefined
    if (u && ((f.grade && u.gradeId !== f.grade) || (f.area && u.areaId !== f.area))) delete f.unit
  }
  return f
}
export function activeFilterCount(f: LibraryFilters): number {
  return [f.stage, f.grade, f.area, f.unit, f.difficulty, f.activity, f.status, f.favoritesOnly, f.includePlanned].filter(Boolean).length
}
export const activityLabel: Record<ExerciseType, string> = { choice: 'Elegir la respuesta', number: 'Escribir un número', fraction: 'Escribir una fracción', order: 'Ordenar elementos' }
