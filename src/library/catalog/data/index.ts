import type { RawCatalog } from '../../types'
import { withLessonOrder } from '../helpers.js'
import { areas, grades, stages, units } from './structure.js'
import { topics } from './topics.js'
import { secundariaTopics } from './topics-secundaria.js'
import { preescolarLessons } from './lessons-preescolar.js'
import { primaria1a3Lessons } from './lessons-primaria-1-3.js'
import { primaria4a6Lessons } from './lessons-primaria-4-6.js'
import { primaria5a6ExtraLessons } from './lessons-primaria-5-6-extra.js'
import { secundariaLessons } from './lessons-secundaria.js'

/** Catálogo curricular unificado. Las lecciones nuevas siguen en borrador hasta su revisión docente. */
export const rawCatalog: RawCatalog = {
  stages, grades, areas, units,
  topics: [...topics, ...secundariaTopics],
  lessons: withLessonOrder([...preescolarLessons, ...primaria1a3Lessons, ...primaria4a6Lessons, ...primaria5a6ExtraLessons, ...secundariaLessons]),
}
