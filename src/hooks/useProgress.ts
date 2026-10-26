import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../services/supabase'
import { describeSyncError } from '../services/syncErrors'
import type { Lesson, ProgressMap } from '../library/types'
import {
  fromRemoteRow, mergeProgress, needsUpload, parseProgressMap, recordAttempt, recordReveal, recordSimpleCompletion,
  recordStep, resetPractice, toRemoteRow, type RemoteProgressRow,
} from '../library/logic/progress'

const storageKey = (scope: string) => `garrett-math-progress-v2:${scope}`
const LEGACY_COMPLETED = 'garrett-math-completed'
const importedKey = (userId: string) => `garrett-math-demo-imported:${userId}`

function readStorage(key: string): unknown { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null } catch { return null } }
function writeStorage(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* almacenamiento opcional */ } }

/** Lee el progreso local de un ámbito. En modo demo también recupera las lecciones completadas de versiones anteriores. */
export function loadProgress(scope: string): ProgressMap {
  const map = parseProgressMap(readStorage(storageKey(scope)))
  if (scope === 'demo') {
    const legacy = readStorage(LEGACY_COMPLETED)
    const now = new Date().toISOString()
    if (Array.isArray(legacy)) for (const id of legacy) if (typeof id === 'string' && id && !map[id]) map[id] = { lessonId: id, status: 'completed', attempts: 0, solved: [], revealed: [], score: null, lastStep: 0, startedAt: now, updatedAt: now, completedAt: now }
  }
  return map
}

export type SyncState =
  | { mode: 'local'; status: 'idle' }
  | { mode: 'cloud'; status: 'syncing' | 'synced' | 'error'; message?: string; lastSyncedAt?: string }

export type ProgressApi = {
  map: ProgressMap
  /** `demo`: datos solo en este navegador. `user`: copia local + sincronización con la cuenta. */
  scope: 'demo' | 'user'
  sync: SyncState
  recordAttempt: (lesson: Lesson, exerciseId: string, correct: boolean) => void
  recordReveal: (lesson: Lesson, exerciseId: string) => void
  setStep: (lessonId: string, step: number) => void
  completeSimple: (lessonId: string) => void
  resetPractice: (lessonId: string) => void
  retrySync: () => void
  /** Lecciones con progreso de demostración guardado en este navegador, ofrecibles para importar a la cuenta. */
  demoImportable: number
  importDemo: () => void
}

/**
 * Progreso del estudiante. Siempre se guarda primero en local (por usuario o «demo»). Con Supabase y sesión,
 * se fusiona con `learning_progress` y se sube lo nuevo. El estado «synced» solo aparece tras una operación real exitosa.
 */
