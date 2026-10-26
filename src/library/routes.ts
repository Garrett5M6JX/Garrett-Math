/** Rutas estables de la Biblioteca. Los identificadores son slugs del catálogo. */
export const libRoutes = {
  home: '/biblioteca',
  myLearning: '/mi-aprendizaje',
  stage: (id: string) => `/biblioteca/etapa/${encodeURIComponent(id)}`,
  grade: (id: string) => `/biblioteca/grado/${encodeURIComponent(id)}`,
  topic: (id: string) => `/biblioteca/tema/${encodeURIComponent(id)}`,
  lesson: (id: string) => `/biblioteca/leccion/${encodeURIComponent(id)}`,
} as const

export type LibraryRoute =
  | { name: 'home' } | { name: 'my-learning' }
  | { name: 'stage' | 'grade' | 'topic' | 'lesson'; id: string }
  | { name: 'not-found' }

export function isLibraryPath(pathname: string): boolean {
  return pathname === libRoutes.myLearning || pathname === libRoutes.home || pathname.startsWith(`${libRoutes.home}/`)
}
export function parseLibraryPath(pathname: string): LibraryRoute {
  const clean = pathname.replace(/\/+$/, '') || '/'
  if (clean === libRoutes.myLearning) return { name: 'my-learning' }
  if (clean === libRoutes.home) return { name: 'home' }
  const match = /^\/biblioteca\/(etapa|grado|tema|leccion)\/([^/]+)$/.exec(clean)
  if (!match) return { name: 'not-found' }
  let id: string
  try { id = decodeURIComponent(match[2]) } catch { return { name: 'not-found' } }
  const name = ({ etapa: 'stage', grado: 'grade', tema: 'topic', leccion: 'lesson' } as const)[match[1] as 'etapa' | 'grado' | 'tema' | 'leccion']
  return { name, id }
}
const LAST_KEY = 'gm-lib-last'
/** Recuerda la última vista de la Biblioteca (con filtros) para volver sin perderlos. */
export function rememberLibraryUrl(url: string): void { try { sessionStorage.setItem(LAST_KEY, url) } catch { /* opcional */ } }
export function lastLibraryUrl(): string {
  try { const v = sessionStorage.getItem(LAST_KEY); return v && v.startsWith(libRoutes.home) ? v : libRoutes.home } catch { return libRoutes.home }
}
