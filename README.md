# Garrett 

Plataforma educativa de demostración construida con React 18, TypeScript, Vite, CSS y Lucide. Esta versión incorpora portabilidad de datos locales y una frontera de error de React, preservando el recorrido de aprendizaje anterior.

## Ejecutar

Requisitos: Node.js LTS y npm. En la carpeta que contiene `package.json`:

```bash
npm install
npm run dev
```

Comprobación de producción:

```bash
npm run build
npm run preview
```

## Funciones

- Flujos de demostración para estudiante, docente y representante familiar.
- Perfil educativo editable con etapa y curso actual. El curso actual es una recomendación: el estudiante puede explorar todos los grados de su etapa, sin que ello le conceda acceso automático a otras etapas.
- Lecciones de muestra y progreso guardado localmente.
- Tema claro/oscuro y diseño adaptable.
- Herramientas de demostración para docentes con acento verde Kelly.
- Perfiles infantiles locales para el espacio familiar.
- En el perfil del estudiante: exportar una copia JSON y restaurar una copia compatible de Garrett Math.
- Fallback de error de renderizado con opción para recargar.

## Copias de seguridad

La exportación incluye únicamente claves locales conocidas de Garrett Math: cuenta demo, etapa, curso, progreso, tema y perfiles familiares. Puede contener nombres o alias, correo de demostración y datos de aprendizaje. Guarda el archivo en un lugar privado. La restauración solo acepta `app: Garrett Math`, `schemaVersion: 1` y claves reconocidas. Restaurar reemplaza las claves correspondientes en el navegador actual y recarga la aplicación.

## Seguridad y límites

**Esta versión no está certificada para producción.** La autenticación sigue siendo local y de demostración: no valida identidades en servidor ni crea cuentas seguras. Las rutas y roles en el cliente no son controles de seguridad. No uses contraseñas reales ni datos sensibles de menores. No hay sincronización entre dispositivos.

Antes de habilitar usuarios reales, implementar y probar autenticación del servidor, permisos por rol, RLS, consentimiento parental, privacidad, retención/eliminación de datos y medidas legales aplicables. `supabase/schema.sql` es solo un punto de partida y requiere revisión.

## Estructura principal

- `src/App.tsx`: coordinación de los flujos y vistas heredadas.
- `src/components/ErrorBoundary.tsx`: fallback para errores de renderizado.
- `src/services/backup.ts`: exportación y restauración de copias locales.
- `src/data/stages.ts`, `src/data/curriculum.ts`: datos educativos.
- `src/types/models.ts`: tipos compartidos.
- `src/router/routes.ts`: rutas canónicas de la demo.
- `src/index.css`: estilos y diseño adaptable.
- `supabase/schema.sql`: esquema preliminar, no listo para aplicar en producción sin revisión.

## Estado de verificación

La compilación debe ejecutarse en un entorno donde `npm install` termine correctamente. Si la red o el registro npm no están disponibles, no se puede afirmar que `npm run build` haya pasado. Consulta `CHANGELOG.md` y `ROADMAP.md` para conocer el alcance y el trabajo pendiente.

## Autenticación con Supabase (v9.1)

La aplicación admite autenticación real opcional con Supabase. Si `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están definidas, los formularios de registro e inicio de sesión usan Supabase Auth; si no, la aplicación permanece en modo demo local.

1. Crea un proyecto en Supabase y configura las URL permitidas en Authentication → URL Configuration (incluye la URL de Vercel y `http://localhost:5173`).
2. Copia `.env.example` a `.env.local` y completa la URL del proyecto y la clave pública anon/publishable.
3. En Authentication → Providers, habilita Email. Se recomienda mantener la confirmación de correo activada.
4. Revisa y adapta `supabase/schema.sql` antes de ejecutarlo. Las políticas incluidas son una base de desarrollo, no una auditoría de seguridad ni autorización de roles lista para producción.
5. En Vercel → Project → Settings → Environment Variables, define las dos variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` y vuelve a desplegar.

**Importante:** nunca incluyas una `service_role` key en el frontend ni en una variable `VITE_*`. La declaración de edad no equivale a consentimiento parental. Antes de usar cuentas reales de menores, revisa consentimiento, privacidad, recuperación de cuentas y políticas RLS con cuidado. El rol de docente/representante debe verificarse y no confiarse solo a metadatos modificables desde el cliente.
