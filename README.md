# Garrett Math v10.0.0 — Biblioteca de matemáticas

Plataforma educativa construida con React 18, TypeScript, Vite, CSS y Lucide. La versión 10 añade la **Biblioteca de matemáticas** (Preescolar y Primaria) sobre la aplicación existente, sin eliminar ninguna de sus páginas.

> **Estado del contenido:** todas las lecciones son **borrador sin revisión docente**. Están marcadas así en la interfaz. La organización por grados es **general y no está ligada a un currículo oficial**; necesita adaptación local antes de usarse con estudiantes.

## Qué cambió respecto a la v9.1.2

| Área | Novedad |
|---|---|
| Biblioteca | Catálogo tipado (2 etapas, 9 grados, 8 áreas, 41 unidades, 64 temas, **46 lecciones completas** con 138 ejercicios). 23 temas del mapa curricular figuran como «en preparación» y no se presentan como disponibles. |
| Exploración | Buscador real (sin tildes, plurales y prefijos), filtros por etapa, grado, área, unidad, dificultad, tipo de actividad y estado; categorías con unidades; migas de pan; prerrequisitos, relacionados, tema anterior/siguiente; favoritos; estados de carga, vacío, sin resultados y error. Los filtros viven en la URL. |
| Lecciones | Objetivo, secciones cortas, ejemplo resuelto paso a paso, visuales SVG con texto alternativo, ejercicios (opción múltiple, número, fracción, ordenar con botones subir/bajar), pistas progresivas, revelar respuesta solo tras agotar pistas, reintentos sin penalización, resumen y criterio de finalización claro. «Escuchar» (voz del navegador) cuando está disponible. |
| Progreso | Estados no iniciada / en progreso / completada; intentos, mejor puntuación y fechas reales; avance por tema, unidad, grado y etapa; «Mi aprendizaje». Abrir una lección **no** la marca como hecha. |
| Nube | Reutiliza la tabla `learning_progress` (**sin migración**). Fusión segura con lo local, subida diferida, reintentos y mensajes de error. Solo se afirma «guardado en tu cuenta» tras una operación real exitosa. |
| Correcciones | Ver [`docs/AUDITORIA_V10.md`](docs/AUDITORIA_V10.md): `vercel.json` (las rutas profundas daban 404 al recargar), progreso inventado en la pantalla de inicio, sincronización que reescribía `score: 100`, botones decorativos, `.gitignore` ausente, etc. |
| Calidad | 57 pruebas automatizadas, auditoría de accesibilidad y contraste, carga diferida del catálogo. |

## Instalar y ejecutar en Windows con VS Code

1. Instala **Node.js LTS (20 o superior)** desde <https://nodejs.org> y **Git**.
2. Descomprime el ZIP, abre la carpeta `Garrett_Math_v10` en VS Code (*Archivo → Abrir carpeta*) y abre una terminal (*Terminal → Nueva terminal*).
3. Ejecuta:

```bash
npm install
npm run dev        # abre http://localhost:5173
```

Otros comandos:

```bash
npm test                 # 57 pruebas de lógica (búsqueda, filtros, ejercicios, progreso, catálogo, copia de seguridad)
npm run typecheck:tests  # comprobación de tipos de las pruebas
npm run build            # tsc -b + vite build → carpeta dist/
npm run preview          # sirve dist/ en local
```

> Si PowerShell dice que «la ejecución de scripts está deshabilitada», usa la terminal *Command Prompt* de VS Code o ejecuta una vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

**Sin variables de entorno la aplicación funciona en modo demo local** (datos solo en este navegador).

## Variables de entorno (sin publicar secretos)

