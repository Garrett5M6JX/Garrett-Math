import type { Area, Grade, Stage, Unit } from '../../types'

export const stages: Stage[] = [
  { id: 'preescolar', name: 'Preescolar', ageRange: '3–5 años', order: 1, description: 'Descubrir los números, las formas y los patrones jugando, observando y manipulando.' },
  { id: 'primaria', name: 'Primaria', ageRange: '6–11 años', order: 2, description: 'Construir una base sólida: números, operaciones, fracciones, geometría, medida y datos.' },
]

export const grades: Grade[] = [
  { id: 'pre-3', stageId: 'preescolar', name: '3 años', order: 1 },
  { id: 'pre-4', stageId: 'preescolar', name: '4 años', order: 2 },
  { id: 'pre-5', stageId: 'preescolar', name: '5 años', order: 3 },
  { id: 'pri-1', stageId: 'primaria', name: '1.º grado', order: 4 },
  { id: 'pri-2', stageId: 'primaria', name: '2.º grado', order: 5 },
  { id: 'pri-3', stageId: 'primaria', name: '3.º grado', order: 6 },
  { id: 'pri-4', stageId: 'primaria', name: '4.º grado', order: 7 },
  { id: 'pri-5', stageId: 'primaria', name: '5.º grado', order: 8 },
  { id: 'pri-6', stageId: 'primaria', name: '6.º grado', order: 9 },
]

export const areas: Area[] = [
  { id: 'numeros', name: 'Números y sistema numérico', icon: 'numeros', order: 1, description: 'Contar, leer, escribir, comparar y descomponer números.' },
  { id: 'operaciones', name: 'Operaciones y cálculo', icon: 'operaciones', order: 2, description: 'Sumar, restar, multiplicar, dividir y calcular con estrategias.' },
  { id: 'fracciones', name: 'Fracciones y decimales', icon: 'fracciones', order: 3, description: 'Partes de un todo, equivalencias, decimales y su relación.' },
  { id: 'geometria', name: 'Geometría y espacio', icon: 'geometria', order: 4, description: 'Formas, posición, ángulos y ubicación en el plano.' },
  { id: 'medida', name: 'Medida, tiempo y dinero', icon: 'medida', order: 5, description: 'Comparar y medir longitud, área, tiempo y más.' },
  { id: 'datos', name: 'Datos y probabilidad', icon: 'datos', order: 6, description: 'Leer tablas y gráficos, y razonar con datos.' },
  { id: 'patrones', name: 'Patrones y pensamiento algebraico', icon: 'patrones', order: 7, description: 'Clasificar, descubrir regularidades y proporciones.' },
  { id: 'problemas', name: 'Resolución de problemas', icon: 'problemas', order: 8, description: 'Situaciones cotidianas que se resuelven con matemáticas.' },
]

const u = (grade: string, area: string, order: number, title: string, description: string): Unit => ({ id: `${grade}-${area}`, gradeId: grade, areaId: area, title, description, order })

export const units: Unit[] = [
  u('pre-3', 'numeros', 1, 'Uno, dos y tres', 'Las primeras cantidades.'),
  u('pre-3', 'patrones', 2, 'Agrupar y clasificar', 'Juntar lo que se parece.'),
  u('pre-3', 'geometria', 3, 'Formas y lugares', 'Formas básicas y posiciones sencillas.'),
  u('pre-3', 'medida', 4, 'Tamaños', 'Comparar grande y pequeño.'),
  u('pre-4', 'numeros', 1, 'Contar y comparar hasta 5', 'Conteo, número y cantidad, más, menos e igual.'),
  u('pre-4', 'patrones', 2, 'Patrones y secuencias', 'Lo que se repite y lo que va primero.'),
  u('pre-4', 'geometria', 3, 'Posiciones en el espacio', 'Encima, debajo y al lado.'),
  u('pre-4', 'medida', 4, 'Longitudes', 'Largo y corto.'),
  u('pre-5', 'numeros', 1, 'Números hasta 10', 'Contar hacia delante y hacia atrás.'),
  u('pre-5', 'operaciones', 2, 'Juntar y quitar', 'Primeras sumas y restas con objetos.'),
  u('pre-5', 'patrones', 3, 'Patrones más largos', 'Patrones de tres elementos.'),
  u('pre-5', 'geometria', 4, 'Figuras y orientación', 'Lados, esquinas, izquierda y derecha.'),
  u('pre-5', 'medida', 5, 'Tiempo y rutinas', 'El orden de las actividades del día.'),
  u('pri-1', 'numeros', 1, 'Números hasta 100', 'Leer, escribir, componer y comparar.'),
  u('pri-1', 'operaciones', 2, 'Sumar y restar hasta 20', 'Significado de sumar y restar.'),
  u('pri-1', 'geometria', 3, 'Figuras', 'Figuras planas y sólidos del entorno.'),
  u('pri-1', 'medida', 4, 'Tiempo', 'La hora en el reloj.'),
  u('pri-1', 'problemas', 5, 'Problemas sencillos', 'Historias con sumas y restas.'),
  u('pri-2', 'numeros', 1, 'Números hasta 999', 'Centenas, decenas y unidades.'),
  u('pri-2', 'operaciones', 2, 'Operaciones', 'Sumas con llevadas y primeras multiplicaciones.'),
  u('pri-2', 'medida', 3, 'Medidas y dinero', 'Longitud y dinero.'),
  u('pri-2', 'datos', 4, 'Datos', 'Pictogramas y tablas.'),
  u('pri-3', 'operaciones', 1, 'Multiplicar y dividir', 'Tablas, repartos y cálculo mental.'),
  u('pri-3', 'fracciones', 2, 'Primeras fracciones', 'Partes iguales de un todo.'),
  u('pri-3', 'medida', 3, 'Perímetro', 'Medir el contorno de figuras.'),
  u('pri-3', 'problemas', 4, 'Problemas con multiplicación', 'Situaciones de grupos y repartos.'),
  u('pri-4', 'numeros', 1, 'Números grandes', 'Números de varias cifras.'),
  u('pri-4', 'operaciones', 2, 'Multiplicación', 'Multiplicar por números de dos cifras.'),
  u('pri-4', 'fracciones', 3, 'Fracciones y decimales', 'Equivalencia, comparación y décimos.'),
  u('pri-4', 'geometria', 4, 'Ángulos y simetría', 'Tipos de ángulos y figuras simétricas.'),
  u('pri-4', 'medida', 5, 'Área', 'Medir superficies.'),
  u('pri-4', 'patrones', 6, 'Regularidades', 'Patrones numéricos.'),
  u('pri-5', 'numeros', 1, 'Múltiplos y divisores', 'Divisibilidad y números primos.'),
  u('pri-5', 'fracciones', 2, 'Operaciones con fracciones y decimales', 'Sumar, restar y operar.'),
  u('pri-5', 'geometria', 3, 'Plano y coordenadas', 'Ubicar puntos.'),
  u('pri-5', 'medida', 4, 'Volumen y capacidad', 'Medir espacio ocupado.'),
  u('pri-6', 'numeros', 1, 'Porcentajes', 'Partes de cien.'),
  u('pri-6', 'operaciones', 2, 'Operaciones combinadas', 'El orden de las operaciones.'),
  u('pri-6', 'fracciones', 3, 'Fracciones avanzadas', 'Multiplicar fracciones.'),
  u('pri-6', 'datos', 4, 'Estadística y probabilidad', 'Media y azar.'),
  u('pri-6', 'patrones', 5, 'Proporcionalidad y álgebra inicial', 'Razones, tablas y expresiones.'),
]
