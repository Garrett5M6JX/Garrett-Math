# Althea — plan maestro del producto

## Visión
Althea será una plataforma educativa unificada desde Preescolar hasta Universidad. Todas las etapas compartirán identidad, autenticación, permisos, navegación, contenidos, progreso y servicios, con herramientas pedagógicas adecuadas a cada nivel.

## Experiencias
- **Estudiante:** cursos, aprendizaje guiado, progreso y evaluaciones.
- **Docente:** aulas, actividades, calificaciones y seguimiento.
- **Familia:** perfiles infantiles y acompañamiento.
- **Administración:** usuarios, permisos, contenidos, publicación y analítica.
- **Motor curricular:** catálogo, prerrequisitos, lecciones, ejercicios, evaluaciones y progreso.
- **Universidad:** programas, asignaturas, períodos, créditos, bibliografía, laboratorios y evaluaciones avanzadas.

## Base técnica que se conserva
React, TypeScript, Vite, Supabase y Vercel. Se preservan la biblioteca, autenticación, roles, panel administrativo, progreso y rutas actuales. La arquitectura objetivo puede organizarse gradualmente en módulos de estudiante, docente, familia, administración y universidad, junto a servicios centrales de autenticación, permisos, currículo, contenidos, progreso, evaluaciones y diseño. Esta estructura es una dirección futura, no una afirmación de que ya exista.

## Brecha curricular conocida
Los modelos generales y los datos de etapas reconocen Preescolar, Primaria, Secundaria y Universidad, pero el catálogo de la biblioteca todavía se concentra en Preescolar y Primaria. Antes de presentar las otras etapas como completas, ampliar y validar los modelos y crear contenido real. No mostrar materias vacías como si estuvieran publicadas.

## Universidad
Reutilizar el motor curricular existente. Antes de crear tablas, auditar el esquema Supabase y las políticas RLS. Entidades futuras a evaluar: programas académicos, períodos, asignaturas, secciones, inscripciones, prerrequisitos, créditos y recursos académicos. No ejecutar SQL sin revisión previa.

## Identidad visual
- Nombre oficial: **Althea**.
- Usar el símbolo original aportado por el usuario: A orgánica con hoja y páginas, verde/turquesa y naranja. No sustituirlo por otro concepto.
- Interfaz: verdes y turquesas como base, naranja como acento y azul petróleo para contraste.
- Espacio docente: conservar Kelly Green como acento de rol.
- Estilo minimalista, cálido y educativo; evitar pantallas completamente blancas y decoración excesiva.
- Mantener modo oscuro, navegación móvil, accesibilidad y movimiento reducido.

## Prioridades de experiencia
1. Unificar gradualmente navegación pública y privada.
2. Centralizar nombre, logo y configuración de marca.
3. Consolidar tokens de color, tipografía, radios, sombras y espaciado.
4. Corregir jerarquía tipográfica y legibilidad.
5. Mejorar tarjetas de cursos y etapas con progreso real y acciones claras.
6. Normalizar estados de controles: hover, foco, activo, deshabilitado y carga.
7. Dar feedback accesible de errores, guardados, publicaciones y avances.
8. Probar todas las pantallas en móvil y escritorio.

## Orden de evolución
1. Identidad y recursos oficiales.
2. Sistema visual para acceso, biblioteca, estudiante, docente, familia y administración.
3. Auditoría y unificación de navegación.
4. Tokens de diseño centralizados.
5. Responsive, accesibilidad y feedback.
6. Compatibilidad curricular de las cuatro etapas.
7. Contenido real de Secundaria y Universidad.
8. Evaluaciones y seguimiento.
9. Herramientas docentes y familiares.
10. Tutor Althea AI conectado al currículo, con límites operativos.
11. Seguridad, RLS, copias de seguridad, pruebas y monitorización.

## Reglas de desarrollo
- Trabajar en ramas y PR pequeños; no modificar main directamente.
- Auditar dependencias antes de cambiar módulos.
- Preservar cuentas, roles, datos, progreso y funciones existentes.
- No inventar contenido ni presentar módulos vacíos como terminados.
- No ejecutar SQL sin revisar esquema y RLS.
- No afirmar build, pruebas o despliegues exitosos sin ejecutarlos y verificarlos.
- Documentar pendientes y priorizar cambios compatibles y reversibles.
- Las versiones describen trabajo implementado, no solo ideas.
