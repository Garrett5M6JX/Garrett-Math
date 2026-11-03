import { useId, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, Brain, Check, Lightbulb, RotateCcw, X } from 'lucide-react'
import type { Exercise } from '../types'
import { correctAnswerText, shuffleDeterministic, type ExerciseResponse } from '../logic/exercises'
import { navigateTo } from '../../router/navigation'
import Visual from './Visual'
import { ReadAloud } from './ui'

export type ExSession = {
  status: 'idle' | 'wrong' | 'right' | 'revealed'
  hints: number
  choice: number | null
  text: string
  order: string[]
  /** Mensaje del último resultado (explicación del error específico, si existe). */
  message?: string
  /** Mensaje de validación (respuesta vacía o mal escrita). No cuenta como intento. */
  invalid?: string
  /** Se resolvió en una visita anterior (dato guardado). */
  solvedBefore?: boolean
}
export function initSession(exercise: Exercise, solvedBefore: boolean): ExSession {
  return { status: solvedBefore ? 'right' : 'idle', hints: 0, choice: null, text: '', order: exercise.type === 'order' ? shuffleDeterministic(exercise.items, exercise.id) : [], solvedBefore }
}
export function responseOf(exercise: Exercise, s: ExSession): ExerciseResponse {
  switch (exercise.type) {
    case 'choice': return { type: 'choice', index: s.choice }
    case 'number': return { type: 'number', text: s.text }
    case 'fraction': return { type: 'fraction', text: s.text }
    case 'order': return { type: 'order', order: s.order }
  }
}

type Props = { exercise: Exercise; number: number; total: number; session: ExSession; onChange: (next: ExSession) => void; onCheck: () => void; onReveal: () => void }