export function useProgress(userId: string | null): ProgressApi {
  const scopeKey = supabase && userId ? userId : 'demo'
  const [state, setState] = useState(() => ({ scope: scopeKey, map: loadProgress(scopeKey) }))
  if (state.scope !== scopeKey) setState({ scope: scopeKey, map: loadProgress(scopeKey) })
  const [sync, setSync] = useState<SyncState>({ mode: 'local', status: 'idle' })
  const [remoteReady, setRemoteReady] = useState(false)
  const [tick, setTick] = useState(0)
  const remoteRef = useRef<ProgressMap>({})
  const [demoImportable, setDemoImportable] = useState(0)

  const update = useCallback((fn: (map: ProgressMap) => ProgressMap) => setState((prev) => ({ scope: prev.scope, map: fn(prev.map) })), [])

  // Persistencia local (y copia en la clave heredada para que la copia de seguridad y versiones anteriores sigan coherentes).
  useEffect(() => {
    writeStorage(storageKey(state.scope), state.map)
    if (state.scope === 'demo') writeStorage(LEGACY_COMPLETED, Object.values(state.map).filter((r) => r.status === 'completed').map((r) => r.lessonId))
  }, [state])

  // Descarga y fusión con la nube.
  useEffect(() => {
    setRemoteReady(false); remoteRef.current = {}
    if (!supabase || !userId) { setSync({ mode: 'local', status: 'idle' }); return }
    const client = supabase
    let alive = true
    setSync({ mode: 'cloud', status: 'syncing' })
    void (async () => {
      try {
        const { data, error } = await client.from('learning_progress').select('lesson_id, status, score, updated_at').eq('user_id', userId)
        if (error) throw error
        if (!alive) return
        const remote: ProgressMap = {}
        for (const row of (data ?? []) as RemoteProgressRow[]) { const rec = fromRemoteRow(row); if (rec) remote[rec.lessonId] = rec }
        remoteRef.current = remote
        setState((prev) => prev.scope === userId ? { scope: prev.scope, map: mergeProgress(prev.map, remote) } : prev)
        setRemoteReady(true)
        setSync({ mode: 'cloud', status: 'synced', lastSyncedAt: new Date().toISOString() })
      } catch (error) {
        console.error('Garrett Math: no se pudo leer el progreso remoto.', error)
        if (alive) setSync({ mode: 'cloud', status: 'error', message: describeSyncError(error) })
      }
    })()
    return () => { alive = false }
  }, [userId, tick])

  // Subida diferida de lo que la nube todavía no tiene.
  useEffect(() => {
    if (!supabase || !userId || !remoteReady || state.scope !== userId) return
    const client = supabase
    const pending = Object.values(state.map).filter((rec) => needsUpload(rec, remoteRef.current[rec.lessonId]))
    if (pending.length === 0) return
    let alive = true
    const timer = window.setTimeout(async () => {
      setSync((s) => ({ mode: 'cloud', status: 'syncing', lastSyncedAt: s.mode === 'cloud' ? s.lastSyncedAt : undefined }))
      try {
        const { error } = await client.from('learning_progress').upsert(pending.map((rec) => toRemoteRow(userId, rec)), { onConflict: 'user_id,lesson_id' })
        if (error) throw error
        for (const rec of pending) remoteRef.current[rec.lessonId] = rec
        if (alive) setSync({ mode: 'cloud', status: 'synced', lastSyncedAt: new Date().toISOString() })
      } catch (error) {
        console.error('Garrett Math: no se pudo guardar el progreso en Supabase.', error)
        if (alive) setSync({ mode: 'cloud', status: 'error', message: describeSyncError(error) })
      }
    }, 700)
    return () => { alive = false; window.clearTimeout(timer) }
  }, [state, userId, remoteReady, tick])

  // Reintento automático al volver la conexión.
  useEffect(() => {
    const onOnline = () => setTick((n) => n + 1)
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  // Detecta progreso de demostración importable al iniciar sesión.
  useEffect(() => {
    if (!supabase || !userId) { setDemoImportable(0); return }
    let imported = false
    try { imported = localStorage.getItem(importedKey(userId)) === '1' } catch { /* opcional */ }
    setDemoImportable(imported ? 0 : Object.keys(loadProgress('demo')).length)
  }, [userId])

  const now = () => new Date().toISOString()
  return useMemo<ProgressApi>(() => ({
    map: state.map,
    scope: state.scope === 'demo' ? 'demo' : 'user',
    sync,
    recordAttempt: (lesson, exerciseId, correct) => update((map) => ({ ...map, [lesson.id]: recordAttempt(map[lesson.id], lesson, exerciseId, correct, now()) })),
    recordReveal: (lesson, exerciseId) => update((map) => ({ ...map, [lesson.id]: recordReveal(map[lesson.id], lesson, exerciseId, now()) })),
    setStep: (lessonId, step) => update((map) => { const next = recordStep(map[lessonId], step); return next && next !== map[lessonId] ? { ...map, [lessonId]: next } : map }),
    completeSimple: (lessonId) => update((map) => ({ ...map, [lessonId]: recordSimpleCompletion(map[lessonId], lessonId, now()) })),
    resetPractice: (lessonId) => update((map) => { const next = resetPractice(map[lessonId], now()); return next ? { ...map, [lessonId]: next } : map }),
    retrySync: () => setTick((n) => n + 1),
    demoImportable,
    importDemo: () => {
      if (!userId) return
      update((map) => mergeProgress(map, loadProgress('demo')))
      try { localStorage.setItem(importedKey(userId), '1') } catch { /* opcional */ }
      setDemoImportable(0)
    },
  }), [state, sync, demoImportable, update, userId])
}
