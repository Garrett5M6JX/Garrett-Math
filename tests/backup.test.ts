import test from 'node:test'
import assert from 'node:assert/strict'
import { applyBackup, createBackup, isBackupKey } from '../src/services/backup'
import { describeSyncError } from '../src/services/syncErrors'

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  return {
    get length() { return map.size }, key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v) }, removeItem: (k: string) => { map.delete(k) }, map,
  }
}
test('la copia incluye el progreso de la Biblioteca y los temas guardados, y nada ajeno', () => {
  const storage = fakeStorage({ 'garrett-math-progress-v2:demo': '{"a":1}', 'garrett-math-favorites:demo': '["x"]', 'garrett-math-progress-v2:abc-123': '{}', 'sb-proyecto-auth-token': 'SECRETO', 'otra-clave': 'x' })
  const backup = createBackup(storage)
  assert.equal(backup.data['garrett-math-progress-v2:demo'], '{"a":1}')
  assert.equal(backup.data['garrett-math-favorites:demo'], '["x"]')
  assert.ok('garrett-math-progress-v2:abc-123' in backup.data)
  assert.ok(!('sb-proyecto-auth-token' in backup.data), 'nunca se exportan tokens de sesión')
  assert.ok(!('otra-clave' in backup.data))
})
test('restaurar solo escribe claves permitidas; una copia antigua sin claves nuevas no borra el progreso nuevo', () => {
  const storage = fakeStorage({ 'garrett-math-progress-v2:demo': 'NUEVO' })
  const old = { app: 'Garrett Math', schemaVersion: 1, exportedAt: 'x', data: { 'garrett-math-stage': 'Primaria', 'garrett-math-completed': '["a"]', 'sb-token': 'MALICIOSO', '__proto__': 'x', 'garrett-math-progress-v2:../x': 'no' } }
  const applied = applyBackup(old, storage)
  assert.equal(applied, 2)
  assert.equal(storage.map.get('garrett-math-progress-v2:demo'), 'NUEVO')
  assert.equal(storage.map.get('garrett-math-stage'), 'Primaria')
  assert.ok(!storage.map.has('sb-token'))
  assert.ok(!isBackupKey('garrett-math-progress-v2:../x'))
})
test('restaurar rechaza archivos que no son una copia de Garrett Math', () => {
  assert.throws(() => applyBackup(null, fakeStorage()), /formato/)
  assert.throws(() => applyBackup({ app: 'Otra', schemaVersion: 1, data: {} }, fakeStorage()), /compatible/)
})
test('describeSyncError traduce los fallos habituales a mensajes accionables', () => {
  assert.match(describeSyncError(new TypeError('Failed to fetch')), /Sin conexión/)
  assert.match(describeSyncError({ code: '42P01', message: 'relation "learning_progress" does not exist' }), /no existe/)
  assert.match(describeSyncError({ code: '42501', message: 'new row violates row-level security policy' }), /RLS/)
  assert.match(describeSyncError({ status: 401, message: 'Invalid API key' }), /clave pública|sesión/)
  assert.match(describeSyncError({ message: 'algo raro' }), /algo raro/)
})
