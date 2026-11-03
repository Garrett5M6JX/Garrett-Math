import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { rawCatalog } from '../library/catalog/data/index.js'

export type EducationalStage = 'Preescolar' | 'Primaria' | 'Secundaria' | 'Universidad'

export type AiActionType =
  | 'chat'
  | 'hint'
  | 'example'
  | 'diagnose_error'
  | 'explain_lesson'

export interface GarrettAiContext {
  lessonId?: string
  lessonTitle?: string
  topicTitle?: string
  objective?: string
  exercisePrompt?: string
  exerciseType?: string
  hintsAvailable?: string[]
  workedExample?: string
  studentAnswer?: string
  actionType?: AiActionType
  hintLevel?: number
}

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

export interface GarrettAiRequest {
  message: string
  history?: ChatMessage[]
  stage?: EducationalStage
  year?: string
  context?: GarrettAiContext
}

export interface GarrettAiResponse {
  ok: boolean
  reply?: string
  error?: string
  stageUsed?: EducationalStage
  verifiedUser?: boolean
  fallback?: boolean
  status?: number
}

// Rate limiter de respaldo por instancia. El límite autoritativo se aplica en PostgreSQL
// mediante consume_garrett_ai_quota(), que serializa las solicitudes por usuario.
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 12

export function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  if (rateLimitMap.size > 5000) {
    for (const [key, values] of rateLimitMap.entries()) {
      const retained = values.filter((stamp) => stamp > now - RATE_LIMIT_WINDOW_MS)
      if (retained.length) rateLimitMap.set(key, retained)
      else rateLimitMap.delete(key)
    }
  }
  const active = (rateLimitMap.get(clientId) || []).filter((stamp) => stamp > now - RATE_LIMIT_WINDOW_MS)
  if (active.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(clientId, active)
    return { allowed: false, remaining: 0 }
  }
  active.push(now)
  rateLimitMap.set(clientId, active)
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - active.length }
}

function safeText(value: unknown, max = 500): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function sanitizeForProvider(value: unknown, max = 1500): string {
  return safeText(value, max)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[correo omitido]')
    .replace(/\+\d[\d ().-]{7,}\d|\b\d{3}[ .-]\d{3}[ .-]\d{4}\b/g, '[teléfono omitido]')
}

