import { BookOpen, Cloud, CloudOff } from 'lucide-react'
import type { Catalog, Lesson } from '../types'
import type { ProgressApi } from '../../hooks/useProgress'
import type { FavoritesApi } from '../../hooks/useFavorites'
import { aggregate, continueLesson, lessonsOfGrade, lessonsOfStage, lessonStatus, suggestNextLesson } from '../logic/progress'
import { libRoutes } from '../routes'
import { formatActivity, plural } from '../format'
import TopicCard from '../components/TopicCard'
import { EmptyState, Link, ProgressBar, StatusChip, SyncNotice } from '../components/ui'

type Props = { catalog: Catalog; progress: ProgressApi; favorites: FavoritesApi; preferredGradeId?: string; signedIn: boolean }

function LessonRow({ catalog, lesson, progress }: { catalog: Catalog; lesson: Lesson; progress: ProgressApi }) {
  const rec = progress.map[lesson.id]; const topic = catalog.topicById.get(lesson.topicId); const date = formatActivity(rec?.updatedAt)
  return <li className="lib-row"><div><Link to={libRoutes.lesson(lesson.id)} className="lib-topic-name">{lesson.title}</Link><small>{topic?.title}{date ? ` · ${date}` : ''}{rec?.score != null ? ` · ${rec.score} %` : ''}</small></div><StatusChip status={lessonStatus(rec)} kind="lesson" /></li>
}

