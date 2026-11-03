import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildSystemInstruction,
  checkRateLimit,
  handleGarrettAiCore,
  retrieveLibraryContext,
  type EducationalStage,
  type GarrettAiContext,
} from '../src/server/garrettAiCore'

test('checkRateLimit: permite solicitudes hasta el límite y bloquea el exceso', () => {
  const clientId = `test-client-${Date.now()}`
  
  // First 12 requests should pass
  for (let i = 0; i < 12; i++) {
    const res = checkRateLimit(clientId)
    assert.equal(res.allowed, true, `La solicitud ${i + 1} debería permitirse`)
  }

  // 13th request should be blocked
  const blocked = checkRateLimit(clientId)
  assert.equal(blocked.allowed, false, 'La solicitud 13 debe ser bloqueada por rate limit')
  assert.equal(blocked.remaining, 0)
})

test('buildSystemInstruction: adapta el tono a cada etapa educativa', () => {
  const stages: EducationalStage[] = ['Preescolar', 'Primaria', 'Secundaria', 'Universidad']

  for (const stage of stages) {
    const prompt = buildSystemInstruction(stage)
    assert.ok(prompt.includes(stage), `El prompt debe mencionar la etapa ${stage}`)
    assert.ok(prompt.includes('Garrett AI'), 'Debe identificarse como Garrett AI')
    assert.ok(prompt.includes('MÉTODO SOCRÁTICO'), 'Debe incluir principios socráticos')
  }

  const prePrompt = buildSystemInstruction('Preescolar')
  assert.ok(prePrompt.includes('3 a 5 años') || prePrompt.includes('Preescolar'))

  const uniPrompt = buildSystemInstruction('Universidad')
  assert.ok(uniPrompt.includes('Universidad') || uniPrompt.includes('Cálculo'))
})

test('buildSystemInstruction: incluye contexto de la lección y del ejercicio cuando se proporcionan', () => {
  const context: GarrettAiContext = {
    lessonTitle: 'Fracciones equivalentes',
    topicTitle: 'Números racionales',
    objective: 'Reconocer fracciones equivalentes',
    exercisePrompt: 'Simplifica 4/8',
    studentAnswer: '2/3',
    actionType: 'diagnose_error',
    hintsAvailable: ['Busca un divisor común'],
  }

  const prompt = buildSystemInstruction('Primaria', '4.º grado', context)
  assert.ok(prompt.includes('Fracciones equivalentes'))
  assert.ok(prompt.includes('Simplifica 4/8'))
  assert.ok(prompt.includes('2/3'))
  assert.ok(prompt.includes('Busca un divisor común'))
  assert.ok(prompt.includes('diagnose_error'))
})

test('handleGarrettAiCore: valida que el mensaje no esté vacío', async () => {
  const res1 = await handleGarrettAiCore({ message: '' })
  assert.equal(res1.ok, false)
  assert.match(res1.error || '', /escribe una pregunta/i)

  const res2 = await handleGarrettAiCore({ message: '   ' })
  assert.equal(res2.ok, false)
})

test('handleGarrettAiCore: valida el límite de longitud del mensaje', async () => {
  const longMessage = 'x'.repeat(1600)
  const res = await handleGarrettAiCore({ message: longMessage })
  assert.equal(res.ok, false)
  assert.match(res.error || '', /demasiado larga/i)
})

test('handleGarrettAiCore: exige una sesión verificada y no genera respuestas simuladas', async () => {
  const res = await handleGarrettAiCore({ message: '¿Cómo sumo 2 + 2?' }, undefined, 'guest-test')
  assert.equal(res.ok, false)
  assert.equal(res.status, 401)
  assert.match(res.error || '', /Inicia sesión/i)
  assert.equal(res.fallback, undefined)
})


test('retrieveLibraryContext: recupera solo fragmentos pertinentes y conserva el estado borrador', () => {
  const context = retrieveLibraryContext('Explícame fracciones equivalentes')
  assert.match(context, /Fracciones equivalentes/i)
  assert.match(context, /borrador pendiente de revisión docente/i)
  assert.doesNotMatch(context, /Lección aprobada/i)
})

test('retrieveLibraryContext: no inventa lecciones para temas en preparación', () => {
  const context = retrieveLibraryContext('Formas en los objetos')
  assert.match(context, /no hay lecciones desarrolladas|no se encontraron|en preparación/i)
})
