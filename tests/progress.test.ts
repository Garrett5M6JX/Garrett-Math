import test from 'node:test'
import assert from 'node:assert/strict'
import {
  aggregate, continueLesson, fromRemoteRow, mergeProgress, needsUpload, parseProgressMap, recordAttempt, recordReveal, recordSimpleCompletion,
  recordStep, requiredSolved, resetPractice, suggestNextLesson, toRemoteRow, topicStatus, lessonStatus, lessonsOfGrade,
} from '../src/library/logic/progress'
import { LATER, NOW, catalog, lessonOf, mapOf, record } from './fixtures'

const lesson = lessonOf('sumar-juntando') // 3 ejercicios → se requieren 3 × 0,7 = 2,1 → 3
const ids = lesson.exercises.map((e) => e.id)

test('requiredSolved: 70 % redondeado hacia arriba, respeta minSolved y nunca excede el total', () => {
  assert.equal(requiredSolved({ exercises: new Array(3).fill(null), minSolved: undefined }), 3)
  assert.equal(requiredSolved({ exercises: new Array(4).fill(null), minSolved: undefined }), 3)
  assert.equal(requiredSolved({ exercises: new Array(10).fill(null), minSolved: 5 }), 5)
  assert.equal(requiredSolved({ exercises: new Array(2).fill(null), minSolved: 9 }), 2)
  assert.equal(requiredSolved({ exercises: [], minSolved: undefined }), 0)
})
test('abrir una lección no crea progreso; sin registro el estado es «no iniciada»', () => {
  assert.equal(lessonStatus(undefined), 'not_started')
  assert.equal(recordStep(undefined, 3), undefined)
  assert.equal(recordStep(record('a', { lastStep: 1 }), 4)?.lastStep, 4)
})
test('un intento incorrecto inicia la lección, cuenta el intento y no completa', () => {
  const r = recordAttempt(undefined, lesson, ids[0], false, NOW)
  assert.equal(r.status, 'in_progress'); assert.equal(r.attempts, 1); assert.deepEqual(r.solved, []); assert.equal(r.score, 0)
})
test('se completa solo al alcanzar los ejercicios requeridos y registra puntuación real', () => {
  let r = recordAttempt(undefined, lesson, ids[0], true, NOW)
  assert.equal(r.status, 'in_progress'); assert.equal(r.score, 33)
  r = recordAttempt(r, lesson, ids[1], true, NOW)
  assert.equal(r.status, 'in_progress'); assert.equal(r.score, 67)
  r = recordAttempt(r, lesson, ids[2], true, LATER)
  assert.equal(r.status, 'completed'); assert.equal(r.score, 100); assert.equal(r.completedAt, LATER); assert.equal(r.attempts, 3)
})
test('reintentar no penaliza: tras fallar, acertar suma y la puntuación solo sube', () => {
  let r = recordAttempt(undefined, lesson, ids[0], false, NOW)
  r = recordAttempt(r, lesson, ids[0], false, NOW)
  r = recordAttempt(r, lesson, ids[0], true, NOW)
  assert.deepEqual(r.solved, [ids[0]]); assert.equal(r.attempts, 3); assert.equal(r.score, 33)
})
test('acertar dos veces el mismo ejercicio no duplica ni infla la puntuación', () => {
  let r = recordAttempt(undefined, lesson, ids[0], true, NOW)
  r = recordAttempt(r, lesson, ids[0], true, NOW)
  assert.deepEqual(r.solved, [ids[0]]); assert.equal(r.score, 33)
})
test('una lección completada nunca vuelve a «en progreso» ni pierde fecha de finalización', () => {
  let r = record(lesson.id, { status: 'completed', solved: ids, score: 100, completedAt: NOW })
  r = recordAttempt(r, lesson, ids[0], false, LATER)
  assert.equal(r.status, 'completed'); assert.equal(r.completedAt, NOW); assert.equal(r.score, 100)
})
test('revelar la respuesta no cuenta como resuelto; resolverlo después lo quita de «revelados»', () => {
  let r = recordReveal(undefined, lesson, ids[0], NOW)
  assert.deepEqual(r.revealed, [ids[0]]); assert.deepEqual(r.solved, []); assert.equal(r.status, 'in_progress')
  r = recordAttempt(r, lesson, ids[0], true, NOW)
  assert.deepEqual(r.revealed, []); assert.deepEqual(r.solved, [ids[0]])
})
test('no se puede registrar un ejercicio ajeno a la lección', () => {
  assert.throws(() => recordAttempt(undefined, lesson, 'otra:e1', true, NOW), /no pertenece/)
  assert.throws(() => recordReveal(undefined, lesson, 'otra:e1', NOW), /no pertenece/)
})
test('lecciones heredadas de una pregunta: completar da 100 % y es idempotente', () => {
  const r = recordSimpleCompletion(undefined, 'ecuacion-simple', NOW)
  assert.equal(r.status, 'completed'); assert.equal(r.score, 100)
  assert.equal(recordSimpleCompletion(r, 'ecuacion-simple', LATER), r)
})
test('resetPractice conserva la finalización y limpia ejercicios', () => {
  const r = resetPractice(record('x', { status: 'completed', solved: ['a'], revealed: ['b'], lastStep: 5 }), LATER)!
  assert.equal(r.status, 'completed'); assert.deepEqual(r.solved, []); assert.equal(r.lastStep, 0)
})
test('mergeProgress: la unión nunca pierde avance (completada gana, puntuación máxima, ejercicios unidos)', () => {
  const local = mapOf(record('a', { solved: ['a:e1'], attempts: 4, score: 33, updatedAt: LATER }), record('solo-local'))
  const remote = mapOf(record('a', { status: 'completed', score: 100, completedAt: NOW, updatedAt: NOW }), record('solo-remota', { status: 'completed', completedAt: NOW }))
  const m = mergeProgress(local, remote)
  assert.equal(m.a.status, 'completed'); assert.equal(m.a.score, 100); assert.equal(m.a.attempts, 4); assert.deepEqual(m.a.solved, ['a:e1']); assert.equal(m.a.completedAt, NOW)
  assert.ok(m['solo-local'] && m['solo-remota'])
  assert.deepEqual(mergeProgress(m, m).a, m.a, 'idempotente')
})
test('needsUpload solo cuando aporta algo nuevo', () => {
  const done = record('a', { status: 'completed', score: 100 })
  assert.equal(needsUpload(done, undefined), true)
  assert.equal(needsUpload(done, record('a')), true)
  assert.equal(needsUpload(done, record('a', { status: 'completed', score: 100 })), false)
  assert.equal(needsUpload(record('a', { score: 40 }), record('a', { score: 60 })), false)
})
test('conversión con learning_progress y lectura tolerante', () => {
  const row = toRemoteRow('u1', record('a', { status: 'completed', score: 80, updatedAt: NOW }))
  assert.deepEqual(row, { user_id: 'u1', lesson_id: 'a', status: 'completed', score: 80, updated_at: NOW })
  assert.equal(fromRemoteRow({ lesson_id: 'a', status: 'completed', score: '95.50', updated_at: NOW })?.score, 95.5)
  assert.equal(fromRemoteRow({ lesson_id: 'a', status: 'raro', score: null, updated_at: NOW }), null)
  assert.equal(fromRemoteRow({ lesson_id: 'a', status: 'in_progress', score: null, updated_at: NOW })?.score, null)
  const parsed = parseProgressMap({ ok: { status: 'completed', score: 150, attempts: -2, solved: ['x', 3] }, mal: { status: 'otro' }, peor: 5 })
  assert.deepEqual(Object.keys(parsed), ['ok']); assert.equal(parsed.ok.score, 100); assert.equal(parsed.ok.attempts, 0); assert.deepEqual(parsed.ok.solved, ['x'])
  assert.deepEqual(parseProgressMap(null), {}); assert.deepEqual(parseProgressMap('x'), {})
})
test('agregados por tema, grado y estado', () => {
  const topicLessons = catalog.lessonsByTopic.get('pri-1-sumar-restar')!
  assert.equal(topicLessons.length, 2)
  const map = mapOf(record('sumar-juntando', { status: 'completed' }), record('restar-quitar'))
  const agg = aggregate(topicLessons, map)
  assert.deepEqual(agg, { total: 2, completed: 1, inProgress: 1, percent: 50 })
  assert.equal(topicStatus(agg), 'in_progress')
  assert.equal(topicStatus(aggregate(topicLessons, {})), 'not_started')
  assert.equal(topicStatus(aggregate([], {})), 'planned')
  assert.equal(topicStatus(aggregate(topicLessons, mapOf(record('sumar-juntando', { status: 'completed' }), record('restar-quitar', { status: 'completed' })))), 'completed')
  assert.equal(aggregate(lessonsOfGrade(catalog, 'pri-1'), {}).percent, 0)
})
test('continuar: devuelve la lección en progreso más reciente', () => {
  const map = mapOf(record('sumar-juntando', { updatedAt: NOW }), record('restar-quitar', { updatedAt: LATER }), record('contar-hasta-5', { status: 'completed', updatedAt: LATER }))
  assert.equal(continueLesson(catalog, map)?.id, 'restar-quitar')
  assert.equal(continueLesson(catalog, {}), undefined)
  assert.equal(continueLesson(catalog, mapOf(record('no-existe'))), undefined)
})
test('siguiente sugerida: primera lección pendiente, preferentemente del grado, respetando prerrequisitos', () => {
  assert.equal(suggestNextLesson(catalog, {})?.id, 'contar-hasta-3')
  const first = suggestNextLesson(catalog, {}, 'pri-1')!
  assert.equal(first.topicId, 'pri-1-leer-escribir-20')
  const next = suggestNextLesson(catalog, mapOf(record('sumar-juntando', { status: 'completed' })), 'pri-1')!
  assert.notEqual(next.id, 'sumar-juntando')
  assert.equal(suggestNextLesson(catalog, Object.fromEntries(catalog.lessons.map((l) => [l.id, record(l.id, { status: 'completed' })]))), undefined)
})
