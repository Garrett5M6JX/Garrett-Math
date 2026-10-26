import test from 'node:test'
import assert from 'node:assert/strict'
import { checkExercise, correctAnswerText, parseFractionInput, parseNumberInput, shuffleDeterministic } from '../src/library/logic/exercises'
import { ch, fr, nm, od } from '../src/library/catalog/helpers'

test('parseNumberInput acepta coma y punto decimal, y rechaza texto o fracciones', () => {
  assert.equal(parseNumberInput(' 12 '), 12)
  assert.equal(parseNumberInput('0,7'), 0.7)
  assert.equal(parseNumberInput('0.7'), 0.7)
  assert.equal(parseNumberInput('-3'), -3)
  for (const bad of ['', 'abc', '1/2', '1,5,2', '1e3', '12a', ',5']) assert.equal(parseNumberInput(bad), null, bad)
})
test('parseFractionInput valida a/b y rechaza denominador cero', () => {
  assert.deepEqual(parseFractionInput(' 3 / 4 '), { n: 3, d: 4 })
  for (const bad of ['3/0', '3', 'a/b', '3/4/5', '-1/2']) assert.equal(parseFractionInput(bad), null, bad)
})
test('opción múltiple: acierta, falla con explicación específica y no acepta sin elegir', () => {
  const e = { ...ch('¿?', ['a', 'b', 'c'], 1, 'x', ['h'], { wrong: { 0: 'mal por A' } }), id: 't:e1' }
  assert.equal(checkExercise(e, { type: 'choice', index: 1 }).status, 'correct')
  assert.deepEqual(checkExercise(e, { type: 'choice', index: 0 }), { status: 'incorrect', message: 'mal por A' })
  assert.equal(checkExercise(e, { type: 'choice', index: 2 }).status, 'incorrect')
  assert.equal(checkExercise(e, { type: 'choice', index: null }).status, 'invalid')
})
test('numérico: nunca acepta cualquier respuesta; vacío/ilegible no cuenta como intento', () => {
  const e = { ...nm('¿?', 0.7, 'x', ['h']), id: 't:e1' }
  assert.equal(checkExercise(e, { type: 'number', text: '0,7' }).status, 'correct')
  assert.equal(checkExercise(e, { type: 'number', text: '0.70' }).status, 'correct')
  assert.equal(checkExercise(e, { type: 'number', text: '7' }).status, 'incorrect')
  assert.equal(checkExercise(e, { type: 'number', text: '' }).status, 'invalid')
  assert.equal(checkExercise(e, { type: 'number', text: 'siete' }).status, 'invalid')
})
test('numérico con tolerancia', () => {
  const e = { ...nm('¿?', 3.14, 'x', ['h'], { tolerance: 0.01 }), id: 't:e1' }
  assert.equal(checkExercise(e, { type: 'number', text: '3,15' }).status, 'correct')
  assert.equal(checkExercise(e, { type: 'number', text: '3,2' }).status, 'incorrect')
})
test('fracción: exacta por defecto y equivalente cuando se permite', () => {
  const exact = { ...fr('¿?', 1, 2, 'x', ['h']), id: 't:e1' }
  assert.equal(checkExercise(exact, { type: 'fraction', text: '1/2' }).status, 'correct')
  const eq = checkExercise(exact, { type: 'fraction', text: '2/4' })
  assert.equal(eq.status, 'incorrect')
  assert.ok(eq.status === 'incorrect' && /equivalente/.test(eq.message ?? ''))
  assert.equal(checkExercise(exact, { type: 'fraction', text: '1/0' }).status, 'invalid')
  const loose = { ...fr('¿?', 1, 2, 'x', ['h'], { equiv: true }), id: 't:e2' }
  assert.equal(checkExercise(loose, { type: 'fraction', text: '3/6' }).status, 'correct')
  assert.equal(checkExercise(loose, { type: 'fraction', text: '2/3' }).status, 'incorrect')
})
test('ordenar: solo el orden exacto es correcto', () => {
  const e = { ...od('¿?', ['a', 'b', 'c'], 'x', ['h']), id: 't:e1' }
  assert.equal(checkExercise(e, { type: 'order', order: ['a', 'b', 'c'] }).status, 'correct')
  assert.equal(checkExercise(e, { type: 'order', order: ['a', 'c', 'b'] }).status, 'incorrect')
  assert.equal(checkExercise(e, { type: 'order', order: ['a', 'b'] }).status, 'invalid')
})
test('una respuesta de otro tipo es inválida', () => {
  const e = { ...nm('¿?', 1, 'x', ['h']), id: 't:e1' }
  assert.equal(checkExercise(e, { type: 'choice', index: 0 }).status, 'invalid')
})
test('shuffleDeterministic: mismo resultado por semilla y nunca igual al orden correcto', () => {
  const items = ['1', '2', '3', '4', '5']
  assert.deepEqual(shuffleDeterministic(items, 'x'), shuffleDeterministic(items, 'x'))
  for (let i = 0; i < 200; i++) assert.notDeepEqual(shuffleDeterministic(items, `seed-${i}`), items)
  assert.notDeepEqual(shuffleDeterministic(['a', 'b'], 's'), ['a', 'b'])
  assert.deepEqual([...shuffleDeterministic(items, 'y')].sort(), items)
  assert.deepEqual(shuffleDeterministic(['solo'], 'z'), ['solo'])
})
test('correctAnswerText', () => {
  assert.equal(correctAnswerText({ ...nm('', 0.7, '', ['h']), id: 'a' }), '0,7')
  assert.equal(correctAnswerText({ ...nm('', 20, '', ['h'], { unit: 'cm' }), id: 'a' }), '20 cm')
  assert.equal(correctAnswerText({ ...fr('', 3, 4, '', ['h']), id: 'a' }), '3/4')
  assert.equal(correctAnswerText({ ...od('', ['a', 'b'], '', ['h']), id: 'a' }), 'a → b')
})
