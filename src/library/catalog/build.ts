import type { Catalog, Exercise, Lesson, RawCatalog, VisualSpec } from '../types'

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order
function indexBy<T extends { id: string }>(items: T[]): Map<string, T> { return new Map(items.map((item) => [item.id, item])) }
function group<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) { const k = key(item); const list = map.get(k); if (list) list.push(item); else map.set(k, [item]) }
  return map
}

/** Construye los índices del catálogo. No valida: usa `validateCatalog` antes si los datos no son de confianza. */
export function buildCatalog(raw: RawCatalog): Catalog {
  const stages = [...raw.stages].sort(byOrder)
  const grades = [...raw.grades].sort(byOrder)
  const areas = [...raw.areas].sort(byOrder)
  const gradeById = indexBy(grades)
  const areaById = indexBy(areas)
  const unitById = indexBy(raw.units)
  const gradeOrder = (gradeId: string) => gradeById.get(gradeId)?.order ?? 0
  const units = [...raw.units].sort((a, b) => gradeOrder(a.gradeId) - gradeOrder(b.gradeId) || a.order - b.order)
  const topicRank = (topicUnitId: string, topicOrder: number) => {
    const unit = unitById.get(topicUnitId)
    return (unit ? gradeOrder(unit.gradeId) : 0) * 1_000_000 + (unit?.order ?? 0) * 1_000 + topicOrder
  }
  const topics = [...raw.topics].sort((a, b) => topicRank(a.unitId, a.order) - topicRank(b.unitId, b.order))
  const lessons = [...raw.lessons].sort((a, b) => a.order - b.order)
  const topicsByArea = new Map<string, typeof topics>()
  for (const topic of topics) {
    const areaId = unitById.get(topic.unitId)?.areaId
    if (!areaId) continue
    const list = topicsByArea.get(areaId)
    if (list) list.push(topic); else topicsByArea.set(areaId, [topic])
  }
  return {
    stages, grades, areas, units, topics, lessons,
    stageById: indexBy(stages), gradeById, areaById, unitById,
    topicById: indexBy(topics), lessonById: indexBy(lessons),
    lessonsByTopic: group(lessons, (l) => l.topicId),
    topicsByUnit: group(topics, (t) => t.unitId),
    unitsByGrade: group(units, (u) => u.gradeId),
    gradesByStage: group(grades, (g) => g.stageId),
    topicsByArea,
  }
}

const SLUG = /^[a-z0-9][a-z0-9-]*(:[a-z0-9-]+)?$/

function checkUnique(label: string, ids: string[], errors: string[]) {
  const seen = new Set<string>()
  for (const id of ids) {
    if (!SLUG.test(id)) errors.push(`${label} «${id}»: el identificador debe ser un slug estable en minúsculas.`)
    if (seen.has(id)) errors.push(`${label} «${id}»: identificador duplicado.`)
    seen.add(id)
  }
}
function checkVisual(where: string, visual: VisualSpec | undefined, errors: string[]) {
  if (visual && !visual.alt.trim()) errors.push(`${where}: el visual no tiene texto alternativo.`)
}
function checkExercise(lessonId: string, exercise: Exercise, errors: string[]) {
  const where = `Ejercicio ${exercise.id} de «${lessonId}»`
  if (!exercise.prompt.trim()) errors.push(`${where}: enunciado vacío.`)
  if (!exercise.explanation.trim()) errors.push(`${where}: falta la explicación.`)
  if (exercise.hints.length === 0 || exercise.hints.length > 3) errors.push(`${where}: debe tener entre 1 y 3 pistas.`)
  checkVisual(where, exercise.visual, errors)
  switch (exercise.type) {
    case 'choice':
      if (exercise.options.length < 2) errors.push(`${where}: necesita al menos 2 opciones.`)
      if (new Set(exercise.options).size !== exercise.options.length) errors.push(`${where}: opciones repetidas.`)
      if (!Number.isInteger(exercise.answerIndex) || exercise.answerIndex < 0 || exercise.answerIndex >= exercise.options.length) errors.push(`${where}: answerIndex fuera de rango.`)
      for (const key of Object.keys(exercise.wrongFeedback ?? {})) {
        const index = Number(key)
        if (index === exercise.answerIndex || index < 0 || index >= exercise.options.length) errors.push(`${where}: wrongFeedback apunta a una opción inválida (${key}).`)
      }
      break
    case 'number':
      if (!Number.isFinite(exercise.answer)) errors.push(`${where}: respuesta numérica no válida.`)
      break
    case 'fraction':
      if (!Number.isInteger(exercise.numerator) || !Number.isInteger(exercise.denominator) || exercise.denominator <= 0) errors.push(`${where}: fracción no válida.`)
      break
    case 'order':
      if (exercise.items.length < 2) errors.push(`${where}: necesita al menos 2 elementos.`)
      if (new Set(exercise.items).size !== exercise.items.length) errors.push(`${where}: elementos repetidos.`)
      break
  }
}
function checkLesson(lesson: Lesson, errors: string[]) {
  const where = `Lección «${lesson.id}»`
  if (lesson.sections.length === 0) errors.push(`${where}: sin secciones.`)
  if (lesson.exercises.length < 2) errors.push(`${where}: necesita al menos 2 ejercicios.`)
  if (lesson.summary.length === 0) errors.push(`${where}: sin resumen.`)
  if (lesson.workedExample.steps.length === 0) errors.push(`${where}: el ejemplo resuelto no tiene pasos.`)
  if (lesson.minSolved !== undefined && (lesson.minSolved < 1 || lesson.minSolved > lesson.exercises.length)) errors.push(`${where}: minSolved fuera de rango.`)
  for (const section of lesson.sections) checkVisual(`${where}, sección «${section.title}»`, section.visual, errors)
  for (const step of lesson.workedExample.steps) checkVisual(`${where}, ejemplo`, step.visual, errors)
  checkUnique(`Ejercicios de ${lesson.id}`, lesson.exercises.map((e) => e.id), errors)
  for (const exercise of lesson.exercises) {
    if (!exercise.id.startsWith(`${lesson.id}:`)) errors.push(`Ejercicio ${exercise.id}: el id debe empezar por «${lesson.id}:».`)
    checkExercise(lesson.id, exercise, errors)
  }
}
/** Detecta ciclos en un grafo de prerrequisitos. Devuelve ids implicados en algún ciclo. */
function findCycle(edges: Map<string, string[]>): string | null {
  const state = new Map<string, 1 | 2>()
  const visit = (id: string): string | null => {
    if (state.get(id) === 2) return null
    if (state.get(id) === 1) return id
    state.set(id, 1)
    for (const next of edges.get(id) ?? []) { const found = visit(next); if (found) return found }
    state.set(id, 2)
    return null
  }
  for (const id of edges.keys()) { const found = visit(id); if (found) return found }
  return null
}

