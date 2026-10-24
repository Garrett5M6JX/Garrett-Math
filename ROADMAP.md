# Hoja de ruta Garrett Math

## v9.0 — robustez y control de datos
- [x] Exportación de datos locales a JSON.
- [x] Restauración validada de copias compatibles.
- [x] Fallback de errores de renderizado.
- [x] Mantener selección de etapa y perfil educativo editable.
- [ ] Ejecutar instalación limpia y compilación de producción en entorno con acceso a npm.

## v9.x — arquitectura y experiencia
- [ ] Extraer pantallas principales a módulos independientes (`pages/WelcomePage`, `LoginPage`, `RegisterPage`, `StudentDashboardPage`, `StageCatalogPage`, `LessonPage`, `StudentProfilePage`, `TeacherDashboardPage`, `FamilyDashboardPage`).
- [ ] Sustituir mensajes de acción pendiente por flujos navegables o etiquetarlos claramente como planificados.
- [ ] Ampliar lecciones con contenido revisado por etapa y grado, y añadir pruebas de respuestas.
- [ ] Mostrar progreso calculado exclusivamente a partir de lecciones realmente completadas.
- [ ] Añadir pruebas de rutas, perfiles y restauración de copias.

## v10 — servicios reales (no activar sin pruebas)
- [ ] Integrar proveedor de autenticación real y recuperación de contraseña.
- [ ] Implementar perfiles y progreso persistentes en backend.
- [ ] Diseñar políticas RLS por rol, consentimiento parental, privacidad y retención de datos.
- [ ] Pruebas de seguridad y revisión legal antes de admitir menores reales.

## Publicación
1. Instalar dependencias desde cero y ejecutar `npm run build`.
2. Probar rutas, roles, móvil y exportar/restaurar datos en navegador limpio.
3. Subir a GitHub como checkpoint privado; revisar `.env` y secretos antes de hacer push.
4. Desplegar preview en Vercel y probarla. No declarar producción lista hasta completar los pasos anteriores.
