# Garrett Math V11 — Administración

## Estado honesto de esta entrega

Esta versión añade una ruta `/admin`, comprobación de administrador en `admin_users`, un editor remoto básico para las tablas del catálogo, siembra inicial idempotente, estados editoriales básicos, exportación y validación preliminar de JSON, ajustes de cierre por inactividad y documentación SQL. El catálogo de la Biblioteca continúa usando el repositorio TypeScript local por defecto; publicar contenido en las tablas remotas no lo conecta automáticamente al reproductor. La vista previa por rol es parcial: abre rutas existentes, pero no implementa aún el aislamiento completo `admin-preview`, el banner persistente en todas las rutas ni el bypass seguro de todas las redirecciones. El historial de versiones, auditoría automática por cada cambio, borrado definitivo con análisis de dependencias, validación completa por campo y la aplicación transaccional de importaciones son pendientes. No se presenta la administración de cuentas Auth como funcional.

## Activar el primer administrador

1. Despliega V11 y configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel. No pongas `service_role` en variables `VITE_*`.
2. Crea tu cuenta normalmente con Supabase Auth y confirma el correo.
3. En Supabase Dashboard abre SQL Editor y ejecuta el archivo `supabase/admin_v11.sql` completo.
4. Sustituye el marcador de correo por el correo exacto de tu cuenta y ejecuta este bloque separado:

```sql
select id, email from auth.users
where lower(email) = lower('TU_CORREO_ADMIN@EJEMPLO.COM');

insert into public.admin_users(user_id)
select id from auth.users
where lower(email) = lower('TU_CORREO_ADMIN@EJEMPLO.COM')
on conflict (user_id) do nothing;
```

5. Inicia sesión en la app y abre `/admin`. Si dice «Sin acceso», verifica que la consulta devolvió una cuenta y que `admin_users` contiene su UUID.
6. En Supabase Auth activa MFA para la cuenta administradora y guarda los métodos de recuperación fuera del repositorio.

## Qué hace el SQL

- `admin_users` guarda los UUID de las cuentas administradoras. RLS permite que cada cuenta compruebe solo su propio registro; el cliente no recibe permisos de inserción, actualización o borrado.
- `public.is_admin()` usa `SECURITY DEFINER` con `search_path` vacío y nombres de tabla cualificados.
- `gm_stages`, `gm_grades`, `gm_areas`, `gm_units`, `gm_topics` y `gm_lessons` normalizan la jerarquía. `data` conserva el objeto original para una migración gradual; `status`, `sort_order`, `updated_by` y `version` sirven para administración editorial.
- `gm_lesson_versions` y `audit_log` preparan historial y auditoría. Esta entrega todavía no registra automáticamente cada cambio ni guarda/restaura snapshots de forma integral.
- No modifica `learning_progress`, `user_profiles`, `child_profiles` ni sus políticas existentes.

## Usar el panel

- **Contenido:** selecciona el tipo de entidad, busca, crea/edita el JSON y cambia el estado. El ID existente se bloquea durante la edición. «Archivar» conserva el registro y «Restaurar» vuelve a borrador.
- **Sembrar catálogo actual:** valida el catálogo TypeScript y hace upsert con `ignoreDuplicates`; no debe sobrescribir registros existentes. Las lecciones y temas se siembran como borrador.
- **Importar / Exportar:** la exportación descarga el catálogo local. La importación valida el JSON, pero no aplica cambios automáticamente en esta versión.
- **Revisión:** ofrece accesos a las listas; la matriz curricular detallada y las validaciones completas antes de publicar están pendientes.
- **Vista previa por rol:** es parcial y no debe usarse para inspeccionar datos reales de estudiantes.
- **Ajustes:** el cierre por inactividad cierra la sesión Auth. El tiempo se mantiene en el estado de la pantalla y vuelve al valor predeterminado al recargar.

## Seguridad y límites

El control de interfaz no sustituye RLS. Las políticas de escritura requieren `public.is_admin()`. El panel no permite listar, cambiar roles ni borrar cuentas de Supabase Auth. Esa función requiere una Supabase Edge Function con secretos almacenados en el servidor, validación de `is_admin()` y auditoría. Nunca se debe enviar `service_role` al navegador.

El contenido de la Biblioteca todavía se carga desde `src/library/catalog/data`; por tanto, editar el catálogo remoto no modifica el contenido visible al alumnado hasta completar la integración de `CatalogRepository`. El modo demo no puede ser administrador.

## Comprobación de RLS

Ejecuta `supabase/verify_admin_rls.sql` en un proyecto de prueba después de crear dos usuarios (uno admin y uno no admin). Reemplaza los UUID de ejemplo. No ejecutes pruebas destructivas en producción. El script muestra comprobaciones; para una garantía completa, ejecuta pruebas automatizadas con dos sesiones autenticadas.

## GitHub y Vercel Hobby

1. Descomprime el ZIP y revisa `git status`.
2. Confirma que `.env` y cualquier secreto no están incluidos; `.env.example` sí puede versionarse.
3. Sube el código a GitHub en una rama de cambios y revisa el diff antes de fusionar.
4. En Vercel usa el repositorio conectado, framework Vite, comando `npm run build` y salida `dist`.
5. Configura solo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en las variables de entorno.
6. Despliega una preview, verifica `/admin` con cuenta no administradora y con la administradora, después comprueba `/biblioteca` y la recarga de rutas profundas.

Vercel Hobby es suficiente para este frontend estático; la gestión segura de usuarios requeriría una función de servidor como Supabase Edge Functions, no un proceso permanente propio.
