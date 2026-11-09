import { ch, ex, lesson, nm, sec } from '../helpers.js'
import type { Lesson } from '../../types.js'

/** Primera entrega de Secundaria: una lección introductoria por año. Todo el contenido requiere revisión docente. */
export const secundariaLessons: Lesson[] = [
  lesson({
    id: 'sec-enteros-intro', topic: 'sec-1-enteros', title: 'Números enteros: positivos y negativos',
    obj: 'Ubicar números enteros en la recta y comparar sus valores.', min: 12, d: 1,
    tags: ['enteros', 'positivos', 'negativos', 'recta numerica'],
    secs: [
      sec('¿Para qué sirven los negativos?', 'Los números negativos permiten representar cantidades por debajo de cero, como temperaturas bajo cero o deudas. El cero separa los positivos de los negativos.'),
      sec('Orden en la recta numérica', 'En la recta, los números aumentan hacia la derecha. Por eso −2 es mayor que −5: está más a la derecha.', { key: '−5 < −2 < 0 < 3' }),
    ],
    ex: ex('Comparar temperaturas', '¿Qué temperatura es mayor: −3 °C o −7 °C?', ['Ubica ambos números en la recta.', '−3 está a la derecha de −7.', 'Por tanto, −3 es mayor.'], '−3 °C es mayor que −7 °C.'),
    exs: [
      nm('¿Cuál es el opuesto de −8?', 8, 'El opuesto tiene la misma distancia al cero, pero al lado contrario.', ['Cambia el signo.']),
      ch('¿Cuál es el mayor número?', ['−9', '−4', '−12'], 1, '−4 está más a la derecha que −9 y −12.', ['Entre negativos, el más cercano a cero es mayor.']),
      ch('Orden correcto de menor a mayor:', ['−1, −3, 2', '−3, −1, 2', '2, −1, −3'], 1, 'La recta aumenta de izquierda a derecha: −3, −1, 2.', ['Coloca primero el más negativo.']),
    ],
    sum: ['Los negativos están a la izquierda del cero.', 'En la recta, avanzar a la derecha significa aumentar.'],
  }),
  lesson({
    id: 'sec-lenguaje-algebraico', topic: 'sec-1-lenguaje-algebraico', title: 'Introducción al lenguaje algebraico',
    obj: 'Representar cantidades desconocidas mediante variables y expresiones.', min: 14, d: 1,
    tags: ['algebra', 'variable', 'expresion'],
    secs: [
      sec('La variable representa un valor', 'Una letra, como x, puede representar un número que todavía no conocemos o que puede cambiar.'),
      sec('Traducir palabras a símbolos', 'El doble de un número se escribe 2x. Cinco más que un número se escribe x + 5. Una expresión no lleva necesariamente signo de igualdad.', { key: '«El triple de x menos 4» → 3x − 4' }),
    ],
    ex: ex('Traducir una frase', 'Escribe «siete más que un número n».', ['Identifica el número desconocido: n.', '«Más que» indica suma.', 'Añade 7: n + 7.'], 'n + 7'),
    exs: [
      ch('¿Cómo se escribe el doble de x?', ['x + 2', '2x', 'x ÷ 2'], 1, 'Doble significa multiplicar por 2: 2x.', ['Doble es dos veces la cantidad.']),
      nm('Si x = 4, ¿cuánto vale 3x + 2?', 14, '3(4) + 2 = 12 + 2 = 14.', ['Sustituye x por 4.', 'Multiplica antes de sumar.']),
      ch('¿Qué expresión representa «un número disminuido en 6»?', ['x + 6', '6x', 'x − 6'], 2, 'Disminuido en 6 significa restar 6 al número.', ['Disminuir indica quitar.']),
    ],
    sum: ['Las variables representan números.', 'La multiplicación puede escribirse sin el signo: 3x.', 'Una expresión algebraica no es necesariamente una ecuación.'],
  }),
  lesson({
    id: 'sec-potencias-intro', topic: 'sec-2-potencias-raices', title: 'Potencias: base y exponente',
    obj: 'Interpretar potencias como multiplicaciones repetidas y calcular potencias sencillas.', min: 12, d: 2,
    tags: ['potencias', 'base', 'exponente'],
    secs: [
      sec('Multiplicar un factor por sí mismo', 'Una potencia indica una multiplicación repetida. En 3², la base es 3 y el exponente 2: 3 × 3.'),
      sec('La base y el exponente', 'La base es el número que se repite como factor. El exponente indica cuántas veces aparece. Así, 2³ = 2 × 2 × 2 = 8.', { key: '2³ = 8, no 2 × 3.' }),
    ],
    ex: ex('Calcular una potencia', 'Calcula 4².', ['La base es 4 y el exponente es 2.', 'Multiplica 4 por sí mismo dos veces: 4 × 4.', 'El resultado es 16.'], '4² = 16.'),
    exs: [
      nm('¿Cuánto vale 2³?', 8, '2³ = 2 × 2 × 2 = 8.', ['Escribe tres factores iguales a 2.']),
      nm('¿Cuánto vale 5²?', 25, '5² = 5 × 5 = 25.', ['El exponente 2 indica dos factores.']),
      ch('En 7⁴, ¿cuál es la base?', ['4', '7', '28'], 1, 'La base es 7; el exponente es 4.', ['La base es el número que se eleva.']),
    ],
    sum: ['La base es el factor que se repite.', 'El exponente indica cuántas veces aparece.', 'No confundas 2³ con 2 × 3.'],
  }),
  lesson({
    id: 'sec-ecuaciones-lineales', topic: 'sec-2-ecuaciones-lineales', title: 'Resolver ecuaciones de primer grado',
    obj: 'Resolver ecuaciones lineales sencillas manteniendo la igualdad.', min: 15, d: 2,
    tags: ['ecuaciones', 'primer grado', 'despejar'],
    secs: [
      sec('Una igualdad equilibrada', 'Una ecuación afirma que dos expresiones tienen el mismo valor. Resolverla es encontrar el valor de la incógnita que hace verdadera la igualdad.'),
      sec('Operaciones equivalentes', 'Podemos sumar, restar, multiplicar o dividir ambos lados por el mismo número distinto de cero y conservar la igualdad.', { key: 'x + 5 = 12 → x = 12 − 5 = 7' }),
    ],
    ex: ex('Despejar x', 'Resuelve x + 8 = 19.', ['Resta 8 en ambos lados.', 'x = 19 − 8.', 'Comprueba: 11 + 8 = 19.'], 'x = 11'),
    exs: [
      nm('Resuelve: x + 6 = 15. ¿Cuánto vale x?', 9, 'Restamos 6 a ambos lados: x = 15 − 6 = 9.', ['La operación inversa de sumar 6 es restar 6.']),
      nm('Resuelve: 4x = 28. ¿Cuánto vale x?', 7, 'Dividimos ambos lados entre 4: x = 28 ÷ 4 = 7.', ['La operación inversa de multiplicar por 4 es dividir entre 4.']),
      ch('¿Qué operación deshace una resta de 3?', ['Sumar 3', 'Multiplicar por 3', 'Dividir entre 3'], 0, 'Sumar 3 deshace la resta de 3.', ['Busca la operación inversa.']),
    ],
    sum: ['Una ecuación es una igualdad con incógnitas.', 'Haz la misma operación en ambos lados.', 'Comprueba sustituyendo la solución.'],
  }),
  lesson({
    id: 'sec-funcion-lineal', topic: 'sec-3-funcion-lineal', title: 'La función lineal y su pendiente',
    obj: 'Reconocer una función de la forma y = mx + b e interpretar m y b.', min: 16, d: 2,
    tags: ['funcion lineal', 'pendiente', 'ordenada al origen'],
    secs: [
      sec('Una regla que relaciona x con y', 'Una función asigna un valor de salida a cada valor permitido de entrada. En y = mx + b, m y b son constantes.'),
      sec('Pendiente e intersección', 'La pendiente m describe cuánto cambia y cuando x aumenta una unidad. b indica dónde corta la recta al eje vertical.', { key: 'En y = 2x + 3, m = 2 y b = 3.' }),
    ],
    ex: ex('Evaluar una función', 'Si y = 2x + 3, calcula y cuando x = 4.', ['Sustituye x por 4.', 'y = 2(4) + 3.', 'y = 8 + 3 = 11.'], 'y = 11'),
    exs: [
      nm('En y = 3x + 2, ¿cuánto vale y si x = 2?', 8, 'y = 3(2) + 2 = 8.', ['Sustituye x por 2.', 'Multiplica antes de sumar.']),
      nm('En y = 5x − 1, ¿cuál es la pendiente?', 5, 'La pendiente es el coeficiente de x: 5.', ['Busca el número que multiplica a x.']),
      ch('En y = −2x + 7, ¿dónde corta la recta al eje y?', ['−2', '7', '0'], 1, 'La ordenada al origen es b = 7.', ['Observa el término independiente.']),
    ],
    sum: ['En y = mx + b, m es la pendiente.', 'b es la intersección con el eje vertical.', 'Sustituye x para calcular la salida y.'],
  }),
]
