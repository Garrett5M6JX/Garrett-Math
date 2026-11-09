import type { Catalog, Exercise, StageId } from '../library/types'

export type AssessmentDefinition = {
  id: string
  title: string
  description: string
  stageId: StageId
  gradeIds?: string[]
  topicIds?: string[]
  lessonIds?: string[]
  questionCount: number
  passPercent: number
  timeLimitMinutes?: number
  attemptsLimit?: number
  /** Solo para vista previa editorial: nunca habilitar como evaluación oficial. */
  previewDrafts?: boolean
}
export type AssessmentAnswer = string | number | number[]
export type AssessmentAnswers = Record<string, AssessmentAnswer>
export type AssessmentQuestionView = {
  id: string
  lessonId: string
  topicId: string
  title: string
  type: Exercise['type']
  prompt: string
  options?: string[]
  items?: string[]
  visual?: Exercise['visual']
}
export type AssessmentPaper = {
  assessmentId: string
  title: string
  description: string
  passPercent: number
  timeLimitMinutes?: number
  questions: AssessmentQuestionView[]
}
export type QuestionResult = {
  questionId: string
  correct: boolean
  earnedPoints: number
  explanation: string
  correctAnswer: string
}
export type AssessmentResult = {
  assessmentId: string
  total: number
  correct: number
  incorrect: number
  unanswered: number
  scorePercent: number
  passed: boolean
  results: QuestionResult[]
}
export type AssessmentBuildOptions = { seed?: string }

function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 16777619)
  return h >>> 0
}
function stableRank(id: string, seed: string): number { return hash(seed + ':' + id) }
function sameOrder(actual: number[], expected: string[]): boolean {
  return actual.length === expected.length && actual.every((value, index) => value === index)
}
function parseFraction(value: AssessmentAnswer): [number, number] | null {
  const match = /^(\s*-?\d+)\s*\/\s*(\d+\s*)$/.exec(String(value))
  if (!match) return null
  const n = Number(match[1]), d = Number(match[2])
  return Number.isFinite(n) && Number.isFinite(d) && d !== 0 ? [n, d] : null
}
function fractionEqual(a: [number, number], b: [number, number]): boolean {
  return a[0] * b[1] === b[0] * a[1]
}
function answerLabel(question: Exercise): string {
  switch (question.type) {
    case 'choice': return question.options[question.answerIndex] ?? ''
    case 'number': return question.unit ? question.answer + ' ' + question.unit : String(question.answer)
    case 'fraction': return question.numerator + '/' + question.denominator
    case 'order': return question.items.join(' → ')
  }
}
function isCorrect(question: Exercise, answer: AssessmentAnswer | undefined): boolean {
  if (answer === undefined || answer === '') return false
  switch (question.type) {
    case 'choice': return typeof answer === 'number' && Number.isInteger(answer) && answer === question.answerIndex
    case 'number': {
      const value = typeof answer === 'number' ? answer : Number(String(answer).replace(',', '.'))
      return Number.isFinite(value) && Math.abs(value - question.answer) <= (question.tolerance ?? 0)
    }
    case 'fraction': {
      const parsed = parseFraction(answer)
      if (!parsed) return false
      return question.equivalent ? fractionEqual(parsed, [question.numerator, question.denominator]) : parsed[0] === question.numerator && parsed[1] === question.denominator
    }
    case 'order': return Array.isArray(answer) && sameOrder(answer, question.items)
  }
}

