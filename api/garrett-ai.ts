import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleGarrettAiCore, type GarrettAiRequest } from '../src/server/garrettAiCore.js'

interface VercelRequest extends IncomingMessage {
  body: unknown
}
interface VercelResponse extends ServerResponse {}

const MAX_BODY_BYTES = 12_000
function sendJson(res: VercelResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Vary', 'Origin')

  // API de mismo origen: no se habilita CORS global.
  const origin = req.headers.origin
  const host = req.headers.host
  if (origin) {
    try {
      if (!host || new URL(origin).host !== host) {
        sendJson(res, 403, { ok: false, error: 'Origen no permitido.' })
        return
      }
    } catch {
      sendJson(res, 403, { ok: false, error: 'Origen no válido.' })
      return
    }
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Método no permitido. Solo se acepta POST.' })
    return
  }

  try {
    let payload: GarrettAiRequest
    if (typeof req.body === 'string') {
      if (Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) {
        sendJson(res, 413, { ok: false, error: 'La solicitud supera el tamaño permitido.' })
        return
      }
      payload = JSON.parse(req.body) as GarrettAiRequest
    } else if (req.body && typeof req.body === 'object') {
      const encoded = JSON.stringify(req.body)
      if (Buffer.byteLength(encoded, 'utf8') > MAX_BODY_BYTES) {
        sendJson(res, 413, { ok: false, error: 'La solicitud supera el tamaño permitido.' })
        return
      }
      payload = req.body as GarrettAiRequest
    } else {
      const chunks: Buffer[] = []
      let size = 0
      for await (const chunk of req) {
        const part = typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk)
        size += part.length
        if (size > MAX_BODY_BYTES) {
          sendJson(res, 413, { ok: false, error: 'La solicitud supera el tamaño permitido.' })
          return
        }
        chunks.push(part)
      }
      const raw = Buffer.concat(chunks).toString('utf8')
      payload = raw ? JSON.parse(raw) as GarrettAiRequest : {} as GarrettAiRequest
    }
    const authHeader = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown'
    const result = await handleGarrettAiCore(payload, authHeader, clientIp)
    sendJson(res, result.status || (result.ok ? 200 : 400), result)
  } catch (error) {
    // No se registra el cuerpo de la solicitud ni información de autenticación.
    if (error instanceof SyntaxError) {
      sendJson(res, 400, { ok: false, error: 'El cuerpo de la solicitud no contiene JSON válido.' })
      return
    }
    sendJson(res, 500, { ok: false, error: 'Error interno procesando Garrett AI.' })
  }
}
