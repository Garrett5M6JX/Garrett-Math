# Althea V41 — Espacio del estudiante

## Incluye
- Incorporación a un aula mediante código con RPC de base de datos.
- Consulta de aulas a las que el estudiante ya pertenece.
- Lista de tareas publicadas, con instrucciones y fecha límite.
- Envío de una respuesta JSON mediante la RPC protegida de V39.
- Consulta de entregas propias, calificaciones y retroalimentación docente.
- Integración en la pantalla de inicio del estudiante.

## Archivos
- `supabase/v41_student_classrooms.sql`: política de lectura de aulas y función `gm_join_classroom`.
- `src/assignments/studentApi.ts`: acceso tipado a aulas y tareas.
- `src/assignments/StudentAssignments.tsx`: interfaz estudiantil.
- `src/assignments/student-assignments.css`: estilos adaptables.

## Requisitos
Aplicar V23–V24 (aulas y matrículas) y V39 (tareas y entregas) antes de V41. El usuario debe iniciar sesión con Supabase; la demo local no puede unirse a aulas reales.

## Seguridad
- El código de aula se valida dentro de una función `SECURITY DEFINER`; no se necesita permitir que el cliente consulte todos los códigos.
- El estudiante solo ve aulas donde existe una matrícula y tareas publicadas.
- Las entregas se envían mediante `gm_submit_assignment`, que valida matrícula, plazo y estado.
- Las calificaciones y comentarios se consultan con RLS y no son editables por el estudiante.
- La respuesta del formulario se envía como JSON; esta interfaz inicial es genérica, no un editor de preguntas enriquecidas.

## Aplicación
1. Confirmar que V23–V24 y V39 estén instaladas en Supabase.
2. Ejecutar `supabase/v41_student_classrooms.sql` en SQL Editor.
3. Iniciar sesión con una cuenta estudiante real.
4. Introducir el código facilitado por el docente.
5. Verificar que solo aparecen las aulas, tareas y entregas de esa cuenta.
