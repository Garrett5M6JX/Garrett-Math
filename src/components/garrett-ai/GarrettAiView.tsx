import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import {
  Brain, Check, ChevronRight, Copy, HelpCircle, Lightbulb,
  MessageSquare, RefreshCw, Send, ShieldCheck, Sparkles, Trash2, X, BookOpen, Layers
} from 'lucide-react'
import type { Level } from '../../types/models'
import { LEVEL_OPTIONS } from '../../types/models'
import {
  sendGarrettAiMessage,
  type ChatMessage,
  type GarrettAiContext,
} from '../../services/garrettAi'
import './garrett-ai.css'

interface Props {
  initialStage?: Level
  initialYear?: string
  initialContext?: GarrettAiContext | null
  onBack?: () => void
  userRole?: 'student' | 'teacher' | 'parent'
}

const STARTER_PROMPTS: Record<Level, string[]> = {
  Preescolar: [
    '🍎 ¿Cómo puedo aprender a contar objetos jugando?',
    '⭐ ¿Qué número viene después del número 3?',
    '🐾 Explícame qué es sumar usando mis dedos',
    '🎈 ¿Cuántos globos tengo si me regalan 2 más?',
  ],
  Primaria: [
    '🍕 Explícame qué es una fracción usando una pizza',
    '➕ ¿Cómo sumo llevando si el número pasa de 9?',
    '➖ ¿Qué truco puedo usar para restar quitando prestado?',
    '✖️ ¿Por qué las tablas de multiplicar son sumas repetidas?',
  ],
  Secundaria: [
    '📐 ¿Cómo despejo la incógnita x en una ecuación lineal?',
    '🔺 ¿Qué significa geométricamente el teorema de Pitágoras?',
    '📊 ¿Cómo interpreto la pendiente de una recta en el plano?',
    '✖️ ¿Por qué menos por menos da más?',
  ],
  Universidad: [
    '📈 ¿Cuál es la intuición geométrica de la derivada como límite?',
    '∫ ¿Cómo se relacionan la integral definida y el área bajo la curva?',
    '🧮 ¿Qué es un espacio vectorial y qué propiedades debe cumplir?',
    '🎲 ¿Cómo interpretar la media y la varianza en una distribución?',
  ],
}

function renderAiLine(line: string) {
  const parts = line.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\[[\s\S]+?\\\]|\\\([^\n]+?\\\))/g)
  return parts.map((part, index) => {
    const display = part.startsWith('$$') || part.startsWith('\\[')
    const isMath = display || (part.startsWith('$') && part.endsWith('$')) || (part.startsWith('\\(') && part.endsWith('\\)'))
    if (!isMath) return <span key={index}>{part}</span>
    const content = part.startsWith('$$') ? part.slice(2, -2) : part.startsWith('$') ? part.slice(1, -1) : part.slice(2, -2)
    return <code key={index} className={display ? 'ai-math-expression ai-math-display' : 'ai-math-expression'} role="math" aria-label={`Expresión matemática: ${content}`}>{content}</code>
  })
}

