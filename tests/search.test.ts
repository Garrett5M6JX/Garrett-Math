import test from 'node:test'
import assert from 'node:assert/strict'
import { activeFilterCount, filtersFromSearch, filtersToSearch, searchTopics, type LibraryFilters } from '../src/library/logic/search'
import { normalizeText, tokenize } from '../src/library/logic/text'
import { catalog, mapOf, record } from './fixtures'

const ids = (f: Partial<LibraryFilters>, ctx = {}) => searchTopics(catalog, { q: '', ...f }, ctx).map((r) => r.topic.id)

test('normalización: sin tildes, mayúsculas ni signos; plurales reducidos', () => {
  assert.equal(normalizeText('  ¿Triángulo, PEQUEÑO? '), 'triangulo pequeno')
  assert.deepEqual(tokenize('Fracciones equivalentes'), ['fraccion', 'equivalent'])
  assert.equal(tokenize('fracción')[0], tokenize('fracciones')[0])
})
test('la búsqueda encuentra por título, concepto, etiqueta, descripción y lección', () => {
  assert.ok(ids({ q: 'fracciones' }).includes('pri-3-partes-iguales'))
  assert.ok(ids({ q: 'denominador' }).includes('pri-3-partes-iguales'), 'por concepto en la lección')
  assert.ok(ids({ q: 'suma repetida' }).includes('pri-2-grupos-iguales'), 'por etiqueta')
  assert.ok(ids({ q: 'cuenta regresiva' }).includes('pre-5-hasta-10'), 'conteo descendente')
  assert.ok(ids({ q: 'promedio' }).includes('pri-6-media'), 'sinónimo en etiquetas')
})
test('ignora tildes y mayúsculas y entiende prefijos', () => {
  assert.deepEqual(ids({ q: 'TRIÁNGULO' }), ids({ q: 'triangulo' }))
  assert.ok(ids({ q: 'triangulo' }).includes('pre-3-formas'))
  assert.ok(ids({ q: 'fracc' }).includes('pri-3-partes-iguales'))
})
test('todos los términos deben coincidir y una consulta absurda no devuelve nada', () => {
  assert.equal(ids({ q: 'fracciones triangulo' }).length, 0)
  assert.equal(ids({ q: 'xyzqwerty' }).length, 0)
  assert.ok(ids({ q: 'decenas unidades' }).includes('pri-1-decenas-unidades'))
})
test('el título pesa más que otras coincidencias', () => {
  const results = searchTopics(catalog, { q: 'area' })
  assert.equal(results[0].topic.id, 'pri-4-area')
})
test('sin texto devuelve solo temas disponibles, en orden curricular', () => {
  const all = ids({})
  assert.ok(all.length > 20)
  assert.ok(all.every((id) => (catalog.lessonsByTopic.get(id)?.length ?? 0) > 0))
  assert.equal(all[0], 'pre-3-uno-dos-tres')
  const withPlanned = ids({ includePlanned: true })
  assert.ok(withPlanned.length > all.length)
  assert.ok(searchTopics(catalog, { q: '', includePlanned: true }).some((r) => !r.available))
})
test('el filtro por etapa, grado, área y unidad modifica los resultados', () => {
  const pre = ids({ stage: 'preescolar' }); const pri = ids({ stage: 'primaria' })
  assert.ok(pre.every((id) => id.startsWith('pre-'))); assert.ok(pri.every((id) => id.startsWith('pri-')))
  assert.equal(pre.length + pri.length, ids({}).length)
  assert.ok(ids({ grade: 'pri-4' }).every((id) => id.startsWith('pri-4-')))
  const frac = ids({ area: 'fracciones' })
  assert.equal(frac.length, 4); assert.ok(ids({ area: 'fracciones', includePlanned: true }).length > frac.length); assert.ok(frac.every((id) => catalog.unitById.get(catalog.topicById.get(id)!.unitId)!.areaId === 'fracciones'))
  assert.deepEqual(ids({ unit: 'pri-4-fracciones' }), ['pri-4-equivalentes', 'pri-4-decimos'])
  assert.deepEqual(ids({ stage: 'preescolar', grade: 'pri-4' }), [])
})
test('el filtro por dificultad y por tipo de actividad funciona', () => {
  assert.ok(ids({ difficulty: 1 }).length > 0 && ids({ difficulty: 1 }).every((id) => catalog.topicById.get(id)!.difficulty === 1))
  const ordering = ids({ activity: 'order' })
  assert.ok(ordering.includes('pre-4-secuencias') && !ordering.includes('pri-3-partes-iguales'))
  assert.ok(ids({ activity: 'fraction' }).includes('pri-3-partes-iguales'))
})
test('los filtros se combinan con la búsqueda de texto', () => {
  assert.deepEqual(ids({ q: 'fracciones', grade: 'pri-4' }).sort(), ['pri-4-decimos', 'pri-4-equivalentes'].sort())
  assert.equal(ids({ q: 'fracciones', stage: 'preescolar' }).length, 0)
})
test('filtro por estado y favoritos usan el contexto real', () => {
  const progress = mapOf(record('sumar-juntando', { status: 'completed' }), record('restar-quitar', { status: 'completed' }), record('decenas-y-unidades'))
  assert.deepEqual(ids({ status: 'completed' }, { progress }), ['pri-1-sumar-restar'])
  assert.deepEqual(ids({ status: 'in_progress' }, { progress }), ['pri-1-decenas-unidades'])
  assert.ok(!ids({ status: 'not_started' }, { progress }).includes('pri-1-sumar-restar'))
  assert.deepEqual(ids({ favoritesOnly: true }, { favorites: new Set(['pri-4-area', 'tema-inexistente']) }), ['pri-4-area'])
  assert.deepEqual(ids({ favoritesOnly: true }, { favorites: new Set() }), [])
})
test('las lecciones coincidentes se devuelven para mostrarlas', () => {
  const r = searchTopics(catalog, { q: 'sumar es juntar' }).find((x) => x.topic.id === 'pri-1-sumar-restar')!
  assert.ok(r.matchedLessons.some((l) => l.id === 'sumar-juntando'))
})
test('filtros ⇄ URL: ida y vuelta, valores inválidos descartados, coherencia grado/etapa', () => {
  const f: LibraryFilters = { q: 'fracciones', stage: 'primaria', grade: 'pri-4', area: 'fracciones', difficulty: 2, activity: 'fraction', status: 'in_progress', favoritesOnly: true, includePlanned: true }
  const s = filtersToSearch(f)
  assert.deepEqual(filtersFromSearch(s, catalog), f)
  assert.equal(filtersToSearch({ q: '' }), '')
  assert.deepEqual(filtersFromSearch('?etapa=secundaria&grado=zzz&dificultad=9&tipo=otro&estado=raro', catalog), { q: '' })
  assert.equal(filtersFromSearch('?etapa=preescolar&grado=pri-4', catalog).grade, undefined)
  assert.equal(filtersFromSearch('?grado=pri-4&unidad=pri-3-medida', catalog).unit, undefined)
  assert.equal(filtersFromSearch('?q=' + 'a'.repeat(500)).q.length, 100)
  assert.equal(activeFilterCount(f), 8)
})
