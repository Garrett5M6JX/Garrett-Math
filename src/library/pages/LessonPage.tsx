import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Brain, CircleCheck, Clock3, Info, RotateCcw, Trophy } from 'lucide-react'
import type { Catalog, Exercise } from '../types'
import type { ProgressApi } from '../../hooks/useProgress'
import { checkExercise } from '../logic/exercises'
import { requiredSolved } from '../logic/progress'
import { gradeOfTopic, lessonNeighbors } from '../logic/navigation'
import { lastLibraryUrl, libRoutes } from '../routes'
import { navigateTo } from '../../router/navigation'
import { plural } from '../format'
import ExercisePlayer, { initSession, responseOf, type ExSession } from '../components/ExercisePlayer'
import Visual from '../components/Visual'
import { Breadcrumbs, DifficultyChip, DraftBadge, Link, ReadAloud, SyncNotice } from '../components/ui'
import { NotFoundPage } from './BrowsePages'

type Step = { kind: 'section'; i: number } | { kind: 'example' } | { kind: 'exercise'; i: number } | { kind: 'summary' }
type Props = { catalog: Catalog; progress: ProgressApi; id: string }

export default function LessonPage({ catalog, progress, id }: Props) {
  const lesson = catalog.lessonById.get(id)
  if (!lesson) return <NotFoundPage what="La lección" />
  return <LessonPlayer catalog={catalog} progress={progress} lessonId={id} />
}

