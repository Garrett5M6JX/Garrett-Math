import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Search, X, Sparkles } from 'lucide-react'
import type { Catalog } from '../types'
import type { ProgressApi } from '../../hooks/useProgress'
import type { FavoritesApi } from '../../hooks/useFavorites'
import { activeFilterCount, filtersFromSearch, filtersToSearch, searchTopics, type LibraryFilters } from '../logic/search'
import { aggregate, continueLesson, lessonsOfStage, suggestNextLesson } from '../logic/progress'
import { libRoutes } from '../routes'
import { navigateTo, useLocationState } from '../../router/navigation'
import { plural } from '../format'
import FilterPanel from '../components/FilterPanel'
import TopicCard from '../components/TopicCard'
import { AREA_ICONS, EmptyState, Link, ProgressBar } from '../components/ui'

type Props = { catalog: Catalog; progress: ProgressApi; favorites: FavoritesApi; preferredGradeId?: string }

export default function LibraryHome({ catalog, progress, favorites, preferredGradeId }: Props) {
  const { search } = useLocationState()
  const filters = useMemo(() => filtersFromSearch(search, catalog), [search, catalog])
  const [draft, setDraft] = useState(filters.q)
  const lastUrlQ = useRef(filters.q)

  // La URL es la fuente de verdad: si cambia desde fuera (atrás/adelante), actualiza el cuadro de búsqueda.
  useEffect(() => { if (filters.q !== lastUrlQ.current) { lastUrlQ.current = filters.q; setDraft(filters.q) } }, [filters.q])
  const apply = (next: LibraryFilters) => { const url = libRoutes.home + filtersToSearch(next); navigateTo(url, { replace: true }) }
  const change = (patch: Partial<LibraryFilters>) => apply(filtersFromSearch(filtersToSearch({ ...filters, ...patch }), catalog))
  useEffect(() => {
    if (draft === filters.q) return
    const timer = window.setTimeout(() => { lastUrlQ.current = draft; apply(filtersFromSearch(filtersToSearch({ ...filters, q: draft }), catalog)) }, 250)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const results = useMemo(() => searchTopics(catalog, filters, { progress: progress.map, favorites: favorites.ids }), [catalog, filters, progress.map, favorites.ids])
  const count = activeFilterCount(filters)
  const browsing = count === 0 && !filters.q.trim()
  const cont = continueLesson(catalog, progress.map)
  const next = cont ?? suggestNextLesson(catalog, progress.map, preferredGradeId)
  const nextTopic = next ? catalog.topicById.get(next.topicId) : undefined
  const chips: { label: string; clear: Partial<LibraryFilters> }[] = []
  if (filters.stage) chips.push({ label: `Etapa: ${catalog.stageById.get(filters.stage)?.name}`, clear: { stage: undefined } })
  if (filters.grade) chips.push({ label: `Grado: ${catalog.gradeById.get(filters.grade)?.name}`, clear: { grade: undefined } })
  if (filters.area) chips.push({ label: `Área: ${catalog.areaById.get(filters.area)?.name}`, clear: { area: undefined } })
  if (filters.unit) chips.push({ label: `Unidad: ${catalog.unitById.get(filters.unit)?.title}`, clear: { unit: undefined } })
  if (filters.difficulty) chips.push({ label: `Dificultad ${filters.difficulty}`, clear: { difficulty: undefined } })
  if (filters.activity) chips.push({ label: 'Tipo de actividad', clear: { activity: undefined } })
  if (filters.status) chips.push({ label: 'Por estado', clear: { status: undefined } })
  if (filters.favoritesOnly) chips.push({ label: 'Guardados', clear: { favoritesOnly: undefined } })
  if (filters.includePlanned) chips.push({ label: 'Con temas en preparación', clear: { includePlanned: undefined } })

  if (catalog.topics.length === 0) return <EmptyState title="La Biblioteca todavía no tiene contenido">Cuando se añadan temas al catálogo aparecerán aquí.</EmptyState>

  return (
    <>
      <section className="lib-hero" aria-labelledby="lib-title">
        <span className="lib-kicker">BIBLIOTECA MATEMÁTICA · PREESCOLAR A UNIVERSIDAD</span>
        <h1 id="lib-title">Explora, aprende y practica</h1>
        <p>Busca un concepto o recorre los temas por etapa, grado y área. Cada lección incluye explicación, ejemplo resuelto y ejercicios con pistas.</p>
        <form className="lib-search" role="search" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="lib-q">Buscar en la Biblioteca</label>
          <div className="lib-search-box"><Search size={18} aria-hidden="true" />
            <input id="lib-q" type="search" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Prueba: fracciones, sumar, triángulo, decenas…" autoComplete="off" maxLength={100} />
            {draft && <button type="button" className="lib-icon-btn" aria-label="Borrar búsqueda" onClick={() => { setDraft(''); lastUrlQ.current = ''; apply(filtersFromSearch(filtersToSearch({ ...filters, q: '' }), catalog)) }}><X size={16} aria-hidden="true" /></button>}
          </div>
        </form>
      </section>

      {browsing && <section className="lib-lab-promo" aria-label="Laboratorio matemático interactivo"><div><span className="lib-kicker"><Sparkles size={13}/> APRENDE EXPERIMENTANDO</span><h2>¿Listo para jugar con las matemáticas?</h2><p>Manipula fracciones, explora figuras y practica con una recta numérica interactiva.</p></div><button type="button" className="lib-btn lib-btn-primary" onClick={() => navigateTo(libRoutes.lab)}>Abrir laboratorio <ArrowRight size={16}/></button></section>}

      {browsing && next && nextTopic && (
        <section className="lib-continue" aria-labelledby="lib-continue-title">
          <div><span className="lib-kicker">{cont ? 'CONTINÚA DONDE LO DEJASTE' : 'UNA BUENA FORMA DE EMPEZAR'}</span><h2 id="lib-continue-title">{next.title}</h2><p>{nextTopic.title} · {plural(next.minutes, 'minuto', 'minutos')}</p></div>
          <Link to={libRoutes.lesson(next.id)} className="lib-btn lib-btn-primary">{cont ? 'Continuar la lección' : 'Empezar la lección'} <ArrowRight size={17} aria-hidden="true" /></Link>
        </section>
      )}

      {browsing && (
        <>
          <section className="lib-section" aria-labelledby="lib-stages">
            <h2 id="lib-stages">Explora por etapa</h2>
            <div className="lib-grid lib-grid-2">
              {catalog.stages.map((stage) => {
                const lessons = lessonsOfStage(catalog, stage.id); const agg = aggregate(lessons, progress.map)
                return <article key={stage.id} className="lib-card lib-stage-card">
                  <span className="lib-kicker">{stage.ageRange} · {stage.status === 'planned' ? 'EN PREPARACIÓN' : 'CONTENIDO DISPONIBLE'}</span><h3><Link to={libRoutes.stage(stage.id)} className="lib-card-link">{stage.name}</Link></h3>
                  <p className="lib-card-desc">{stage.description}</p>
                  <ProgressBar percent={agg.percent} label={`Avance en ${stage.name}`} detail={`${agg.completed} de ${plural(agg.total, 'lección', 'lecciones')} completadas`} />
                </article>
              })}
            </div>
          </section>
          <section className="lib-section" aria-labelledby="lib-areas">
            <h2 id="lib-areas">Explora por área matemática</h2>
            <div className="lib-grid lib-grid-4">
              {catalog.areas.map((area) => {
                const Icon = AREA_ICONS[area.icon]
                const topicCount = searchTopics(catalog, { q: '', area: area.id }).length
                const units = catalog.units.filter((u) => u.areaId === area.id && (catalog.topicsByUnit.get(u.id) ?? []).some((t) => (catalog.lessonsByTopic.get(t.id)?.length ?? 0) > 0))
                const empty = topicCount === 0
                return <article key={area.id} className={`lib-card lib-area-card area-${area.id} ${empty ? 'is-planned' : ''}`}>
                  <span className="lib-area-icon"><Icon size={22} aria-hidden="true" /></span>
                  <h3>{empty ? area.name : <button type="button" className="lib-card-link lib-link-btn" onClick={() => change({ area: area.id })}>{area.name}</button>}</h3>
                  <p className="lib-card-desc">{area.description}</p>
                  <p className="lib-muted">{empty ? 'En preparación: todavía sin lecciones' : plural(topicCount, 'tema disponible', 'temas disponibles')}</p>
                  {!empty && <details className="lib-units"><summary>Unidades ({units.length})</summary><ul>{units.map((u) => <li key={u.id}><button type="button" className="lib-link-btn" onClick={() => change({ area: area.id, grade: u.gradeId, unit: u.id })}>{catalog.gradeById.get(u.gradeId)?.name} · {u.title}</button></li>)}</ul></details>}
                </article>
              })}
            </div>
          </section>
        </>
      )}

      <section className="lib-section" aria-labelledby="lib-results-title">
        <div className="lib-results-head"><h2 id="lib-results-title">{browsing ? 'Todos los temas' : 'Resultados'}</h2><p className="lib-muted" role="status" aria-live="polite">{plural(results.length, 'tema encontrado', 'temas encontrados')}</p></div>
        <FilterPanel catalog={catalog} filters={filters} onChange={change} onClear={() => { setDraft(''); lastUrlQ.current = ''; navigateTo(libRoutes.home, { replace: true }) }} hasUser={progress.scope === 'user'} />
        {chips.length > 0 && <ul className="lib-active-filters" aria-label="Filtros activos">{chips.map((c) => <li key={c.label}><button type="button" className="lib-chip lib-removable" onClick={() => change(c.clear)} aria-label={`Quitar filtro ${c.label}`}>{c.label} <X size={13} aria-hidden="true" /></button></li>)}</ul>}
        {results.length === 0
          ? <EmptyState title="No encontramos temas con esa búsqueda" icon={<Search size={26} aria-hidden="true" />}><p>Revisa la ortografía, usa menos palabras o quita algún filtro.</p><button type="button" className="lib-btn lib-btn-primary" onClick={() => { setDraft(''); lastUrlQ.current = ''; navigateTo(libRoutes.home, { replace: true }) }}>Limpiar búsqueda y filtros</button></EmptyState>
          : <div className="lib-grid lib-grid-3">{results.map((r) => <TopicCard key={r.topic.id} catalog={catalog} topic={r.topic} progress={progress.map} favorite={favorites.has(r.topic.id)} onToggleFavorite={() => favorites.toggle(r.topic.id)} matchedLessons={filters.q.trim() ? r.matchedLessons.map((l) => l.title) : []} />)}</div>}
      </section>
    </>
  )
}
