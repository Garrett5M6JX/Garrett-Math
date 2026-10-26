import { ArrowLeft, ArrowRight, Info } from 'lucide-react'
import type { Catalog } from '../types'
import type { ProgressApi } from '../../hooks/useProgress'
import { aggregate, lessonsOfGrade, lessonsOfStage, lessonsOfUnit, topicAggregate, topicStatus } from '../logic/progress'
import { libRoutes, lastLibraryUrl } from '../routes'
import { filtersToSearch } from '../logic/search'
import { plural } from '../format'
import { AreaChip, Breadcrumbs, EmptyState, Link, ProgressBar, StatusChip } from '../components/ui'

type Props = { catalog: Catalog; progress: ProgressApi; id: string }

export function StagePage({ catalog, progress, id }: Props) {
  const stage = catalog.stageById.get(id)
  if (!stage) return <NotFoundPage what="La etapa" />
  const agg = aggregate(lessonsOfStage(catalog, id), progress.map)
  const grades = catalog.gradesByStage.get(id) ?? []
  return (
    <>
      <Breadcrumbs items={[{ label: 'Biblioteca', to: lastLibraryUrl() }, { label: stage.name }]} />
      <section className="lib-hero lib-hero-compact"><span className="lib-kicker">ETAPA · {stage.ageRange}</span><h1>{stage.name}</h1><p>{stage.description}</p>
        <ProgressBar percent={agg.percent} label={`Avance en ${stage.name}`} detail={`${agg.completed} de ${plural(agg.total, 'lección', 'lecciones')} completadas`} />
        <Link to={libRoutes.home + filtersToSearch({ q: '', stage: id })} className="lib-btn lib-btn-secondary">Buscar temas de esta etapa</Link>
      </section>
      <section className="lib-section" aria-labelledby="grades-title"><h2 id="grades-title">Grados y edades</h2>
        <div className="lib-grid lib-grid-3">{grades.map((grade) => {
          const lessons = lessonsOfGrade(catalog, grade.id); const a = aggregate(lessons, progress.map)
          const topics = (catalog.unitsByGrade.get(grade.id) ?? []).flatMap((u) => catalog.topicsByUnit.get(u.id) ?? [])
          return <article key={grade.id} className="lib-card"><h3><Link to={libRoutes.grade(grade.id)} className="lib-card-link">{grade.name}</Link></h3>
            <p className="lib-card-desc">{plural(topics.length, 'tema', 'temas')} en el mapa · {plural(lessons.length, 'lección disponible', 'lecciones disponibles')}</p>
            <ProgressBar percent={a.percent} label={`Avance en ${grade.name}`} detail={`${a.completed} de ${lessons.length} completadas`} /></article>
        })}</div>
      </section>
    </>
  )
}

export function GradePage({ catalog, progress, id }: Props) {
  const grade = catalog.gradeById.get(id)
  if (!grade) return <NotFoundPage what="El grado" />
  const stage = catalog.stageById.get(grade.stageId)
  const siblings = catalog.gradesByStage.get(grade.stageId) ?? []
  const index = siblings.findIndex((g) => g.id === id)
  const prev = siblings[index - 1]; const next = siblings[index + 1]
  const agg = aggregate(lessonsOfGrade(catalog, id), progress.map)
  const units = catalog.unitsByGrade.get(id) ?? []
  return (
    <>
      <Breadcrumbs items={[{ label: 'Biblioteca', to: lastLibraryUrl() }, { label: stage?.name ?? 'Etapa', to: libRoutes.stage(grade.stageId) }, { label: grade.name }]} />
      <section className="lib-hero lib-hero-compact"><span className="lib-kicker">{stage?.name.toUpperCase()} · MAPA DE CONTENIDOS</span><h1>{grade.name}</h1>
        <p>Recorrido por unidades y temas. Los temas «en preparación» forman parte del mapa curricular pero todavía no tienen lecciones.</p>
        <ProgressBar percent={agg.percent} label={`Avance en ${grade.name}`} detail={`${agg.completed} de ${plural(agg.total, 'lección', 'lecciones')} completadas`} />
      </section>
      <p className="lib-note"><Info size={16} aria-hidden="true" />Organización general de contenidos, no vinculada a un currículo oficial. Necesita adaptación local.</p>
      {units.length === 0 ? <EmptyState title="Este grado aún no tiene unidades" /> : units.map((unit) => {
        const area = catalog.areaById.get(unit.areaId); const topics = catalog.topicsByUnit.get(unit.id) ?? []
        const a = aggregate(lessonsOfUnit(catalog, unit.id), progress.map)
        return <section key={unit.id} className="lib-section lib-unit" aria-labelledby={`u-${unit.id}`}>
          <div className="lib-unit-head"><div>{area && <AreaChip areaId={area.id} icon={area.icon} name={area.name} />}<h2 id={`u-${unit.id}`}>{unit.title}</h2><p className="lib-muted">{unit.description}</p></div>
            {a.total > 0 && <ProgressBar percent={a.percent} label={`Avance en la unidad ${unit.title}`} detail={`${a.completed}/${a.total}`} />}</div>
          <ul className="lib-topic-list">{topics.map((topic) => {
            const t = topicAggregate(catalog, topic, progress.map); const status = topicStatus(t)
            return <li key={topic.id}><div>{status === 'planned' ? <span className="lib-topic-name is-planned">{topic.title}</span> : <Link to={libRoutes.topic(topic.id)} className="lib-topic-name">{topic.title}</Link>}<small>{topic.description}</small></div><StatusChip status={status} /></li>
          })}</ul>
        </section>
      })}
      <nav className="lib-pager" aria-label="Grados">{prev ? <Link to={libRoutes.grade(prev.id)} className="lib-btn lib-btn-secondary"><ArrowLeft size={16} aria-hidden="true" /> {prev.name}</Link> : <span />}{next && <Link to={libRoutes.grade(next.id)} className="lib-btn lib-btn-secondary">{next.name} <ArrowRight size={16} aria-hidden="true" /></Link>}</nav>
    </>
  )
}

export function NotFoundPage({ what = 'La página' }: { what?: string }) {
  return <EmptyState title={`${what} que buscas no existe`}><p>Puede que el enlace sea antiguo o tenga un error.</p><Link to={libRoutes.home} className="lib-btn lib-btn-primary">Volver a la Biblioteca</Link></EmptyState>
}
