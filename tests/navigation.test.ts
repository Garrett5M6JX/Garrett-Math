import test from 'node:test'
import assert from 'node:assert/strict'
import { dependentTopics, lessonNeighbors, prerequisiteTopics, relatedTopics, topicNeighbors } from '../src/library/logic/navigation'
import { catalog } from './fixtures'

test('tema anterior/siguiente sigue la trayectoria del área y salta temas sin lecciones', () => {
  const n = topicNeighbors(catalog, 'pri-4-equivalentes')
  assert.equal(n.prev?.id, 'pri-3-partes-iguales')
  assert.ok(n.next && (catalog.lessonsByTopic.get(n.next.id)?.length ?? 0) > 0)
  assert.notEqual(n.next?.id, 'pri-4-comparar-fracciones', 'omite el tema en preparación')
  assert.equal(topicNeighbors(catalog, 'pre-3-uno-dos-tres').prev, undefined)
  assert.deepEqual(topicNeighbors(catalog, 'no-existe'), {})
})
test('prerrequisitos y dependientes', () => {
  const t = catalog.topicById.get('pri-4-equivalentes')!
  assert.deepEqual(prerequisiteTopics(catalog, t).map((x) => x.id), ['pri-3-partes-iguales'])
  assert.ok(dependentTopics(catalog, 'pri-4-equivalentes').some((x) => x.id === 'pri-5-sumar-fracciones'))
  assert.ok(prerequisiteTopics(catalog, catalog.topicById.get('pri-1-leer-escribir-20')!).some((x) => x.id.startsWith('pre-')), 'hay prerrequisitos entre etapas')
})
test('temas relacionados: excluyen el propio tema, solo con lecciones y priorizan afinidad', () => {
  const rel = relatedTopics(catalog, 'pri-4-equivalentes', 4)
  assert.ok(rel.length > 0 && rel.length <= 4)
  assert.ok(rel.every((t) => t.id !== 'pri-4-equivalentes' && (catalog.lessonsByTopic.get(t.id)?.length ?? 0) > 0))
  assert.ok(rel.some((t) => t.id === 'pri-5-sumar-fracciones' || t.id === 'pri-3-partes-iguales'))
  assert.deepEqual(relatedTopics(catalog, 'no-existe'), [])
})
test('lección anterior/siguiente dentro del tema y salto al siguiente tema al terminar', () => {
  const n = lessonNeighbors(catalog, 'sumar-juntando')
  assert.equal(n.prev, undefined); assert.equal(n.next?.id, 'restar-quitar')
  const last = lessonNeighbors(catalog, 'restar-quitar')
  assert.equal(last.prev?.id, 'sumar-juntando'); assert.equal(last.next, undefined)
  assert.ok(last.nextTopicFirst === undefined || catalog.lessonById.has(last.nextTopicFirst.id))
  assert.deepEqual(lessonNeighbors(catalog, 'zzz'), {})
})
