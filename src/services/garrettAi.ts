import type { Level } from '../types/models'
import { supabase } from './supabase'

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
  id: string
  role: 'user' | 'model'
  text: string
  timestamp: number
  context?: GarrettAiContext
  isError?: boolean
  isFallback?: boolean
}

export interface SendMessageParams {
  message: string
  history?: { role: 'user' | 'model'; text: string }[]
  stage?: Level
  year?: string
  context?: GarrettAiContext
  signal?: AbortSignal
}

export interface SendMessageResult {
  ok: boolean
  reply: string
  error?: string
  stageUsed?: Level
  fallback?: boolean
}

/**
 * Sends a message to the secure server endpoint /api/garrett-ai.
 * Automatically attaches the Supabase session token if available.
 */
export async function sendGarrettAiMessage(params: SendMessageParams): Promise<SendMessageResult> {
  const { message, history = [], stage = 'Primaria', year, context } = params

  let authToken: string | undefined

  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        authToken = session.access_token
      }
    } catch {
      // Continue without auth token in guest or demo mode
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  try {
    const res = await fetch('/api/garrett-ai', {
      method: 'POST',
      headers,
      signal: params.signal,
      body: JSON.stringify({
        message,
        history,
        stage,
        year,
        context,
      }),
    })

    const data = await res.json()

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        reply: '',
        error: data.error || `Error del servidor (${res.status}). Intenta de nuevo más tarde.`,
      }
    }

    return {
      ok: true,
      reply: data.reply || '',
      stageUsed: data.stageUsed,
      fallback: data.fallback,
    }
  } catch (error: any) {
    if (error?.name === 'AbortError') return { ok: false, reply: '', error: 'La solicitud se canceló.' }
    console.error('[sendGarrettAiMessage error]:', error?.name || 'network')
    return {
      ok: false,
      reply: '',
      error: 'No se pudo conectar con el servidor de Garrett AI. Revisa tu conexión a internet o intenta de nuevo.',
    }
  }
}
