import type { IncomingMessage, ServerResponse } from 'node:http'
import { createClient } from '@supabase/supabase-js'

interface Request extends IncomingMessage {}
interface Response extends ServerResponse {}
function sendJson(res: Response, statusCode: number, data: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Método no permitido.' })
  const authorization = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization
  if (!authorization?.startsWith('Bearer ')) return sendJson(res, 401, { error: 'Sesión requerida.' })
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return sendJson(res, 503, { error: 'Supabase no está configurado en el servidor.' })
  const client = createClient(url, key, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user }, error } = await client.auth.getUser(authorization.slice(7))
  if (error || !user) return sendJson(res, 401, { error: 'Sesión inválida.' })
  const { data: admin } = await client.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!admin) return sendJson(res, 403, { error: 'Se requiere permiso de administrador.' })
  const { data: stats, error: statsError } = await client.rpc('get_garrett_ai_admin_stats')
  if (statsError) return sendJson(res, 503, { error: 'No se pudieron consultar las estadísticas. Aplica la migración V12.' })
  return sendJson(res, 200, {
    enabled: process.env.GARRETT_AI_ENABLED !== 'false',
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    maxPerMinute: Number(process.env.GARRETT_AI_MAX_PER_MINUTE || 10),
    maxPerDay: Number(process.env.GARRETT_AI_MAX_PER_DAY || 100),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    stats,
  })
}
