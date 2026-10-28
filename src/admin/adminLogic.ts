export const EDITORIAL_STATES = ['borrador', 'en_revision', 'revisado', 'publicado', 'archivado'] as const
export type EditorialState = typeof EDITORIAL_STATES[number]
export function isStableSlug(value: string): boolean { return /^[a-z0-9][a-z0-9-]*$/.test(value) }
export function canChangeStableId(originalId: string | null, nextId: string): boolean {
  return isStableSlug(nextId) && (originalId === null || originalId === nextId)
}
export function isEditorialState(value: string): value is EditorialState {
  return (EDITORIAL_STATES as readonly string[]).includes(value)
}
export function parseCatalogJson(text: string): unknown {
  return JSON.parse(text) as unknown
}
