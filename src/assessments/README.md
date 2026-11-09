# Motor de evaluaciones

El módulo contiene la lógica de dominio compartida para evaluaciones de estudiantes y docentes.

- `buildAssessment` selecciona preguntas por etapa, grado, tema o lección con una semilla reproducible.
- El papel entregado al cliente contiene enunciados, opciones y visuales, nunca índices de respuesta, soluciones ni explicaciones de corrección.
- `gradeAssessment` calcula aciertos, errores, preguntas sin responder, porcentaje y aprobación.
- Las preguntas se toman de lecciones revisadas. `previewDrafts` solo permite ensayos internos y no debe usarse para evaluaciones oficiales.

Esta versión no persiste intentos ni crea tablas en Supabase. La persistencia debe añadirse en una migración posterior con políticas RLS por estudiante/aula/organización y corrección protegida del lado servidor. No almacenar respuestas correctas ni claves de examen en registros accesibles al alumno.
