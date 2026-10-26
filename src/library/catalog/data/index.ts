import type { RawCatalog } from '../../types'
import { withLessonOrder } from '../helpers'
import { areas, grades, stages, units } from './structure'
import { topics } from './topics'
import { preescolarLessons } from './lessons-preescolar'
import { primaria1a3Lessons } from './lessons-primaria-1-3'
import { primaria4a6Lessons } from './lessons-primaria-4-6'

/** Catálogo inicial en bruto. Para migrar a una base de datos, basta con servir este mismo objeto desde un repositorio remoto. */
export const rawCatalog: RawCatalog = {
  stages, grades, areas, units, topics,
  lessons: withLessonOrder([...preescolarLessons, ...primaria1a3Lessons, ...primaria4a6Lessons]),
}
