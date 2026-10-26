# Auditoría de la v9.1.2 y correcciones de la v10

Inspección del ZIP recibido (≈1 160 líneas de código fuente, sin `package-lock.json`, sin pruebas, sin `vercel.json`, sin `.gitignore`).

## Qué funcionaba, qué era demo y qué estaba incompleto

| Elemento | Estado en la v9.1.2 |
|---|---|
| Registro, inicio de sesión, restauración de sesión, perfil educativo (Supabase) | Funcional cuando hay variables de entorno; si no, demo local. **No verificable aquí contra un Supabase real.** |
| Paneles de estudiante, docente y familia | Funcionales (docente = herramientas de demostración, rotuladas). |
| Lecciones | 1 pregunta por lección (Secundaria/Universidad) y una actividad suelta de Preescolar. Contenido de muestra. |
| Biblioteca matemática, «Mi progreso» | **Botones que solo mostraban un aviso** («estará disponible…»). |
| Garrett AI | Marcado «PRONTO»; no existe (se mantiene así, honestamente). |

## Problemas detectados y solución aplicada

| # | Problema | Solución |
|---|---|---|
| 1 | Sin `vercel.json`: recargar `/estudiante` o cualquier ruta profunda daba **404 en Vercel**. | `vercel.json` con *rewrite* a `index.html` y cabeceras de seguridad. Verificado con un servidor de prueba con el mismo comportamiento. |
| 2 | Las tarjetas de inicio mostraban **progreso inventado** (65 %, 32 %…) y «5 preguntas» fijas. | El avance se calcula con lecciones realmente completadas; la recomendación sale de la Biblioteca y del grado del perfil. La barra lateral («Pequeños pasos») también era un 42 % fijo: ahora es real. |
| 3 | La sincronización subía **todas** las lecciones completadas con `score: 100` en cada cambio, sin gestión de errores, sin reintentos, y sin avisar al usuario. | Nuevo `useProgress`: fusión local↔nube sin pérdida, subida solo de lo nuevo, puntuación real, reintento (manual y al volver la red), mensajes de error y estado de sincronización honesto. |
| 4 | El progreso local era global del navegador: dos usuarios en el mismo equipo compartían/subían datos ajenos. | Progreso local separado por usuario (`…:<id>`) y `demo`. El progreso demo no se mezcla con una cuenta salvo que el usuario lo importe. |
| 5 | Errores al leer el perfil o el progreso se ignoraban en silencio. | Se registran en consola y se muestran de forma comprensible; la app sigue con los datos de la sesión. |
| 6 | Botones decorativos («Biblioteca matemática», «Mi progreso»). | Ahora navegan a páginas reales (Biblioteca, Mi aprendizaje, Perfil). |
| 7 | El botón de buscar del encabezado solo filtraba 5 tarjetas. | Enter abre la Biblioteca con la consulta; en la Biblioteca se oculta para no duplicar buscadores. |
| 8 | La siguiente lección de la ruta heredada podía saltar a otra etapa. | Se limita a la misma etapa. |
| 9 | Copia de seguridad con lista fija de claves. | Incluye progreso y favoritos de la Biblioteca; restaurar solo escribe claves con formato permitido y nunca toca tokens de sesión. |
| 10 | Importación sin usar (`Calculator` en `data/stages.ts`) y sin `.gitignore` ni pruebas. | Limpiado; añadidos `.gitignore`, pruebas y scripts. |
| 11 | `profileStage`: colisión de nombres detectada durante la integración. | Renombrado en el código nuevo. |
| 12 | `PublicLayout.tsx` y `src/pages/README.md` / `layouts/README.md` | `PublicLayout` ya no se usa (no importado) y se deja como estaba para no alterar el proyecto; puede eliminarse. |

## Seguridad: revisión

- `src/services/supabase.ts` solo usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`; no hay `service_role`.
- El rol docente proviene de `app_metadata.assigned_role` (no editable). Se mantiene.
- RLS de `learning_progress`: cada usuario solo lee/escribe filas con `user_id = auth.uid()`. La app solo envía `user_id` del usuario autenticado. No se modificó ninguna política.
- No se guardan datos personales nuevos de menores.

## No verificado

Ver la sección de verificación del `CHANGELOG.md`.
