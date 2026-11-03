# Garrett AI V12 — Arquitectura, configuración y operación

## Estado de implementación

Garrett AI usa `@google/genai` desde `api/garrett-ai.ts`, una función serverless Node.js de Vercel. El navegador nunca recibe `GEMINI_API_KEY`. El endpoint requiere una sesión Supabase válida, consulta el perfil educativo en `user_profiles` y descarta la etapa enviada por el cliente como fuente de autorización.

El historial se mantiene en `sessionStorage` durante la sesión del navegador; el servidor no persiste el texto de las conversaciones. El botón de cancelar aborta la petición del navegador; no garantiza detener una generación que ya haya comenzado en el proveedor Gemini. La nueva tabla `garrett_ai_usage` registra únicamente usuario, fecha y modelo para aplicar cuotas y obtener métricas agregadas.

## Arquitectura

1. React envía una pregunta a `POST /api/garrett-ai` con el token de la sesión Supabase.
2. Vercel valida el método, origen de mismo host y tamaño del cuerpo.
3. El servidor valida el token con `auth.getUser()`, lee `user_profiles` y deriva el rol desde `app_metadata` / `user_metadata`.
4. PostgreSQL aplica el límite persistente con `consume_garrett_ai_quota()`.
5. El servidor recupera hasta dos lecciones relevantes del catálogo local y envía solo ese contexto a Gemini.
6. La respuesta vuelve al cliente. No se almacena en una tabla de conversaciones.

## Catálogo y estado editorial

El catálogo local contiene 46 lecciones y 64 temas. Las lecciones existentes se encuentran marcadas como `borrador` en el código de origen y no han sido revisadas por docentes. Garrett AI puede usarlas como contexto de apoyo, pero el prompt obliga a identificarlas como borrador y no como contenido aprobado. Los temas sin lección asociada se identifican como «en preparación» y no se presentan como lecciones disponibles.

La recuperación actual usa coincidencia léxica local, no embeddings ni búsqueda semántica. Devuelve como máximo dos lecciones y no envía todo el catálogo. En el ZIP V11 todas las 46 lecciones están en estado `borrador`; por ello Garrett AI debe etiquetarlas como no revisadas, y los 23 temas sin lección asociada se comunican como «en preparación».

## Requisitos previos

- Node.js 20 o superior.
- Proyecto Supabase con Auth y la tabla `user_profiles`.
- La tabla `admin_users` y la función `is_admin()` creadas por `supabase/admin_v11.sql`.
- Proyecto Google AI / Gemini API con clave y cuota habilitada.
- Proyecto Vercel con runtime Node.js.

## Configuración local

1. Copia `.env.example` como `.env.local`.
2. Configura:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - Opcionalmente modelo, límites y timeout.
3. Instala dependencias con `npm install`.
4. Ejecuta `npm test`, `npm run typecheck:tests` y `npm run build`.
5. Ejecuta `npm run dev`. El servidor Vite incluye middleware local para las dos rutas Garrett AI. Opcionalmente, instala la CLI (`npm i -g vercel`) y ejecuta `npm run dev:vercel` para verificar el enrutamiento del entorno Vercel.

## Variables de entorno

| Variable | Uso | Secreto |
|---|---|---|
| `GEMINI_API_KEY` | Clave API Gemini | Sí, solo servidor |
| `GEMINI_MODEL` | Identificador del modelo | No, servidor |
| `GARRETT_AI_ENABLED` | Interruptor del servicio (`false` desactiva) | No, servidor |
| `GARRETT_AI_MAX_PER_MINUTE` | Cuota por usuario/minuto | No, servidor |
| `GARRETT_AI_MAX_PER_DAY` | Cuota por usuario/24 h | No, servidor |
| `GARRETT_AI_TIMEOUT_MS` | Timeout HTTP (5–50 s) | No, servidor |
| `SUPABASE_URL` | URL para funciones serverless | No |
| `SUPABASE_ANON_KEY` | Clave pública anon/publishable para funciones | No |
| `VITE_SUPABASE_URL` | URL para React | No |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon/publishable para React | No |

No configures `service_role` en el frontend. Esta integración no necesita `SUPABASE_SERVICE_ROLE_KEY`.

## Migración Supabase V12

Ejecuta `supabase/garrett_ai_v12.sql` en Supabase SQL Editor después de tener aplicado el esquema V11. La migración es aditiva: crea `garrett_ai_usage`, índices, políticas RLS y funciones RPC de cuota/estadísticas. No desactiva RLS ni cambia las tablas educativas existentes.

