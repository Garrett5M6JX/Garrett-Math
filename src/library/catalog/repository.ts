import type { Catalog } from '../types'
import { buildCatalog, validateCatalog } from './build'

/**
 * Frontera de acceso al catálogo. Hoy lo sirve el propio paquete (contenido estático, cargado de forma diferida
 * para no engordar el bundle inicial). Para migrar a una base de datos basta con otra implementación de esta interfaz.
 */
export interface CatalogRepository { load(): Promise<Catalog> }

export const bundledCatalogRepository: CatalogRepository = {
  async load() {
    const { rawCatalog } = await import('./data')
    const errors = validateCatalog(rawCatalog)
    if (errors.length > 0) throw new Error(`El catálogo contiene ${errors.length} errores de contenido. Primer error: ${errors[0]}`)
    return buildCatalog(rawCatalog)
  },
}
