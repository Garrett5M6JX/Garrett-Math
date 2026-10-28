# Hoja de ruta Garrett Math

Leyenda: **[x] terminado en la v10** · **[ ] pendiente** · *(infra)* requiere servicios o servidores adicionales.

## Terminado en la v10.0.0
- [x] Biblioteca de matemáticas (Preescolar y Primaria): catálogo tipado, búsqueda, filtros, temas, lecciones, ejercicios, progreso.
- [x] Progreso real por lección (local y sincronizado con `learning_progress`) y «Mi aprendizaje».
- [x] Rutas profundas estables en Vercel, pruebas automatizadas, auditoría y documentación.

## Siguiente versión (prioridad alta)
1. [ ] Ejecutar `npm install`, `npm run build` y las pruebas en un equipo con acceso a npm y corregir lo que aparezca.
2. [ ] **Revisión docente** de las 46 lecciones y adaptación al currículo del país. Cambiar `reviewStatus` a `'revisado'` solo tras validar.
3. [ ] Probar con un proyecto Supabase real: registro, sesión, `learning_progress` con varios usuarios y verificación de RLS.
4. [ ] Completar los 23 temas «en preparación» (empezando por Resolución de problemas, tablas de multiplicar, cálculo mental, simetría, probabilidad).
5. [ ] Pruebas con lectores de pantalla (NVDA/VoiceOver) y con niños y docentes reales; ajustar tipografía y textos de Preescolar.
6. [ ] Dividir `App.tsx` en páginas (`WelcomePage`, `LoginPage`, `StudentDashboardPage`…) y ampliar las pruebas de rutas y perfiles.
7. [ ] Recuperación de contraseña con Supabase Auth.

## Recomendaciones (no implementadas)
| Recomendación | Estado | Notas |
|---|---|---|
| Diagnóstico inicial opcional | Recomendada | Solo con contenido revisado; sugerencia, nunca una barrera. Puede hacerse en el cliente. |
| Ruta de aprendizaje personalizada | Recomendada | Los prerrequisitos ya están modelados en el catálogo. |
| Logros sin presión | Recomendada | Sin rachas ni rankings; reconocer el esfuerzo, no la velocidad. |
| Repaso según errores reales | Recomendada | Requiere guardar errores por ejercicio (hoy solo local); valorar una tabla aditiva con RLS. |
| Área familiar con progreso | Requiere *(infra)* | Necesita relación tutor–estudiante con consentimiento y políticas RLS propias. |
| Herramientas docentes para asignar actividades | Requiere *(infra)* | Tablas de grupos/asignaciones y RLS por rol. |
| Editor de contenidos | Requiere *(infra)* | Mover el catálogo a base de datos (la interfaz `CatalogRepository` ya lo permite) y un rol de administración seguro. |
| Tutor de IA | Requiere *(infra)* | Solo mediante backend (función segura) con clave secreta fuera del navegador, moderación y control de coste. |
| Importar/exportar contenidos y copias de seguridad | Parcial | La copia de progreso local existe; falta exportar/importar catálogos validados con `validateCatalog`. |
| Analítica respetuosa con la privacidad | Requiere *(infra)* | Agregada y anónima, con base legal y consentimiento. |
| Arrastrar y soltar | Opcional | Hoy hay una alternativa accesible equivalente; si se añade, mantenerla. |

## Antes de admitir menores reales
- [ ] Autenticación de producción, consentimiento parental, privacidad, retención y eliminación de datos, revisión legal.
- [ ] Pruebas de seguridad de las políticas RLS.

## Publicación
1. `npm install` y `npm run build` en limpio.
2. `npm test` y revisión manual en móvil y escritorio.
3. Subir a GitHub (revisar que no haya `.env*`), desplegar una *preview* en Vercel Hobby y probarla.
4. No declarar producción lista hasta completar los puntos de arriba.

## V11 — Administración (base inicial)
- [x] Ruta `/admin` con verificación en Supabase `admin_users`.
- [x] SQL aditivo para jerarquía de catálogo, RLS, versiones y auditoría.
- [x] Panel básico para listas remotas, siembra, edición JSON, estados y archivo/restauración.
- [x] Exportación del catálogo local y validación previa de JSON.
- [ ] Conectar `CatalogRepository` remoto al reproductor con fallback visible al catálogo local.
- [ ] Validación completa antes de publicar, mensajes por campo y prevención de ciclos/prerrequisitos incompatibles.
- [ ] Versionado y restauración real de lecciones; auditoría automática por cada mutación.
- [ ] Borrado definitivo protegido con conteo de progreso y prerrequisitos.
- [ ] Vista previa global por rol con banner persistente, bypass de redirecciones y ámbito `admin-preview` aislado.
- [ ] Importación transaccional con diff/confirmación y cobertura curricular detallada.
- [ ] Pruebas RLS con dos sesiones reales, pruebas de navegador y MFA verificado.
- [ ] Gestión de usuarios Auth mediante Edge Function segura, solo si se solicita.
