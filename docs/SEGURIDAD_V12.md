# Informe de seguridad Garrett Math V12

## Cambios aplicados

- Eliminado el CORS global `*` de la función Garrett AI; se valida el origen contra el host de la solicitud.
- La API exige `Authorization: Bearer` y valida el token mediante Supabase Auth.
- El perfil educativo se lee en el servidor desde `user_profiles`; el cliente no puede seleccionar una etapa de mayor nivel para cambiar las reglas del tutor.
- Los mensajes se limitan a 1500 caracteres, el cuerpo HTTP a 12 KB y el historial a ocho entradas saneadas.
- Se aplica cuota por usuario en PostgreSQL mediante RPC y bloqueo transaccional por usuario.
- La clave Gemini se lee exclusivamente desde `process.env.GEMINI_API_KEY`.
- Los errores técnicos no incluyen prompts, tokens ni claves en la respuesta o logs.
- La tabla nueva tiene RLS habilitada; el usuario solo puede leer sus propios registros de uso. La escritura se realiza por función `SECURITY DEFINER` con `auth.uid()`.
- Las estadísticas agregadas requieren la función `is_admin()` de V11.
- Las conversaciones no se persisten en Supabase.

## Riesgos / pendientes

- La limitación de uso es por cuenta autenticada; no hay cuota global de gasto monetario ni alertas de presupuesto de Google Cloud.
- La recuperación de Biblioteca es lexical y local, no un sistema semántico/embeddings.
- La aplicación aún conserva modo demo y algunas rutas públicas. Garrett AI no responde en modo demo: exige sesión real.
- El panel permite consultar estado y métricas, pero los cambios de configuración se realizan en Vercel; el panel no edita modelo, límites ni instrucciones.
- La creación de materiales para docentes funciona como generación de texto en el chat; no hay todavía un flujo estructurado de borrador/publicación con revisión.
- Los perfiles infantiles de familia no se envían como contexto de perfil vinculado a Garrett AI; la API usa el perfil educativo de la cuenta autenticada.
- No se ejecutó una auditoría de penetración, prueba real de RLS contra un proyecto Supabase, ni una llamada real a Gemini en este entorno.
- Las políticas de moderación del proveedor y la revisión de privacidad para menores deben verificarse antes de producción.

## Verificaciones manuales antes de publicar

- Confirmar que `GEMINI_API_KEY` no aparece en `dist/`.
- Confirmar que `SUPABASE_SERVICE_ROLE_KEY` no está configurada en el frontend ni en el repositorio.
- Ejecutar la migración V12 y comprobar RLS en Supabase.
- Probar una sesión inválida, una sesión de estudiante, docente, familia y administrador.
- Confirmar que un usuario no administrador recibe 403 en `/api/garrett-ai-admin`.
- Revisar cuota y errores en Vercel Functions Logs sin registrar datos personales.
