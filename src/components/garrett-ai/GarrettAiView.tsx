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

function formatLatex(source: string): string {
  let value = source.trim()
  const symbols: Record<string, string> = {
    '\\times': '×', '\\cdot': '·', '\\div': '÷', '\\pm': '±',
    '\\neq': '≠', '\\leq': '≤', '\\geq': '≥', '\\le': '≤', '\\ge': '≥',
    '\\approx': '≈', '\\infty': '∞', '\\pi': 'π', '\\theta': 'θ',
    '\\alpha': 'α', '\\beta': 'β', '\\sum': '∑', '\\int': '∫',
    '\\rightarrow': '→', '\\to': '→', '\\Rightarrow': '⇒',
    '\\in': '∈', '\\notin': '∉', '\\emptyset': '∅',
    '\\degree': '°', '\\angle': '∠', '\\therefore': '∴',
  }
  value = value.replace(/\\(?:d?frac)\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)')
  value = value.replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)')
  value = value.replace(/\\sqrt\s*\[([^\]]+)\]\s*\{([^{}]*)\}/g, '√[$1]($2)')
  for (const [command, symbol] of Object.entries(symbols)) value = value.split(command).join(symbol)
  value = value
    .replace(/\\(?:left|right|displaystyle|textstyle|quad|qquad)/g, ' ')
    .replace(/\\(?:text|mathrm|mathbf|operatorname)\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\[,;!]/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const superscripts: Record<string, string> = {
    '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
    '+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾','n':'ⁿ','i':'ⁱ',
  }
  value = value.replace(/\^\{([^{}]+)\}|\^([0-9+\-=()ni])/g, (_match, group: string | undefined, single: string | undefined) =>
    [...(group ?? single ?? '')].map((char) => superscripts[char] ?? char).join(''),
  )
  return value
}

function renderAiLine(line: string, keyPrefix = 'line') {
  const tokenPattern = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+\$|\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*\n]+\*(?!\*)|(?<!_)_[^_\n]+_(?!_)|\x60[^\x60]+\x60)/g
  const parts = line.split(tokenPattern)
  return parts.map((part, index) => {
    if (!part) return null
    const key = keyPrefix + '-' + index
    const displayMath = (part.startsWith('$$') && part.endsWith('$$')) || (part.startsWith('\\[') && part.endsWith('\\]'))
    const inlineMath = (part.startsWith('$') && part.endsWith('$')) || (part.startsWith('\\(') && part.endsWith('\\)'))
    if (displayMath || inlineMath) {
      const content = part.startsWith('$$') ? part.slice(2, -2) : part.startsWith('$') ? part.slice(1, -1) : part.slice(2, -2)
      const formatted = formatLatex(content)
      return <span key={key} className={displayMath ? 'ai-math-expression ai-math-display' : 'ai-math-expression'} role="math" aria-label={'Expresión matemática: ' + formatted}>{formatted}</span>
    }
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={key}>{renderAiLine(part.slice(2, -2), key)}</strong>
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={key}>{renderAiLine(part.slice(1, -1), key)}</em>
    }
    if (part.charCodeAt(0) === 96 && part.charCodeAt(part.length - 1) === 96) return <code key={key}>{part.slice(1, -1)}</code>
    return <span key={key}>{part}</span>
  })
}

function renderAiMessage(text: string) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const blocks: Array<{ type: 'paragraph' | 'ul' | 'ol' | 'heading'; lines: string[]; level?: number }> = []
  let paragraph: string[] = []
  let listType: 'ul' | 'ol' | null = null
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', lines: paragraph })
    paragraph = []
  }
  const flushList = () => { listType = null }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { flushParagraph(); flushList(); continue }
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/)
    const bullet = trimmed.match(/^[-*•]\s+(.+)$/)
    const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/)
    if (heading) {
      flushParagraph(); flushList()
      blocks.push({ type: 'heading', lines: [heading[2]], level: heading[1].length })
    } else if (bullet || numbered) {
      flushParagraph()
      const nextType = bullet ? 'ul' : 'ol'
      if (listType !== nextType) { flushList(); blocks.push({ type: nextType, lines: [] }); listType = nextType }
      blocks[blocks.length - 1].lines.push((bullet ?? numbered)![1])
    } else { flushList(); paragraph.push(trimmed) }
  }
  flushParagraph()

  return blocks.map((block, index) => {
    const content = block.lines.map((line, lineIndex) => (
      <span key={index + '-' + lineIndex}>
        {renderAiLine(line, 'block-' + index + '-line-' + lineIndex)}
        {lineIndex < block.lines.length - 1 && block.type === 'paragraph' ? <br /> : null}
      </span>
    ))
    if (block.type === 'ul') return <ul key={index}>{content.map((item, i) => <li key={i}>{item}</li>)}</ul>
    if (block.type === 'ol') return <ol key={index}>{content.map((item, i) => <li key={i}>{item}</li>)}</ol>
    if (block.type === 'heading') return <h3 key={index} className={'ai-response-heading ai-response-heading-' + block.level}>{content}</h3>
    return <p key={index}>{content}</p>
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
                    {renderAiMessage(m.text)}
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
