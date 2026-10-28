-- Verificación manual orientativa en un proyecto de PRUEBA.
-- Sustituye los UUID y ejecuta como postgres en SQL Editor. No modifica datos.
-- Verifica que la función identifica correctamente a la cuenta admin configurada:
select public.is_admin() as is_admin_for_current_sql_editor_session;
-- Para comprobar permisos reales, autentica dos sesiones (admin/no admin) con la Data API.
-- Un usuario no admin debe recibir 0 filas al leer admin_users ajenos y debe fallar al intentar INSERT/UPDATE/DELETE.
-- Debe fallar también al escribir gm_topics/gm_lessons. No intentes simular auth.uid() en producción.
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname='public' and (tablename='admin_users' or tablename like 'gm_%' or tablename='audit_log')
order by tablename, policyname;
