import type {
  ChoiceExercise, Difficulty, Exercise, FractionExercise, Lesson, LessonSection, NumberExercise, OrderExercise, Topic, VisualSpec, WorkedExample,
} from '../types.js'

/** Ayudantes para escribir contenido de forma compacta y tipada. No contienen lógica de presentación. */

const clean = <T extends Record<string, any>>(obj: T): T => {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v
  }
  return out as T
}

export const sec = (title: string, body: string | string[], extra: { key?: string; v?: VisualSpec } = {}): LessonSection =>
  clean({ title, body: Array.isArray(body) ? body : [body], keyIdea: extra.key, visual: extra.v })

type Extra = { v?: VisualSpec }
export const ch = (prompt: string, options: string[], answerIndex: number, explanation: string, hints: string[], extra: Extra & { wrong?: Record<number, string> } = {}): ChoiceExercise =>
  clean({ id: '', type: 'choice', prompt, options, answerIndex, explanation, hints, visual: extra.v, wrongFeedback: extra.wrong })
export const nm = (prompt: string, answer: number, explanation: string, hints: string[], extra: Extra & { unit?: string; tolerance?: number } = {}): NumberExercise =>
  clean({ id: '', type: 'number', prompt, answer, explanation, hints, unit: extra.unit, tolerance: extra.tolerance, visual: extra.v })
export const fr = (prompt: string, numerator: number, denominator: number, explanation: string, hints: string[], extra: Extra & { equiv?: boolean } = {}): FractionExercise =>
  clean({ id: '', type: 'fraction', prompt, numerator, denominator, explanation, hints, equivalent: extra.equiv, visual: extra.v })
export const od = (prompt: string, items: string[], explanation: string, hints: string[], extra: Extra = {}): OrderExercise =>
  clean({ id: '', type: 'order', prompt, items, explanation, hints, visual: extra.v })

export const ex = (title: string, problem: string, steps: (string | [string, VisualSpec])[], answer: string): WorkedExample =>
  ({ title, problem, answer, steps: steps.map((s) => typeof s === 'string' ? { text: s } : { text: s[0], visual: s[1] }) })

type LessonDef = {
  id: string; topic: string; title: string; obj: string; min: number; d: Difficulty; tags: string[]
  pre?: string[]; secs: LessonSection[]; ex: WorkedExample; exs: Exercise[]; sum: string[]; minSolved?: number
}
/** Crea una lección; los ejercicios reciben el identificador `<lección>:e<n>` para que sean únicos y estables. */
export const lesson = (def: LessonDef): Lesson => clean({
  id: def.id, topicId: def.topic, title: def.title, order: 0, objective: def.obj, minutes: def.min, difficulty: def.d,
  tags: def.tags, prerequisites: def.pre, sections: def.secs, workedExample: def.ex,
  exercises: def.exs.map((e, i) => ({ ...e, id: `${def.id}:e${i + 1}` })), summary: def.sum, minSolved: def.minSolved, reviewStatus: 'borrador',
})

/** Asigna `order` consecutivo dentro de cada tema según el orden de escritura. */
export function withLessonOrder(lessons: Lesson[]): Lesson[] {
  const counters = new Map<string, number>()
  return lessons.map((l) => { const n = (counters.get(l.topicId) ?? 0) + 1; counters.set(l.topicId, n); return { ...l, order: n } })
}

/** Tema compacto: el id es `<grado>-<slug>` y la unidad es `<grado>-<área>`. */
export const topic = (grade: string, area: string, slug: string, title: string, description: string, difficulty: Difficulty, tags: string[], prerequisites: string[] = []): Omit<Topic, 'order'> =>
  ({ id: `${grade}-${slug}`, unitId: `${grade}-${area}`, title, description, difficulty, tags, prerequisites })

export function withTopicOrder(topics: Omit<Topic, 'order'>[]): Topic[] {
  const counters = new Map<string, number>()
  return topics.map((t) => { const n = (counters.get(t.unitId) ?? 0) + 1; counters.set(t.unitId, n); return { ...t, order: n } })
}
