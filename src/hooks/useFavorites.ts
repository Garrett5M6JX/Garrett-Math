import { useCallback, useEffect, useMemo, useState } from 'react'

const key = (scope: string) => `garrett-math-favorites:${scope}`
function load(scope: string): string[] {
  try { const raw = JSON.parse(localStorage.getItem(key(scope)) || '[]') as unknown; return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [] } catch { return [] }
}
export type FavoritesApi = { ids: ReadonlySet<string>; has: (id: string) => boolean; toggle: (id: string) => boolean }

/** Temas guardados. Se almacenan solo en este navegador (por usuario), no se sincronizan con la nube. */
export function useFavorites(userId: string | null): FavoritesApi {
  const scope = userId ?? 'demo'
  const [state, setState] = useState(() => ({ scope, list: load(scope) }))
  if (state.scope !== scope) setState({ scope, list: load(scope) })
  useEffect(() => { try { localStorage.setItem(key(state.scope), JSON.stringify(state.list)) } catch { /* opcional */ } }, [state])
  const ids = useMemo(() => new Set(state.list), [state.list])
  const toggle = useCallback((id: string) => {
    const adding = !ids.has(id)
    setState((prev) => ({ scope: prev.scope, list: prev.list.includes(id) ? prev.list.filter((x) => x !== id) : [...prev.list, id] }))
    return adding
  }, [ids])
  return useMemo(() => ({ ids, has: (id: string) => ids.has(id), toggle }), [ids, toggle])
}
