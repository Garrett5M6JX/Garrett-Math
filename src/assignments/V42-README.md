# Althea V42 — Libro de calificaciones

## Incluye
- Vista por aula de las matrículas, tareas, entregas y notas.
- Promedio individual calculado únicamente con entregas calificadas.
- Promedio global de las calificaciones registradas en el aula.
- Indicadores de estudiantes, tareas, entregas calificadas y pendientes.
- Filtros para todos los estudiantes, con tareas pendientes o con calificaciones.
- Exportación CSV compatible con hojas de cálculo e impresión.

## Privacidad y límites
- El panel solo carga aulas cuyo docente coincide con la sesión autenticada y exige `app_metadata.assigned_role=teacher`.
- La consulta de matrículas, tareas, entregas y perfiles sigue sometida a las políticas RLS de Supabase.
- No consulta correos electrónicos ni expone datos de otras aulas.
- El promedio es la media aritmética simple de las notas existentes (0–100); las tareas sin calificar no se cuentan.
- Los alumnos sin perfil visible aparecen con un identificador abreviado.
- Los borradores no se consideran pendientes; una tarea publicada sin entrega sí cuenta como pendiente.

## Requisitos
- Migraciones V23–V24 para aulas y matrículas.
- Migración V39 para tareas y entregas.
- Migración V41 para incorporación de estudiantes y lectura de aulas por miembros.
- Sesión real de Supabase con rol docente asignado.

## Aplicación
No requiere una migración SQL nueva. La interfaz se integra en el espacio docente existente.
