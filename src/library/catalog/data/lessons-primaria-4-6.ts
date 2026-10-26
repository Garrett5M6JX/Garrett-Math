import { ch, ex, fr, lesson, nm, sec } from '../helpers'
import type { Lesson } from '../../types'

/** Lecciones de 4.º a 6.º de Primaria. Todas son BORRADOR: no han sido revisadas por docentes. */
export const primaria4a6Lessons: Lesson[] = [
  // ───────────────── 4.º
  lesson({
    id: 'fracciones-equivalentes', topic: 'pri-4-equivalentes', title: 'Fracciones equivalentes', obj: 'Reconocer y construir fracciones equivalentes multiplicando o dividiendo numerador y denominador por el mismo número.', min: 10, d: 2,
    tags: ['fracciones', 'equivalentes', 'simplificar'], pre: ['fracciones-partes-iguales'],
    secs: [
      sec('Distinta escritura, misma cantidad', 'Dos fracciones son equivalentes cuando representan la misma cantidad. 1/2 y 2/4 cubren la misma parte del todo.', { v: { kind: 'fraction', parts: 4, shaded: 2, alt: 'Barra de 4 partes con 2 pintadas: es la mitad, igual que 1/2' }, key: '1/2 = 2/4' }),
      sec('Cómo construirlas', 'Multiplica el numerador y el denominador por el mismo número (distinto de 0): 1/2 = (1×3)/(2×3) = 3/6. También puedes dividir ambos por un divisor común para simplificar.', { key: 'Mismo número arriba y abajo.' }),
    ],
    ex: ex('Completa 2/3 = ?/9', 'Busca el numerador que falta.', ['De 3 a 9 se multiplicó por 3.', 'Multiplica también el numerador: 2 × 3 = 6.', 'Entonces 2/3 = 6/9.'], '2/3 = 6/9.'),
    exs: [
      fr('Escribe una fracción equivalente a 1/2 con denominador 6.', 3, 6, 'Se multiplicó por 3: (1×3)/(2×3) = 3/6.', ['¿Por cuánto multiplicas 2 para llegar a 6?', 'Multiplica el numerador por el mismo número.']),
      fr('Simplifica 4/8 hasta su forma más simple.', 1, 2, 'Dividimos 4 y 8 entre 4: 1/2.', ['¿Qué número divide a 4 y a 8?']),
      ch('¿Cuál es equivalente a 2/3?', ['4/6', '3/4', '2/6'], 0, '2/3 = (2×2)/(3×2) = 4/6.', ['Multiplica arriba y abajo por el mismo número.'], { wrong: { 2: 'Solo cambió el denominador: la fracción ya no vale lo mismo.' } }),
    ],
    sum: ['Equivalentes: misma cantidad, distinta escritura.', 'Multiplica o divide arriba y abajo por el mismo número.'],
  }),
  lesson({
    id: 'decimos', topic: 'pri-4-decimos', title: 'Décimos y números decimales', obj: 'Relacionar fracciones con denominador 10 y su escritura decimal.', min: 9, d: 2,
    tags: ['decimales', 'decimos', 'coma decimal'], pre: ['fracciones-partes-iguales'],
    secs: [
      sec('Un entero en diez partes', 'Si dividimos un entero en 10 partes iguales, cada parte es un décimo: 1/10 = 0,1.', { v: { kind: 'fraction', parts: 10, shaded: 3, alt: 'Barra de 10 partes con 3 pintadas: 3/10' }, key: '3/10 = 0,3' }),
      sec('La coma decimal', 'La coma separa los enteros de las partes más pequeñas que 1. En 0,3 hay 0 enteros y 3 décimos.'),
    ],
    ex: ex('7/10 en decimal', 'Escribe 7/10 como decimal.', ['Son 7 décimos.', '0 enteros y 7 décimos: 0,7.'], '7/10 = 0,7.'),
    exs: [
      nm('Escribe 7/10 como número decimal.', 0.7, '7 décimos se escriben 0,7.', ['Un décimo es 0,1.']),
      nm('¿Cuántos décimos hay en 0,5?', 5, '0,5 = 5/10: son 5 décimos.', ['Lee la cifra después de la coma.']),
      ch('¿Qué fracción es igual a 0,9?', ['9/10', '1/9', '9/100'], 0, '0,9 = 9/10.', ['Un décimo es 1/10.'], { wrong: { 2: '9/100 sería 0,09: tiene dos cifras decimales.' } }),
    ],
    sum: ['Un décimo es 1/10 = 0,1.', 'La coma separa enteros y décimos.'],
  }),
  lesson({
    id: 'area-rectangulos', topic: 'pri-4-area', title: 'Área de rectángulos', obj: 'Calcular el área de un rectángulo contando cuadrados y multiplicando largo por ancho.', min: 9, d: 2,
    tags: ['area', 'superficie', 'rectangulo'], pre: ['perimetro-rectangulo', 'grupos-iguales'],
    secs: [
      sec('Cubrir una superficie', 'El área mide cuánta superficie cubre una figura. Se cuenta en cuadrados de una unidad.', { v: { kind: 'rectGrid', w: 4, h: 3, alt: 'Rectángulo de 4 por 3 cuadrados' }, key: 'Área = largo × ancho.' }),
      sec('Filas iguales', 'Un rectángulo de 4 por 3 tiene 3 filas de 4 cuadrados: 3 × 4 = 12 cuadrados. Se escribe 12 unidades cuadradas (por ejemplo, 12 cm²).'),
    ],
    ex: ex('Una baldosa', 'Un rectángulo mide 6 cm por 4 cm. ¿Cuál es su área?', ['Multiplicamos largo por ancho.', '6 × 4 = 24.', 'Se expresa en cm².'], 'Área: 24 cm².'),
    exs: [
      nm('¿Cuál es el área de este rectángulo (en cuadrados)?', 12, '4 × 3 = 12 cuadrados.', ['Cuenta los cuadrados de una fila y las filas.'], { v: { kind: 'rectGrid', w: 4, h: 3, alt: 'Rectángulo de 4 por 3' } }),
      nm('Un rectángulo mide 6 cm por 4 cm. ¿Cuál es su área en cm²?', 24, '6 × 4 = 24 cm².', ['Multiplica los lados.'], { unit: 'cm²' }),
      ch('Quieres poner baldosas en un piso. ¿Qué mides?', ['El perímetro', 'El área'], 1, 'Cubrir una superficie se mide con el área.', ['¿Mides el borde o lo que cubres?']),
    ],
    sum: ['Área: superficie cubierta.', 'Rectángulo: largo × ancho, en unidades cuadradas.'],
  }),
  lesson({
    id: 'tipos-de-angulos', topic: 'pri-4-angulos', title: 'Tipos de ángulos', obj: 'Clasificar ángulos como rectos, agudos u obtusos.', min: 8, d: 2,
    tags: ['angulos', 'recto', 'agudo', 'obtuso'], pre: ['figuras-lados-esquinas'],
    secs: [
      sec('El ángulo recto', 'Un ángulo es la abertura entre dos semirrectas. El ángulo recto mide 90° y se parece a la esquina de una hoja.', { v: { kind: 'angle', degrees: 90, alt: 'Ángulo recto de 90 grados' }, key: 'Recto: 90°.' }),
      sec('Agudo y obtuso', 'Agudo es menor que 90°; obtuso es mayor que 90° y menor que 180°.', { v: { kind: 'angle', degrees: 45, alt: 'Ángulo agudo de 45 grados' } }),
    ],
    ex: ex('Un ángulo de 120°', '¿Qué tipo de ángulo es?', ['Lo comparamos con 90°.', '120° es mayor que 90° y menor que 180°.'], 'Es obtuso.'),
    exs: [
      ch('¿Qué tipo de ángulo es?', ['Agudo', 'Recto', 'Obtuso'], 1, 'Mide 90°: es recto.', ['Compáralo con la esquina de una hoja.'], { v: { kind: 'angle', degrees: 90, alt: 'Ángulo de 90 grados' } }),
      ch('¿Qué tipo de ángulo es?', ['Agudo', 'Recto', 'Obtuso'], 0, 'Mide 45°, menos que 90°: es agudo.', ['¿Es más abierto o más cerrado que un recto?'], { v: { kind: 'angle', degrees: 45, alt: 'Ángulo de 45 grados' } }),
      ch('¿Qué tipo de ángulo es?', ['Agudo', 'Recto', 'Obtuso'], 2, 'Mide 120°, más que 90°: es obtuso.', ['Más abierto que un recto.'], { v: { kind: 'angle', degrees: 120, alt: 'Ángulo de 120 grados' } }),
    ],
    sum: ['Agudo < 90°, recto = 90°, obtuso > 90° y < 180°.'],
  }),
  // ───────────────── 5.º
  lesson({
    id: 'sumar-fracciones-igual-denominador', topic: 'pri-5-sumar-fracciones', title: 'Sumar y restar fracciones con igual denominador', obj: 'Sumar y restar fracciones del mismo denominador y simplificar el resultado.', min: 10, d: 3,
    tags: ['fracciones', 'suma de fracciones', 'resta de fracciones'], pre: ['fracciones-equivalentes'],
    secs: [
      sec('Mismas partes, se suman las partes', 'Si las partes son del mismo tamaño, solo sumamos cuántas partes hay: 2/5 + 1/5 = 3/5.', { v: { kind: 'fraction', parts: 5, shaded: 3, alt: 'Barra de 5 partes con 3 pintadas: 3/5' }, key: 'El denominador no cambia.' }),
      sec('Restar y simplificar', 'Se restan los numeradores: 5/6 − 2/6 = 3/6. Después se puede simplificar: 3/6 = 1/2.'),
    ],
    ex: ex('3/8 + 2/8', 'Calcula la suma.', ['Los denominadores son iguales: 8.', 'Suma los numeradores: 3 + 2 = 5.', 'Mantén el denominador: 5/8.'], '3/8 + 2/8 = 5/8.'),
    exs: [
      fr('Calcula 2/7 + 3/7.', 5, 7, '2 + 3 = 5 y el denominador sigue siendo 7.', ['Suma solo los numeradores.']),
      fr('Calcula 5/6 − 2/6. Puedes simplificar.', 1, 2, '5/6 − 2/6 = 3/6 = 1/2.', ['Resta los numeradores.', 'Después simplifica.'], { equiv: true }),
      ch('Al sumar fracciones con igual denominador, el denominador…', ['se suma', 'se mantiene', 'se multiplica'], 1, 'Las partes siguen siendo del mismo tamaño: el denominador se mantiene.', ['¿Cambia el tamaño de cada parte?'], { wrong: { 0: 'Sumar denominadores daría 1/5 + 1/5 = 2/10, y eso no es correcto: 2/5.' } }),
    ],
    sum: ['Igual denominador: se operan los numeradores.', 'El denominador se mantiene.', 'Simplifica si es posible.'],
  }),
  lesson({
    id: 'criterios-divisibilidad', topic: 'pri-5-divisibilidad', title: 'Criterios de divisibilidad', obj: 'Usar los criterios del 2, 3, 5 y 10 para decidir si un número es divisible.', min: 10, d: 3,
    tags: ['divisibilidad', 'multiplos', 'divisores', 'criterios'], pre: ['dividir-repartiendo'],
    secs: [
      sec('Mirar la última cifra', 'Un número es divisible por 2 si termina en 0, 2, 4, 6 u 8. Por 5, si termina en 0 o 5. Por 10, si termina en 0.', { key: 'Divisible: la división es exacta (sin resto).' }),
      sec('El criterio del 3', 'Un número es divisible por 3 si la suma de sus cifras es múltiplo de 3. 231: 2 + 3 + 1 = 6, y 6 es múltiplo de 3.'),
    ],
    ex: ex('¿Es 135 divisible por 5? ¿Y por 3?', 'Aplica los criterios.', ['Termina en 5: divisible por 5.', 'Suma de cifras: 1 + 3 + 5 = 9, múltiplo de 3.', 'También es divisible por 3.'], 'Es divisible por 5 y por 3.'),
    exs: [
      ch('¿Cuál es divisible por 3?', ['124', '231', '506'], 1, '231: 2 + 3 + 1 = 6, que es múltiplo de 3.', ['Suma las cifras.'], { wrong: { 0: '124: 1 + 2 + 4 = 7, no es múltiplo de 3.' } }),
      ch('¿Cuál es divisible por 5?', ['137', '135', '142'], 1, '135 termina en 5.', ['Mira la última cifra.']),
      ch('¿Cuál es divisible por 2 y por 5 a la vez?', ['45', '60', '72'], 1, '60 termina en 0: es divisible por 2, por 5 y por 10.', ['Debe terminar en 0.'], { wrong: { 0: '45 es divisible por 5 pero termina en impar.', 2: '72 es divisible por 2 pero no por 5.' } }),
    ],
    sum: ['Por 2: termina en cifra par.', 'Por 5: termina en 0 o 5.', 'Por 10: termina en 0.', 'Por 3: suma de cifras múltiplo de 3.'],
  }),
  lesson({
    id: 'primos-y-compuestos', topic: 'pri-5-primos', title: 'Números primos y compuestos', obj: 'Distinguir números primos de compuestos buscando sus divisores.', min: 9, d: 3,
    tags: ['primos', 'compuestos', 'divisores'], pre: ['criterios-divisibilidad'],
    secs: [
      sec('Dos divisores exactos', 'Un número primo tiene exactamente dos divisores: 1 y él mismo. 7 solo se divide entre 1 y 7.', { key: 'Primos: 2, 3, 5, 7, 11, 13…' }),
      sec('Compuestos', 'Un número compuesto tiene más de dos divisores. 9 se divide entre 1, 3 y 9. El número 1 no es primo ni compuesto, porque solo tiene un divisor.'),
    ],
    ex: ex('¿Es 15 primo?', 'Busca sus divisores.', ['15 es divisible por 5 (termina en 5).', '15 = 3 × 5: tiene divisores 1, 3, 5 y 15.', 'Tiene más de dos divisores.'], '15 es compuesto.'),
    exs: [
      ch('¿Cuál es primo?', ['9', '11', '15'], 1, '11 solo se divide entre 1 y 11.', ['Prueba si algún número lo divide.'], { wrong: { 0: '9 = 3 × 3.', 2: '15 = 3 × 5.' } }),
      nm('¿Cuántos divisores tiene el número 7?', 2, 'Solo el 1 y el 7: son 2 divisores.', ['Prueba dividirlo entre 2, 3, 4…']),
      ch('¿Cuál es compuesto?', ['13', '21', '17'], 1, '21 = 3 × 7, tiene más de dos divisores.', ['Busca el que se pueda dividir en dos factores.']),
    ],
    sum: ['Primo: exactamente 2 divisores.', 'Compuesto: más de 2 divisores.', '1 no es ni primo ni compuesto.'],
  }),
  lesson({
    id: 'coordenadas-primer-cuadrante', topic: 'pri-5-coordenadas', title: 'Coordenadas en el plano', obj: 'Leer y ubicar puntos con coordenadas (x, y) en el primer cuadrante.', min: 9, d: 3,
    tags: ['coordenadas', 'plano', 'puntos', 'ejes'],
    secs: [
      sec('Dos ejes', 'El plano tiene un eje horizontal (x) y uno vertical (y). Un punto se escribe (x, y): primero horizontal y después vertical.', { v: { kind: 'coordinates', max: 6, points: [{ x: 2, y: 3, label: 'A' }], alt: 'Plano con el punto A en x = 2, y = 3' }, key: 'Primero x (→), luego y (↑).' }),
      sec('Cómo leer un punto', 'Para (2, 3): avanza 2 hacia la derecha desde el origen y sube 3.'),
    ],
    ex: ex('Leemos el punto A', '¿Qué coordenadas tiene A?', ['Avanza hacia la derecha: 2.', 'Sube: 3.', 'A está en (2, 3).'], 'A = (2, 3).'),
    exs: [
      ch('¿Qué coordenadas tiene el punto A?', ['(2, 3)', '(3, 2)', '(2, 2)'], 0, 'Se avanza 2 en x y se sube 3 en y.', ['Escribe primero el valor horizontal.'], { v: { kind: 'coordinates', max: 6, points: [{ x: 2, y: 3, label: 'A' }, { x: 5, y: 1, label: 'B' }, { x: 4, y: 4, label: 'C' }], alt: 'Plano con A (2,3), B (5,1) y C (4,4)' }, wrong: { 1: 'Al revés: primero va la x.' } }),
      nm('¿Cuál es la coordenada x del punto B?', 5, 'B está en (5, 1): x = 5.', ['Cuenta hacia la derecha.'], { v: { kind: 'coordinates', max: 6, points: [{ x: 2, y: 3, label: 'A' }, { x: 5, y: 1, label: 'B' }, { x: 4, y: 4, label: 'C' }], alt: 'Plano con A (2,3), B (5,1) y C (4,4)' } }),
      ch('¿Qué punto está en (4, 4)?', ['A', 'B', 'C'], 2, 'C está en x = 4, y = 4.', ['Avanza 4 y sube 4.'], { v: { kind: 'coordinates', max: 6, points: [{ x: 2, y: 3, label: 'A' }, { x: 5, y: 1, label: 'B' }, { x: 4, y: 4, label: 'C' }], alt: 'Plano con A (2,3), B (5,1) y C (4,4)' } }),
    ],
    sum: ['Un punto se escribe (x, y).', 'Primero horizontal, luego vertical.'],
  }),
  // ───────────────── 6.º
  lesson({
    id: 'porcentajes-introduccion', topic: 'pri-6-porcentajes', title: 'Porcentajes introductorios', obj: 'Entender el porcentaje como fracción de 100 y calcular 50 %, 25 % y 10 % de una cantidad.', min: 10, d: 3,
    tags: ['porcentajes', 'por ciento', 'fracciones'], pre: ['fracciones-equivalentes', 'decimos'],
    secs: [
      sec('Partes de cien', 'Por ciento significa «de cada 100». 50 % es 50 de cada 100, es decir, la mitad: 1/2.', { v: { kind: 'fraction', parts: 2, shaded: 1, alt: 'Barra dividida en dos partes con una pintada: 50 %, la mitad' }, key: '50 % = 1/2, 25 % = 1/4, 10 % = 1/10' }),
      sec('Calcular el porcentaje de una cantidad', 'Para el 50 %, divide entre 2. Para el 25 %, divide entre 4. Para el 10 %, divide entre 10.'),
    ],
    ex: ex('10 % de 80', 'Calcula el 10 % de 80.', ['10 % = 1/10.', 'Divide 80 entre 10.', '80 ÷ 10 = 8.'], 'El 10 % de 80 es 8.'),
    exs: [
      nm('¿Cuál es el 50 % de 40?', 20, 'La mitad de 40: 40 ÷ 2 = 20.', ['50 % es la mitad.']),
      nm('¿Cuál es el 25 % de 12?', 3, '25 % = 1/4. 12 ÷ 4 = 3.', ['25 % es un cuarto.']),
      nm('¿Cuál es el 10 % de 90?', 9, '90 ÷ 10 = 9.', ['10 % es un décimo.']),
    ],
    sum: ['% significa «de cada 100».', '50 % mitad, 25 % cuarto, 10 % décimo.'],
  }),
  lesson({
    id: 'proporcionalidad-tablas', topic: 'pri-6-proporcionalidad', title: 'Razón y proporcionalidad', obj: 'Completar tablas de proporcionalidad directa y resolver problemas con la unidad.', min: 10, d: 3,
    tags: ['proporcionalidad', 'razon', 'tablas'], pre: ['fracciones-equivalentes', 'grupos-iguales'],
    secs: [
      sec('Si uno se duplica, el otro también', 'Dos cantidades son proporcionales si, al multiplicar una por un número, la otra se multiplica por el mismo número. Si 3 lápices cuestan 6 monedas, 6 lápices cuestan 12.', { key: 'Doble de lápices, doble de monedas.' }),
      sec('Reducir a la unidad', 'Calcula primero el valor de 1: 6 ÷ 3 = 2 monedas por lápiz. Después multiplica por la cantidad que necesitas.'),
    ],
    ex: ex('5 lápices', 'Si 3 lápices cuestan 6 monedas, ¿cuánto cuestan 5?', ['Un lápiz cuesta 6 ÷ 3 = 2 monedas.', 'Cinco cuestan 5 × 2 = 10.'], '5 lápices cuestan 10 monedas.'),
    exs: [
      nm('Si 3 lápices cuestan 6 monedas, ¿cuántas monedas cuestan 5 lápices?', 10, '1 lápiz = 2 monedas; 5 × 2 = 10.', ['Calcula el precio de uno.'], { unit: 'monedas' }),
      nm('Una receta usa 2 tazas de harina para 4 personas. ¿Cuántas tazas se necesitan para 6 personas?', 3, 'Para 2 personas hace falta 1 taza; para 6, 3 tazas.', ['¿Cuánta harina corresponde a 1 persona?'], { unit: 'tazas' }),
      nm('4 cuadernos cuestan 20 monedas. ¿Cuánto cuesta uno?', 5, '20 ÷ 4 = 5.', ['Divide el precio entre los cuadernos.'], { unit: 'monedas' }),
    ],
    sum: ['Cantidades proporcionales crecen en la misma proporción.', 'Reducir a la unidad es una estrategia útil.'],
  }),
  lesson({
    id: 'media-aritmetica', topic: 'pri-6-media', title: 'Media aritmética', obj: 'Calcular e interpretar la media de un conjunto de datos.', min: 9, d: 3,
    tags: ['media', 'promedio', 'estadistica'], pre: ['leer-pictogramas', 'dividir-repartiendo'],
    secs: [
      sec('Repartir por igual', 'La media (o promedio) es el valor que tendría cada dato si se repartiera el total por igual. Se calcula sumando todos los datos y dividiendo entre cuántos son.', { key: 'Media = suma de datos ÷ cantidad de datos.' }),
      sec('Un ejemplo', 'Datos: 4, 6 y 8. Suma: 18. Son 3 datos. Media: 18 ÷ 3 = 6.'),
    ],
    ex: ex('Media de 2, 4 y 6', 'Calcula la media.', ['Suma: 2 + 4 + 6 = 12.', 'Hay 3 datos.', '12 ÷ 3 = 4.'], 'La media es 4.'),
    exs: [
      nm('¿Cuál es la media de 2, 4 y 6?', 4, '(2 + 4 + 6) ÷ 3 = 12 ÷ 3 = 4.', ['Suma primero todos los datos.']),
      nm('Un estudiante sacó 7, 8, 9 y 8. ¿Cuál es su media?', 8, '7 + 8 + 9 + 8 = 32, y 32 ÷ 4 = 8.', ['Suma las 4 notas y divide entre 4.']),
      nm('¿Cuál es la media de 5, 5 y 5?', 5, 'Si todos los datos son iguales, la media es ese mismo valor: 15 ÷ 3 = 5.', ['Suma y divide entre 3.']),
    ],
    sum: ['Media = suma ÷ cantidad de datos.', 'Es el valor que se obtendría repartiendo por igual.'],
  }),
  lesson({
    id: 'orden-de-operaciones', topic: 'pri-6-orden-operaciones', title: 'Orden de las operaciones', obj: 'Resolver operaciones combinadas respetando paréntesis, multiplicación y división, y luego suma y resta.', min: 9, d: 3,
    tags: ['jerarquia', 'parentesis', 'operaciones combinadas'], pre: ['grupos-iguales', 'dividir-repartiendo'],
    secs: [
      sec('Hay un orden', 'Primero lo que está entre paréntesis. Después multiplicaciones y divisiones, de izquierda a derecha. Por último, sumas y restas, de izquierda a derecha.', { key: 'Paréntesis → × ÷ → + −' }),
      sec('Por qué importa', '2 + 3 × 4 = 2 + 12 = 14. Pero (2 + 3) × 4 = 5 × 4 = 20. Los paréntesis cambian el resultado.'),
    ],
    ex: ex('8 − 2 × 3', 'Calcula respetando el orden.', ['Primero la multiplicación: 2 × 3 = 6.', 'Después la resta: 8 − 6 = 2.'], 'El resultado es 2.'),
    exs: [
      nm('Calcula 8 − 2 × 3.', 2, 'Primero 2 × 3 = 6; después 8 − 6 = 2.', ['La multiplicación va antes que la resta.'], {}),
      nm('Calcula (8 − 2) × 3.', 18, 'Primero el paréntesis: 8 − 2 = 6; después 6 × 3 = 18.', ['Resuelve lo que está entre paréntesis.']),
      nm('Calcula 20 ÷ 4 + 6.', 11, 'Primero 20 ÷ 4 = 5; después 5 + 6 = 11.', ['La división va antes que la suma.']),
    ],
    sum: ['Paréntesis, luego × y ÷, luego + y −.', 'Los paréntesis pueden cambiar el resultado.'],
  }),
]
