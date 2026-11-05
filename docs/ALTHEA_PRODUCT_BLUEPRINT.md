# Althea — plan maestro de evolución

Este documento es la referencia funcional y técnica del proyecto. Las implementaciones deben ser graduales, compatibles con las cuentas, el contenido y el progreso existentes. No rehacer la plataforma ni introducir cambios masivos sin auditoría.

## 1. Visión del producto

Althea será una plataforma educativa unificada desde Preescolar hasta Universidad. No se construirá Universidad como una aplicación independiente: todas las etapas compartirán identidad, autenticación, permisos, navegación, contenidos, progreso y servicios; cada etapa podrá tener herramientas y complejidad pedagógica propias.

### Experiencias y roles
- **Estudiante:** aprendizaje, cursos, progreso y evaluaciones.
- **Docente:** aulas, actividades, seguimiento y recursos.
- **Familia:** perfiles infantiles y acompañamiento.
- **Administración:** contenidos, usuarios, permisos y analítica.
- **Motor curricular común:** catálogo, prerrequisitos, contenidos, ejercicios, evaluaciones y progreso.
- **Universidad:** programas/carreras, asignaturas, períodos, créditos, bibliografía, demostraciones, laboratorios y evaluaciones avanzadas.

## 2. Arquitectura actual y destino

### Base que se conserva
- React, TypeScript, Vite, Supabase y Vercel.
- Biblioteca organizada en estructura, temas y lecciones.
- Rutas/experiencias existentes de estudiante, docente, familia y asistente.
- Perfiles que ya admiten Universidad como etapa.

No mover ni reemplazar módulos existentes de golpe. Migrar gradualmente hacia:

```
src/
  app/                 # router, layouts y providers
  modules/
    student/
    teacher/
    family/
    administration/
    university/
      pages/
      components/
      services/
      types/
      routes.ts
  core/
    auth/
    permissions/
    curriculum/
    content/
    progress/
    assessments/
    design-system/
  library/              # conservar y migrar gradualmente
  admin/                # conservar y migrar gradualmente
  components/
  hooks/
  services/
  types/
```

La estructura anterior es el destino propuesto, no una afirmación de que ya exista.

### Inconsistencia curricular prioritaria
- `src/types/models.ts` y `src/data/stages.ts` reconocen Preescolar, Primaria, Secundaria y Universidad.
- `src/library/types.ts` y `src/library/catalog/data/structure.ts` han limitado el catálogo de biblioteca a Preescolar y Primaria.
- Antes de mostrar etapas nuevas como si tuvieran cursos completos, ampliar el modelo y diseñar sus catálogos reales. No mostrar materias vacías ni prometer contenido que no existe.

### Rutas objetivo
- `/`: inicio público.
- `/biblioteca`: biblioteca general.
- `/estudiante`: espacio del estudiante.
- `/profesor`: espacio docente.
- `/familia`: espacio familiar.
- `/universidad`: portal universitario.
- `/universidad/programas` y detalle de programa.
- `/universidad/asignaturas/:subjectId`.
- `/universidad/aula/:courseId`.
- `/universidad/evaluaciones/:assessmentId`.

Las rutas universitarias pueden permanecer protegidas o mostrar disponibilidad futura hasta que haya contenido real.

## 3. Universidad: modelo académico futuro

No crear una segunda base de datos ni duplicar las tablas generales de lecciones. Revisar primero el esquema real y las políticas RLS. Entidades a evaluar, reutilizando lo existente cuando corresponda:

- `gm_academic_programs`: carreras/programas.
- `gm_academic_terms`: semestres, trimestres o períodos.
- `gm_subjects`: asignaturas.
- `gm_course_sections`: secciones/grupos.
- `gm_course_enrollments`: inscripciones.
- `gm_subject_prerequisites`: prerrequisitos.
- `gm_subject_credits`: créditos.
- `gm_academic_resources`: bibliografía y recursos.

Metadatos curriculares a evaluar: `level_type`, `curriculum_version`, `institution_id`, `academic_period_id` y `publication_status`. No ejecutar SQL hasta auditar migraciones y RLS existentes.

## 4. Diseño y experiencia

### Identidad de marca
- La marca se llama **Althea**.
- El símbolo oficial de referencia es el logo aportado por el usuario: A orgánica con hoja y páginas, verde/turquesa y naranja. No sustituirlo por un concepto genérico ni rediseñar otro símbolo.
- Paleta de interfaz: verdes y turquesas como base, naranja como acento y azul petróleo para contraste.
- El espacio docente conserva su acento Kelly Green diferenciado.
- Mantener un estilo limpio, minimalista, cálido y educativo; evitar una interfaz completamente blanca y evitar saturación decorativa.
- Mantener modo oscuro, navegación móvil, accesibilidad y movimiento reducido.

### Ocho prioridades UX
1. Unificar navegación pública y privada mediante componentes compartidos con variantes por rol.
2. Centralizar marca/nombre/logo para evitar referencias antiguas dispersas.
3. Consolidar tokens de diseño: colores, tipografía, radios, sombras, espaciado y tamaños.
4. Normalizar jerarquía tipográfica y evitar texto informativo demasiado pequeño.
5. Mejorar tarjetas de cursos y etapas: título, descripción, nivel, progreso real y acción principal.
6. Normalizar estados de botones y controles: normal, hover, focus, activo, deshabilitado y cargando.
7. Dar feedback claro y accesible a guardados, errores, publicaciones, avances y respuestas.
8. Probar responsive y accesibilidad en todas las pantallas, no solo en la portada.

### Hallazgos técnicos de UI a resolver gradualmente
- La biblioteca pública y la aplicación principal tienen marcos de navegación distintos.
- El CSS principal concentra estilos de muchas áreas; separar tokens y estilos por módulo de forma gradual.
- La marca aparece en varios componentes y textos; sustituirla centralizadamente.
- Conservar el tema oscuro y el menú móvil durante cualquier rediseño.

## 5. Orden de ejecución

1. Consolidar identidad Althea y recursos oficiales del logo.
2. Aplicar sistema visual a autenticación, registro, recuperación, biblioteca, estudiante, docente, familia y administración.
3. Auditar y unificar navegación pública/privada.
4. Centralizar configuración de marca y tokens.
5. Revisar responsive, accesibilidad, estados y feedback.
6. Resolver compatibilidad del catálogo curricular para las cuatro etapas.
7. Completar progresivamente contenidos reales de Secundaria y Universidad.
8. Implementar evaluaciones y seguimiento de aprendizaje.
9. Fortalecer herramientas docentes y familiares.
10. Integrar el tutor Althea AI con el currículo y límites operativos.
11. Reforzar seguridad, RLS, copias de seguridad, pruebas y monitorización.

## 6. Reglas de trabajo

- Trabajar en ramas y PR pequeños; no modificar `main` directamente.
- Antes de tocar una zona, inspeccionar dependencias y comportamiento actual.
- Preservar autenticación, roles, datos, progreso, rutas y funciones ya existentes.
- No inventar contenido curricular ni mostrar módulos vacíos como terminados.
- No ejecutar SQL sin revisión de esquema y RLS, y sin instrucciones claras para el usuario.
- No afirmar que una prueba, build o despliegue fue exitoso si no se ejecutó y verificó.
- Priorizar cambios compatibles y reversibles; documentar qué queda pendiente.
- Las versiones y PR describen cambios realmente implementados, no ideas futuras.
