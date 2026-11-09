# Althea V39 — Tareas, entregas y calificación

## Qué añade
- Tareas ligadas a un aula existente, con etapa, año, contenidos de referencia, plazo y estado.
- Una entrega por estudiante y tarea, con respuesta JSON limitada a 32 KB.
- Envío mediante RPC que valida sesión, matrícula, publicación y plazo.
- Calificación docente de 0 a 100 y retroalimentación; una entrega calificada queda bloqueada.
- Políticas RLS: el alumno solo ve su entrega; el docente propietario del aula puede consultar las entregas de sus tareas.

## Archivos
- `supabase/v39_assignments.sql`: migración aditiva.
- `src/assignments/api.ts`: llamadas tipadas desde el cliente Supabase.

## Requisitos previos
Aplicar previamente el esquema base, las migraciones de roles/permisos V19 y aulas/docentes V23–V24. La migración no crea ni modifica cuentas, roles, aulas o matrículas existentes.

## Aplicación
1. Abrir Supabase → SQL Editor.
2. Revisar y ejecutar el archivo completo `supabase/v39_assignments.sql`.
3. Comprobar que aparecen `gm_assignments`, `gm_assignment_submissions` y las funciones `gm_submit_assignment` y `gm_grade_assignment_submission`.
4. Probar primero con un aula de prueba y dos cuentas (docente y estudiante).

## Seguridad y alcance
- No se usa la clave service-role en el navegador.
- No se permite al estudiante escribir directamente su nota ni la retroalimentación.
- No se añade todavía una interfaz visual de tareas ni una organización multi-colegio.
- Las respuestas de evaluación automáticas de V38 no se califican aquí. Esta versión habilita entregas y calificación docente manual; la corrección automática debe ejecutarse en servidor confiable.
- No registrar datos personales sensibles en instrucciones o respuestas.
