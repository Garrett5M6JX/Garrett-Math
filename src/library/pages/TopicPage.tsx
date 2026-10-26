import { ArrowLeft, ArrowRight, Clock3, Lock, Play, RotateCcw } from 'lucide-react'
import type { Catalog } from '../types'
import type { ProgressApi } from '../../hooks/useProgress'
import type { FavoritesApi } from '../../hooks/useFavorites'
import { aggregate, lessonStatus, lessonsOfTopic, topicAggregate, topicStatus } from '../logic/progress'
import { areaOfTopic, dependentTopics, gradeOfTopic, prerequisiteTopics, relatedTopics, topicNeighbors } from '../logic/navigation'
import { lastLibraryUrl, libRoutes } from '../routes'
import { formatActivity, plural } from '../format'
import { activityLabel } from '../logic/search'
import TopicCard from '../components/TopicCard'
import { AreaChip, Breadcrumbs, DifficultyChip, DraftBadge, FavoriteButton, Link, ProgressBar, StatusChip } from '../components/ui'
import { NotFoundPage } from './BrowsePages'

type Props = { catalog: Catalog; progress: ProgressApi; favorites: FavoritesApi; id: string }

export default function TopicPage({ catalog, progress, favorites, id }: Props) {
  const topic = catalog.topicById.get(id)
  if (!topic) return <NotFoundPage what="El tema" />
  const unit = catalog.unitById.get(topic.unitId); const grade = gradeOfTopic(catalog, topic); const area = areaOfTopic(catalog, topic)
  const stage = grade ? catalog.stageById.get(grade.stageId) : undefined
  const lessons = lessonsOfTopic(catalog, id)
  const agg = topicAggregate(catalog, topic, progress.map); const status = topicStatus(agg)
  const { prev, next } = topicNeighbors(catalog, id)
  const prereqs = prerequisiteTopics(catalog, topic); const dependents = dependentTopics(catalog, id).filter((t) => (catalog.lessonsByTopic.get(t.id)?.length ?? 0) > 0)
  const related = relatedTopics(catalog, id, 4)
  const activities = Array.from(new Set(lessons.flatMap((l) => l.exercises.map((e) => e.type))))
  const firstPending = lessons.find((l) => lessonStatus(progress.map[l.id]) !== 'completed') ?? lessons[0]
  const startLabel = agg.completed === agg.total && agg.total > 0 ? 'Repasar el tema' : agg.completed + agg.inProgress > 0 ? 'Continuar el tema' : 'Empezar el tema'

  return (
    <>
      <Breadcrumbs items={[{ label: 'Biblioteca', to: lastLibraryUrl() }, { label: stage?.name ?? 'Etapa', to: stage ? libRoutes.stage(stage.id) : undefined }, { label: grade?.name ?? 'Grado', to: grade ? libRoutes.grade(grade.id) : undefined }, { label: topic.title }]} />
      <section className="lib-hero lib-hero-compact">
        <div className="lib-hero-row"><div className="lib-chips">{area && <AreaChip areaId={area.id} icon={area.icon} name={area.name} />}<DifficultyChip level={topic.difficulty} />{lessons.some((l) => l.reviewStatus !== 'revisado') && <DraftBadge />}</div>
          <FavoriteButton active={favorites.has(id)} onToggle={() => favorites.toggle(id)} title={topic.title} /></div>
        <h1>{topic.title}</h1><p>{topic.description}</p>
        <p className="lib-muted">{grade?.name} · Unidad: {unit?.title}</p>
        {lessons.length > 0 ? <>
          <ProgressBar percent={agg.percent} label={`Avance en ${topic.title}`} detail={`${agg.completed} de ${plural(agg.total, 'lección completada', 'lecciones completadas')}`} />
          <div className="lib-hero-actions"><StatusChip status={status} />{firstPending && <Link to={libRoutes.lesson(firstPending.id)} className="lib-btn lib-btn-primary"><Play size={16} aria-hidden="true" /> {startLabel}</Link>}</div>
        </> : <p className="lib-note lib-note-warn"><Lock size={16} aria-hidden="true" />Este tema forma parte del mapa curricular, pero todavía no tiene lecciones. No se marca como disponible hasta que exista contenido.</p>}
      </section>

      {lessons.length > 0 && <section className="lib-section" aria-labelledby="lessons-title"><h2 id="lessons-title">Lecciones</h2>
        {activities.length > 0 && <p className="lib-muted">Actividades: {activities.map((a) => activityLabel[a]).join(' · ')}</p>}
        <ol className="lib-lessons">{lessons.map((lesson, i) => {
          const rec = progress.map[lesson.id]; const st = lessonStatus(rec); const date = formatActivity(rec?.updatedAt)
          return <li key={lesson.id} className="lib-card lib-lesson-row">
            <span className="lib-lesson-num" aria-hidden="true">{i + 1}</span>
            <div className="lib-lesson-body"><h3><Link to={libRoutes.lesson(lesson.id)} className="lib-card-link">{lesson.title}</Link></h3><p className="lib-card-desc">{lesson.objective}</p>
              <div className="lib-card-meta"><span><Clock3 size={14} aria-hidden="true" /> {lesson.minutes} min</span><span>{plural(lesson.exercises.length, 'ejercicio', 'ejercicios')}</span><StatusChip status={st} kind="lesson" />{rec && rec.score !== null && <span>Mejor resultado: {rec.score} %</span>}{date && <span>Última actividad: {date}</span>}</div></div>
            <span className="lib-lesson-cta" aria-hidden="true">{st === 'completed' ? <RotateCcw size={18} /> : <Play size={18} />}</span>
          </li>
        })}</ol></section>}

      {(prereqs.length > 0 || dependents.length > 0) && <section className="lib-section" aria-labelledby="pre-title"><h2 id="pre-title">Antes y después de este tema</h2>
        <div className="lib-grid lib-grid-2">
          {prereqs.length > 0 && <div className="lib-card"><h3>Conviene saber antes</h3><ul className="lib-link-list">{prereqs.map((p) => { const a = aggregate(lessonsOfTopic(catalog, p.id), progress.map); const s = topicStatus(a); return <li key={p.id}>{s === 'planned' ? <span>{p.title}</span> : <Link to={libRoutes.topic(p.id)}>{p.title}</Link>}<StatusChip status={s} /></li> })}</ul><p className="lib-muted">Son recomendaciones: puedes abrir este tema aunque no los hayas completado.</p></div>}
          {dependents.length > 0 && <div className="lib-card"><h3>Te prepara para</h3><ul className="lib-link-list">{dependents.map((p) => <li key={p.id}><Link to={libRoutes.topic(p.id)}>{p.title}</Link></li>)}</ul></div>}
        </div></section>}

      {(prev || next) && <nav className="lib-pager" aria-label="Temas del mismo área">{prev ? <Link to={libRoutes.topic(prev.id)} className="lib-btn lib-btn-secondary"><ArrowLeft size={16} aria-hidden="true" /> Anterior: {prev.title}</Link> : <span />}{next && <Link to={libRoutes.topic(next.id)} className="lib-btn lib-btn-secondary">Siguiente: {next.title} <ArrowRight size={16} aria-hidden="true" /></Link>}</nav>}

      {related.length > 0 && <section className="lib-section" aria-labelledby="rel-title"><h2 id="rel-title">Temas relacionados</h2>
        <div className="lib-grid lib-grid-3">{related.map((t) => <TopicCard key={t.id} catalog={catalog} topic={t} progress={progress.map} favorite={favorites.has(t.id)} onToggleFavorite={() => favorites.toggle(t.id)} />)}</div></section>}

      <p className="lib-back"><Link to={lastLibraryUrl()} className="lib-btn lib-btn-ghost"><ArrowLeft size={16} aria-hidden="true" /> Volver a la Biblioteca</Link></p>
    </>
  )
}