/** Comprueba integridad referencial y calidad mínima del contenido. Devuelve la lista de errores (vacía si es válido). */
export function validateCatalog(raw: RawCatalog): string[] {
  const errors: string[] = []
  checkUnique('Etapa', raw.stages.map((s) => s.id), errors)
  checkUnique('Grado', raw.grades.map((g) => g.id), errors)
  checkUnique('Área', raw.areas.map((a) => a.id), errors)
  checkUnique('Unidad', raw.units.map((u) => u.id), errors)
  checkUnique('Tema', raw.topics.map((t) => t.id), errors)
  checkUnique('Lección', raw.lessons.map((l) => l.id), errors)
  const stageIds = new Set(raw.stages.map((s) => s.id as string))
  const gradeById = indexBy(raw.grades)
  const areaIds = new Set(raw.areas.map((a) => a.id))
  const unitById = indexBy(raw.units)
  const topicById = indexBy(raw.topics)
  const lessonById = indexBy(raw.lessons)
  for (const g of raw.grades) if (!stageIds.has(g.stageId)) errors.push(`Grado «${g.id}»: etapa «${g.stageId}» inexistente.`)
  for (const u of raw.units) {
    if (!gradeById.has(u.gradeId)) errors.push(`Unidad «${u.id}»: grado «${u.gradeId}» inexistente.`)
    if (!areaIds.has(u.areaId)) errors.push(`Unidad «${u.id}»: área «${u.areaId}» inexistente.`)
  }
  const gradeOfTopic = (topicId: string) => { const unit = unitById.get(topicById.get(topicId)?.unitId ?? ''); return unit ? gradeById.get(unit.gradeId) : undefined }
  const topicEdges = new Map<string, string[]>()
  for (const t of raw.topics) {
    if (!t.title.trim() || !t.description.trim()) errors.push(`Tema «${t.id}»: título o descripción vacíos.`)
    if (t.tags.length === 0) errors.push(`Tema «${t.id}»: sin etiquetas de búsqueda.`)
    if (!unitById.has(t.unitId)) errors.push(`Tema «${t.id}»: unidad «${t.unitId}» inexistente.`)
    topicEdges.set(t.id, t.prerequisites)
    for (const pre of t.prerequisites) {
      if (pre === t.id) errors.push(`Tema «${t.id}»: es prerrequisito de sí mismo.`)
      else if (!topicById.has(pre)) errors.push(`Tema «${t.id}»: prerrequisito «${pre}» inexistente.`)
      else if ((gradeOfTopic(pre)?.order ?? 0) > (gradeOfTopic(t.id)?.order ?? 0)) errors.push(`Tema «${t.id}»: el prerrequisito «${pre}» pertenece a un grado posterior.`)
    }
  }
  const cycle = findCycle(topicEdges)
  if (cycle) errors.push(`Los prerrequisitos de temas contienen un ciclo que involucra «${cycle}».`)
  const lessonEdges = new Map<string, string[]>()
  for (const l of raw.lessons) {
    if (!topicById.has(l.topicId)) errors.push(`Lección «${l.id}»: tema «${l.topicId}» inexistente.`)
    lessonEdges.set(l.id, l.prerequisites ?? [])
    for (const pre of l.prerequisites ?? []) {
      if (pre === l.id) errors.push(`Lección «${l.id}»: es prerrequisito de sí misma.`)
      else if (!lessonById.has(pre)) errors.push(`Lección «${l.id}»: prerrequisito «${pre}» inexistente.`)
    }
    checkLesson(l, errors)
  }
  const lessonCycle = findCycle(lessonEdges)
  if (lessonCycle) errors.push(`Los prerrequisitos de lecciones contienen un ciclo que involucra «${lessonCycle}».`)
  return errors
}
