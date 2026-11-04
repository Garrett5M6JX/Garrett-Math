import { ch, fr, lesson, nm, sec } from '../helpers.js'
import type { Lesson } from '../../types.js'

/** Nuevas lecciones de 5.º y 6.º de Primaria. Contenido en borrador para revisión docente. */
export const primaria5a6ExtraLessons: Lesson[] = [
  lesson({
    id: 'operar-decimales',
    topic: 'pri-5-decimales-operaciones',
    title: 'Sumar y restar números decimales',
    obj: 'Alinear las comas decimales para sumar y restar con precisión.',
    min: 9, d: 3, tags: ['decimales', 'suma', 'resta', 'coma decimal'],
    secs: [
      sec('Alineamos las comas', 'Escribe los números uno debajo del otro haciendo coincidir las comas decimales. Si hace falta, añade ceros a la derecha: 5,4 = 5,40.'),
      sec('Sumamos o restamos', 'Opera cada columna como con números naturales. La coma del resultado queda alineada con las demás.', { key: 'Primero alinea las comas; después calcula.' }),
    ],
    ex: {
      title: 'Una compra',
      problem: 'Un cuaderno cuesta 5,40 y un lápiz 2,35. ¿Cuánto cuestan juntos?',
      steps: [
        { text: 'Alineamos las comas: 5,40 + 2,35.' },
        { text: 'Sumamos centésimas, décimas y unidades: 5,40 + 2,35 = 7,75.' },
      ],
      answer: 'Cuestan 7,75.',
    },
    exs: [
      nm('Calcula 5,4 + 2,35.', 7.75, 'Escribimos 5,40 + 2,35 = 7,75.', ['Añade un cero: 5,4 = 5,40.', 'Alinea las comas antes de sumar.']),
      nm('Calcula 8,2 − 3,45.', 4.75, '8,20 − 3,45 = 4,75.', ['Escribe 8,2 como 8,20.', 'Alinea las comas y resta.']),
      ch('¿Qué debemos hacer antes de sumar decimales?', ['Alinear las comas', 'Borrar las comas', 'Multiplicar los números'], 0, 'Alinear las comas permite operar unidades del mismo valor posicional.', ['Observa las columnas de décimas y centésimas.']),
    ],
    sum: ['Alinea siempre las comas decimales.', 'Puedes añadir ceros a la derecha sin cambiar el valor.', 'Comprueba que cada columna representa la misma posición.'],
  }),
  lesson({
    id: 'volumen-prismas',
    topic: 'pri-5-volumen',
    title: 'Volumen de prismas rectangulares',
    obj: 'Calcular el volumen contando cubos unidad y multiplicando largo, ancho y alto.',
    min: 10, d: 3, tags: ['volumen', 'prismas', 'cubos', 'capacidad', 'medidas'],
    secs: [
      sec('El espacio que ocupa', 'El volumen mide el espacio que ocupa un cuerpo. Podemos imaginar que lo llenamos con cubos iguales de una unidad cúbica.'),
      sec('Capas de cubos', 'En un prisma rectangular, cada capa tiene largo × ancho cubos. El número de capas es la altura. Por eso: volumen = largo × ancho × alto.', { key: 'V = largo × ancho × alto.' }),
      sec('Unidades cúbicas', 'Si las medidas están en centímetros, el volumen se expresa en centímetros cúbicos (cm³). No confundas volumen con área: el área mide una superficie y el volumen mide espacio.' ),
    ],
    ex: {
      title: 'Una caja de bloques',
      problem: 'Una caja mide 4 cm de largo, 3 cm de ancho y 2 cm de alto. ¿Cuál es su volumen?',
      steps: [
        { text: 'Calculamos cuántos cubos hay en una capa: 4 × 3 = 12.' },
        { text: 'Hay 2 capas: 12 × 2 = 24.' },
      ],
      answer: 'El volumen es 24 cm³.',
    },
    exs: [
      nm('Un prisma mide 4 cm × 3 cm × 2 cm. ¿Cuál es su volumen en cm³?', 24, '4 × 3 × 2 = 24 cm³.', ['Multiplica las tres dimensiones.', 'Primero calcula 4 × 3 y luego multiplica por 2.'], { unit: 'cm³' }),
      nm('Una caja tiene 5 cubos de largo, 2 de ancho y 3 de alto. ¿Cuántos cubos unidad caben?', 30, '5 × 2 × 3 = 30 cubos unidad.', ['Calcula los cubos de una capa.', 'Multiplica por el número de capas.']),
      ch('¿Qué magnitud se expresa en cm³?', ['Longitud', 'Área', 'Volumen'], 2, 'Los centímetros cúbicos miden volumen.', ['Piensa en el espacio que ocupa un objeto.']),
    ],
    sum: ['Volumen: espacio que ocupa un cuerpo.', 'Prisma rectangular: V = largo × ancho × alto.', 'El volumen se expresa en unidades cúbicas.'],
  }),
  lesson({
    id: 'multiplicar-fracciones',
    topic: 'pri-6-multiplicar-fracciones',
    title: 'Multiplicación de fracciones',
    obj: 'Multiplicar numeradores entre sí y denominadores entre sí, y simplificar el resultado.',
    min: 10, d: 3, tags: ['fracciones', 'multiplicación', 'numerador', 'denominador'],
    secs: [
      sec('Multiplicamos arriba y abajo', 'Para multiplicar dos fracciones, multiplicamos los numeradores entre sí y los denominadores entre sí.'),
      sec('Simplificamos', 'Después de multiplicar, buscamos si numerador y denominador tienen un divisor común para escribir una fracción equivalente más sencilla.', { key: '(a/b) × (c/d) = (a×c)/(b×d).' }),
    ],
    ex: {
      title: 'Dos tercios por tres cuartos',
      problem: 'Calcula 2/3 × 3/4.',
      steps: [
        { text: 'Multiplicamos los numeradores: 2 × 3 = 6.' },
        { text: 'Multiplicamos los denominadores: 3 × 4 = 12.' },
        { text: 'Simplificamos 6/12 dividiendo arriba y abajo entre 6: 1/2.' },
      ],
      answer: '2/3 × 3/4 = 1/2.',
    },
    exs: [
      fr('Calcula 2/3 × 3/4 y simplifica.', 1, 2, '2×3 = 6 y 3×4 = 12. La fracción 6/12 se simplifica a 1/2.', ['Multiplica numerador por numerador.', 'Multiplica denominador por denominador.', 'Simplifica 6/12.'], { equiv: true }),
      fr('Calcula 1/2 × 2/5.', 1, 5, '1×2 = 2 y 2×5 = 10; 2/10 = 1/5.', ['Multiplica arriba y abajo.', 'Simplifica el resultado.']),
      ch('¿Qué se multiplica al operar dos fracciones?', ['Solo los numeradores', 'Numeradores entre sí y denominadores entre sí', 'Los denominadores se suman'], 1, 'Se multiplican numerador por numerador y denominador por denominador.', ['La operación se realiza por separado arriba y abajo.']),
    ],
    sum: ['Multiplica numerador por numerador.', 'Multiplica denominador por denominador.', 'Simplifica si existe un divisor común.'],
  }),
  lesson({
    id: 'probabilidad-sucesos',
    topic: 'pri-6-probabilidad',
    title: 'Sucesos y probabilidad',
    obj: 'Distinguir sucesos seguros, posibles e imposibles y expresar probabilidades sencillas.',
    min: 9, d: 3, tags: ['probabilidad', 'azar', 'sucesos', 'posible', 'imposible'],
    secs: [
      sec('El azar', 'Un experimento aleatorio tiene resultados que no podemos saber con seguridad antes de realizarlo, como lanzar una moneda o un dado.'),
      sec('Seguro, posible e imposible', 'Un suceso seguro ocurre siempre. Uno imposible no puede ocurrir. Un suceso posible puede ocurrir, pero no está garantizado.'),
      sec('Casos favorables', 'Cuando todos los resultados son igual de probables, calculamos: probabilidad = casos favorables ÷ casos posibles.'),
    ],
    ex: {
      title: 'Lanzamos un dado',
      problem: 'Al lanzar un dado justo de seis caras, ¿cuál es la probabilidad de obtener un 6?',
      steps: [
        { text: 'Hay 6 resultados posibles: 1, 2, 3, 4, 5 y 6.' },
        { text: 'Solo un resultado es favorable: obtener 6.' },
        { text: 'La probabilidad es 1/6.' },
      ],
      answer: 'La probabilidad es 1/6.',
    },
    exs: [
      ch('Al lanzar un dado común, ¿qué suceso es imposible?', ['Obtener un 3', 'Obtener un 6', 'Obtener un 8'], 2, 'Un dado común tiene caras del 1 al 6; no puede salir 8.', ['Revisa los números que aparecen en sus caras.']),
      ch('Al lanzar una moneda equilibrada, ¿qué probabilidad hay de obtener cara?', ['1/2', '1/3', '1'], 0, 'Hay dos resultados igualmente probables y uno es cara: 1/2.', ['La moneda tiene dos caras posibles.']),
      ch('Si una bolsa tiene 4 bolas rojas y ninguna azul, sacar una bola azul es…', ['Seguro', 'Posible', 'Imposible'], 2, 'No hay bolas azules en la bolsa, así que el suceso es imposible.', ['Observa cuántas bolas azules hay.']),
    ],
    sum: ['Seguro: ocurre siempre.', 'Imposible: no puede ocurrir.', 'Posible: puede ocurrir.', 'Si los resultados son equiprobables: P = casos favorables / casos posibles.'],
  }),
]