export function retrieveLibraryContext(message: string, requestedLessonId?: string): string {
  const query = message.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const lessons = rawCatalog.lessons
  const exact = requestedLessonId ? lessons.find((lesson) => lesson.id === requestedLessonId) : undefined
  const inPreparation = rawCatalog.topics.filter((topic) => !lessons.some((lesson) => lesson.topicId === topic.id))
  const exactPreparation = inPreparation.find((topic) => {
    const title = topic.title.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return title.length > 5 && (query.includes(title) || title.includes(query))
  })
  if (exactPreparation) {
    return `El tema «${exactPreparation.title}» está en preparación en el mapa curricular y todavía no tiene una lección desarrollada en la Biblioteca. No lo presentes como una lección disponible ni inventes su contenido.`
  }
  const ranked = lessons
    .map((lesson) => {
      const topic = rawCatalog.topics.find((item) => item.id === lesson.topicId)
      const unit = topic && rawCatalog.units.find((item) => item.id === topic.unitId)
      const haystack = [lesson.title, lesson.objective, ...lesson.tags, topic?.title, topic?.description, unit?.title]
        .filter(Boolean).join(' ').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const score = query.split(/\W+/).filter((word) => word.length > 2 && haystack.includes(word)).length
      return { lesson, topic, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
  const selected = [...(exact ? [{ lesson: exact, topic: rawCatalog.topics.find((t) => t.id === exact.topicId), score: 99 }] : []),
    ...ranked.filter((item) => item.lesson.id !== exact?.id)].slice(0, 2)
  if (!selected.length) {
    const topicMatches = inPreparation.filter((topic) => {
      const haystack = [topic.title, topic.description, ...topic.tags].join(' ').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return query.split(/\W+/).some((word) => word.length > 2 && haystack.includes(word))
    }).slice(0, 3)
    if (topicMatches.length) return `Se encontraron temas del mapa curricular, pero no lecciones desarrolladas para ellos: ${topicMatches.map((topic) => `${topic.title} (${topic.id})`).join('; ')}. Indica que el contenido está en preparación y no lo presentes como una lección disponible.`
    return 'No se encontró una lección del catálogo que coincida con esta consulta. No atribuyas explicaciones a la Biblioteca si no aparecen en este contexto.'
  }
  return selected.map(({ lesson, topic }) => [
    `Lección del catálogo: ${lesson.title} (estado editorial: ${lesson.reviewStatus === 'revisado' ? 'revisada' : 'borrador pendiente de revisión docente; no presentarla como contenido aprobado'})`,
    `Tema: ${topic?.title || 'Sin tema'}`,
    `Objetivo: ${lesson.objective}`,
    `Explicación: ${lesson.sections.map((section) => `${section.title}: ${section.body.join(' ')}`).join('\n')}`,
    `Ejemplo resuelto: ${lesson.workedExample.problem}. ${lesson.workedExample.steps.map((step) => step.text).join(' ')} Resultado: ${lesson.workedExample.answer}`,
    `Resumen: ${lesson.summary.join('; ')}`,
  ].join('\n')).join('\n\n')
}

/**
 * Builds the strict pedagogical system prompt for Garrett AI.
 */
export function buildSystemInstruction(stage: EducationalStage, year?: string, context?: GarrettAiContext): string {
  const stageGuidelines: Record<EducationalStage, string> = {
    Preescolar: `
- PÚBLICO: Niñas y niños de 3 a 5 años (Preescolar).
- LENGUAJE: Muy cariñoso, alegre, simple, positivo y cercano.
- REGLAS DIDÁCTICAS:
  * Usa oraciones cortas.
  * Relaciona los números con cosas divertidas y cotidianas (manzanas, estrellas, carritos, deditos, animalitos).
  * Conteo hasta 10 máximo.
  * Celebra cada esfuerzo con entusiasmo.
  * Usa emojis amigables (🍎, ⭐, 🐾, 🎈).`,

    Primaria: `
- PÚBLICO: Estudiantes de 1.º a 6.º de Primaria (6 a 12 años).
- LENGUAJE: Claro, paciente, motivador, directo y ordenado.
- REGLAS DIDÁCTICAS:
  * Explica el "por qué" detrás de las cuentas (repartos, grupos iguales, partes de una figura).
  * Estructura los pasos usando viñetas o numeración clara.
  * No uses términos abstractos o algebraicos complejos que aún no hayan visto.
  * Si piden ayuda con fracciones, usa metáforas visuales como barras de chocolate o pizzas partidas en trozos iguales.`,

    Secundaria: `
- PÚBLICO: Estudiantes de Secundaria (12 a 17 años).
- LENGUAJE: Riguroso pero cercano, empático y constructivo.
- REGLAS DIDÁCTICAS:
  * Guía el razonamiento algebraico y geométrico paso a paso.
  * Fomenta que el estudiante identifique las incógnitas y relaciones antes de operar.
  * Justifica las propiedades matemáticas (por qué se cancela un término, qué significa una ecuación balanceada).
  * Promueve el pensamiento crítico y la comprobación de resultados.`,

    Universidad: `
- PÚBLICO: Estudiantes universitarios (Cálculo, Álgebra Lineal, Estadística, etc.).
- LENGUAJE: Preciso, formal, conciso y conceptualmente profundo.
- REGLAS DIDÁCTICAS:
  * Aclara intuiciones geométricas y analíticas detrás de teoremas y definiciones (épsilon-delta, derivada como tasa instantánea, espacio vectorial).
  * Brinda demostraciones o pasos lógicos sin obviar justificaciones clave.
  * Resalta aplicaciones y casos frontera.`,
  }

  let prompt = `Eres "Garrett AI", el tutor inteligente de matemáticas de Garrett Math.
Tu misión principal es ayudar al estudiante a COMPRENDER y RAZONAR las matemáticas, NUNCA simplemente hacerle la tarea o darle la respuesta final de golpe.

=== PRINCIPIOS PEDAGÓGICOS FUNDAMENTALES (MÉTODO SOCRÁTICO) ===
1. NUNCA des la respuesta final directamente cuando un estudiante pregunte cómo resolver un ejercicio.
2. Da PISTAS PROGRESIVAS:
   - Pista 1 (Comprensión): Ayuda a identificar qué datos conocemos y qué nos están pidiendo.
   - Pista 2 (Estrategia): Sugiere qué camino u operación puede ser útil y por qué.
   - Pista 3 (Paso guiado): Muestra el primer cálculo o plantea una pregunta clave para que el estudiante dé el paso final.
3. Si el estudiante cometió un error ("Revisar mi error"):
   - Sé muy amable y felicítale por intentarlo.
   - Diagnostica exactamente dónde se produjo el malentendido conceptual (por ejemplo: sumó antes de multiplicar, olvidó el signo o contó dos veces el mismo elemento).
   - Explica por qué es un error común y cómo evitarlo.
4. Si te piden un "ejemplo similar":
   - Propón un ejercicio con la misma estructura pero diferentes números.
   - Resuélvelo paso a paso para que le sirva de guía modelo.
5. SEGURIDAD INFANTIL Y PRIVACIDAD:
   - Solo responde temas relacionados con matemáticas, razonamiento lógico, ciencias aplicadas y motivación para estudiar.
   - Si te preguntan sobre temas ajenos, declina cortésmente diciendo: "Como tutor de Garrett Math, me enfoco en ayudarte a aprender matemáticas paso a paso. ¿Tienes alguna duda de números o problemas que quieras resolver?".
   - Nunca solicites información personal sensible.

=== ETAPA EDUCATIVA ACTUAL ===
Etapa: ${stage}${year ? ` (${year})` : ''}
${stageGuidelines[stage]}
`

  if (context) {
    prompt += `\n=== CONTEXTO DE LA LECCIÓN / EJERCICIO DE LA BIBLIOTECA ===\n`
    if (context.topicTitle) prompt += `- Tema: ${context.topicTitle}\n`
    if (context.lessonTitle) prompt += `- Lección: ${context.lessonTitle}\n`
    if (context.objective) prompt += `- Objetivo educativo: ${context.objective}\n`
    if (context.exercisePrompt) prompt += `- Ejercicio actual: "${context.exercisePrompt}"\n`
    if (context.exerciseType) prompt += `- Tipo de ejercicio: ${context.exerciseType}\n`
    if (context.studentAnswer) prompt += `- Respuesta que dio el estudiante: "${context.studentAnswer}"\n`
    if (context.hintsAvailable && context.hintsAvailable.length > 0) {
      prompt += `- Pistas de la plataforma:\n  * ${context.hintsAvailable.join('\n  * ')}\n`
    }
    if (context.workedExample) prompt += `- Ejemplo resuelto de la lección: ${context.workedExample}\n`
    if (context.actionType) prompt += `- Acción específica solicitada por el usuario: ${context.actionType}\n`
  }

  return prompt
}

/**
 * Core business handler that can be invoked from both Vercel Serverless Functions
 * and Vite Connect middleware.
 */
export async function handleGarrettAiCore(
  payload: GarrettAiRequest,
  authHeader?: string,
  clientIp = 'unknown',
): Promise<GarrettAiResponse> {
  const message = sanitizeForProvider(payload?.message, 1500)
  if (!message) return { ok: false, status: 400, error: 'Por favor, escribe una pregunta o duda sobre matemáticas.' }
  if (typeof payload?.message !== 'string' || payload.message.length > 1500) {
    return { ok: false, status: 400, error: 'La pregunta es demasiado larga. Escribe menos de 1500 caracteres.' }
  }
  if (!authHeader || !/^Bearer\s+\S+$/i.test(authHeader)) {
    return { ok: false, status: 401, error: 'Inicia sesión para utilizar Garrett AI. El modo de demostración no envía consultas a Gemini.' }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return { ok: false, status: 503, error: 'El servicio de autenticación no está configurado en el servidor.' }
  }

  const token = authHeader.replace(/^Bearer\s+/i, '')
  const supabaseServer = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let user
  try {
    const { data, error } = await supabaseServer.auth.getUser(token)
    if (error || !data.user) return { ok: false, status: 401, error: 'Tu sesión no es válida o ha caducado. Vuelve a iniciar sesión.' }
    user = data.user
  } catch {
    return { ok: false, status: 401, error: 'No se pudo verificar tu sesión. Vuelve a iniciar sesión.' }
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from('user_profiles')
    .select('education_stage, education_year')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError || !profile) {
    return { ok: false, status: 503, error: 'No se pudo verificar tu perfil educativo. Inténtalo más tarde.' }
  }

  const validStages: EducationalStage[] = ['Preescolar', 'Primaria', 'Secundaria', 'Universidad']
  const verifiedStage = validStages.includes(profile?.education_stage) ? profile.education_stage as EducationalStage : 'Primaria'
  const verifiedYear = safeText(profile?.education_year, 50)
  const role = user.app_metadata?.assigned_role === 'teacher'
    ? 'teacher'
    : user.user_metadata?.requested_role === 'parent' ? 'parent' : 'student'
  const enabled = process.env.GARRETT_AI_ENABLED !== 'false'
  if (!enabled) return { ok: false, status: 503, error: 'Garrett AI está temporalmente desactivado por la administración.' }
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { ok: false, status: 503, error: 'Garrett AI no está activado: falta configurar GEMINI_API_KEY en el servidor.' }

  const instanceLimit = checkRateLimit(`${user.id}:${clientIp}`)
  if (!instanceLimit.allowed) {
    return { ok: false, status: 429, error: 'Has alcanzado el límite temporal de consultas. Espera un minuto e inténtalo de nuevo.' }
  }

  const model = safeText(process.env.GEMINI_MODEL, 80) || 'gemini-3.8-flash'
  const minuteEnv = Number(process.env.GARRETT_AI_MAX_PER_MINUTE || 10)
  const dayEnv = Number(process.env.GARRETT_AI_MAX_PER_DAY || 100)
  const maxPerMinute = Number.isFinite(minuteEnv) ? Math.max(1, Math.min(60, Math.floor(minuteEnv))) : 10
  const maxPerDay = Number.isFinite(dayEnv) ? Math.max(1, Math.min(1000, Math.floor(dayEnv))) : 100
  // Cuota persistente en PostgreSQL: funciona entre instancias serverless.
  const { data: quotaAllowed, error: quotaError } = await supabaseServer.rpc('consume_garrett_ai_quota', {
    p_max_per_minute: maxPerMinute,
    p_max_per_day: maxPerDay,
    p_model: model,
  })
  if (quotaError) {
    return { ok: false, status: 503, error: 'No se pudo comprobar el límite de uso. Verifica la migración de Garrett AI en Supabase.' }
  }
  if (quotaAllowed !== true) {
    return { ok: false, status: 429, error: 'Has alcanzado tu límite de consultas de Garrett AI. Vuelve a intentarlo más tarde.' }
  }

  const history = Array.isArray(payload.history) ? payload.history.slice(-8) : []
  const safeHistory = history
    .filter((item) => item && (item.role === 'user' || item.role === 'model') && typeof item.text === 'string')
    .map((item) => ({ role: item.role, text: sanitizeForProvider(item.text, 1500) }))
    .filter((item) => item.text.length > 0)
  const context = payload.context && typeof payload.context === 'object' ? payload.context : undefined
  const lessonId = safeText(context?.lessonId, 120)
  const libraryContext = retrieveLibraryContext(message, lessonId)
  const verifiedContext: GarrettAiContext = {
    lessonId,
    lessonTitle: sanitizeForProvider(context?.lessonTitle, 160),
    topicTitle: sanitizeForProvider(context?.topicTitle, 160),
    objective: sanitizeForProvider(context?.objective, 500),
    exercisePrompt: sanitizeForProvider(context?.exercisePrompt, 500),
    exerciseType: safeText(context?.exerciseType, 60),
    hintsAvailable: Array.isArray(context?.hintsAvailable) ? context.hintsAvailable.slice(0, 3).map((v) => sanitizeForProvider(v, 300)) : [],
    workedExample: sanitizeForProvider(context?.workedExample, 800),
    studentAnswer: sanitizeForProvider(context?.studentAnswer, 300),
    actionType: ['chat', 'hint', 'example', 'diagnose_error', 'explain_lesson'].includes(context?.actionType || '')
      ? context?.actionType : 'chat',
    hintLevel: Number.isInteger(context?.hintLevel) ? Math.min(3, Math.max(1, Number(context?.hintLevel))) : 1,
  }

  try {
    const timeoutMs = Math.min(50000, Math.max(5000, Number(process.env.GARRETT_AI_TIMEOUT_MS || 45000)))
    const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: timeoutMs } })
    const systemInstruction = `${buildSystemInstruction(verifiedStage, verifiedYear, verifiedContext)}

=== ROL VERIFICADO ===
${role}. Adapta las actividades al rol: estudiantes reciben tutoría; docentes pueden preparar materiales editables; familia recibe explicaciones de apoyo.

=== CONTEXTO RECUPERADO DE LA BIBLIOTECA ===
${libraryContext}

No inventes títulos, lecciones, ejercicios ni estados editoriales. Solo atribuye a la Biblioteca las lecciones listadas en el contexto y respeta su estado editorial: las marcadas como borrador no están aprobadas por docentes. Si el tema figura en preparación o no tiene lección asociada, dilo con claridad. Si el usuario pide explícitamente la solución completa, puedes mostrarla con procedimiento.`
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...safeHistory.map((item) => ({ role: item.role, parts: [{ text: item.text }] })),
        { role: 'user', parts: [{ text: message }] },
      ],
      config: { systemInstruction, maxOutputTokens: 1200 },
    })
    const reply = safeText(response.text, 12000)
    if (!reply) return { ok: false, status: 502, error: 'Gemini no devolvió una explicación. Inténtalo de nuevo.' }
    return { ok: true, reply, stageUsed: verifiedStage, verifiedUser: true }
  } catch (error: any) {
    const status = Number(error?.status || error?.code || 0)
    const detail = `${error?.message || ''} ${error?.statusText || ''}`
    if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(detail)) {
      return { ok: false, status: 429, error: 'Gemini ha alcanzado temporalmente su cuota. Espera antes de volver a intentarlo.' }
    }
    if (status === 401 || status === 403 || /API_KEY_INVALID|PERMISSION_DENIED|invalid api key/i.test(detail)) {
      return { ok: false, status: 503, error: 'La configuración de Gemini no es válida. Contacta con la administración.' }
    }
    if (/timeout|deadline|ETIMEDOUT/i.test(detail)) {
      return { ok: false, status: 504, error: 'Gemini tardó demasiado en responder. Inténtalo nuevamente.' }
    }
    // Diagnóstico acotado: nunca registrar prompts, historial, cabeceras ni claves.
    const providerMessage = safeText(error?.message, 500)
      .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[clave omitida]')
      .replace(/Bearer\s+\S+/gi, 'Bearer [token omitido]')
      .replace(/([?&](?:key|token|access_token|api_key)=)[^&\s]+/gi, '$1[omitido]')
      .replace(/https?:\/\/[^\s]+/gi, '[url omitida]')
      .slice(0, 300)
    console.error('[Garrett AI] Fallo del proveedor Gemini', {
      status: status || 'unknown',
      code: safeText(error?.code, 80) || 'unknown',
      name: safeText(error?.name, 80) || 'Error',
      message: providerMessage || 'Sin mensaje del proveedor',
    })
    if (status === 503 || /UNAVAILABLE|overloaded|temporarily unavailable/i.test(detail)) {
      return { ok: false, status: 503, error: 'Gemini no está disponible en este momento. Inténtalo nuevamente en unos minutos.' }
    }
    return { ok: false, status: 502, error: 'Garrett AI no pudo procesar la consulta. Inténtalo de nuevo más tarde.' }
  }
}