export default function GarrettAiView({
  initialStage = 'Primaria',
  initialYear,
  initialContext = null,
  onBack,
  userRole = 'student',
}: Props) {
  const [stage, setStage] = useState<Level>(initialStage)
  const [context, setContext] = useState<GarrettAiContext | null>(() => {
    if (initialContext) return initialContext
    try {
      const pending = sessionStorage.getItem('garrett-ai-pending-context')
      if (pending) {
        sessionStorage.removeItem('garrett-ai-pending-context')
        return JSON.parse(pending) as GarrettAiContext
      }
    } catch {
      // ignore
    }
    return null
  })
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(`gm-ai-chat-${initialStage}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [hintLevel, setHintLevel] = useState(1)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const requestControllerRef = useRef<AbortController | null>(null)

  // Save conversation in session storage
  useEffect(() => {
    try {
      sessionStorage.setItem(`gm-ai-chat-${stage}`, JSON.stringify(messages))
    } catch {
      // storage unavailable
    }
  }, [messages, stage])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Update stage if prop changes
  useEffect(() => {
    if (initialStage) setStage(initialStage)
  }, [initialStage])

  // Update context if prop changes
  useEffect(() => {
    if (initialContext) setContext(initialContext)
  }, [initialContext])

  const sendMessage = async (textToSend?: string, actionType?: GarrettAiContext['actionType']) => {
    const raw = (textToSend ?? input).trim()
    if (!raw || loading) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: raw,
      timestamp: Date.now(),
      context: context ? { ...context, actionType: actionType || context.actionType } : undefined,
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setLoading(true)
    const controller = new AbortController()
    requestControllerRef.current = controller

    // Build history formatted for API
    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.role,
      text: m.text.slice(0, 900),
    }))

    const activeContext = context ? { ...context, actionType: actionType || context.actionType } : undefined

    const result = await sendGarrettAiMessage({
      message: raw,
      history: historyPayload,
      stage,
      year: initialYear,
      context: activeContext,
      signal: controller.signal,
    })

    if (result.ok) {
      const modelMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: result.reply,
        timestamp: Date.now(),
        isFallback: result.fallback,
      }
      setMessages((prev) => [...prev, modelMsg])
    } else {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: result.error || 'Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: Date.now(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMsg])
    }

    setLoading(false)
    if (requestControllerRef.current === controller) requestControllerRef.current = null
  }

  const cancelRequest = () => {
    requestControllerRef.current?.abort()
    requestControllerRef.current = null
  }

  useEffect(() => () => requestControllerRef.current?.abort(), [])

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    void sendMessage()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const handleClear = () => {
    if (messages.length === 0) return
    if (window.confirm('¿Quieres limpiar la conversación con Garrett AI?')) {
      setMessages([])
      setHintLevel(1)
      try {
        sessionStorage.removeItem(`gm-ai-chat-${stage}`)
      } catch {
        // ok
      }
    }
  }

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Quick Action: Pedir pista progresiva
  const handleAskHint = () => {
    const nextLevel = hintLevel
    setHintLevel((prev) => (prev % 3) + 1)
    const prompt = context?.exercisePrompt
      ? `Dame una pista de nivel ${nextLevel} para resolver este ejercicio sin revelarme la solución todavía: "${context.exercisePrompt}"`
      : `Necesito una pista paso a paso (nivel ${nextLevel}) para orientar mi razonamiento matemático.`

    void sendMessage(prompt, 'hint')
  }

  // Quick Action: Ejemplo similar
  const handleAskExample = () => {
    const prompt = context?.exercisePrompt
      ? `Por favor, crea y resuelve un ejemplo similar al ejercicio "${context.exercisePrompt}" pero con diferentes números para entender el procedimiento paso a paso.`
      : `Muéstrame un ejemplo resuelto paso a paso adecuado para mi nivel (${stage}) que me ayude a practicar.`

    void sendMessage(prompt, 'example')
  }

  // Quick Action: Revisar mi error
  const handleAskDiagnose = () => {
    const prompt = context?.studentAnswer
      ? `Mi respuesta fue "${context.studentAnswer}". ¿Podrías explicarme en qué me equivoqué de forma constructiva y qué concepto debo revisar?`
      : `Cometí un error en mi cálculo. ¿Podrías hacerme una serie de preguntas para revisar juntos en qué paso me confundí?`

    void sendMessage(prompt, 'diagnose_error')
  }

  // Quick Action: Explicar lección
  const handleAskExplainLesson = () => {
    const prompt = context?.lessonTitle
      ? `¿Podrías explicarme con palabras sencillas y visuales el objetivo de la lección "${context.lessonTitle}"?`
      : `¿Podrías explicarme los conceptos fundamentales de matemáticas para la etapa de ${stage}?`

    void sendMessage(prompt, 'explain_lesson')
  }

  return (
    <div className="ai-shell">
      {/* Header Card */}
      <header className="ai-header-card">
        <div className="ai-header-left">
          <div className="ai-avatar-badge" aria-hidden="true">
            <Brain size={28} />
          </div>
          <div className="ai-header-titles">
            <span className="eyebrow"><Sparkles size={13} /> TUTOR INTELIGENTE</span>
            <h1>Garrett <span>AI</span></h1>
            <p>
              {userRole === 'teacher'
                ? 'Apoyo docente para diseñar explicaciones, guías y resolución pedagógica de ejercicios.'
                : 'Tu compañero matemático: pistas paso a paso, ejemplos similares y razonamiento guiado.'}
            </p>
          </div>
        </div>

        <div className="ai-header-controls">
          <label className="ai-stage-pill" title="Cambiar etapa educativa para adaptar las explicaciones">
            <span>Etapa:</span>
            <select value={stage} disabled aria-label="Etapa educativa verificada por tu perfil">
              {LEVEL_OPTIONS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </label>

          {messages.length > 0 && (
            <button
              type="button"
              className="ai-btn-ghost"
              onClick={handleClear}
              title="Borrar conversación y empezar de nuevo"
            >
              <Trash2 size={15} /> Limpiar
            </button>
          )}

          {onBack && (
            <button type="button" className="ai-btn-ghost" onClick={onBack}>
              Volver
            </button>
          )}
        </div>
      </header>

      {/* Context Banner if opened from a specific lesson/exercise */}
      {context && (
        <div className="ai-context-banner" role="status">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} />
            <span>
              Contexto activo: <strong>{context.lessonTitle || context.topicTitle || 'Lección seleccionada'}</strong>
              {context.exercisePrompt ? ` · Ejercicio: «${context.exercisePrompt.slice(0, 50)}${context.exercisePrompt.length > 50 ? '…' : ''}»` : ''}
            </span>
          </div>
          <button
            type="button"
            className="ai-context-clear"
            onClick={() => setContext(null)}
            title="Quitar contexto de lección"
            aria-label="Quitar contexto de lección"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Quick Action Chips */}
      <div className="ai-quick-actions" role="toolbar" aria-label="Acciones rápidas de tutoría">
        <button
          type="button"
          className="ai-action-chip"
          onClick={handleAskHint}
          disabled={loading}
        >
          <Lightbulb size={15} /> Pedir pista paso a paso
        </button>

        <button
          type="button"
          className="ai-action-chip"
          onClick={handleAskExample}
          disabled={loading}
        >
          <Layers size={15} /> Explicar con otro ejemplo
        </button>

        <button
          type="button"
          className="ai-action-chip"
          onClick={handleAskDiagnose}
          disabled={loading}
        >
          <HelpCircle size={15} /> Revisar mi error
        </button>

        <button
          type="button"
          className="ai-action-chip"
          onClick={handleAskExplainLesson}
          disabled={loading}
        >
          <BookOpen size={15} /> Explicar tema de la biblioteca
        </button>
      </div>

      {/* Chat Box */}
      <main className="ai-chat-box">
        <div className="ai-messages-scroll" role="log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="ai-starter-state">
              <div className="ai-starter-icon">
                <Brain size={28} />
              </div>
              <h2>¿En qué te puedo ayudar hoy?</h2>
              <p>
                Soy Garrett AI. Pregúntame sobre cualquier ejercicio, concepto o duda de matemáticas.
                Te guiaré paso a paso adaptado a {stage}.
              </p>

              <div className="ai-starter-prompts">
                {STARTER_PROMPTS[stage].map((promptText, i) => (
                  <button
                    key={i}
                    type="button"
                    className="ai-starter-btn"
                    onClick={() => void sendMessage(promptText)}
                  >
                    <span>{promptText}</span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`ai-msg ${m.role === 'user' ? 'ai-msg-user' : 'ai-msg-model'} ${m.isError ? 'ai-msg-error' : ''}`}
              >
                <div className="ai-msg-avatar" aria-hidden="true">
                  {m.role === 'user' ? (userRole === 'teacher' ? 'PD' : 'TÚ') : <Brain size={18} />}
                </div>
                <div className="ai-msg-content">
                  <div className="ai-formatted-text">
                    {m.text.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>
                        {paragraph.split('\n').map((line, lIdx) => (
                          <span key={lIdx}>
                            {renderAiLine(line)}
                            {lIdx < paragraph.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>

                  <div className="ai-msg-meta">
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      type="button"
                      className="ai-copy-btn"
                      onClick={() => copyMessage(m.id, m.text)}
                      title="Copiar respuesta"
                      aria-label="Copiar respuesta"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check size={12} /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="ai-msg ai-msg-model">
              <div className="ai-msg-avatar" aria-hidden="true">
                <Brain size={18} />
              </div>
              <div className="ai-msg-content">
                <div className="ai-typing-indicator">
                  <span>Garrett AI está razonando paso a paso</span>
                  <button type="button" className="ai-btn-ghost" onClick={cancelRequest} aria-label="Cancelar solicitud">Cancelar</button>
                  <span className="ai-typing-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form className="ai-input-form" onSubmit={handleFormSubmit}>
          <div className="ai-input-row">
            <textarea
              ref={textareaRef}
              className="ai-textarea"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                context?.exercisePrompt
                  ? `Pregunta sobre este ejercicio o pide una pista...`
                  : `Escribe tu pregunta o duda de matemáticas (Presiona Enter para enviar)...`
              }
              aria-label="Escribe tu mensaje a Garrett AI"
            />
            <button
              type="submit"
              className="ai-send-btn"
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje a Garrett AI"
              title="Enviar"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>

          <div className="ai-input-hint">
            <span className="ai-safety-badge">
              <ShieldCheck size={14} /> Tutor pedagógico de Garrett Math · Privacidad protegida
            </span>
            <span>Enter para enviar · Shift+Enter para nueva línea</span>
          </div>
        </form>
      </main>
    </div>
  )
}
