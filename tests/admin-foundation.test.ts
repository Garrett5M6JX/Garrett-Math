import test from 'node:test'
import assert from 'node:assert/strict'
import { rawCatalog } from '../src/library/catalog/data'
import { validateCatalog } from '../src/library/catalog/build'
import { canChangeStableId, isEditorialState, isStableSlug, parseCatalogJson } from '../src/admin/adminLogic'

test('el catálogo inicial cumple la validación existente', () => {
  assert.deepEqual(validateCatalog(rawCatalog), [])
})
test('los IDs de lección existentes son slugs únicos y estables', () => {
  const ids = rawCatalog.lessons.map(x => x.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(ids.every(isStableSlug))
  assert.ok(ids.every(id => canChangeStableId(id, id)))
  assert.equal(canChangeStableId(ids[0], 'otro-id'), false)
})
test('los estados editoriales solo aceptan el flujo documentado', () => {
  for (const s of ['borrador','en_revision','revisado','publicado','archivado']) assert.equal(isEditorialState(s), true)
  assert.equal(isEditorialState('aprobado'), false)
})
test('la importación JSON rechaza sintaxis inválida sin alterar el catálogo', () => {
  assert.throws(() => parseCatalogJson('{no-json'))
  const original = JSON.stringify(rawCatalog)
  assert.deepEqual(parseCatalogJson(JSON.stringify(rawCatalog)), rawCatalog)
  assert.equal(JSON.stringify(rawCatalog), original)
})