1. Copia `.env.example` a `.env.local` (este archivo está en `.gitignore`).
2. Completa, desde Supabase → *Project Settings → API*:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-o-publishable
```

Solo la URL y la clave **anon/publishable** pueden estar en el navegador. **Nunca** pongas la `service_role` ni secretos en variables `VITE_*`. Tener las variables definidas no demuestra que la nube funcione: la aplicación solo muestra «guardado en tu cuenta» tras una lectura/escritura real correcta.

## Actualizar GitHub

En la carpeta de tu repositorio actual (la que contiene `.git`):

1. Copia el contenido de `Garrett_Math_v10` sobre el repositorio (sustituye `src/`, `README.md`, etc.; **no copies ni borres `.git`**). Si quieres conservar la v9, antes ejecuta `git checkout -b v10-biblioteca`.
2. Revisa que no se suban secretos: `git status` no debe listar `.env.local` ni `node_modules`.
3. Sube:

```bash
git add .
git commit -m "Garrett Math v10: Biblioteca de matemáticas (Preescolar y Primaria)"
git push            # o: git push -u origin v10-biblioteca
```

Si alguna vez subiste un `.env` por error: `git rm --cached .env.local` y **rota la clave** en Supabase.

## Desplegar en Vercel Hobby

La aplicación es un sitio estático (Vite) sin funciones de servidor ni procesos permanentes: no requiere Vercel Pro.

1. En <https://vercel.com/new> importa el repositorio de GitHub.
2. Vercel detecta *Vite*. Comprueba: *Build Command* `npm run build`, *Output Directory* `dist` (ya definidos en `vercel.json`).
3. En *Settings → Environment Variables* añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Production y Preview) y vuelve a desplegar.
4. `vercel.json` redirige todas las rutas a `index.html` para que `/biblioteca/tema/...` o `/mi-aprendizaje` funcionen **al recargar**. Añade cabeceras de seguridad básicas.
5. Si usas Supabase, en *Authentication → URL Configuration* añade tu dominio de Vercel como *Site URL* y en *Redirect URLs*.

> El plan Hobby de Vercel es para uso personal y no comercial; revisa sus condiciones vigentes si el proyecto cambia de naturaleza.

## Qué usa datos locales y qué usa Supabase

| Función | Almacenamiento |
|---|---|
| Catálogo de la Biblioteca | Incluido en la aplicación (`src/library/catalog/data`), cargado de forma diferida. No hay tablas remotas de contenido. |
| Progreso de lecciones | Siempre en local (`garrett-math-progress-v2:<usuario o demo>`). Con Supabase y sesión: se sincroniza con `learning_progress` (solo `status`, `score`, `updated_at`). |
| Intentos, ejercicios resueltos, paso de la lección | **Solo local** (la tabla no tiene esas columnas). |
| Temas guardados (favoritos) | **Solo local**, por usuario. |
| Cuenta, perfil educativo, perfiles infantiles | Como en la v9 (Supabase si está configurado; demo local si no). |
| Copia de seguridad (perfil del estudiante) | Ahora incluye el progreso y favoritos de la Biblioteca. |

Visitantes sin cuenta pueden explorar la Biblioteca; su progreso es local y está rotulado como «modo demo». Al iniciar sesión, ese progreso **no se mezcla automáticamente**: «Mi aprendizaje» ofrece importarlo.

## Migraciones de base de datos

**Ninguna.** El esquema existente (`unique (user_id, lesson_id)`, `score` 0–100, RLS por propietario con *select/insert/update/delete*) es compatible. No necesitas volver a ejecutar `supabase/schema.sql` si las tablas ya existen. No se desactiva RLS ni se modifican políticas.

## Estructura del código de la Biblioteca

```
src/library/
  types.ts                 Modelo de contenido (etapa → grado → área → unidad → tema → lección → ejercicio)
  catalog/data/            Contenido (TypeScript tipado): estructura, temas y lecciones
  catalog/build.ts         Índices y validación del catálogo (referencias, ciclos, ejercicios, alt de visuales)
  catalog/repository.ts    Frontera de datos: hoy estática; mañana, base de datos
  logic/                   Búsqueda, filtros↔URL, ejercicios, progreso, navegación (funciones puras con pruebas)
  components/ pages/       Interfaz (Visual SVG, ExercisePlayer, TopicCard, FilterPanel, páginas)
  library.css              Estilos (todo cuelga de .gm-lib)
src/hooks/                 useCatalog, useProgress (local + Supabase), useFavorites
src/router/navigation.ts   Navegación sin recargas (History API) compartida con App.tsx
tests/                     Pruebas (node:test + tsx)
```

Para añadir contenido consulta [`docs/CONTENIDO.md`](docs/CONTENIDO.md).

## Rutas

`/biblioteca` · `/biblioteca/etapa/:id` · `/biblioteca/grado/:id` · `/biblioteca/tema/:id` · `/biblioteca/leccion/:id` · `/mi-aprendizaje`. Las URL de búsqueda usan `?q=&etapa=&grado=&area=&unidad=&dificultad=&tipo=&estado=&favoritos=1&planificados=1`.

## Pruebas realizadas y límites de la verificación

Resultados reales y lo que **no** se pudo comprobar están en [`CHANGELOG.md`](CHANGELOG.md#verificación-de-la-v1000). Resumen: el entorno de desarrollo de esta versión **no tenía acceso a internet**, así que **no se ejecutaron `npm install` ni `vite build`**. Ejecuta `npm run build` en tu equipo antes de desplegar y revisa el resultado.

## Limitaciones conocidas

- Contenido en borrador, sin revisión pedagógica; 23 temas del mapa aún sin lecciones.
- Sin currículo oficial: la secuencia es general.
- Arrastrar y soltar no se implementó: se ofrece la alternativa accesible de botones subir/bajar.
- La recuperación de contraseña sigue sin implementarse (el botón lo indica).
- Autenticación de demostración y roles: ver «Seguridad» más abajo.
- «Garrett AI» sigue marcado como «PRONTO»: no existe.

## Seguridad

- No hay `service_role` ni secretos en el código ni en el ZIP; `.gitignore` excluye `.env*` salvo `.env.example`.
- Los privilegios de docente se leen de `app_metadata.assigned_role` (no editable por el usuario). El rol de familia/estudiante se pide en `user_metadata` y solo da acceso a datos propios (RLS por `auth.uid()`).
- No se guardan datos personales nuevos: el progreso se asocia al identificador de usuario y a identificadores de lección.
- Las rutas y roles del cliente **no son controles de seguridad**; la protección real son las políticas RLS.
- Antes de usar con menores en producción: consentimiento parental, privacidad, retención y eliminación de datos, y medidas legales aplicables.

## Historial

`HOJA_DE_RUTA_GARRETT_MATH.md` es la hoja de ruta original (v9) y se conserva como referencia; la vigente es `ROADMAP.md`.