function LessonPlayer({ catalog, progress, lessonId }: { catalog: Catalog; progress: ProgressApi; lessonId: string }) {
  const lesson = catalog.lessonById.get(lessonId)!
  const topic = catalog.topicById.get(lesson.topicId)!
  const grade = gradeOfTopic(catalog, topic); const stage = grade ? catalog.stageById.get(grade.stageId) : undefined
  const steps = useMemo<Step[]>(() => [...lesson.sections.map((_, i) => ({ kind: 'section', i }) as Step), { kind: 'example' }, ...lesson.exercises.map((_, i) => ({ kind: 'exercise', i }) as Step), { kind: 'summary' }], [lesson])
  const record = progress.map[lessonId]
  const [stepIndex, setStepIndex] = useState(() => record && record.status === 'in_progress' ? Math.min(record.lastStep, steps.length - 1) : 0)
  const [sessions, setSessions] = useState<Record<string, ExSession>>({})
  const [shownSteps, setShownSteps] = useState(1)
  const headingRef = useRef<HTMLDivElement>(null)
  const step = steps[stepIndex]
  const { next, nextTopicFirst } = lessonNeighbors(catalog, lessonId)
  const need = requiredSolved(lesson)
  const solved = record?.solved ?? []
  const completed = record?.status === 'completed'

  const sessionFor = (exercise: Exercise): ExSession => sessions[exercise.id] ?? initSession(exercise, solved.includes(exercise.id))
  const setSession = (exercise: Exercise, s: ExSession) => setSessions((prev) => ({ ...prev, [exercise.id]: s }))
  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, index))
    setStepIndex(clamped); progress.setStep(lessonId, clamped)
  }
  const firstStep = useRef(true)
  // Al avanzar de paso, lleva el foco y la vista al contenido (no en la carga inicial).
  useEffect(() => { if (firstStep.current) { firstStep.current = false; return } headingRef.current?.focus({ preventScroll: true }); headingRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' }) }, [stepIndex])

  const check = (exercise: Exercise) => {
    const s = sessionFor(exercise)
    const result = checkExercise(exercise, responseOf(exercise, s))
    if (result.status === 'invalid') { setSession(exercise, { ...s, invalid: result.message }); return }
    const correct = result.status === 'correct'
    progress.recordAttempt(lesson, exercise.id, correct)
    setSession(exercise, { ...s, status: correct ? 'right' : 'wrong', message: result.status === 'incorrect' ? result.message : undefined, invalid: undefined, solvedBefore: false })
  }
  const reveal = (exercise: Exercise) => { progress.recordReveal(lesson, exercise.id); setSession(exercise, { ...sessionFor(exercise), status: 'revealed', invalid: undefined }) }
  const practiceAgain = () => { progress.resetPractice(lessonId); setSessions({}); setShownSteps(1); setStepIndex(0) }

  const exerciseStep = step.kind === 'exercise' ? lesson.exercises[step.i] : null
  const exerciseSession = exerciseStep ? sessionFor(exerciseStep) : null
  const exerciseDone = exerciseSession ? exerciseSession.status === 'right' || exerciseSession.status === 'revealed' : true
  const exampleDone = shownSteps >= lesson.workedExample.steps.length
  const phase = step.kind === 'section' ? `Aprende · ${step.i + 1} de ${lesson.sections.length}` : step.kind === 'example' ? 'Mira un ejemplo' : step.kind === 'exercise' ? `Practica · ${step.i + 1} de ${lesson.exercises.length}` : 'Resumen'
  const percent = Math.round((stepIndex / (steps.length - 1)) * 100)
  const revealedCount = (record?.revealed ?? []).length
  const nextTarget = next ?? nextTopicFirst
  const firstPending = lesson.exercises.findIndex((e) => !solved.includes(e.id))

  return (
    <div className="lib-lesson">
      <Breadcrumbs items={[{ label: 'Biblioteca', to: lastLibraryUrl() }, { label: stage?.name ?? 'Etapa', to: stage ? libRoutes.stage(stage.id) : undefined }, { label: grade?.name ?? 'Grado', to: grade ? libRoutes.grade(grade.id) : undefined }, { label: topic.title, to: libRoutes.topic(topic.id) }, { label: lesson.title }]} />
      <header className="lib-lesson-head">
        <div className="lib-chips">
          <span className="lib-chip"><Clock3 size={13} aria-hidden="true" />{lesson.minutes} min</span>
          <DifficultyChip level={lesson.difficulty} />
          {lesson.reviewStatus !== 'revisado' && <DraftBadge />}
          {completed && <span className="lib-chip lib-status status-completed"><CircleCheck size={13} aria-hidden="true" />Completada</span>}
          <button
            type="button"
            className="lib-chip"
            onClick={() => {
              sessionStorage.setItem('garrett-ai-pending-context', JSON.stringify({
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                topicTitle: topic.title,
                objective: lesson.objective,
                workedExample: `${lesson.workedExample.title}: ${lesson.workedExample.problem} -> ${lesson.workedExample.answer}`,
                actionType: 'explain_lesson',
              }))
              navigateTo('/garrett-ai')
            }}
            title="Preguntar a Garrett AI sobre esta lección"
            style={{ cursor: 'pointer', background: '#eeedff', color: '#5d56dc', borderColor: '#d3cffe', fontWeight: 700 }}
          >
            <Brain size={13} aria-hidden="true" /> Garrett AI
          </button>
        </div>
        <h1>{lesson.title}</h1>
        <p className="lib-objective"><b>Objetivo:</b> {lesson.objective}</p>
        <div className="lib-stepbar" aria-label="Progreso de la lección">
          <div className="lib-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={`Paso ${stepIndex + 1} de ${steps.length}`}><span style={{ width: `${percent}%` }} /></div>
          <span>Paso {stepIndex + 1} de {steps.length} · {phase}</span>
        </div>
      </header>

      <div className="lib-lesson-card" ref={headingRef} tabIndex={-1} role="region" aria-label={phase}>
        {step.kind === 'section' && (() => { const s = lesson.sections[step.i]; return <>
          <div className="lib-ex-head"><span className="lib-kicker">APRENDE</span><ReadAloud text={`${s.title}. ${s.body.join(' ')}`} /></div>
          <h2>{s.title}</h2>{s.body.map((p, i) => <p key={i} className="lib-body">{p}</p>)}
          {s.visual && <Visual spec={s.visual} />}
          {s.keyIdea && <p className="lib-key"><Info size={18} aria-hidden="true" /><span><b>Idea clave:</b> {s.keyIdea}</span></p>}
        </> })()}

        {step.kind === 'example' && <>
          <span className="lib-kicker">MIRA UN EJEMPLO RESUELTO</span><h2>{lesson.workedExample.title}</h2>
          <p className="lib-problem"><b>Problema:</b> {lesson.workedExample.problem}</p>
          <ol className="lib-steps">{lesson.workedExample.steps.slice(0, shownSteps).map((s, i) => <li key={i}><span className="lib-step-n" aria-hidden="true">{i + 1}</span><div><p>{s.text}</p>{s.visual && <Visual spec={s.visual} />}</div></li>)}</ol>
          {exampleDone ? <p className="lib-answer"><CircleCheck size={18} aria-hidden="true" /><span><b>Respuesta:</b> {lesson.workedExample.answer}</span></p>
            : <button type="button" className="lib-btn lib-btn-secondary" onClick={() => setShownSteps((n) => n + 1)}>Mostrar el siguiente paso ({shownSteps} de {lesson.workedExample.steps.length})</button>}
        </>}

        {exerciseStep && exerciseSession && <ExercisePlayer key={exerciseStep.id} exercise={exerciseStep} number={(step as { i: number }).i + 1} total={lesson.exercises.length} session={exerciseSession} onChange={(s) => setSession(exerciseStep, s)} onCheck={() => check(exerciseStep)} onReveal={() => reveal(exerciseStep)} />}

        {step.kind === 'summary' && <>
          <div className={`lib-result ${completed ? 'done' : ''}`}>
            <Trophy size={30} aria-hidden="true" />
            <div><h2>{completed ? '¡Lección completada!' : 'Todavía no está completada'}</h2>
              <p>{completed ? `Resolviste ${solved.length} de ${plural(lesson.exercises.length, 'ejercicio', 'ejercicios')} (el mínimo era ${need}).` : `Llevas ${solved.length} de ${lesson.exercises.length} ejercicios resueltos. Necesitas al menos ${need} para completarla.`}</p>
              {record && record.score !== null && <p className="lib-muted">Mejor resultado: {record.score} % · {plural(record.attempts, 'comprobación', 'comprobaciones')}{progress.scope === 'user' ? ' (los intentos se guardan en este dispositivo)' : ''}</p>}
              {revealedCount > 0 && <p className="lib-muted">Viste la respuesta de {plural(revealedCount, 'ejercicio', 'ejercicios')}; no cuentan hasta que los resuelvas tú.</p>}</div>
          </div>
          <h3>Lo esencial</h3><ul className="lib-summary">{lesson.summary.map((s) => <li key={s}>{s}</li>)}</ul>
          <p className="lib-criteria"><Info size={16} aria-hidden="true" />Criterio de finalización: resolver correctamente al menos {need} de {lesson.exercises.length} ejercicios. Puedes reintentar cuantas veces quieras.</p>
          <SyncNotice sync={progress.sync} scope={progress.scope} onRetry={progress.retrySync} />
          <div className="lib-ex-actions">
            {!completed && firstPending >= 0 && <button type="button" className="lib-btn lib-btn-primary" onClick={() => goTo(lesson.sections.length + 1 + firstPending)}>Ir al primer ejercicio pendiente</button>}
            {completed && nextTarget && <button type="button" className="lib-btn lib-btn-primary" onClick={() => navigateTo(libRoutes.lesson(nextTarget.id))}>Siguiente lección: {nextTarget.title} <ArrowRight size={16} aria-hidden="true" /></button>}
            <Link to={libRoutes.topic(topic.id)} className="lib-btn lib-btn-secondary">Volver al tema</Link>
            <button type="button" className="lib-btn lib-btn-ghost" onClick={practiceAgain}><RotateCcw size={15} aria-hidden="true" /> Practicar de nuevo</button>
          </div>
        </>}
      </div>

      {step.kind !== 'summary' && <div className="lib-lesson-nav">
        <button type="button" className="lib-btn lib-btn-secondary" onClick={() => goTo(stepIndex - 1)} disabled={stepIndex === 0}><ArrowLeft size={16} aria-hidden="true" /> Anterior</button>
        <button type="button" className="lib-btn lib-btn-primary" onClick={() => goTo(stepIndex + 1)} disabled={(step.kind === 'exercise' && !exerciseDone) || (step.kind === 'example' && !exampleDone)}>{step.kind === 'exercise' && step.i === lesson.exercises.length - 1 ? 'Ver resumen' : 'Continuar'} <ArrowRight size={16} aria-hidden="true" /></button>
      </div>}
      {step.kind === 'exercise' && !exerciseDone && <p className="lib-muted lib-nav-note">Resuelve el ejercicio (o usa las pistas y mira la respuesta) para continuar.</p>}
      {step.kind === 'example' && !exampleDone && <p className="lib-muted lib-nav-note">Muestra todos los pasos para continuar.</p>}
    </div>
  )
}
