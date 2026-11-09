# Althea — modelo público e institucional

## Decisión de producto

Althea tendrá dos modalidades sobre una sola plataforma:

1. **Althea Público:** acceso individual para estudiantes y familias, sin necesidad de pertenecer a un colegio.
2. **Althea Instituciones:** espacios de trabajo aislados para colegios y centros educativos, con administración, docentes, aulas, estudiantes, actividades e informes.

Ambas modalidades compartirán identidad, autenticación, motor curricular, biblioteca, evaluaciones, progreso y servicios educativos. No se crearán dos aplicaciones ni dos catálogos paralelos.

Un usuario podrá mantener su cuenta personal y pertenecer a una o varias instituciones mediante membresías. La pertenencia institucional no debe duplicar su cuenta ni sobrescribir su perfil individual.

## Auditoría de la base existente (main)

- La aplicación usa React, TypeScript, Vite y Supabase.
- `src/types/models.ts` ya define Preescolar, Primaria, Secundaria y Universidad.
- `src/library/types.ts` limita actualmente `StageId` a Preescolar y Primaria.
- `src/library/catalog/data/structure.ts` solo declara las dos primeras etapas y sus grados.
- `supabase/admin_v23_v24_teachers_analytics.sql` crea `gm_classrooms` y `gm_classroom_members`, pero las aulas no tienen `organization_id`.
- La creación de aulas se realiza mediante `gm_admin_create_classroom`, orientada al administrador global con permiso `teachers.manage`.
- Las políticas actuales de aulas distinguen docente y administrador global, pero no aíslan datos por institución.
- No se encontraron tablas `gm_organizations` ni `gm_memberships` en los archivos SQL revisados.
- `learning_progress` pertenece a un usuario, sin contexto institucional ni de matrícula.
- El catálogo curricular y las cuentas individuales son una base reutilizable; no equivalen todavía a un LMS institucional.

## Principios de arquitectura

### Identidad y pertenencia
- Mantener una única identidad Supabase Auth por persona.
- Separar el perfil personal de la pertenencia a una institución.
- Modelar la pertenencia con membresías revocables y roles acotados a cada institución.
- Una persona puede tener más de una membresía y distintos roles en diferentes instituciones.
- No confiar en `user_metadata` editable por el cliente para conceder permisos institucionales.

### Aislamiento multiinstitucional
- Cada recurso institucional debe pertenecer a una institución, directa o indirectamente.
- Toda consulta y mutación institucional debe validar la membresía activa y el permiso requerido.
- Implementar RLS de denegación por defecto y comprobar intentos cruzados entre instituciones.
- Las funciones `SECURITY DEFINER` deben fijar `search_path`, validar el actor y limitar sus permisos.
- El superadministrador global conserva capacidades de soporte explícitas y auditadas, sin convertirse en el rol habitual de los colegios.
- No exponer datos de menores entre familias, docentes o instituciones que no tengan relación autorizada.

### Separación de modalidades
- Los datos personales y el progreso individual pueden existir sin institución.
- Las aulas, tareas, matrículas, entregas, calificaciones e informes institucionales deben tener contexto de organización.
- El contenido curricular publicado será compartido; las asignaciones y adaptaciones institucionales serán propias de cada organización.
- Un estudiante podrá acceder a su aprendizaje personal y a las actividades de sus aulas desde la misma cuenta.

## Modelo de datos objetivo (propuesta, no migración ejecutada)

| Entidad | Propósito |
|---|---|
| `gm_organizations` | Instituciones, estado y datos básicos |
| `gm_organization_memberships` | Usuario, institución, rol, estado y fechas de membresía |
| `gm_organization_settings` | Configuración académica y operativa de la institución |
| `gm_classrooms` | Aulas vinculadas a una institución y docente |
| `gm_classroom_members` | Inscripción de estudiantes en aulas |
| `gm_assignments` | Actividades asignadas por docentes |
| `gm_assignment_submissions` | Entregas e intentos de estudiantes |
| `gm_assessments` | Evaluaciones |
| `gm_assessment_results` | Resultados y calificaciones |
| `gm_audit_events` | Acciones institucionales relevantes |

