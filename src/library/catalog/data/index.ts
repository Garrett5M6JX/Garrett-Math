import type { RawCatalog } from '../../types'
import { withLessonOrder } from '../helpers.js'
import { areas, grades, stages, units } from './structure.js'
import { topics } from './topics.js'
import { preescolarLessons } from './lessons-preescolar.js'
import { primaria1a3Lessons } from './lessons-primaria-1-3.js'
import { primaria4a6Lessons } from './lessons-primaria-4-6.js'

/** Catálogo inicial en bruto. Para migrar a una base de datos, basta con servir este mismo objeto desde un repositorio remoto. */
export const rawCatalog: RawCatalog = {
  stages, grades, areas, units, topics,
  lessons: withLessonOrder([...preescolarLessons, ...primaria1a3Lessons, ...primaria4a6Lessons]),
}
