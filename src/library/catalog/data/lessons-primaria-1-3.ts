import { ch, ex, fr, lesson, nm, od, sec } from '../helpers.js'
import type { Lesson } from '../../types'

/** Lecciones de 1.º a 3.º de Primaria. Todas son BORRADOR: no han sido revisadas por docentes. */
export const primaria1a3Lessons: Lesson[] = [
  // ───────────────── 1.º
  lesson({
    id: 'leer-escribir-20', topic: 'pri-1-leer-escribir-20', title: 'Leer y escribir números hasta 20', obj: 'Relacionar la cantidad, el nombre y la cifra de los números del 11 al 20.', min: 6, d: 1,
    tags: ['numeros', 'leer', 'escribir', 'hasta 20'], pre: ['contar-hasta-10'],
    secs: [
      sec('Diez y algo más', 'Del 11 al 19 hay una decena (10) y algunas unidades. Trece es diez y tres: se escribe 13.', { v: { kind: 'placeValue', tens: 1, ones: 3, alt: 'Una decena y tres unidades: el número 13' }, key: '13 = 10 + 3' }),
      sec('El número veinte', 'Dos decenas forman el 20. Después del 19 viene el 20.', { v: { kind: 'numberLine', from: 10, to: 20, highlight: [19, 20], alt: 'Recta numérica del 10 al 20' } }),
    ],
    ex: ex('¿Qué número es quince?', 'Escribe en cifras «quince».', ['Quince es diez y cinco.', 'Una decena y cinco unidades.', 'Se escribe 15.'], 'Se escribe 15.'),
    exs: [
      nm('¿Qué número es «diecisiete»? Escribe la cifra.', 17, 'Diecisiete es diez y siete: 17.', ['Es una decena y algunas unidades.', 'Diez y siete.']),
      nm('Una decena y 8 unidades. ¿Qué número es?', 18, '10 + 8 = 18.', ['Suma 10 y 8.'], { v: { kind: 'placeValue', tens: 1, ones: 8, alt: 'Una decena y ocho unidades' } }),
      ch('¿Qué número viene después del 19?', ['18', '20', '21'], 1, 'Después del 19 viene el 20.', ['Cuenta: 18, 19, …'], { wrong: { 0: 'El 18 viene antes del 19.' } }),
    ],
    sum: ['Del 11 al 19: una decena y unidades.', 'Dos decenas forman el 20.'],
  }),
  lesson({
    id: 'decenas-y-unidades', topic: 'pri-1-decenas-unidades', title: 'Decenas y unidades', obj: 'Descomponer números hasta 99 en decenas y unidades.', min: 7, d: 1,
    tags: ['valor posicional', 'decenas', 'unidades'],
    secs: [
      sec('Una decena son diez unidades', 'Agrupamos de diez en diez. Cada grupo de diez es una decena. Lo que sobra son unidades.', { v: { kind: 'placeValue', tens: 4, ones: 7, alt: 'Cuatro decenas y siete unidades: el número 47' }, key: 'En 47 hay 4 decenas y 7 unidades.' }),
      sec('La posición cambia el valor', 'En 47, el 4 está en las decenas y vale 40. El 7 está en las unidades y vale 7. Por eso 47 = 40 + 7.'),
    ],
    ex: ex('Descomponemos el 36', '¿Cuántas decenas y unidades tiene 36?', ['La cifra de la izquierda (3) son las decenas.', 'La cifra de la derecha (6) son las unidades.', '36 = 30 + 6.'], '36 tiene 3 decenas y 6 unidades.'),
    exs: [
      nm('¿Cuántas decenas tiene 52?', 5, 'En 52 hay 5 decenas y 2 unidades.', ['Mira la cifra de la izquierda.']),
      nm('4 decenas y 9 unidades. ¿Qué número forman?', 49, '40 + 9 = 49.', ['Una decena vale 10.', '4 decenas son 40.']),
      ch('¿Qué número es 20 + 8?', ['82', '28', '208'], 1, '20 + 8 = 28: 2 decenas y 8 unidades.', ['2 decenas son 20.'], { wrong: { 0: '82 sería 80 + 2. Fíjate: las decenas van a la izquierda.' } }),
    ],
    sum: ['10 unidades = 1 decena.', 'La posición de la cifra cambia su valor.'],
  }),
  lesson({
    id: 'comparar-numeros-100', topic: 'pri-1-comparar', title: 'Comparar y ordenar números', obj: 'Comparar números hasta 100 con los signos < , > e =, y ordenarlos.', min: 7, d: 1,
    tags: ['comparar', 'ordenar', 'mayor que', 'menor que'],
    secs: [
      sec('Primero las decenas', 'Para comparar, mira primero las decenas. Más decenas significa un número mayor. Si son iguales, compara las unidades.', { key: '47 y 74: 4 decenas < 7 decenas.' }),
      sec('Los signos', 'El signo < significa «menor que» y > «mayor que». La parte abierta mira al número mayor. = significa «igual».', { key: '47 < 74' }),
    ],
    ex: ex('¿Cuál es mayor?', 'Compara 63 y 58.', ['Decenas: 6 y 5.', '6 decenas es más que 5 decenas.', 'Entonces 63 > 58.'], '63 es mayor que 58.'),
    exs: [
      ch('¿Cuál es mayor?', ['47', '74'], 1, '74 tiene 7 decenas; 47 solo 4.', ['Compara las decenas primero.']),
      ch('Completa: 35 __ 53', ['<', '>', '='], 0, '35 tiene 3 decenas y 53 tiene 5: 35 < 53.', ['Mira las decenas: 3 y 5.']),
      od('Ordena de menor a mayor.', ['25', '45', '52'], 'Decenas: 2, 4 y 5. Orden: 25, 45, 52.', ['Empieza por el que tiene menos decenas.']),
    ],
    sum: ['Compara primero las decenas.', '< menor que, > mayor que, = igual.'],
  }),
  lesson({
    id: 'sumar-juntando', topic: 'pri-1-sumar-restar', title: 'Sumar es juntar', obj: 'Resolver sumas sencillas representando cantidades.', min: 8, d: 1,
    tags: ['suma', 'juntar', 'sumar'], pre: ['juntar-hasta-5'],
    secs: [
      sec('Sumar es reunir', 'Sumar es reunir dos o más cantidades para saber cuántos elementos hay en total. El signo + indica que juntamos cantidades.', { v: { kind: 'counters', groups: [{ count: 2, shape: 'circulo', color: 'rojo' }, { count: 3, shape: 'circulo', color: 'azul' }], alt: 'Dos círculos rojos y tres círculos azules' }, key: '2 + 3 = 5' }),
      sec('El signo igual', 'El signo = muestra que las dos partes tienen el mismo valor: 2 + 3 y 5 son lo mismo.'),
    ],
    ex: ex('Lápices', 'Tienes 2 lápices y recibes 3 más. ¿Cuántos tienes?', ['Representa la primera cantidad: 2.', 'Añade la segunda: 3 más.', 'Cuenta todos sin repetir: 5.', 'Escribe: 2 + 3 = 5.'], 'Tienes 5 lápices.'),
    exs: [
      nm('¿Cuánto es 2 + 3?', 5, 'Dos objetos más tres objetos forman cinco: 2 + 3 = 5.', ['Cuenta primero 2 y sigue con 3 más.', 'Usa tus dedos: 2 y luego 3 más.']),
      nm('¿Cuánto es 4 + 4?', 8, 'Cuatro más cuatro son ocho.', ['Es un doble.'], { v: { kind: 'counters', groups: [{ count: 4, shape: 'estrella', color: 'amarillo' }, { count: 4, shape: 'estrella', color: 'amarillo' }], alt: 'Dos grupos de cuatro estrellas' } }),
      ch('Tienes 6 canicas y te dan 3 más. ¿Cuántas tienes?', ['8', '9', '10'], 1, '6 + 3 = 9.', ['Empieza en 6 y cuenta 3 más.']),
    ],
    sum: ['Sumar es juntar cantidades.', 'El signo = indica que ambos lados valen lo mismo.'],
  }),
  lesson({
    id: 'restar-quitar', topic: 'pri-1-sumar-restar', title: 'Restar es quitar', obj: 'Interpretar la resta como quitar elementos de una cantidad.', min: 7, d: 1,
    tags: ['resta', 'quitar', 'restar'], pre: ['sumar-juntando'],
    secs: [
      sec('Cuántos quedan', 'Restar sirve para saber cuántos quedan cuando quitamos una parte de una cantidad inicial.', { v: { kind: 'counters', groups: [{ count: 5, shape: 'circulo', color: 'naranja' }], crossed: 2, alt: 'Cinco círculos naranjas, dos tachados' }, key: '5 − 2 = 3' }),
      sec('Pasos para restar', 'Identifica cuántos hay al inicio, quita la cantidad indicada y cuenta los que quedan.'),
    ],
    ex: ex('Galletas', 'Tienes 5 galletas y comes 2. ¿Cuántas quedan?', ['Al inicio hay 5.', 'Quita 2.', 'Cuenta las que quedan: 3.', 'Escribe 5 − 2 = 3.'], 'Quedan 3 galletas.'),
    exs: [
      nm('¿Cuánto es 5 − 2?', 3, 'Al quitar 2 de 5 quedan 3: 5 − 2 = 3.', ['Empieza con 5 y quita 2.', 'Cuenta hacia atrás: 4, 3.']),
      nm('¿Cuánto es 7 − 3?', 4, 'Al quitar 3 de 7 quedan 4.', ['Cuenta hacia atrás 3 lugares desde 7.']),
      ch('Tenías 8 caramelos y regalaste 3. ¿Cuántos tienes?', ['4', '5', '11'], 1, '8 − 3 = 5.', ['Quitar es restar.'], { wrong: { 2: 'Sumaste. Regalar es quitar, así que quedan menos de 8.' } }),
    ],
    sum: ['Restar es quitar.', 'El resultado es lo que queda.'],
  }),
  lesson({
    id: 'hora-en-punto', topic: 'pri-1-hora-punto', title: 'La hora en punto', obj: 'Leer la hora exacta en un reloj de manecillas.', min: 6, d: 2,
    tags: ['hora', 'reloj', 'en punto'],
    secs: [
      sec('Dos manecillas', 'La manecilla corta marca la hora. La larga marca los minutos. Cuando la larga apunta al 12, es la hora en punto.', { v: { kind: 'clock', hour: 3, minute: 0, alt: 'Reloj que marca las 3 en punto' }, key: 'Larga en el 12: hora en punto.' }),
      sec('Leemos la hora', 'Si la corta está en el 3 y la larga en el 12, son las 3 en punto.'),
    ],
    ex: ex('¿Qué hora es?', 'La manecilla corta apunta al 7 y la larga al 12.', ['La larga está en el 12: es en punto.', 'La corta marca la hora: 7.'], 'Son las 7 en punto.'),
    exs: [
      ch('¿Qué hora marca el reloj?', ['2 en punto', '3 en punto', '4 en punto'], 1, 'La corta apunta al 3 y la larga al 12.', ['Mira la manecilla corta.'], { v: { kind: 'clock', hour: 3, minute: 0, alt: 'Reloj que marca las 3 en punto' } }),
      nm('La manecilla corta está en el 9 y la larga en el 12. ¿Qué hora es? Escribe el número.', 9, 'Son las 9 en punto.', ['La corta indica la hora.'], { v: { kind: 'clock', hour: 9, minute: 0, alt: 'Reloj que marca las 9 en punto' } }),
      ch('Las dos manecillas apuntan al 12. ¿Qué hora es?', ['6 en punto', '12 en punto'], 1, 'Las dos en el 12 son las 12 en punto.', ['La corta indica la hora: ¿en qué número está?'], { v: { kind: 'clock', hour: 12, minute: 0, alt: 'Reloj que marca las 12 en punto' } }),
    ],
    sum: ['Manecilla corta: hora.', 'Manecilla larga en el 12: en punto.'],
  }),
  // ───────────────── 2.º
  lesson({
    id: 'centenas-decenas-unidades', topic: 'pri-2-valor-posicional', title: 'Centenas, decenas y unidades', obj: 'Leer, escribir y descomponer números hasta 999.', min: 8, d: 2,
    tags: ['valor posicional', 'centenas', 'decenas', 'unidades'], pre: ['decenas-y-unidades'],
    secs: [
      sec('Diez decenas, una centena', '10 decenas forman una centena (100). Un número de tres cifras tiene centenas, decenas y unidades.', { v: { kind: 'placeValue', hundreds: 3, tens: 4, ones: 2, alt: 'Tres centenas, cuatro decenas y dos unidades: 342' }, key: '342 = 300 + 40 + 2' }),
      sec('El cero también cuenta', 'En 506 no hay decenas. Escribimos 0 para mantener cada cifra en su sitio: 500 + 0 + 6.'),
    ],
    ex: ex('Escribe 5 centenas y 6 unidades', 'No hay decenas.', ['5 centenas = 500.', '0 decenas = 0.', '6 unidades = 6.', '500 + 0 + 6 = 506.'], 'El número es 506.'),
    exs: [
      nm('3 centenas, 2 decenas y 8 unidades. ¿Qué número es?', 328, '300 + 20 + 8 = 328.', ['Cada centena vale 100.']),
      nm('5 centenas y 6 unidades (sin decenas). ¿Qué número es?', 506, '500 + 0 + 6 = 506. El cero ocupa el lugar de las decenas.', ['¿Cuántas decenas hay?'], { v: { kind: 'placeValue', hundreds: 5, tens: 0, ones: 6, alt: 'Cinco centenas y seis unidades' } }),
      ch('¿Qué número es 400 + 30 + 7?', ['437', '473', '4 037'], 0, '400 + 30 + 7 = 437.', ['Colócalos de izquierda a derecha.']),
    ],
    sum: ['10 decenas = 1 centena.', 'El cero guarda el lugar de una cifra vacía.'],
  }),
  lesson({
    id: 'sumar-llevando', topic: 'pri-2-suma-llevando', title: 'Sumar con llevadas', obj: 'Sumar números de dos cifras cuando las unidades superan 9.', min: 8, d: 2,
    tags: ['suma', 'llevadas', 'reagrupar'], pre: ['sumar-juntando', 'decenas-y-unidades'],
    secs: [
      sec('Primero las unidades', 'Suma las unidades. Si pasan de 9, forma una decena: escribes las unidades que sobran y «llevas» 1 a las decenas.', { key: '7 + 5 = 12: escribo 2 y llevo 1.' }),
      sec('Después las decenas', 'Suma las decenas y añade lo que llevas.'),
    ],
    ex: ex('27 + 15', 'Calcula 27 + 15.', ['Unidades: 7 + 5 = 12. Escribo 2 y llevo 1.', 'Decenas: 2 + 1 + 1 (la llevada) = 4.', 'El resultado es 42.'], '27 + 15 = 42.'),
    exs: [
      nm('¿Cuánto es 38 + 24?', 62, 'Unidades: 8 + 4 = 12 (2, llevo 1). Decenas: 3 + 2 + 1 = 6. Resultado: 62.', ['Suma primero 8 + 4.', 'Escribe el 2 y lleva 1.']),
      nm('¿Cuánto es 46 + 37?', 83, 'Unidades: 6 + 7 = 13 (3, llevo 1). Decenas: 4 + 3 + 1 = 8. Resultado: 83.', ['6 + 7 son 13.']),
      nm('Ana tiene 18 pegatinas y Luis 25. ¿Cuántas tienen juntos?', 43, '18 + 25: 8 + 5 = 13 (3, llevo 1); 1 + 2 + 1 = 4. Juntos: 43.', ['Juntar es sumar.']),
    ],
    sum: ['Suma primero las unidades.', 'Si pasan de 9, lleva 1 a las decenas.'],
  }),
  lesson({
    id: 'grupos-iguales', topic: 'pri-2-grupos-iguales', title: 'Multiplicar: grupos iguales', obj: 'Interpretar la multiplicación como suma repetida de grupos iguales.', min: 8, d: 2,
    tags: ['multiplicacion', 'grupos iguales', 'suma repetida'], pre: ['sumar-juntando'],
    secs: [
      sec('Grupos que se repiten', 'Si hay 3 grupos de 4, sumamos 4 + 4 + 4 = 12. Lo escribimos más corto como 3 × 4 = 12.', { v: { kind: 'array', rows: 3, cols: 4, alt: 'Tres filas de cuatro puntos: 12 puntos en total' }, key: '3 × 4 = 4 + 4 + 4 = 12' }),
      sec('Qué significa ×', 'El signo × se lee «veces». 3 × 4 son 3 veces 4. Los grupos deben ser iguales.'),
    ],
    ex: ex('Bolsas de manzanas', '4 bolsas con 2 manzanas cada una. ¿Cuántas manzanas hay?', ['Hay 4 grupos iguales de 2.', 'Suma: 2 + 2 + 2 + 2 = 8.', 'Lo escribimos 4 × 2 = 8.'], 'Hay 8 manzanas.'),
    exs: [
      nm('¿Cuántos hay en 4 grupos de 2?', 8, '2 + 2 + 2 + 2 = 8, o 4 × 2 = 8.', ['Suma 2 cuatro veces.']),
      nm('¿Cuánto es 3 × 5?', 15, '3 grupos de 5: 5 + 5 + 5 = 15.', ['Suma 5 tres veces.']),
      ch('¿Qué multiplicación representa 2 + 2 + 2 + 2?', ['2 × 4', '4 × 4', '2 × 2'], 0, 'Hay cuatro veces el 2: 4 × 2, o 2 × 4, es 8.', ['¿Cuántas veces aparece el 2?'], { wrong: { 1: 'En 4 × 4 se repite 4, no 2.' } }),
    ],
    sum: ['Multiplicar es sumar grupos iguales.', '3 × 4 se lee «3 veces 4».'],
  }),
  lesson({
    id: 'leer-pictogramas', topic: 'pri-2-pictogramas', title: 'Leer pictogramas', obj: 'Interpretar datos representados con símbolos y responder preguntas.', min: 7, d: 2,
    tags: ['pictogramas', 'datos', 'graficos'], pre: ['comparar-numeros-100'],
    secs: [
      sec('Un símbolo, un dato', 'Un pictograma usa símbolos para mostrar datos. Antes de leerlo, mira la clave: aquí cada círculo vale 1 niño.', { v: { kind: 'bars', unitLabel: 'niño', data: [{ label: 'Manzana', value: 5 }, { label: 'Pera', value: 3 }, { label: 'Uva', value: 6 }], alt: 'Pictograma de frutas favoritas: manzana 5, pera 3, uva 6' }, key: 'Primero lee la clave.' }),
      sec('Contar y comparar', 'Cuenta los símbolos de cada fila. La fila más larga tiene más, la más corta tiene menos.'),
    ],
    ex: ex('Fruta favorita', '¿Cuántos niños eligieron pera?', ['Buscamos la fila de pera.', 'Contamos sus círculos: 3.'], '3 niños.'),
    exs: [
      nm('¿Cuántos niños eligieron uva?', 6, 'La fila de uva tiene 6 círculos.', ['Busca la fila de uva y cuenta.'], { v: { kind: 'bars', unitLabel: 'niño', data: [{ label: 'Manzana', value: 5 }, { label: 'Pera', value: 3 }, { label: 'Uva', value: 6 }], alt: 'Pictograma: manzana 5, pera 3, uva 6' } }),
      ch('¿Qué fruta fue la menos elegida?', ['Manzana', 'Pera', 'Uva'], 1, 'La pera tiene solo 3 círculos: es la menos elegida.', ['Busca la fila más corta.'], { v: { kind: 'bars', unitLabel: 'niño', data: [{ label: 'Manzana', value: 5 }, { label: 'Pera', value: 3 }, { label: 'Uva', value: 6 }], alt: 'Pictograma: manzana 5, pera 3, uva 6' } }),
      nm('¿Cuántos niños eligieron manzana o pera en total?', 8, '5 + 3 = 8.', ['Suma las dos filas.'], { v: { kind: 'bars', unitLabel: 'niño', data: [{ label: 'Manzana', value: 5 }, { label: 'Pera', value: 3 }, { label: 'Uva', value: 6 }], alt: 'Pictograma: manzana 5, pera 3, uva 6' } }),
    ],
    sum: ['La clave dice cuánto vale cada símbolo.', 'Cuenta y compara las filas.'],
  }),
  // ───────────────── 3.º
  lesson({
    id: 'dividir-repartiendo', topic: 'pri-3-dividir-repartir', title: 'Dividir: repartir en partes iguales', obj: 'Interpretar la división como reparto equitativo y relacionarla con la multiplicación.', min: 9, d: 2,
    tags: ['division', 'repartir', 'partes iguales'], pre: ['grupos-iguales'],
    secs: [
      sec('Repartir', 'Dividir es repartir en partes iguales. Si repartes 12 galletas entre 3 niños, cada uno recibe 4.', { v: { kind: 'counters', groups: [{ count: 4, shape: 'circulo', color: 'rojo' }, { count: 4, shape: 'circulo', color: 'azul' }, { count: 4, shape: 'circulo', color: 'verde' }], alt: 'Tres grupos de cuatro círculos: 12 entre 3 es 4' }, key: '12 ÷ 3 = 4' }),
      sec('Dividir y multiplicar', 'La división deshace la multiplicación: como 3 × 4 = 12, entonces 12 ÷ 3 = 4 y 12 ÷ 4 = 3.'),
    ],
    ex: ex('Reparto de lápices', '15 lápices entre 3 amigos. ¿Cuántos recibe cada uno?', ['Buscamos un número que multiplicado por 3 dé 15.', '3 × 5 = 15.', 'Cada uno recibe 5.'], '15 ÷ 3 = 5.'),
    exs: [
      nm('Repartes 10 fichas en 2 grupos iguales. ¿Cuántas hay en cada grupo?', 5, '10 ÷ 2 = 5, porque 2 × 5 = 10.', ['¿Qué número por 2 da 10?']),
      nm('¿Cuánto es 15 ÷ 3?', 5, '15 ÷ 3 = 5 porque 3 × 5 = 15.', ['Piensa en la tabla del 3.']),
      ch('Si 3 × 4 = 12, ¿cuánto es 12 ÷ 4?', ['3', '4', '8'], 0, '12 ÷ 4 = 3 porque 4 × 3 = 12.', ['Usa la multiplicación al revés.']),
    ],
    sum: ['Dividir es repartir en partes iguales.', 'Dividir y multiplicar son operaciones inversas.'],
  }),
  lesson({
    id: 'fracciones-partes-iguales', topic: 'pri-3-partes-iguales', title: 'Fracciones: partes iguales de un todo', obj: 'Leer y escribir fracciones sencillas como partes iguales de un todo.', min: 9, d: 2,
    tags: ['fracciones', 'partes iguales', 'numerador', 'denominador'], pre: ['dividir-repartiendo'],
    secs: [
      sec('Partes iguales', 'Una fracción describe partes iguales de un todo. El denominador (abajo) dice en cuántas partes iguales se divide el todo. El numerador (arriba) dice cuántas partes tomamos.', { v: { kind: 'fraction', parts: 4, shaded: 1, alt: 'Una barra dividida en 4 partes iguales con 1 pintada: un cuarto' }, key: '1/4: 1 parte de 4.' }),
      sec('Nombres comunes', '1/2 es un medio (mitad), 1/3 un tercio y 1/4 un cuarto. Las partes deben ser del mismo tamaño.'),
    ],
    ex: ex('Una pizza', 'Una pizza se corta en 8 partes iguales y comes 3. ¿Qué fracción comiste?', ['Denominador: 8 partes iguales.', 'Numerador: comiste 3.', 'La fracción es 3/8.'], 'Comiste 3/8.'),
    exs: [
      fr('¿Qué fracción está pintada? Escríbela como a/b.', 1, 4, 'Hay 4 partes iguales y 1 está pintada: 1/4.', ['Cuenta todas las partes.', 'Cuenta las pintadas.'], { v: { kind: 'fraction', parts: 4, shaded: 1, alt: 'Barra de 4 partes con 1 pintada' } }),
      fr('¿Qué fracción está pintada? Escríbela como a/b.', 3, 5, '3 de 5 partes iguales: 3/5.', ['El denominador es el total de partes.'], { v: { kind: 'fraction', parts: 5, shaded: 3, form: 'circulo', alt: 'Círculo dividido en 5 partes con 3 pintadas' } }),
      ch('Una torta se parte en 8 partes iguales y comes 3. ¿Qué fracción comiste?', ['3/8', '8/3', '5/8'], 0, 'Tomaste 3 de 8 partes: 3/8.', ['El denominador es el total de partes.'], { wrong: { 2: '5/8 son las partes que no comiste.' } }),
    ],
    sum: ['El denominador: en cuántas partes iguales se divide el todo.', 'El numerador: cuántas partes se toman.'],
  }),
  lesson({
    id: 'perimetro-rectangulo', topic: 'pri-3-perimetro', title: 'Perímetro de figuras', obj: 'Calcular el perímetro de rectángulos y cuadrados sumando sus lados.', min: 8, d: 2,
    tags: ['perimetro', 'contorno', 'rectangulo'], pre: ['grupos-iguales'],
    secs: [
      sec('El contorno', 'El perímetro es la longitud del contorno de una figura: la suma de todos sus lados.', { v: { kind: 'rectGrid', w: 5, h: 3, showDims: true, alt: 'Rectángulo de 5 por 3 cuadros' }, key: 'Perímetro = suma de los lados.' }),
      sec('En un rectángulo', 'Un rectángulo tiene dos lados largos iguales y dos cortos iguales. Para 5 y 3: 5 + 3 + 5 + 3 = 16.'),
    ],
    ex: ex('Rectángulo de 5 por 3', '¿Cuál es su perímetro?', ['Sumamos los cuatro lados.', '5 + 3 + 5 + 3 = 16.'], 'El perímetro es 16 unidades.'),
    exs: [
      nm('Un rectángulo mide 6 cm de largo y 4 cm de ancho. ¿Cuál es su perímetro?', 20, '6 + 4 + 6 + 4 = 20 cm.', ['Un rectángulo tiene 4 lados.'], { unit: 'cm' }),
      nm('Un cuadrado tiene lados de 5 m. ¿Cuál es su perímetro?', 20, 'Los 4 lados valen 5: 5 + 5 + 5 + 5 = 20 m.', ['Todos los lados son iguales.'], { unit: 'm' }),
      nm('¿Cuál es el perímetro de este rectángulo de 4 por 2 cuadros?', 12, '4 + 2 + 4 + 2 = 12.', ['Suma los cuatro lados.'], { v: { kind: 'rectGrid', w: 4, h: 2, showDims: true, alt: 'Rectángulo de 4 por 2 cuadros' } }),
    ],
    sum: ['Perímetro: suma de todos los lados.', 'Se mide en unidades de longitud: cm, m…'],
  }),
]
