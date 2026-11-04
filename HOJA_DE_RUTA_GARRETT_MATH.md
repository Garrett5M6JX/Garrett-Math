# Garrett Math — hoja de ruta resumida v7

## Principios de producto
- Construir módulos pequeños y reutilizables; no cargar librerías grandes si CSS/React resuelven el caso.
- Separar contenido curricular, interfaz y lógica de ejercicios.
- Probar cada incremento antes de avanzar.
- No activar cuentas ni guardar datos de menores sin permisos, seguridad y política de privacidad.

## Etapa A — Base y calidad (actual)
1. Mantener navegación por etapas y cursos.
2. Unificar jerarquía tipográfica y accesibilidad.
3. Conservar modo claro/oscuro.
4. Separar currículo de la interfaz.
5. Guardar preferencias y progreso localmente.
6. Añadir pruebas de compilación y revisión móvil.

## Etapa B — Motor educativo
7. Crear catálogo de unidades y lecciones por curso.
8. Admitir distintos tipos de pregunta: opción múltiple, respuesta numérica y respuesta abierta guiada.
9. Añadir pistas graduadas y explicación por opción.
10. Registrar intentos, aciertos y duración localmente.
11. Añadir evaluación de unidad y repaso de errores.
12. Revisar cada solución matemática antes de publicar.

## Etapa C — Contenido
13. Completar primero una ruta de primaria.
14. Revisar la secuencia de prerrequisitos.
15. Crear plantillas para lecciones y actividades.
16. Incorporar fuentes de referencia y revisión editorial.
17. Expandir después a preescolar, secundaria y universidad.

## Etapa D — Docentes
18. Mejorar el planificador de clase con duración, objetivos y materiales.
19. Crear banco de ejercicios con nivel, tema, dificultad y solución.
20. Generar hojas imprimibles con clave de respuestas separada.
21. Crear guías de clase y rúbricas editables.
22. Añadir exportación PDF cuando el flujo esté validado.

## Etapa E — Datos y cuentas
23. Definir modelo de usuarios, perfiles, cursos, lecciones, intentos y tareas.
24. Configurar Supabase Auth y PostgreSQL.
25. Aplicar Row Level Security y permisos por rol.
26. Sincronizar progreso entre dispositivos.
27. Crear perfiles de estudiante y docente.
28. Incorporar copias de seguridad, eliminación de cuenta y controles de privacidad.

## Etapa F — Aulas y evaluación
29. Permitir al docente crear grupos.
30. Generar códigos de invitación seguros.
31. Asignar prácticas y fechas límite.
32. Permitir entregas y reintentos.
33. Mostrar resultados e indicadores de dificultad.
34. Añadir comentarios y retroalimentación.

## Etapa G — Garrett AI y fotos
35. Diseñar tutor con límites claros y respuestas pedagógicas.
36. Mantener claves de API solo en backend.
37. Evaluar precisión, coste, latencia y seguridad.
38. Añadir entrada de ejercicios por foto con confirmación del texto reconocido.
39. Resolver con pasos verificables y avisar de incertidumbre.

## Etapa H — Lanzamiento
40. Añadir pruebas unitarias y pruebas de interacción.
41. Medir carga inicial y dividir módulos solo cuando haga falta.
42. Revisar contraste, teclado, lectores de pantalla y móvil.
43. Probar con docentes y estudiantes de forma controlada.
44. Desplegar en un entorno de prueba y después en producción.
45. Monitorizar errores, rendimiento y comentarios antes de ampliar el alcance.

## Alcance real de v7
Incluye navegación por etapas, cuatro lecciones base más una segunda lección por etapa, ejercicios autocorregibles, modo oscuro, progreso local y planificador docente imprimible. No incluye backend, autenticación, IA ni aulas conectadas.


## v14 · Acceso a cuentas (implementación)
- Pantalla propia para solicitar recuperación de contraseña mediante Supabase Auth.
- Pantalla para actualizar la contraseña después de abrir el enlace de recuperación.
- Botón «Continuar con Google» usando OAuth de Supabase.
- La persistencia de sesión ya está activada en `src/services/supabase.ts` con `persistSession: true` y renovación automática; no se almacenan contraseñas localmente.

### Configuración externa necesaria para Google
1. En Supabase, abrir Authentication → Providers → Google y habilitar el proveedor.
2. En Google Cloud Console, crear un OAuth Client ID de tipo Web application.
3. En Authorized redirect URIs de Google, pegar exactamente el callback URL que muestra Supabase para el proveedor Google.
4. En Supabase → Authentication → URL Configuration, agregar el dominio de producción y el dominio Preview autorizado.
5. Guardar Client ID y Client Secret solamente en la configuración del proveedor Google de Supabase. Nunca incluir el Client Secret en variables `VITE_*`, React o Git.
6. Probar el flujo con una cuenta adulta de prueba y verificar el retorno a Garrett Math.

### Límites conocidos
- Las cuentas creadas mediante Google reciben el rol predeterminado de estudiante. El rol docente debe seguir asignándose mediante el mecanismo administrativo autorizado; no se permite que el navegador se otorgue permisos docentes.
- El correo de recuperación debe usar la plantilla de correo de Supabase y el dominio debe estar autorizado en URL Configuration.
- Las rutas de recuperación dependen de que Supabase detecte el token del enlace en la URL.
