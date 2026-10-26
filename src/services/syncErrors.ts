/** Traduce errores de Supabase/red a mensajes accionables en español. No oculta el error original (se registra en consola). */
export function describeSyncError(error: unknown): string {
  const e = error as { message?: string; code?: string; status?: number } | null
  const message = (e?.message ?? String(error ?? '')).toLowerCase()
  if (message.includes('failed to fetch') || message.includes('networkerror') || message.includes('network request failed') || (typeof navigator !== 'undefined' && navigator.onLine === false)) return 'Sin conexión con Supabase. Tu progreso sigue guardado en este dispositivo y se reintentará al volver la conexión.'
  if (e?.code === '42P01' || message.includes('does not exist') || e?.code === 'PGRST205') return 'La tabla learning_progress no existe en tu proyecto de Supabase. Revisa supabase/schema.sql.'
  if (e?.code === '42501' || message.includes('row-level security') || message.includes('permission denied')) return 'Las políticas de seguridad (RLS) de Supabase rechazaron la operación. Revisa las políticas de learning_progress.'
  if (e?.status === 401 || message.includes('jwt') || message.includes('invalid api key')) return 'La sesión o la clave pública de Supabase no son válidas. Vuelve a iniciar sesión y revisa las variables de entorno.'
  return `No se pudo sincronizar con Supabase${e?.message ? `: ${e.message}` : '.'}`
}
