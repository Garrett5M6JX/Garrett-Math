# Changelog Garrett Math

## v9.0.0 — actualización mayor

- Se añade una herramienta de copia de seguridad local en el perfil educativo: exportación JSON e importación validada por formato y versión de esquema.
- Se incorpora un `ErrorBoundary` de React con mensaje de recuperación para errores de renderizado.
- Se mantiene el recorrido educativo existente, incluido el acceso a todos los grados de la etapa seleccionada y la edición del perfil educativo.
- Se actualiza la versión del paquete y la documentación para reflejar las capacidades y límites reales.
- La importación restaura únicamente claves conocidas de Garrett Math; no ejecuta código del archivo importado.

### Límites explícitos de esta versión

- La autenticación continúa siendo una demostración local, no una autenticación segura.
- La copia de seguridad puede incluir alias, correo de demostración, perfiles infantiles y progreso local. Guárdala en un lugar privado y no la compartas públicamente.
- La compilación de producción debe verificarse en un entorno con dependencias npm instalables antes de publicar.

## v8.4.0

- Modelos, datos por etapa, marca compartida, selector, layout público y almacenamiento demo separados en módulos.
- Rutas de navegación y perfil educativo editable.
- Espacios de demostración para estudiantes, docentes y familias.

## [9.1.0] - 2026-10-23
- Cambiado el hero del espacio docente a fondo negro para aumentar contraste.
- La palabra «inspirar» ahora usa verde Kelly brillante.
- Añadido cliente opcional de Supabase Auth para registro, inicio y cierre de sesión.
- El modo demo local se conserva cuando no se configuran variables de entorno.
- Documentadas las variables de Vercel, configuración de Supabase y precauciones para cuentas de menores.
