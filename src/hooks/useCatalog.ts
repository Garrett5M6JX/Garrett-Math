import { useCallback, useEffect, useState } from 'react'
import type { Catalog } from '../library/types'
import { bundledCatalogRepository, type CatalogRepository } from '../library/catalog/repository'

export type CatalogState = { status: 'loading' } | { status: 'ready'; catalog: Catalog } | { status: 'error'; error: string }

let cache: Promise<Catalog> | null = null
function load(repository: CatalogRepository): Promise<Catalog> {
  if (!cache) cache = repository.load().catch((error) => { cache = null; throw error })
  return cache
}

/** Carga el catálogo (una sola vez por sesión) con estados de carga y error reintentables. */
export function useCatalog(repository: CatalogRepository = bundledCatalogRepository): CatalogState & { retry: () => void } {
  const [state, setState] = useState<CatalogState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    setState({ status: 'loading' })
    load(repository).then((catalog) => { if (alive) setState({ status: 'ready', catalog }) })
      .catch((error: unknown) => { if (alive) setState({ status: 'error', error: error instanceof Error ? error.message : 'No se pudo cargar el catálogo.' }) })
    return () => { alive = false }
  }, [repository, attempt])
  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry }
}
