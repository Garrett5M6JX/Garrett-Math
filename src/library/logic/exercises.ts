import type { Exercise } from '../types'

export type ExerciseResponse =
  | { type: 'choice'; index: number | null }
  | { type: 'number'; text: string }
  | { type: 'fraction'; text: string }
  | { type: 'order'; order: string[] }

/** `invalid` significa que la respuesta no es evaluable (vacía o mal escrita); no cuenta como intento. */
export type CheckResult = { status: 'correct' } | { status: 'incorrect'; message?: string } | { status: 'invalid'; message: string }

/** Acepta «12», «-3», «1,5» y «1.5». Rechaza fracciones, texto y separadores ambiguos. */
export function parseNumberInput(raw: string): number | null {
  const text = raw.trim()
  if (!/^-?\d+([.,]\d+)?$/.test(text)) return null
  return Number(text.replace(',', '.'))
}
export function parseFractionInput(raw: string): { n: number; d: number } | null {
  const match = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(raw)
  if (!match) return null
  const n = Number(match[1]); const d = Number(match[2])
  return d > 0 ? { n, d } : null
}

export function checkExercise(exercise: Exercise, response: ExerciseResponse): CheckResult {
  if (response.type !== exercise.type) return { status: 'invalid', message: 'La respuesta no corresponde a este ejercicio.' }
  switch (exercise.type) {
    case 'choice': {
      const r = response as Extract<ExerciseResponse, { type: 'choice' }>
      if (r.index === null || r.index < 0 || r.index >= exercise.options.length) return { status: 'invalid', message: 'Elige una opción antes de comprobar.' }
      return r.index === exercise.answerIndex ? { status: 'correct' } : { status: 'incorrect', message: exercise.wrongFeedback?.[r.index] }
    }
    case 'number': {
      const r = response as Extract<ExerciseResponse, { type: 'number' }>
      if (!r.text.trim()) return { status: 'invalid', message: 'Escribe un número antes de comprobar.' }
      const value = parseNumberInput(r.text)
      if (value === null) return { status: 'invalid', message: 'Escribe solo un número, por ejemplo 12 o 0,5.' }
      return Math.abs(value - exercise.answer) <= (exercise.tolerance ?? 0) + 1e-9 ? { status: 'correct' } : { status: 'incorrect' }
    }
    case 'fraction': {
      const r = response as Extract<ExerciseResponse, { type: 'fraction' }>
      if (!r.text.trim()) return { status: 'invalid', message: 'Escribe una fracción antes de comprobar.' }
      const value = parseFractionInput(r.text)
      if (!value) return { status: 'invalid', message: 'Escribe la fracción como a/b, por ejemplo 3/4.' }
      const same = exercise.equivalent ? value.n * exercise.denominator === exercise.numerator * value.d : value.n === exercise.numerator && value.d === exercise.denominator
      return same ? { status: 'correct' } : { status: 'incorrect', message: !exercise.equivalent && value.n * exercise.denominator === exercise.numerator * value.d ? 'Es equivalente, pero el ejercicio pide la fracción indicada en el enunciado.' : undefined }
    }
    case 'order': {
      const r = response as Extract<ExerciseResponse, { type: 'order' }>
      if (r.order.length !== exercise.items.length) return { status: 'invalid', message: 'Faltan elementos por ordenar.' }
      return r.order.every((item, i) => item === exercise.items[i]) ? { status: 'correct' } : { status: 'incorrect' }
    }
  }
}

/** Texto de la respuesta correcta, para mostrarla solo tras agotar las pistas. */
export function correctAnswerText(exercise: Exercise): string {
  switch (exercise.type) {
    case 'choice': return exercise.options[exercise.answerIndex]
    case 'number': return `${String(exercise.answer).replace('.', ',')}${exercise.unit ? ` ${exercise.unit}` : ''}`
    case 'fraction': return `${exercise.numerator}/${exercise.denominator}`
    case 'order': return exercise.items.join(' → ')
  }
}

function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function mulberry32(a: number) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
/** Mezcla determinista (misma semilla, mismo orden) y garantiza que el resultado NO coincide con el orden correcto. */
export function shuffleDeterministic<T>(items: readonly T[], seed: string): T[] {
  const result = [...items]
  const random = mulberry32(hash(seed))
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]] }
  if (result.length > 1 && result.every((item, i) => item === items[i])) result.push(result.shift() as T)
  return result
}