export default function MyLearning({ catalog, progress, favorites, preferredGradeId, signedIn }: Props) {
  const all = catalog.lessons
  const byStatus = (s: 'in_progress' | 'completed') => all.filter((l) => progress.map[l.id]?.status === s).sort((a, b) => (progress.map[b.id]?.updatedAt ?? '').localeCompare(progress.map[a.id]?.updatedAt ?? ''))
  const inProgress = byStatus('in_progress'); const completed = byStatus('completed')
  const cont = continueLesson(catalog, progress.map); const suggested = cont ?? suggestNextLesson(catalog, progress.map, preferredGradeId)
  const pending = all.filter((l) => lessonStatus(progress.map[l.id]) === 'not_started')
  const total = aggregate(all, progress.map)
  const favTopics = catalog.topics.filter((t) => favorites.has(t.id))
  const gradeId = preferredGradeId && catalog.gradeById.has(preferredGradeId) ? preferredGradeId : undefined
  const orphan = Object.keys(progress.map).filter((id) => !catalog.lessonById.has(id)).length

  return (
    <>
      <section className="lib-hero lib-hero-compact"><span className="lib-kicker">MI APRENDIZAJE</span><h1>Tu avance y lo que sigue</h1>
        <p>El avance solo cuenta lecciones que realmente completaste: abrir una lección no la marca como hecha.</p>
        <ProgressBar percent={total.percent} label="Avance en toda la Biblioteca" detail={`${total.completed} de ${plural(total.total, 'lección', 'lecciones')} completadas`} />
        <SyncNotice sync={progress.sync} scope={progress.scope} onRetry={progress.retrySync} />
        {!signedIn && <p className="lib-note"><CloudOff size={16} aria-hidden="true" />Estás explorando sin cuenta. Inicia sesión para guardar tu progreso en tu cuenta cuando la nube esté conectada.</p>}
        {progress.demoImportable > 0 && <p className="lib-note"><Cloud size={16} aria-hidden="true" />Hay progreso guardado en este navegador antes de iniciar sesión ({plural(progress.demoImportable, 'lección', 'lecciones')}). <button type="button" className="lib-link-btn" onClick={progress.importDemo}>Añadirlo a mi cuenta</button></p>}
      </section>

      {suggested && <section className="lib-continue"><div><span className="lib-kicker">{cont ? 'CONTINÚA DONDE LO DEJASTE' : 'SIGUIENTE PASO SUGERIDO'}</span><h2>{suggested.title}</h2><p>{catalog.topicById.get(suggested.topicId)?.title} · {suggested.minutes} min</p></div><Link to={libRoutes.lesson(suggested.id)} className="lib-btn lib-btn-primary">{cont ? 'Continuar' : 'Empezar'}</Link></section>}

      <section className="lib-section" aria-labelledby="ml-prog"><h2 id="ml-prog">Avance por etapa y grado</h2>
        <div className="lib-grid lib-grid-2">{catalog.stages.map((stage) => { const a = aggregate(lessonsOfStage(catalog, stage.id), progress.map); return <div key={stage.id} className="lib-card"><h3><Link to={libRoutes.stage(stage.id)} className="lib-card-link">{stage.name}</Link></h3><ProgressBar percent={a.percent} label={`Avance en ${stage.name}`} detail={`${a.completed}/${a.total}`} />
          <ul className="lib-mini-list">{(catalog.gradesByStage.get(stage.id) ?? []).map((g) => { const ga = aggregate(lessonsOfGrade(catalog, g.id), progress.map); return <li key={g.id} className={g.id === gradeId ? 'is-current' : ''}><Link to={libRoutes.grade(g.id)}>{g.name}{g.id === gradeId ? ' (tu grado)' : ''}</Link><span>{ga.completed}/{ga.total} · {ga.percent} %</span></li> })}</ul></div> })}</div></section>

      <section className="lib-section" aria-labelledby="ml-doing"><h2 id="ml-doing">En progreso</h2>
        {inProgress.length === 0 ? <EmptyState title="No tienes lecciones en progreso" icon={<BookOpen size={26} aria-hidden="true" />}><p>Cuando empieces una lección y la dejes a medias, aparecerá aquí para que continúes.</p></EmptyState> : <ul className="lib-rows">{inProgress.map((l) => <LessonRow key={l.id} catalog={catalog} lesson={l} progress={progress} />)}</ul>}</section>

      <section className="lib-section" aria-labelledby="ml-pending"><h2 id="ml-pending">Pendiente</h2>
        {pending.length === 0 ? <EmptyState title="No quedan lecciones sin empezar" /> : <>
          <p className="lib-muted">{plural(pending.length, 'lección sin empezar', 'lecciones sin empezar')}. Estas son las primeras{gradeId ? ' de tu grado' : ''}:</p>
          <ul className="lib-rows">{(gradeId ? pending.filter((l) => lessonsOfGrade(catalog, gradeId).some((g) => g.id === l.id)) : pending).slice(0, 6).map((l) => <LessonRow key={l.id} catalog={catalog} lesson={l} progress={progress} />)}</ul>
          <p><Link to={libRoutes.home} className="lib-btn lib-btn-secondary">Buscar en la Biblioteca</Link></p></>}</section>

      <section className="lib-section" aria-labelledby="ml-done"><h2 id="ml-done">Completadas</h2>
        {completed.length === 0 ? <EmptyState title="Aún no completaste ninguna lección"><p>Resuelve los ejercicios de una lección para completarla.</p></EmptyState> : <ul className="lib-rows">{completed.map((l) => <LessonRow key={l.id} catalog={catalog} lesson={l} progress={progress} />)}</ul>}</section>

      <section className="lib-section" aria-labelledby="ml-fav"><h2 id="ml-fav">Temas guardados</h2>
        <p className="lib-muted">Los temas guardados se almacenan solo en este navegador{signedIn ? ' (no se sincronizan con tu cuenta)' : ''}.</p>
        {favTopics.length === 0 ? <EmptyState title="Todavía no guardaste temas"><p>Usa el corazón de cada tema para encontrarlo rápido más tarde.</p></EmptyState> : <div className="lib-grid lib-grid-3">{favTopics.map((t) => <TopicCard key={t.id} catalog={catalog} topic={t} progress={progress.map} favorite onToggleFavorite={() => favorites.toggle(t.id)} />)}</div>}</section>
      {orphan > 0 && <p className="lib-muted">Tienes progreso de {plural(orphan, 'lección', 'lecciones')} de otras etapas (por ejemplo, de Secundaria o Universidad) que no se muestran aquí.</p>}
    </>
  )
}
