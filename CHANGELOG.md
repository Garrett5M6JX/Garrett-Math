# Changelog Garrett Math

## v9.1.2 — Supabase: sesión, perfiles y progreso

- Restaura la sesión real de Supabase al recargar y limpia la cuenta local si no existe una sesión válida.
- Guarda y actualiza el perfil educativo en `user_profiles`.
- Sincroniza perfiles infantiles con `child_profiles` y elimina perfiles remotos propios.
- Guarda y recupera lecciones completadas en `learning_progress`.
- Evita otorgar el rol de profesor basándose en `user_metadata` editable por el usuario; requiere `app_metadata.assigned_role` asignado de forma confiable.
- Alinea `supabase/schema.sql` con las tablas usadas por la aplicación y documenta las variables de Vercel.

## v9.0.0 — actualización mayor

- Se añade una herramienta de copia de seguridad local en el perfil educativo: exportación JSON e importación validada por formato y versión de esquema.
- Se incorpora un `ErrorBoundary` de React con mensaje de recuperación para errores de renderizado.
- Se mantiene el recorrido educativo existente, incluido el acceso a todos los grados de la etapa seleccionada y la edición del perfil educativo.
- La importación restaura únicamente claves conocidas de Garrett Math; no ejecuta código del archivo importado.

### Límites explícitos

- No se pudo completar una compilación en este entorno porque las dependencias npm no quedaron instaladas; se verificó la sintaxis TypeScript/JSX, pero debe confirmarse `npm run build` en un entorno con dependencias disponibles.
- Para producción con menores, revisa consentimiento parental, privacidad, recuperación de cuentas y políticas RLS.

## v8.4.0

- Modelos, datos por etapa, marca compartida, selector, layout público y almacenamiento demo separados en módulos.
- Rutas de navegación y perfil educativo editable.
