import test from 'node:test'
import assert from 'node:assert/strict'
import { validateCatalog } from '../src/library/catalog/build'
import { rawCatalog } from '../src/library/catalog/data'
import { catalog, clone } from './fixtures'

test('el catálogo incluido es válido (referencias, ejercicios, pistas, textos alternativos)', () => {
  assert.deepEqual(validateCatalog(rawCatalog), [])
})
test('el catálogo contiene solo Preescolar y Primaria con contenido real', () => {
  assert.deepEqual(catalog.stages.map((s) => s.id), ['preescolar', 'primaria'])
  assert.equal(catalog.gradesByStage.get('preescolar')?.length, 3)
  assert.equal(catalog.gradesByStage.get('primaria')?.length, 6)
  assert.ok(catalog.lessons.length >= 40, `lecciones: ${catalog.lessons.length}`)
  for (const grade of catalog.grades) {
    const count = [...(catalog.unitsByGrade.get(grade.id) ?? [])].flatMap((u) => catalog.topicsByUnit.get(u.id) ?? []).flatMap((t) => catalog.lessonsByTopic.get(t.id) ?? []).length
    assert.ok(count >= 3, `el grado ${grade.id} tiene solo ${count} lecciones`)
  }
})
test('todo el contenido está marcado como borrador (ninguna revisión docente declarada)', () => {
  assert.ok(catalog.lessons.every((l) => l.reviewStatus === 'borrador'))
})
test('se conservan los identificadores de lecciones de versiones anteriores (para no perder progreso)', () => {
  for (const id of ['contar-hasta-5', 'numero-siguiente', 'sumar-juntando', 'restar-quitar']) assert.ok(catalog.lessonById.has(id), id)
})
test('cada tema con lecciones tiene lección introductoria con práctica', () => {
  for (const topic of catalog.topics) {
    const lessons = catalog.lessonsByTopic.get(topic.id) ?? []
    for (const l of lessons) assert.ok(l.exercises.length >= 2 && l.sections.length >= 1, l.id)
  }
})
test('el mapa curricular marca como «en preparación» los temas sin lecciones y estos existen', () => {
  const planned = catalog.topics.filter((t) => !(catalog.lessonsByTopic.get(t.id)?.length))
  assert.ok(planned.length > 10)
  assert.ok(planned.every((t) => t.description.length > 10))
})
test('verificación aritmética: los ejercicios numéricos de una sola operación tienen la respuesta correcta', () => {
  let checked = 0
  for (const lesson of catalog.lessons) for (const e of lesson.exercises) {
    if (e.type !== 'number') continue
    const ops = e.prompt.match(/[+−×÷]/g) ?? []
    const m = /(\d+)\s*([+−×÷])\s*(\d+)/.exec(e.prompt)
    if (ops.length !== 1 || !m) continue
    const [a, b] = [Number(m[1]), Number(m[3])]
    const expected = m[2] === '+' ? a + b : m[2] === '−' ? a - b : m[2] === '×' ? a * b : a / b
    assert.equal(e.answer, expected, `${e.id}: ${e.prompt}`)
    checked++
  }
  assert.ok(checked >= 10, `solo se verificaron ${checked}`)
})
test('el validador detecta datos rotos', () => {
  const broken = clone(rawCatalog)
  broken.lessons[0].exercises[0] = { ...broken.lessons[0].exercises[0], type: 'choice', options: ['a', 'b'], answerIndex: 5 } as never
  broken.topics[1].prerequisites = ['no-existe']
  broken.lessons[1].id = broken.lessons[2].id
  const errors = validateCatalog(broken).join('\n')
  assert.match(errors, /answerIndex fuera de rango/)
  assert.match(errors, /prerrequisito «no-existe» inexistente/)
  assert.match(errors, /identificador duplicado/)
})
test('el validador detecta ciclos de prerrequisitos y prerrequisitos de grados posteriores', () => {
  const cyc = clone(rawCatalog)
  const a = cyc.topics.find((t) => t.id === 'pre-4-contar-5')!
  const b = cyc.topics.find((t) => t.id === 'pre-3-uno-dos-tres')!
  b.prerequisites = [a.id]
  const errors = validateCatalog(cyc).join('\n')
  assert.match(errors, /ciclo/)
  assert.match(errors, /grado posterior/)
})
test('el validador exige texto alternativo en los visuales', () => {
  const noAlt = clone(rawCatalog)
  const s = noAlt.lessons[0].sections[0]
  s.visual = { kind: 'tenFrame', filled: 3, alt: '  ' }
  assert.match(validateCatalog(noAlt).join('\n'), /texto alternativo/)
})
