import test from 'node:test'
import assert from 'node:assert/strict'
import { buildAssessment, gradeAssessment } from '../src/assessments/engine'
import type { AssessmentDefinition } from '../src/assessments/engine'
import { catalog } from './fixtures'

const definition: AssessmentDefinition = {
  id: 'diagnostico-sec-1', title: 'Diagnóstico de Secundaria',
  description: 'Comprobación inicial de conceptos.', stageId: 'secundaria',
  gradeIds: ['sec-1'], questionCount: 3, passPercent: 60, previewDrafts: true,
}

test('construye un examen sin incluir respuestas correctas', () => {
  const paper = buildAssessment(catalog, definition, { seed: 'grupo-1' })
  assert.equal(paper.questions.length, 3)
  for (const q of paper.questions) {
    assert.ok(!('answer' in q) && !('answerIndex' in q) && !('explanation' in q))
    assert.ok(q.lessonId.startsWith('sec-'))
  }
})
test('la selección es reproducible para la misma semilla', () => {
  const a = buildAssessment(catalog, definition, { seed: 'same' })
  const b = buildAssessment(catalog, definition, { seed: 'same' })
  assert.deepEqual(a.questions.map((q) => q.id), b.questions.map((q) => q.id))
})
test('no entrega contenido en borrador como evaluación oficial', () => {
  const official = { ...definition, previewDrafts: false }
  assert.throws(() => buildAssessment(catalog, official), /aprobación docente/)
})
test('rechaza configuraciones y cantidades imposibles', () => {
  assert.throws(() => buildAssessment(catalog, { ...definition, questionCount: 0 }), /entero positivo/)
  assert.throws(() => buildAssessment(catalog, { ...definition, passPercent: 120 }), /entre 0 y 100/)
  assert.throws(() => buildAssessment(catalog, { ...definition, questionCount: 999 }), /No hay suficientes preguntas/)
})
test('corrige selección múltiple y deja respuestas sin contestar como incorrectas', () => {
  const paper = buildAssessment(catalog, definition, { seed: 'grade-choice' })
  const choice = paper.questions.find((q) => q.type === 'choice')
  if (!choice) return
  const result = gradeAssessment(catalog, paper, { [choice.id]: 1 })
  assert.equal(result.total, 3)
  assert.equal(result.unanswered, 2)
  assert.equal(result.correct + result.incorrect + result.unanswered, result.total)
})
test('el resultado conserva la suma de aciertos, errores y no respondidas', () => {
  const paper = buildAssessment(catalog, definition, { seed: 'grade-balance' })
  const result = gradeAssessment(catalog, paper, {})
  assert.equal(result.correct, 0)
  assert.equal(result.unanswered, paper.questions.length)
  assert.equal(result.incorrect, 0)
  assert.equal(result.scorePercent, 0)
  assert.equal(result.passed, false)
})
