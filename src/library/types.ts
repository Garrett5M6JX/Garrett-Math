/**
 * Modelo de contenido de la Biblioteca de Garrett Math.
 * Jerarquía: Etapa → Grado → Área → Unidad → Tema → Lección → (secciones, ejemplo, ejercicios).
 * Todos los elementos tienen identificadores estables (slugs) y se relacionan por id.
 * El contenido es dato puro: no contiene JSX ni estilos.
 */

export type StageId = 'preescolar' | 'primaria'
export type Difficulty = 1 | 2 | 3
/** Estado editorial del contenido. Nada del catálogo inicial está validado por docentes. */
export type ReviewStatus = 'borrador' | 'revisado'
export type ColorKey = 'rojo' | 'azul' | 'verde' | 'amarillo' | 'morado' | 'naranja'
export type ShapeKey = 'circulo' | 'cuadrado' | 'triangulo' | 'estrella' | 'rombo'

export type Stage = { id: StageId; name: string; ageRange: string; description: string; order: number }
export type Grade = { id: string; stageId: StageId; name: string; order: number; ageLabel?: string }
export type Area = { id: string; name: string; description: string; order: number; icon: AreaIcon }
export type AreaIcon = 'numeros' | 'operaciones' | 'fracciones' | 'geometria' | 'medida' | 'datos' | 'patrones' | 'problemas'
export type Unit = { id: string; gradeId: string; areaId: string; title: string; description: string; order: number }

export type Topic = {
  id: string
  unitId: string
  title: string
  description: string
  order: number
  difficulty: Difficulty
  /** Conceptos y palabras clave para la búsqueda (sin tildes obligatorias). */
  tags: string[]
  /** Temas que conviene conocer antes. Siempre apuntan a temas existentes. */
  prerequisites: string[]
}

// ───────────── Visuales (SVG declarativos) ─────────────
export type CounterGroup = { count: number; shape?: ShapeKey; color?: ColorKey }
export type VisualSpec =
  | { kind: 'counters'; groups: CounterGroup[]; crossed?: number; alt: string }
  | { kind: 'tenFrame'; filled: number; alt: string }
  | { kind: 'numberLine'; from: number; to: number; step?: number; highlight?: number[]; jumps?: { from: number; to: number }[]; alt: string }
  | { kind: 'shape'; shape: 'circulo' | 'cuadrado' | 'triangulo' | 'rectangulo' | 'pentagono' | 'hexagono'; color?: ColorKey; alt: string }
  | { kind: 'pattern'; items: (string | '?')[]; alt: string }
  | { kind: 'fraction'; parts: number; shaded: number; form?: 'barra' | 'circulo'; alt: string }
  | { kind: 'placeValue'; hundreds?: number; tens: number; ones: number; alt: string }
  | { kind: 'array'; rows: number; cols: number; alt: string }
  | { kind: 'clock'; hour: number; minute: number; alt: string }
  | { kind: 'bars'; data: { label: string; value: number }[]; orientation?: 'vertical' | 'horizontal'; unitLabel?: string; alt: string }
  | { kind: 'spatial'; relation: 'encima' | 'debajo' | 'dentro' | 'fuera' | 'al-lado' | 'izquierda' | 'derecha'; alt: string }
  | { kind: 'rectGrid'; w: number; h: number; showDims?: boolean; alt: string }
  | { kind: 'coordinates'; max: number; points: { x: number; y: number; label: string }[]; alt: string }
  | { kind: 'angle'; degrees: number; alt: string }

// ───────────── Ejercicios ─────────────
type ExerciseBase = {
  id: string
  prompt: string
  /** Pistas progresivas: de la más sutil a la más directa. Máximo 3. */
  hints: string[]
  /** Explicación que se muestra tras comprobar o al revelar. */
  explanation: string
  visual?: VisualSpec
}
export type ChoiceExercise = ExerciseBase & {
  type: 'choice'
  options: string[]
  answerIndex: number
  /** Explicación específica de errores frecuentes, por índice de opción. */
  wrongFeedback?: Record<number, string>
}
export type NumberExercise = ExerciseBase & { type: 'number'; answer: number; unit?: string; tolerance?: number }
/** Por defecto exige exactamente `numerator/denominator`; con `equivalent: true` acepta cualquier fracción de igual valor. */
export type FractionExercise = ExerciseBase & { type: 'fraction'; numerator: number; denominator: number; equivalent?: boolean }
/** `items` están en el orden CORRECTO; la interfaz los presenta mezclados de forma determinista. */
export type OrderExercise = ExerciseBase & { type: 'order'; items: string[] }
export type Exercise = ChoiceExercise | NumberExercise | FractionExercise | OrderExercise
export type ExerciseType = Exercise['type']

export type LessonSection = { title: string; body: string[]; keyIdea?: string; visual?: VisualSpec }
export type WorkedExample = { title: string; problem: string; steps: { text: string; visual?: VisualSpec }[]; answer: string }

export type Lesson = {
  id: string
  topicId: string
  title: string
  order: number
  objective: string
  minutes: number
  difficulty: Difficulty
  tags: string[]
  /** Lecciones que conviene completar antes (misma biblioteca). */
  prerequisites?: string[]
  sections: LessonSection[]
  workedExample: WorkedExample
  exercises: Exercise[]
  summary: string[]
  /** Número mínimo de ejercicios resueltos para completar la lección. Por defecto, el 70 % redondeado hacia arriba. */
  minSolved?: number
  reviewStatus: ReviewStatus
}

/** Datos crudos tal como se escriben en `catalog/data`. */
export type RawCatalog = {
  stages: Stage[]
  grades: Grade[]
  areas: Area[]
  units: Unit[]
  topics: Topic[]
  lessons: Lesson[]
}

/** Catálogo con índices para consultas rápidas. Se genera con `buildCatalog`. */
export type Catalog = RawCatalog & {
  stageById: Map<string, Stage>
  gradeById: Map<string, Grade>
  areaById: Map<string, Area>
  unitById: Map<string, Unit>
  topicById: Map<string, Topic>
  lessonById: Map<string, Lesson>
  lessonsByTopic: Map<string, Lesson[]>
  topicsByUnit: Map<string, Topic[]>
  unitsByGrade: Map<string, Unit[]>
  gradesByStage: Map<string, Grade[]>
  /** Temas ordenados por trayectoria dentro de cada área (grado → unidad → orden). */
  topicsByArea: Map<string, Topic[]>
}

// ───────────── Progreso ─────────────
export type LessonStatus = 'not_started' | 'in_progress' | 'completed'
export type LessonProgress = {
  lessonId: string
  status: 'in_progress' | 'completed'
  /** Comprobaciones de respuesta realizadas (solo datos locales). */
  attempts: number
  /** Ejercicios resueltos correctamente alguna vez. */
  solved: string[]
  /** Ejercicios cuya respuesta se reveló tras agotar las pistas (no cuentan como resueltos). */
  revealed: string[]
  /** Mejor porcentaje de ejercicios resueltos (0–100) o null si aún no hay un dato real. */
  score: number | null
  lastStep: number
  startedAt: string
  updatedAt: string
  completedAt?: string
}
export type ProgressMap = Record<string, LessonProgress>
