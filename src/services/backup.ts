/** Exportación/importación de una copia local. No contiene secretos ni sincroniza datos. */
const FIXED_KEYS = [
  'garrett-math-demo-account', 'garrett-math-stage', 'garrett-math-year',
  'garrett-math-completed', 'garrett-math-theme', 'garrett-math-child-profiles',
] as const
/** Progreso y temas guardados de la Biblioteca (uno por usuario o «demo»). Solo se aceptan claves con este formato exacto. */
const DYNAMIC_KEY = /^garrett-math-(progress-v2|favorites):[A-Za-z0-9_-]{1,64}$/
export const isBackupKey = (key: string): boolean => (FIXED_KEYS as readonly string[]).includes(key) || DYNAMIC_KEY.test(key)

export type GarrettBackup = { app: 'Garrett Math'; schemaVersion: 1; exportedAt: string; data: Record<string, string | null> }

function storedKeys(storage: Pick<Storage, 'length' | 'key'>): string[] {
  const keys: string[] = []
  for (let i = 0; i < storage.length; i++) { const key = storage.key(i); if (key && DYNAMIC_KEY.test(key)) keys.push(key) }
  return keys
}
export function createBackup(storage: Pick<Storage, 'length' | 'key' | 'getItem'> = localStorage): GarrettBackup {
  const data: Record<string, string | null> = {}
  for (const key of [...FIXED_KEYS, ...storedKeys(storage)]) data[key] = storage.getItem(key)
  return { app: 'Garrett Math', schemaVersion: 1, exportedAt: new Date().toISOString(), data }
}
export function downloadBackup(): void {
  const payload = JSON.stringify(createBackup(), null, 2)
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `garrett-math-respaldo-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url)
}
/** Aplica una copia ya leída. Ignora claves desconocidas (no escribe nada fuera de la lista permitida). */
export function applyBackup(parsed: unknown, storage: Pick<Storage, 'setItem' | 'removeItem'> = localStorage): number {
  if (!parsed || typeof parsed !== 'object') throw new Error('El archivo no tiene el formato esperado.')
  const backup = parsed as Partial<GarrettBackup>
  if (backup.app !== 'Garrett Math' || backup.schemaVersion !== 1 || !backup.data || typeof backup.data !== 'object') throw new Error('El archivo no es una copia compatible de Garrett Math.')
  let applied = 0
  for (const [key, value] of Object.entries(backup.data)) {
    if (!isBackupKey(key)) continue
    if (value === null) { storage.removeItem(key); applied++ } else if (typeof value === 'string') { storage.setItem(key, value); applied++ }
  }
  return applied
}
export function restoreBackup(file: File): Promise<void> {
  return file.text().then((text) => { applyBackup(JSON.parse(text) as unknown) })
}
