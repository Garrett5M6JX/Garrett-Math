import { useMemo, useSyncExternalStore } from 'react'

/** Evento propio para que todos los componentes sepan que cambió la URL sin recargar la página. */
const EVENT = 'gm:navigate'

export function navigateTo(url: string, options: { replace?: boolean } = {}): void {
  const current = window.location.pathname + window.location.search
  if (current !== url) {
    if (options.replace) window.history.replaceState({}, '', url)
    else window.history.pushState({}, '', url)
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('popstate', callback)
  window.addEventListener(EVENT, callback)
  return () => { window.removeEventListener('popstate', callback); window.removeEventListener(EVENT, callback) }
}
const snapshot = () => window.location.pathname + window.location.search

/** Ubicación actual reactiva (ruta y query). */
export function useLocationState(): { pathname: string; search: string } {
  const value = useSyncExternalStore(subscribe, snapshot, () => '/')
  return useMemo(() => {
    const index = value.indexOf('?')
    return index < 0 ? { pathname: value, search: '' } : { pathname: value.slice(0, index), search: value.slice(index) }
  }, [value])
}
export const NAVIGATE_EVENT = EVENT
