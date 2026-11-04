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


## v13–v18 — Evolución incremental (plan de trabajo)
### v13 · Calidad visual y accesibilidad
- Mantener dimensiones constantes del selector de tema entre modo claro y oscuro.
- Mejorar contraste del espacio docente en modo oscuro.
- Verificar navegación con teclado, estados de foco y reducción de movimiento.
- Mantener componentes ligeros y evitar dependencias innecesarias.

### v14 · Cuentas y acceso
- Recuperación de contraseña con Supabase Auth y flujo seguro de actualización.
- Inicio de sesión con Google OAuth configurado desde Supabase.
- Mensajes claros para enlaces caducados, correo no confirmado y errores de autenticación.
- Mantener la sesión persistente (ya activada en el cliente Supabase) y explicar cómo cerrar sesión en dispositivos compartidos.
- No almacenar contraseñas ni secretos OAuth en el navegador.

### v15 · Biblioteca ampliada
- Incorporar lecciones nuevas por grado, con objetivos, prerrequisitos, explicación, ejemplo y ejercicios.
- Publicar contenido solo después de validar respuestas y soluciones.
- Mantener el catálogo separado de la interfaz y cargar módulos de contenido por demanda cuando el volumen crezca.

### v16 · Experiencias interactivas
- Añadir actividades de arrastrar y soltar accesibles también con teclado.
- Incorporar rectas numéricas, modelos de fracciones y geometría manipulable.
- Guardar intentos y retroalimentación sin duplicar consultas al servidor.

### v17 · Espacio docente
- Guardar borradores de guías y prácticas.
- Planificador de clase con objetivos, duración, materiales y secuencia.
- Banco filtrable de ejercicios y exportación/impresión.
- Mantener recursos personales privados hasta contar con políticas RLS revisadas.

### v18 · Aulas y seguimiento
- Aulas, códigos de invitación, tareas y fechas de entrega.
- Informes de progreso y resultados por estudiante.
- Requiere diseño de tablas, permisos por rol, RLS y pruebas antes de activar datos reales.

## Reglas de rendimiento para cada versión
- Preferir React/CSS y componentes existentes antes de instalar dependencias.
- Evitar peticiones repetidas; paginar listas grandes y usar consultas selectivas.
- Dividir rutas y módulos pesados mediante carga diferida cuando proceda.
- No cargar contenido completo de todas las etapas en la pantalla inicial.
- Revisar tamaño de bundle, compilación, pruebas y experiencia móvil en cada Pull Request.
- No marcar una versión como lista hasta que Vercel Preview esté en Ready y se hayan probado los flujos afectados.


## v15 · Biblioteca matemática ampliada (contenido añadido)
Se incorporan cuatro lecciones nuevas para Primaria:
- 5.º: suma y resta de números decimales.
- 5.º: volumen de prismas rectangulares.
- 6.º: multiplicación de fracciones.
- 6.º: sucesos y probabilidad.

Cada lección incluye objetivo, explicación, ejemplo resuelto, ejercicios de práctica, pistas y retroalimentación. El contenido permanece marcado como borrador hasta su revisión docente. Se reutiliza el motor de catálogo existente y su carga diferida; no se añade una dependencia ni una consulta de red nueva.

Siguientes contenidos propuestos: porcentajes aplicados, divisiones con decimales, perímetro y área de figuras compuestas, ecuaciones sencillas, razones y proporcionalidad, estadística y geometría espacial.
