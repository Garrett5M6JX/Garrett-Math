import { topic, withTopicOrder } from '../helpers.js'

/** Catálogo inicial de Secundaria. Los temas sin lección se muestran como contenido en preparación. */
export const secundariaTopics = withTopicOrder([
  // 1.º año
  topic('sec-1', 'numeros', 'enteros', 'Números enteros', 'Comparar, ordenar y operar con números positivos y negativos.', 1, ['enteros', 'negativos', 'opuestos', 'valor absoluto']),
  topic('sec-1', 'operaciones', 'lenguaje-algebraico', 'Lenguaje algebraico', 'Traducir situaciones y patrones a expresiones con variables.', 1, ['algebra', 'variables', 'expresiones', 'terminos']),
  topic('sec-1', 'geometria', 'angulos-poligonos', 'Ángulos y polígonos', 'Clasificar ángulos y reconocer propiedades básicas de polígonos.', 1, ['angulos', 'poligonos', 'geometria']),
  topic('sec-1', 'datos', 'tablas-graficos', 'Tablas y gráficos', 'Organizar datos y elegir representaciones adecuadas.', 1, ['estadistica', 'tablas', 'graficos', 'datos']),
  // 2.º año
  topic('sec-2', 'numeros', 'potencias-raices', 'Potencias y raíces cuadradas', 'Usar potencias, exponentes y raíces en cálculos sencillos.', 2, ['potencias', 'exponentes', 'raices']),
  topic('sec-2', 'operaciones', 'ecuaciones-lineales', 'Ecuaciones de primer grado', 'Resolver ecuaciones lineales aplicando operaciones equivalentes.', 2, ['ecuaciones', 'primer grado', 'despeje'], ['sec-1-lenguaje-algebraico']),
  topic('sec-2', 'patrones', 'razones-proporciones', 'Razones y proporciones', 'Resolver situaciones de proporcionalidad directa y porcentajes.', 2, ['razones', 'proporciones', 'porcentajes'], ['sec-1-lenguaje-algebraico']),
  topic('sec-2', 'geometria', 'teorema-pitagoras', 'Teorema de Pitágoras', 'Relacionar los catetos y la hipotenusa de un triángulo rectángulo.', 2, ['pitagoras', 'triangulo rectangulo', 'hipotenusa']),
  // 3.º año
  topic('sec-3', 'numeros', 'intervalos-reales', 'Intervalos y valor absoluto', 'Representar subconjuntos de los números reales en la recta.', 2, ['reales', 'intervalos', 'valor absoluto']),
  topic('sec-3', 'operaciones', 'polinomios', 'Operaciones con polinomios', 'Sumar, restar y multiplicar expresiones polinómicas.', 2, ['polinomios', 'monomios', 'productos']),
  topic('sec-3', 'patrones', 'funcion-lineal', 'Función lineal', 'Interpretar pendiente, ordenada al origen y gráfica de una recta.', 2, ['funciones', 'funcion lineal', 'pendiente', 'grafica'], ['sec-2-ecuaciones-lineales']),
  topic('sec-3', 'datos', 'probabilidad-simple', 'Probabilidad simple', 'Calcular probabilidades en espacios muestrales finitos.', 2, ['probabilidad', 'azar', 'espacio muestral']),
  // 4.º año
  topic('sec-4', 'operaciones', 'ecuaciones-cuadraticas', 'Ecuaciones cuadráticas', 'Resolver ecuaciones de segundo grado por factorización y fórmula.', 3, ['cuadratica', 'segundo grado', 'formula general'], ['sec-3-polinomios']),
  topic('sec-4', 'patrones', 'parabola', 'Función cuadrática y parábola', 'Analizar vértice, eje de simetría e intersecciones de una parábola.', 3, ['parabola', 'funcion cuadratica', 'vertice'], ['sec-3-funcion-lineal']),
  topic('sec-4', 'geometria', 'razones-trigonometricas', 'Razones trigonométricas', 'Aplicar seno, coseno y tangente en triángulos rectángulos.', 3, ['trigonometria', 'seno', 'coseno', 'tangente'], ['sec-2-teorema-pitagoras']),
  topic('sec-4', 'datos', 'dispersion-estadistica', 'Medidas de dispersión', 'Interpretar rango, varianza y desviación estándar en conjuntos pequeños.', 3, ['dispersion', 'varianza', 'desviacion estandar']),
  // 5.º año
  topic('sec-5', 'operaciones', 'radicales-racionales', 'Expresiones radicales y racionales', 'Simplificar expresiones algebraicas con radicales y denominadores.', 3, ['radicales', 'expresiones racionales', 'simplificar']),
  topic('sec-5', 'patrones', 'exponenciales-logaritmos', 'Funciones exponenciales y logarítmicas', 'Modelar crecimiento y relacionar logaritmos con exponentes.', 3, ['exponenciales', 'logaritmos', 'crecimiento']),
  topic('sec-5', 'geometria', 'geometria-analitica', 'Geometría analítica', 'Estudiar rectas y circunferencias mediante coordenadas.', 3, ['geometria analitica', 'rectas', 'circunferencia']),
  topic('sec-5', 'datos', 'muestreo-variabilidad', 'Muestreo y variabilidad', 'Comprender muestras, sesgos y variabilidad al interpretar datos.', 3, ['muestreo', 'variabilidad', 'inferencia']),
])