La función `consume_garrett_ai_quota` serializa las peticiones por usuario y aplica cuotas por minuto y por 24 horas. Si no se aplica la migración, la API rechaza las consultas con un error de configuración en lugar de saltarse los límites.

## Configuración en Vercel Hobby

Añade las variables de entorno en Project → Settings → Environment Variables para Production y Preview. La clave `GEMINI_API_KEY` debe ser una variable de servidor sin prefijo `VITE_`. Después de cambiar variables, crea un nuevo despliegue.

`vercel.json` configura `api/garrett-ai.ts` con `maxDuration: 60` y el timeout HTTP predeterminado de Gemini en 45 segundos. La documentación vigente de Vercel indica un máximo de 60 segundos para Hobby cuando Fluid Compute no está activo y hasta 300 segundos con Fluid Compute. Esta configuración conservadora de 60 segundos no requiere Pro. Revisa los límites de tu proyecto y la configuración de Fluid Compute antes de producción.

## Panel administrativo

La pestaña Garrett AI del panel `/admin` consulta `GET /api/garrett-ai-admin`. El endpoint exige sesión y registro en `admin_users`. Muestra estado de configuración, modelo, límites y métricas agregadas (24 h / 7 días / usuarios activos). No muestra claves ni mensajes.

En esta entrega la configuración de modelo, límites, activación y timeout se administra mediante variables de entorno de Vercel, no editando valores desde la interfaz. El mensaje de bienvenida y las instrucciones pedagógicas permanecen en el código del servidor. La edición dinámica de esos parámetros desde el panel queda pendiente.

## Pruebas

- `npm test`: pruebas de lógica del catálogo, progreso, ejercicios, navegación, panel y Garrett AI.
- `npm run typecheck:tests`: tipos de pruebas.
- `npm run build`: TypeScript y build Vite.
- `npm run dev`: frontend Vite y middleware local para ambas rutas Garrett AI.
- `npm run dev:vercel`: prueba opcional mediante la CLI de Vercel.

No es posible verificar una llamada real a Gemini ni las políticas efectivas de una instancia Supabase sin credenciales y un proyecto de prueba configurado. No introduzcas claves reales en repositorios o capturas de pantalla.

## Seguridad y privacidad

- Autenticación obligatoria en la API.
- Etapa y curso se obtienen del perfil en Supabase; no se confía en valores de etapa enviados por el navegador.
- Los roles se derivan de metadatos verificados de Supabase.
- El texto de conversación solo se conserva en `sessionStorage` del navegador y no se inserta en Supabase.
- La tabla de uso no almacena mensajes ni respuestas.
- RLS permanece activa en tablas existentes y en la nueva tabla.
- Los errores devueltos al navegador son genéricos; los logs del servidor no incluyen prompts, tokens ni claves. Se filtran patrones comunes de correo y teléfono antes de enviar texto a Gemini, pero esto no es una detección completa de datos personales; el usuario debe evitar incluirlos.
- La cuota persistente es por usuario. La limitación adicional por instancia es defensiva y no reemplaza la cuota de PostgreSQL.
- La API limita mensajes a 1500 caracteres, cuerpo a 12 KB e historial a ocho mensajes.

Antes de usar con menores en producción, realiza una revisión legal y de privacidad, establece el consentimiento parental aplicable y documenta retención, borrado, tratamiento por Google y controles de supervisión.

## Despliegue y reversión

1. Conserva una copia del despliegue actual y la base de datos.
2. Aplica `supabase/garrett_ai_v12.sql`.
3. Configura variables en Vercel.
4. Despliega y verifica login, Biblioteca, rutas profundas y `/api/garrett-ai`.
5. Prueba con una cuenta de cada rol y revisa cuotas y métricas.
6. Si Garrett AI presenta problemas, establece `GARRETT_AI_ENABLED=false` y redespliega. El resto de Garrett Math permanece disponible.
7. Para revertir el código, vuelve al despliegue anterior de Vercel o al commit anterior. La migración es aditiva y no necesita revertirse para volver a la versión anterior; no elimines la tabla de uso si contiene registros.


## Referencias oficiales

- Modelos Gemini: https://ai.google.dev/gemini-api/docs/models
- SDK Google GenAI: https://googleapis.github.io/js-genai/
- Vercel Functions duration: https://vercel.com/docs/functions/configuring-functions/duration
- Vercel Hobby: https://vercel.com/docs/plans/hobby
