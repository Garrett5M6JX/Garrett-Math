import { buildCatalog } from '../src/library/catalog/build'
import { rawCatalog } from '../src/library/catalog/data'
import type { Lesson, LessonProgress, ProgressMap } from '../src/library/types'

export const catalog = buildCatalog(rawCatalog)
export const NOW = '2026-10-25T10:00:00.000Z'
export const LATER = '2026-10-26T10:00:00.000Z'
export const lessonOf = (id: string): Lesson => { const l = catalog.lessonById.get(id); if (!l) throw new Error(`Falta la lección ${id}`); return l }
export const record = (lessonId: string, patch: Partial<LessonProgress> = {}): LessonProgress =>
  ({ lessonId, status: 'in_progress', attempts: 0, solved: [], revealed: [], score: null, lastStep: 0, startedAt: NOW, updatedAt: NOW, ...patch })
export const mapOf = (...records: LessonProgress[]): ProgressMap => Object.fromEntries(records.map((r) => [r.lessonId, r]))
export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
