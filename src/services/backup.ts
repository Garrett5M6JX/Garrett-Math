/** Exportación/importación de una copia local. No contiene secretos ni sincroniza datos. */
const BACKUP_KEYS = [
  'garrett-math-demo-account', 'garrett-math-stage', 'garrett-math-year',
  'garrett-math-completed', 'garrett-math-theme', 'garrett-math-child-profiles',
] as const
export type GarrettBackup = { app: 'Garrett Math'; schemaVersion: 1; exportedAt: string; data: Record<string, string | null> }
export function createBackup(): GarrettBackup {
  const data: Record<string, string | null> = {}
  for (const key of BACKUP_KEYS) data[key] = localStorage.getItem(key)
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
export function restoreBackup(file: File): Promise<void> {
  return file.text().then((text) => {
    const parsed: unknown = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object') throw new Error('El archivo no tiene el formato esperado.')
    const backup = parsed as Partial<GarrettBackup>
    if (backup.app !== 'Garrett Math' || backup.schemaVersion !== 1 || !backup.data || typeof backup.data !== 'object') throw new Error('El archivo no es una copia compatible de Garrett Math.')
    for (const key of BACKUP_KEYS) {
      const value = backup.data[key]
      if (value === null || typeof value === 'string') {
        if (value === null) localStorage.removeItem(key)
        else localStorage.setItem(key, value)
      }
    }
  })
}
