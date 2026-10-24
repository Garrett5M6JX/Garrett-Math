# Organización de páginas y rutas

La aplicación conserva un enrutador ligero propio en `src/router/routes.ts`, para no introducir una dependencia adicional antes de validar el comportamiento existente. Las rutas se sincronizan con el historial del navegador.

## Rutas principales

- `/`: presentación pública.
- `/iniciar-sesion`: acceso de demostración.
- `/crear-cuenta/rol`: selección de rol.
- `/crear-cuenta`: registro de demostración.
- `/configurar-perfil`: selección educativa inicial.
- `/estudiante`: panel del estudiante.
- `/estudiante/cursos`: explorador de todos los grados de la etapa elegida.
- `/perfil`: perfil educativo editable.
- `/profesor`: panel docente.
- `/familia`: administración local de perfiles infantiles.

## Límites de esta refactorización

Se extrajeron modelos (`src/types/models.ts`), configuración de etapas (`src/data/stages.ts`), marca reutilizable (`src/components/Brand.tsx`), selector accesible (`src/components/CustomSelect.tsx`), layout público (`src/layouts/PublicLayout.tsx`) y utilidades de almacenamiento demo (`src/services/demoStorage.ts`).

La lógica y algunas vistas siguen coordinadas desde `src/App.tsx` para no romper los flujos que comparten estado. La extracción de cada vista a un archivo `*Page.tsx` es la siguiente fase recomendada, después de validar compilación y recorridos. No se afirma que la separación completa de todas las páginas esté terminada.
