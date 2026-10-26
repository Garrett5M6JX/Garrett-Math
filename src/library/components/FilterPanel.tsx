import type { ReactNode } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useId, useState } from 'react'
import type { Catalog, ExerciseType } from '../types'
import { activeFilterCount, activityLabel, type LibraryFilters } from '../logic/search'
import { difficultyLabel, lessonStatusLabel } from '../format'

type Props = { catalog: Catalog; filters: LibraryFilters; onChange: (patch: Partial<LibraryFilters>) => void; onClear: () => void; hasUser: boolean }
const ACTIVITY_ORDER: ExerciseType[] = ['choice', 'number', 'fraction', 'order']

function Field({ label, value, onChange, children, disabled, hint }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode; disabled?: boolean; hint?: string }) {
  const id = useId()
  return <div className="lib-field"><label htmlFor={id}>{label}</label><select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-describedby={hint ? `${id}-h` : undefined}>{children}</select>{hint && <small id={`${id}-h`}>{hint}</small>}</div>
}

/** Panel de filtros. En pantallas pequeñas se pliega con un botón; en escritorio permanece visible. */
export default function FilterPanel({ catalog, filters, onChange, onClear, hasUser }: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const count = activeFilterCount(filters)
  const grades = filters.stage ? catalog.gradesByStage.get(filters.stage) ?? [] : catalog.grades
  const units = filters.grade || filters.area
    ? catalog.units.filter((u) => (!filters.grade || u.gradeId === filters.grade) && (!filters.area || u.areaId === filters.area) && (!filters.stage || catalog.gradeById.get(u.gradeId)?.stageId === filters.stage))
    : []
  return (
    <div className="lib-filters">
      <button type="button" className="lib-btn lib-btn-secondary lib-filters-toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        <SlidersHorizontal size={16} aria-hidden="true" /> Filtros{count > 0 && <span className="lib-count" aria-label={`${count} filtros activos`}>{count}</span>}
      </button>
      <div id={panelId} className={`lib-filters-body ${open ? 'open' : ''}`}>
        <Field label="Etapa" value={filters.stage ?? ''} onChange={(v) => onChange({ stage: v || undefined })}>
          <option value="">Todas</option>{catalog.stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Field>
        <Field label="Grado o edad" value={filters.grade ?? ''} onChange={(v) => onChange({ grade: v || undefined })}>
          <option value="">Todos</option>{grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </Field>
        <Field label="Área matemática" value={filters.area ?? ''} onChange={(v) => onChange({ area: v || undefined })}>
          <option value="">Todas</option>{catalog.areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </Field>
        <Field label="Unidad" value={filters.unit ?? ''} onChange={(v) => onChange({ unit: v || undefined })} disabled={units.length === 0} hint={units.length === 0 ? 'Elige un grado o un área para ver sus unidades.' : undefined}>
          <option value="">Todas</option>{units.map((u) => <option key={u.id} value={u.id}>{catalog.gradeById.get(u.gradeId)?.name} · {u.title}</option>)}
        </Field>
        <Field label="Dificultad" value={String(filters.difficulty ?? '')} onChange={(v) => onChange({ difficulty: v ? (Number(v) as 1 | 2 | 3) : undefined })}>
          <option value="">Cualquiera</option>{([1, 2, 3] as const).map((d) => <option key={d} value={d}>{difficultyLabel[d]}</option>)}
        </Field>
        <Field label="Tipo de actividad" value={filters.activity ?? ''} onChange={(v) => onChange({ activity: (v || undefined) as ExerciseType | undefined })}>
          <option value="">Cualquiera</option>{ACTIVITY_ORDER.map((a) => <option key={a} value={a}>{activityLabel[a]}</option>)}
        </Field>
        <Field label="Mi estado" value={filters.status ?? ''} onChange={(v) => onChange({ status: (v || undefined) as LibraryFilters['status'] })}>
          <option value="">Cualquiera</option>{(['not_started', 'in_progress', 'completed'] as const).map((s) => <option key={s} value={s}>{lessonStatusLabel[s]}</option>)}
        </Field>
        <label className="lib-check"><input type="checkbox" checked={Boolean(filters.favoritesOnly)} onChange={(e) => onChange({ favoritesOnly: e.target.checked || undefined })} /><span>Solo temas guardados{!hasUser && ' (en este navegador)'}</span></label>
        <label className="lib-check"><input type="checkbox" checked={Boolean(filters.includePlanned)} onChange={(e) => onChange({ includePlanned: e.target.checked || undefined })} /><span>Incluir temas en preparación</span></label>
        {count > 0 && <button type="button" className="lib-btn lib-btn-ghost" onClick={onClear}><X size={15} aria-hidden="true" /> Limpiar filtros</button>}
      </div>
    </div>
  )
}
