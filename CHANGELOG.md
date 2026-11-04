# Changelog Garrett Math

## v10.0.0 — Biblioteca de matemáticas (Preescolar y Primaria)

### Novedades
- **Biblioteca** en `/biblioteca`: 46 lecciones completas (21 de Preescolar, 25 de Primaria), 138 ejercicios, 64 temas en 41 unidades y 8 áreas; 23 temas del mapa curricular marcados «en preparación». Todo el contenido es **borrador sin revisión docente** y la interfaz lo indica.
- Buscador y filtros reales (etapa, grado, área, unidad, dificultad, tipo de actividad, estado, guardados), con estado en la URL; categorías y unidades; migas de pan; prerrequisitos, relacionados y tema anterior/siguiente; favoritos locales; estados de carga, vacío, sin resultados y error.
- Lecciones interactivas: secciones cortas, ejemplo resuelto paso a paso, visuales SVG accesibles, ejercicios de opción múltiple, número, fracción y ordenar (con botones, sin arrastrar), pistas progresivas, reintentos sin penalización, resumen y criterio de finalización.
- «Mi aprendizaje» (`/mi-aprendizaje`) con avance por etapa y grado, lecciones en progreso/pendientes/completadas y estado de sincronización.
- Navegación: Inicio, Biblioteca, Mi aprendizaje y Perfil en el panel; el docente puede abrir la Biblioteca (conserva su identidad verde Kelly con botones de contraste AA). Visitantes sin cuenta pueden explorarla en modo demo local.
- Progreso real y sincronización con `learning_progress` sin migraciones (ver README).
- `vercel.json` (rutas profundas al recargar), `.gitignore`, pruebas automatizadas, documentación (`docs/`).

### Correcciones
Ver `docs/AUDITORIA_V10.md` (progreso inventado en el inicio, sincronización que reescribía `score: 100`, ausencia de `vercel.json`, botones decorativos, etc.).

### Cambios de comportamiento a tener en cuenta
- En Preescolar y Primaria, las áreas de la página de etapa antigua llevan ahora al grado correspondiente de la Biblioteca. Secundaria y Universidad conservan su flujo de muestra.
- La actividad rápida «contar hasta 5» de Preescolar se conserva como «Práctica rápida» (no guarda progreso).
- El progreso se guarda por usuario en el navegador (`garrett-math-progress-v2:<id|demo>`); las lecciones completadas de versiones anteriores (`garrett-math-completed`) se siguen leyendo en modo demo.

### Verificación de la v10.0.0
Entorno de desarrollo **sin acceso a internet**: no se pudieron instalar las dependencias reales.

**Ejecutado y aprobado:**
- `node scripts/run-tests.mjs` (equivale a `npm test`): **57/57** pruebas (catálogo, búsqueda, filtros↔URL, ejercicios, progreso, navegación, copia de seguridad, errores de sincronización). Incluyen verificación aritmética automática de los ejercicios numéricos.
- `tsc` en modo estricto (con `noUnusedLocals`/`noUnusedParameters`) sobre `src/` y `tests/`: sin errores, **usando declaraciones mínimas temporales** para `react`, `lucide-react` y `@supabase/supabase-js` (no incluidas en el ZIP).
- Aplicación empaquetada con esbuild y ejecutada en Chromium (Playwright):
  - modo demo, sin cuenta: **61/61** comprobaciones (rutas directas y recarga con servidor de *fallback* SPA, búsqueda, filtros, volver con filtros, ejercicios, pistas, revelar, ordenar, finalización, progreso local y favoritos);
  - integración con el panel existente (estudiante, docente, familia): **23/23**;
  - sincronización con un **cliente Supabase simulado** (lectura, subida, fallo de red, reintento, importación de progreso demo): **22/22**;
  - responsive 375/768/1280 px (sin desbordamiento horizontal), nombres accesibles, encabezados, ids, foco con teclado, controles táctiles: **27/27**;
  - contraste de texto (claro y oscuro, incluyendo estados de acierto/error/pista): **18/18** tras corregir un 4,47:1 en el botón primario oscuro.

**NO verificado (pendiente en tu equipo):**
- `npm install`, `npm run build` (Vite + tipos reales de React/Lucide/Supabase) y `npm run typecheck:tests`.
- Conexión con un proyecto **real** de Supabase (solo se probó un cliente simulado), políticas RLS reales y flujos de registro/inicio de sesión.
- Estilos con Tailwind real (el bundle de prueba ignoró sus directivas) y fuentes de Google (sin red).
- Despliegue en Vercel (no se tiene acceso); `vercel.json` se probó solo con un servidor equivalente.
- Safari/Firefox, dispositivos táctiles reales, lectores de pantalla y emulación de `prefers-reduced-motion` (implementado en CSS, no probado).
- Revisión pedagógica del contenido.

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

## [11.0.0] - 2026-10-28
- Añadida ruta `/admin` con comprobación de sesión Supabase y tabla `admin_users`.
- Añadido panel administrativo de navegación, catálogo remoto inicial, siembra idempotente, edición JSON básica, estados editoriales, archivo/restauración, exportación y validación de JSON.
- Añadido SQL aditivo `supabase/admin_v11.sql`, script de inspección RLS y documentación `docs/ADMIN.md`.
- Retirado del menú lateral el botón «Etapa», que duplicaba la navegación de la Biblioteca.
- Añadidos avisos claros sobre funciones parciales y tareas pendientes.
- Limitaciones conocidas: el reproductor aún usa el catálogo local; la vista previa por rol no tiene aislamiento integral de progreso; importación, historial/versiones y auditoría automática necesitan trabajo adicional.


## V12.0.0 — Garrett AI (integración y endurecimiento)

- API serverless Gemini con SDK oficial `@google/genai`, modelo configurable y timeout.
- Autenticación Supabase obligatoria; etapa educativa recuperada en servidor.
- Cuotas persistentes PostgreSQL por usuario y métricas administrativas agregadas.
- Recuperación contextual limitada a dos lecciones y distinción entre borrador y temas en preparación.
- Panel administrativo con estado, modelo, límites y estadísticas agregadas.
- Migración aditiva `supabase/garrett_ai_v12.sql` y documentación V12.
- No se almacenan conversaciones en la base de datos.


## v13.0.0 — Base visual y experiencia docente
- Se estabilizan las dimensiones del selector de tema para evitar saltos entre modo claro y oscuro.
- Se mejora la legibilidad del espacio docente en modo oscuro, conservando la identidad Kelly green.
- Se amplía la hoja de ruta con las siguientes etapas de autenticación, biblioteca, interactividad y herramientas docentes.
- No se cambian los datos de Supabase, el proveedor Gemini ni el esquema de autenticación.
- La persistencia de sesión de Supabase ya está activada mediante `persistSession: true`; no se añade almacenamiento inseguro de contraseñas.


## v15.0.0 — Biblioteca ampliada
- Añadidas cuatro lecciones de Primaria (5.º y 6.º): operaciones con decimales, volumen de prismas, multiplicación de fracciones y probabilidad.
- Cada lección incorpora explicación, ejemplo resuelto, tres ejercicios y pistas.
- Contenido editorial marcado como borrador para revisión de docentes.
- Reutiliza la carga diferida y el catálogo existente; sin nuevas dependencias ni migraciones de base de datos.
