import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import {
  TriangleAlert, Table, Calculator, Check, CircleCheck, ChevronRight, Circle, Clock3, Hash, Heart, Lightbulb, LoaderCircle, Percent,
  Repeat, Ruler, Shapes, Volume2, type LucideIcon,
} from 'lucide-react'
import { navigateTo } from '../../router/navigation'
import type { SyncState } from '../../hooks/useProgress'
import type { AreaIcon, Difficulty } from '../types'
import type { TopicStatus } from '../logic/progress'
import { difficultyLabel, lessonStatusLabel, topicStatusLabel } from '../format'

/** Enlace interno: es un <a> real (se puede abrir en otra pestaña) que navega sin recargar. */
export function Link({ to, children, className, 'aria-label': ariaLabel, onNavigate }: { to: string; children: ReactNode; className?: string; 'aria-label'?: string; onNavigate?: () => void }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault(); onNavigate?.(); navigateTo(to)
  }
  return <a href={to} onClick={onClick} className={className} aria-label={ariaLabel}>{children}</a>
}

export type Crumb = { label: string; to?: string }
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return <nav className="lib-crumbs" aria-label="Ruta de navegación"><ol>{items.map((c, i) => <li key={`${c.label}-${i}`}>{c.to && i < items.length - 1 ? <Link to={c.to}>{c.label}</Link> : <span aria-current={i === items.length - 1 ? 'page' : undefined}>{c.label}</span>}{i < items.length - 1 && <ChevronRight size={14} aria-hidden="true" />}</li>)}</ol></nav>
}

export const AREA_ICONS: Record<AreaIcon, LucideIcon> = { numeros: Hash, operaciones: Calculator, fracciones: Percent, geometria: Shapes, medida: Ruler, datos: Table, patrones: Repeat, problemas: Lightbulb }
export function AreaChip({ areaId, icon, name }: { areaId: string; icon: AreaIcon; name: string }) {
  const Icon = AREA_ICONS[icon]
  return <span className={`lib-chip lib-area area-${areaId}`}><Icon size={13} aria-hidden="true" />{name}</span>
}
export function DifficultyChip({ level }: { level: Difficulty }) {
  return <span className="lib-chip lib-diff" title={`Dificultad: ${difficultyLabel[level]}`}><span className="lib-dots" aria-hidden="true">{[1, 2, 3].map((n) => <i key={n} className={n <= level ? 'on' : ''} />)}</span>{difficultyLabel[level]}</span>
}
export function DraftBadge() {
  return <span className="lib-chip lib-draft" title="Este contenido todavía no ha sido revisado por docentes."><TriangleAlert size={13} aria-hidden="true" />Borrador sin revisión docente</span>
}
/** El estado se comunica con icono y texto, nunca solo con color. */
export function StatusChip({ status, kind = 'topic' }: { status: TopicStatus | 'not_started' | 'in_progress' | 'completed'; kind?: 'topic' | 'lesson' }) {
  const label = kind === 'lesson' && status !== 'planned' ? lessonStatusLabel[status] : topicStatusLabel[status]
  const icon = status === 'completed' ? <CircleCheck size={13} aria-hidden="true" /> : status === 'in_progress' ? <Clock3 size={13} aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />
  return <span className={`lib-chip lib-status status-${status}`}>{icon}{label}</span>
}
export function ProgressBar({ percent, label, detail }: { percent: number; label: string; detail?: string }) {
  return <div className="lib-progress"><div className="lib-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={label}><span style={{ width: `${percent}%` }} /></div>{detail && <span className="lib-progress-detail">{detail}</span>}</div>
}
export function FavoriteButton({ active, onToggle, title }: { active: boolean; onToggle: () => void; title: string }) {
  return <button type="button" className={`lib-fav ${active ? 'on' : ''}`} aria-pressed={active} aria-label={active ? `Quitar «${title}» de guardados` : `Guardar «${title}»`} title={active ? 'Quitar de guardados' : 'Guardar tema'} onClick={onToggle}><Heart size={18} fill={active ? 'currentColor' : 'none'} aria-hidden="true" /></button>
}
export function ReadAloud({ text, label = 'Escuchar' }: { text: string; label?: string }) {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined')
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => () => { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel() }, [])
  if (!supported) return null
  const toggle = () => {
    const synth = window.speechSynthesis
    if (speaking) { synth.cancel(); setSpeaking(false); return }
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-ES'; utterance.onend = () => setSpeaking(false); utterance.onerror = () => setSpeaking(false)
    setSpeaking(true); synth.speak(utterance)
  }
  return <button type="button" className="lib-btn lib-btn-ghost lib-listen" onClick={toggle} aria-pressed={speaking}><Volume2 size={16} aria-hidden="true" />{speaking ? 'Detener' : label}</button>
}

export function LoadingState({ text = 'Cargando la Biblioteca…' }: { text?: string }) {
  return <div className="lib-state" role="status" aria-live="polite"><LoaderCircle className="lib-spin" size={26} aria-hidden="true" /><strong>{text}</strong></div>
}
export function ErrorState({ title = 'No pudimos cargar la Biblioteca', detail, onRetry }: { title?: string; detail?: string; onRetry?: () => void }) {
  return <div className="lib-state lib-state-error" role="alert"><TriangleAlert size={28} aria-hidden="true" /><strong>{title}</strong>{detail && <p>{detail}</p>}{onRetry && <button type="button" className="lib-btn lib-btn-primary" onClick={onRetry}>Reintentar</button>}</div>
}
export function EmptyState({ title, children, icon }: { title: string; children?: ReactNode; icon?: ReactNode }) {
  return <div className="lib-state">{icon ?? <Check size={26} aria-hidden="true" />}<strong>{title}</strong>{children && <div className="lib-state-body">{children}</div>}</div>
}

/** Estado de guardado del progreso. Solo afirma «guardado en tu cuenta» tras una operación real exitosa. */
export function SyncNotice({ sync, scope, onRetry }: { sync: SyncState; scope: 'demo' | 'user'; onRetry: () => void }) {
  if (sync.mode === 'local') return <p className="lib-sync lib-sync-local" role="status"><span className="lib-dot" aria-hidden="true" />{scope === 'demo' ? 'Modo demo: tu progreso se guarda solo en este navegador, no en una cuenta ni en la nube.' : 'Tu progreso se guarda solo en este dispositivo.'}</p>
  if (sync.status === 'syncing') return <p className="lib-sync" role="status"><LoaderCircle className="lib-spin" size={14} aria-hidden="true" />Sincronizando con tu cuenta…</p>
  if (sync.status === 'error') return <p className="lib-sync lib-sync-error" role="alert"><TriangleAlert size={14} aria-hidden="true" />{sync.message} <button type="button" className="lib-link-btn" onClick={onRetry}>Reintentar</button></p>
  return <p className="lib-sync lib-sync-ok" role="status"><CircleCheck size={14} aria-hidden="true" />Progreso guardado en tu cuenta{sync.lastSyncedAt ? ` · ${new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' }).format(new Date(sync.lastSyncedAt))}` : ''}.</p>
}