Antes de crear tablas nuevas, inspeccionar el esquema real de Supabase, constraints, índices, triggers, funciones, grants y todas las políticas RLS existentes. Reutilizar o extender tablas actuales cuando sea seguro; no duplicar `gm_classrooms` ni membresías sin justificación.

## Roles propuestos

- **Superadministrador Althea:** soporte y configuración global, con acceso excepcional auditado.
- **Administrador institucional / Director:** gestiona una institución, sus miembros, aulas y configuración.
- **Coordinador:** administra grupos o áreas autorizadas.
- **Docente:** gestiona sus aulas, actividades y estudiantes inscritos.
- **Estudiante:** accede a su perfil, progreso, aulas y actividades asignadas.
- **Familia / Tutor:** accede únicamente a perfiles infantiles vinculados y autorizados.
- **Usuario individual:** usa Althea Público sin membresía institucional.

Los roles institucionales se asignan por membresía, no mediante un único rol global que impida pertenecer a varias instituciones.

## Plan de implementación por fases

### Fase 1 — Núcleo curricular (V36)
- Ampliar el modelo tipado a las cuatro etapas de forma compatible.
- Separar etapa, grado, área, unidad, tema y lección.
- Añadir estado de disponibilidad curricular para no presentar etapas vacías como completas.
- Mantener intactos los IDs actuales de Preescolar y Primaria.
- Añadir pruebas de integridad y compatibilidad del catálogo.

### Fase 2 — Base multiinstitucional (V37–V38)
- Auditar el esquema real de Supabase antes de escribir migraciones.
- Diseñar migración aditiva y reversible para organizaciones y membresías.
- Incorporar contexto institucional a aulas y matrículas.
- Reescribir RLS y RPC con validación de pertenencia y permisos.
- Probar aislamiento con al menos dos instituciones y cuentas de distintos roles.
- No habilitar colegios reales hasta pasar las pruebas de aislamiento.

### Fase 3 — Operación escolar (V39–V40)
- Alta y configuración de institución.
- Invitaciones y altas/bajas de docentes.
- Creación de aulas y matrículas por código o invitación.
- Actividades, entregas, evaluaciones y calificaciones.
- Panel institucional y reportes.

### Fase 4 — Experiencia conectada (V41–V44)
- Familia vinculada con autorización.
- Progreso personal e institucional sin duplicación.
- Tutor IA contextualizado por lección y permisos.
- Exportaciones, auditoría, copias de seguridad y controles de privacidad.
- Piloto controlado con una institución antes de ofrecer disponibilidad general.

## Criterios de aceptación

- Un estudiante puede usar Althea sin pertenecer a un colegio.
- Un usuario puede pertenecer a más de una institución sin duplicar su cuenta.
- Un docente solo gestiona aulas y estudiantes autorizados.
- Un administrador institucional no puede leer ni modificar otra institución.
- Una familia solo consulta menores vinculados y autorizados.
- Los datos personales y progreso individual no se filtran entre usuarios.
- Los IDs y progresos existentes de Preescolar y Primaria siguen funcionando.
- Las etapas sin contenido real se identifican como próximas o en preparación.
- No se habilita un piloto escolar hasta completar pruebas RLS y de aislamiento.

## Reglas de seguridad y despliegue

- No ejecutar SQL en producción desde esta fase de diseño.
- No conceder roles desde el navegador ni confiar en valores enviados por el cliente.
- No usar claves service-role en el frontend.
- Toda migración debe ser aditiva, revisada, documentada y acompañada de plan de reversión.
- Probar primero en un proyecto Supabase de desarrollo.
- No declarar cumplimiento legal o preparación comercial sin revisión jurídica y técnica.
