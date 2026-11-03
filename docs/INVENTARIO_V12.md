# Inventario y plan de Garrett Math V12

## Inventario recibido

El ZIP V11 contiene 116 entradas principales, con:

- React 18, TypeScript y Vite 6.
- Aplicación principal `src/App.tsx`.
- Biblioteca `src/library/` con 64 temas y 46 lecciones / 138 ejercicios.
- Panel administrativo `src/admin/`.
- Autenticación Supabase en `src/services/supabase.ts`.
- Esquemas SQL V11 en `supabase/`.
- API inicial `api/garrett-ai.ts`.
- Núcleo inicial `src/server/garrettAiCore.ts`.
- Interfaz inicial `src/components/garrett-ai/GarrettAiView.tsx`.
- Suite de pruebas `tests/`.

## Plan ejecutado

1. Mantener la aplicación React/Vite existente.
2. Endurecer API Gemini y verificación de sesión.
3. Crear cuotas persistentes en PostgreSQL con migración aditiva.
4. Recuperar contexto de un máximo de dos lecciones y conservar estado editorial.
5. Añadir endpoint administrativo con verificación de `admin_users`.
6. Añadir métricas agregadas de solicitudes.
7. Añadir documentación, variables de entorno y `.gitignore`.
8. Añadir pruebas de autenticación y recuperación contextual.

## Archivos nuevos

- `.gitignore`
- `api/garrett-ai-admin.ts`
- `docs/GARRETT_AI_V12.md`
- `docs/SEGURIDAD_V12.md`
- `docs/VERCEL_HOBBY_V12.md`
- `docs/INVENTARIO_V12.md`
- `supabase/garrett_ai_v12.sql`

## Archivos principales modificados

- `package.json`, `metadata.json`, `.env.example`, `vercel.json`
- `src/server/garrettAiCore.ts`
- `vite.config.ts`
- `src/services/garrettAi.ts`
- `src/components/garrett-ai/GarrettAiView.tsx`
- `src/components/garrett-ai/garrett-ai.css`
- `src/admin/AdminApp.tsx`
- `tests/garrett-ai.test.ts`
- `README.md`, `CHANGELOG.md`

## No modificado deliberadamente

- Catálogo fuente de lecciones y temas.
- Tablas educativas y políticas RLS V11.
- Flujos existentes de registro, inicio de sesión y progreso.
- Proveedor de base de datos y hosting.
- Dependencias de React, Vite y Supabase.

## Limitaciones conocidas

- No se pudo instalar dependencias por timeout de red; build y pruebas completas quedan pendientes.
- No se pudo probar una API key real ni una instancia Supabase.
- Las 46 lecciones permanecen en borrador hasta revisión docente.
- El motor de fórmulas es resaltado accesible de notación, no KaTeX/MathJax.
- La generación docente no dispone de flujo estructurado de borrador/publicación.
- El panel administrativo consulta configuración y métricas, pero los cambios se hacen mediante variables de entorno en Vercel.
- Los perfiles infantiles no se cargan como perfil de contexto vinculado en Garrett AI; se usa el perfil de la cuenta autenticada.

## Veredicto de entrega

**APROBADO CON LIMITACIONES.** Se implementaron cambios de código y documentación, pero no se certifica build, ejecución de pruebas ni conectividad real por falta de instalación de dependencias y credenciales de entorno.