/** Crea una prueba estable y sin exponer respuestas correctas al cliente antes de entregar. */
export function buildAssessment(catalog: Catalog, definition: AssessmentDefinition, options: AssessmentBuildOptions = {}): AssessmentPaper {
  if (!definition.id.trim() || !definition.title.trim()) throw new Error('La evaluación necesita identificador y título.')
  if (!Number.isInteger(definition.questionCount) || definition.questionCount < 1) throw new Error('La cantidad de preguntas debe ser un entero positivo.')
  if (!Number.isFinite(definition.passPercent) || definition.passPercent < 0 || definition.passPercent > 100) throw new Error('El porcentaje mínimo debe estar entre 0 y 100.')
  if (definition.timeLimitMinutes !== undefined && (!Number.isInteger(definition.timeLimitMinutes) || definition.timeLimitMinutes < 1)) throw new Error('El tiempo debe ser un número entero de minutos.')
  const allowedGrades = new Set(definition.gradeIds ?? catalog.gradesByStage.get(definition.stageId)?.map((g) => g.id) ?? [])
  const allowedTopics = definition.topicIds ? new Set(definition.topicIds) : null
  const allowedLessons = definition.lessonIds ? new Set(definition.lessonIds) : null
  const candidates: { lessonId: string; topicId: string; title: string; question: Exercise }[] = []
  for (const lesson of catalog.lessons) {
    const topic = catalog.topicById.get(lesson.topicId)
    const unit = topic ? catalog.unitById.get(topic.unitId) : undefined
    const grade = unit ? catalog.gradeById.get(unit.gradeId) : undefined
    if (!topic || !grade || grade.stageId !== definition.stageId || !allowedGrades.has(grade.id)) continue
    if (allowedTopics && !allowedTopics.has(topic.id)) continue
    if (allowedLessons && !allowedLessons.has(lesson.id)) continue
    if (!definition.previewDrafts && lesson.reviewStatus !== 'revisado') continue
    for (const question of lesson.exercises) candidates.push({ lessonId: lesson.id, topicId: topic.id, title: lesson.title, question })
  }
  const seed = options.seed ?? definition.id
  const selected = candidates.sort((a, b) => stableRank(a.question.id, seed) - stableRank(b.question.id, seed)).slice(0, definition.questionCount)
  if (selected.length < definition.questionCount) {
    throw new Error(`No hay suficientes preguntas disponibles: se necesitan ${definition.questionCount} y solo hay ${selected.length}. Revisa el contenido o su aprobación docente.`)
  }
  return {
    assessmentId: definition.id, title: definition.title, description: definition.description,
    passPercent: definition.passPercent, timeLimitMinutes: definition.timeLimitMinutes,
    questions: selected.map(({ lessonId, topicId, title, question }) => ({
      id: question.id, lessonId, topicId, title, type: question.type, prompt: question.prompt,
      ...(question.type === 'choice' ? { options: [...question.options] } : {}),
      ...(question.type === 'order' ? { items: [...question.items] } : {}),
      ...(question.visual ? { visual: question.visual } : {}),
    })),
  }
}

/** Corrige en servidor/dominio al entregar. Las respuestas correctas solo aparecen en el resultado final. */
export function gradeAssessment(
  catalog: Catalog,
  paper: AssessmentPaper,
  answers: AssessmentAnswers,
): AssessmentResult {
  const results = paper.questions.map((item): QuestionResult => {
    const question = catalog.lessonById.get(item.lessonId)?.exercises.find((e) => e.id === item.id)
    if (!question) throw new Error(`La pregunta «${item.id}» ya no existe en el catálogo.`)
    const correct = isCorrect(question, answers[item.id])
    return {
      questionId: item.id, correct, earnedPoints: correct ? 1 : 0,
      explanation: question.explanation, correctAnswer: answerLabel(question),
    }
  })
  const correct = results.filter((r) => r.correct).length
  const unanswered = paper.questions.filter((q) => answers[q.id] === undefined || answers[q.id] === '').length
  const scorePercent = paper.questions.length ? Math.round((correct / paper.questions.length) * 100) : 0
  return {
    assessmentId: paper.assessmentId, total: paper.questions.length, correct,
    incorrect: paper.questions.length - correct - unanswered, unanswered, scorePercent,
    passed: scorePercent >= paper.passPercent, results,
  }
}
