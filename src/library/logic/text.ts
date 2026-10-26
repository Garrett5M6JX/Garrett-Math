/** Normaliza texto para comparar: sin tildes, minúsculas, solo letras/números separados por un espacio. */
export function normalizeText(input: string): string {
  return input.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}
/** Reduce plurales simples en español para que «fracciones» coincida con «fracción». */
export function stem(word: string): string {
  if (word.length > 5 && word.endsWith('es')) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s')) return word.slice(0, -1)
  return word
}
export function tokenize(input: string): string[] {
  return normalizeText(input).split(' ').filter(Boolean).map(stem)
}