export default function ExercisePlayer({ exercise, number, total, session, onChange, onCheck, onReveal }: Props) {
  const uid = useId()
  const [live, setLive] = useState('')
  const locked = session.status === 'right' || session.status === 'revealed'
  const hintsAvailable = exercise.hints.length
  const canReveal = !locked && session.hints >= hintsAvailable
  const set = (patch: Partial<ExSession>) => onChange({ ...session, ...patch, invalid: undefined })
  const submit = (event: FormEvent) => { event.preventDefault(); if (!locked) onCheck() }
  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= session.order.length) return
    const next = [...session.order]; [next[index], next[target]] = [next[target], next[index]]
    set({ order: next, status: session.status === 'wrong' ? 'idle' : session.status })
    setLive(`«${next[target]}» ahora está en la posición ${target + 1} de ${next.length}.`)
  }
  const describedBy = [session.invalid ? `${uid}-err` : '', `${uid}-fb`].filter(Boolean).join(' ')

  return (
    <form className="lib-exercise" onSubmit={submit} noValidate aria-labelledby={`${uid}-q`}>
      <div className="lib-ex-head"><span className="lib-kicker">EJERCICIO {number} DE {total}</span><ReadAloud text={exercise.prompt} /></div>
      <h2 id={`${uid}-q`}>{exercise.prompt}</h2>
      {exercise.visual && <Visual spec={exercise.visual} />}

      {exercise.type === 'choice' && (
        <fieldset className="lib-options" disabled={locked} aria-describedby={describedBy}>
          <legend className="lib-sr">Elige una respuesta</legend>
          {exercise.options.map((option, i) => {
            const selected = session.choice === i
            const isCorrect = i === exercise.answerIndex
            const mark = session.status === 'right' && isCorrect ? 'right' : session.status === 'revealed' && isCorrect ? 'right' : session.status === 'wrong' && selected ? 'wrong' : ''
            return <label key={option} className={`lib-option ${selected ? 'selected' : ''} ${mark}`}>
              <input type="radio" name={`${uid}-opt`} checked={selected} onChange={() => set({ choice: i, status: session.status === 'wrong' ? 'idle' : session.status })} />
              <span>{option}</span>
              {mark === 'right' && <span className="lib-option-mark"><Check size={16} aria-hidden="true" /> Correcta</span>}
              {mark === 'wrong' && <span className="lib-option-mark"><X size={16} aria-hidden="true" /> Todavía no</span>}
            </label>
          })}
        </fieldset>
      )}

      {(exercise.type === 'number' || exercise.type === 'fraction') && (
        <div className="lib-answer-field">
          <label htmlFor={`${uid}-in`}>{exercise.type === 'number' ? 'Tu respuesta (un número)' : 'Tu respuesta (fracción a/b)'}</label>
          <div className="lib-input-row">
            <input id={`${uid}-in`} type="text" inputMode={exercise.type === 'number' ? 'decimal' : 'text'} autoComplete="off" value={session.text} disabled={locked}
              onChange={(e) => set({ text: e.target.value, status: session.status === 'wrong' ? 'idle' : session.status })}
              aria-invalid={Boolean(session.invalid)} aria-describedby={describedBy} placeholder={exercise.type === 'number' ? 'Escribe el número' : 'Por ejemplo 3/4'} />
            {exercise.type === 'number' && exercise.unit && <span className="lib-unit-suffix">{exercise.unit}</span>}
          </div>
          {session.invalid && <p id={`${uid}-err`} className="lib-field-error" role="alert">{session.invalid}</p>}
        </div>
      )}

      {exercise.type === 'order' && (
        <div className="lib-order">
          <p className="lib-muted" id={`${uid}-ohelp`}>Usa los botones para subir o bajar cada elemento hasta ponerlos en orden.</p>
          <ol aria-describedby={`${uid}-ohelp`}>{session.order.map((item, i) => (
            <li key={item}><span className="lib-order-pos" aria-hidden="true">{i + 1}</span><span className="lib-order-text">{item}</span>
              <span className="lib-order-btns">
                <button type="button" className="lib-icon-btn" disabled={locked || i === 0} onClick={() => move(i, -1)} aria-label={`Subir «${item}»`}><ArrowUp size={17} aria-hidden="true" /></button>
                <button type="button" className="lib-icon-btn" disabled={locked || i === session.order.length - 1} onClick={() => move(i, 1)} aria-label={`Bajar «${item}»`}><ArrowDown size={17} aria-hidden="true" /></button>
              </span></li>))}</ol>
          <p className="lib-sr" role="status" aria-live="polite">{live}</p>
        </div>
      )}

      {session.hints > 0 && !locked && <ul className="lib-hints" aria-label="Pistas">{exercise.hints.slice(0, session.hints).map((hint, i) => <li key={i}><Lightbulb size={16} aria-hidden="true" /><span><b>Pista {i + 1}:</b> {hint}</span></li>)}</ul>}

      <div id={`${uid}-fb`} className="lib-feedback-wrap" role="status" aria-live="polite">
        {session.status === 'wrong' && <div className="lib-feedback wrong"><strong>Todavía no es correcto.</strong> Puedes intentarlo otra vez, sin ninguna penalización.{session.message && <p>{session.message}</p>}</div>}
        {session.status === 'right' && <div className="lib-feedback right"><strong>{session.solvedBefore && session.hints === 0 && !session.message ? 'Ya resolviste este ejercicio antes.' : '¡Correcto!'}</strong><p>{exercise.explanation}</p></div>}
        {session.status === 'revealed' && <div className="lib-feedback revealed"><strong>Respuesta: {correctAnswerText(exercise)}</strong><p>{exercise.explanation}</p><p className="lib-muted">Como viste la respuesta, este ejercicio no cuenta como resuelto hasta que lo hagas por tu cuenta (por ejemplo, con «Practicar de nuevo»).</p></div>}
      </div>

      <div className="lib-ex-actions">
        {!locked && <button type="submit" className="lib-btn lib-btn-primary">Comprobar respuesta</button>}
        {!locked && session.hints < hintsAvailable && <button type="button" className="lib-btn lib-btn-secondary" onClick={() => set({ hints: session.hints + 1 })}><Lightbulb size={16} aria-hidden="true" /> Pista {session.hints + 1} de {hintsAvailable}</button>}
        <button
          type="button"
          className="lib-btn lib-btn-ghost"
          onClick={() => {
            sessionStorage.setItem('garrett-ai-pending-context', JSON.stringify({
              exercisePrompt: exercise.prompt,
              exerciseType: exercise.type,
              hintsAvailable: exercise.hints,
              studentAnswer: session.text || (session.choice !== null ? exercise.type === 'choice' ? exercise.options[session.choice] : '' : ''),
              actionType: session.status === 'wrong' ? 'diagnose_error' : 'hint',
            }))
            navigateTo('/garrett-ai')
          }}
          title="Pedir ayuda o pistas guiadas a Garrett AI"
        >
          <Brain size={15} aria-hidden="true" /> Garrett AI
        </button>
        {canReveal && <button type="button" className="lib-btn lib-btn-ghost" onClick={onReveal}>Ver la respuesta</button>}
        {locked && <button type="button" className="lib-btn lib-btn-ghost" onClick={() => onChange({ ...initSession(exercise, false), solvedBefore: session.solvedBefore })}><RotateCcw size={15} aria-hidden="true" /> Practicar de nuevo</button>}
      </div>
      {!locked && !canReveal && <p className="lib-muted lib-reveal-note">La respuesta se puede ver después de usar todas las pistas.</p>}
    </form>
  )
}
