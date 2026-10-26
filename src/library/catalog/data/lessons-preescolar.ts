import { ch, ex, lesson, nm, od, sec } from '../helpers'
import type { Lesson } from '../../types'

/** Lecciones de Preescolar. Todas son BORRADOR: no han sido revisadas por docentes. */
export const preescolarLessons: Lesson[] = [
  // ───────────────── 3 años
  lesson({
    id: 'contar-hasta-3', topic: 'pre-3-uno-dos-tres', title: 'Contamos hasta tres', obj: 'Contar de uno en uno hasta 3 señalando cada objeto.', min: 4, d: 1,
    tags: ['contar', 'uno', 'dos', 'tres'],
    secs: [
      sec('Señalamos y contamos', 'Toca cada ficha una sola vez. Di: uno, dos, tres.', { v: { kind: 'counters', groups: [{ count: 3, shape: 'estrella', color: 'amarillo' }], alt: 'Tres estrellas amarillas en fila' } }),
      sec('El último número', 'El último número que dices te dice cuántas hay.', { key: 'Contar: un número para cada objeto.' }),
    ],
    ex: ex('Contamos fichas', '¿Cuántas fichas hay?', [['Señala la primera ficha y di «uno».', { kind: 'counters', groups: [{ count: 2, shape: 'circulo', color: 'rojo' }], alt: 'Dos círculos rojos' }], 'Señala la segunda y di «dos».', 'Ya no quedan más. Hay dos.'], 'Hay 2 fichas.'),
    exs: [
      ch('¿Cuántas estrellas hay?', ['1', '2', '3'], 1, 'Contamos: uno, dos. Hay 2 estrellas.', ['Señala cada estrella una vez.', 'Cuenta: uno… ¿y luego?'], { v: { kind: 'counters', groups: [{ count: 2, shape: 'estrella', color: 'amarillo' }], alt: 'Dos estrellas' } }),
      ch('¿Cuántos círculos hay?', ['2', '3', '4'], 1, 'Contamos: uno, dos, tres. Hay 3 círculos.', ['Cuenta con el dedo.', 'Después del dos viene el tres.'], { v: { kind: 'counters', groups: [{ count: 3, shape: 'circulo', color: 'azul' }], alt: 'Tres círculos azules' } }),
      ch('¿Cuántos cuadrados hay?', ['1', '2', '3'], 0, 'Hay un solo cuadrado: 1.', ['Mira con atención: ¿cuántos ves?'], { v: { kind: 'counters', groups: [{ count: 1, shape: 'cuadrado', color: 'verde' }], alt: 'Un cuadrado verde' } }),
    ],
    sum: ['Contamos una vez cada objeto.', 'El último número dicho es la cantidad.'],
  }),
  lesson({
    id: 'agrupar-por-color', topic: 'pre-3-agrupar', title: 'Juntamos lo que se parece', obj: 'Agrupar objetos por un rasgo común: color o forma.', min: 4, d: 1,
    tags: ['clasificar', 'colores', 'formas'],
    secs: [
      sec('Mismo color, mismo grupo', 'Podemos juntar cosas que tienen el mismo color.', { v: { kind: 'counters', groups: [{ count: 2, shape: 'circulo', color: 'rojo' }, { count: 2, shape: 'circulo', color: 'azul' }], alt: 'Dos círculos rojos y dos círculos azules' } }),
      sec('Misma forma, mismo grupo', 'También podemos juntar cosas que tienen la misma forma.', { key: 'Un grupo comparte algo igual.' }),
    ],
    ex: ex('Elegimos el grupo', 'Hay dos círculos rojos y un círculo azul. ¿Cuáles van juntos por color?', ['Miramos los colores.', 'Los dos rojos son del mismo color.'], 'Van juntos los dos círculos rojos.'),
    exs: [
      ch('¿Cuáles son del mismo color?', ['Dos círculos rojos', 'Un círculo rojo y uno azul'], 0, 'Los dos círculos rojos tienen el mismo color.', ['Busca los que tengan el mismo color.'], { v: { kind: 'counters', groups: [{ count: 2, shape: 'circulo', color: 'rojo' }, { count: 1, shape: 'circulo', color: 'azul' }], alt: 'Dos círculos rojos y un círculo azul' } }),
      ch('¿Cuál va con los cuadrados?', ['Otro cuadrado', 'Un triángulo'], 0, 'Otro cuadrado tiene la misma forma.', ['Fíjate en la forma, no en el color.'], { v: { kind: 'counters', groups: [{ count: 2, shape: 'cuadrado', color: 'verde' }], alt: 'Dos cuadrados verdes' } }),
      ch('¿Qué grupo es diferente?', ['Los tres círculos', 'Dos círculos y un triángulo'], 1, 'En el segundo grupo hay un triángulo: no todo es igual.', ['Un grupo es igual si todas las formas son iguales.']),
    ],
    sum: ['Agrupar es juntar lo que se parece.', 'Podemos agrupar por color o por forma.'],
  }),
  lesson({
    id: 'formas-circulo-cuadrado-triangulo', topic: 'pre-3-formas', title: 'Círculo, cuadrado y triángulo', obj: 'Reconocer y nombrar el círculo, el cuadrado y el triángulo.', min: 5, d: 1,
    tags: ['formas', 'circulo', 'cuadrado', 'triangulo'],
    secs: [
      sec('El círculo', 'El círculo es redondo. No tiene esquinas.', { v: { kind: 'shape', shape: 'circulo', color: 'azul', alt: 'Un círculo azul' } }),
      sec('El cuadrado', 'El cuadrado tiene 4 lados iguales y 4 esquinas.', { v: { kind: 'shape', shape: 'cuadrado', color: 'verde', alt: 'Un cuadrado verde' } }),
      sec('El triángulo', 'El triángulo tiene 3 lados y 3 esquinas.', { v: { kind: 'shape', shape: 'triangulo', color: 'naranja', alt: 'Un triángulo naranja' } }),
    ],
    ex: ex('¿Qué forma es?', 'Una forma es redonda y no tiene esquinas. ¿Cuál es?', ['Pensamos: ¿tiene esquinas? No.', 'La forma sin esquinas es el círculo.'], 'Es un círculo.'),
    exs: [
      ch('¿Qué forma es?', ['Círculo', 'Cuadrado', 'Triángulo'], 2, 'Tiene 3 lados: es un triángulo.', ['Cuenta los lados.'], { v: { kind: 'shape', shape: 'triangulo', color: 'rojo', alt: 'Un triángulo rojo' } }),
      ch('¿Qué forma es?', ['Círculo', 'Cuadrado', 'Triángulo'], 0, 'Es redonda, sin esquinas: es un círculo.', ['¿Tiene esquinas?'], { v: { kind: 'shape', shape: 'circulo', color: 'amarillo', alt: 'Un círculo amarillo' } }),
      ch('¿Cuál tiene 4 lados iguales?', ['Círculo', 'Cuadrado', 'Triángulo'], 1, 'El cuadrado tiene 4 lados iguales.', ['Piensa en una ventana cuadrada.']),
    ],
    sum: ['Círculo: redondo.', 'Cuadrado: 4 lados iguales.', 'Triángulo: 3 lados.'],
  }),
  lesson({
    id: 'dentro-y-fuera', topic: 'pre-3-dentro-fuera', title: 'Dentro y fuera', obj: 'Decir si un objeto está dentro o fuera de un lugar.', min: 4, d: 1,
    tags: ['dentro', 'fuera', 'posicion'],
    secs: [
      sec('Dentro', 'Si algo está en el interior de la caja, está dentro.', { v: { kind: 'spatial', relation: 'dentro', alt: 'Una pelota dentro de una caja' } }),
      sec('Fuera', 'Si algo no está en el interior, está fuera.', { v: { kind: 'spatial', relation: 'fuera', alt: 'Una pelota fuera de una caja' } }),
    ],
    ex: ex('¿Dónde está la pelota?', 'La pelota está en el interior de la caja. ¿Dentro o fuera?', ['Miramos la caja.', 'La pelota está adentro.'], 'Está dentro.'),
    exs: [
      ch('¿Dónde está la pelota?', ['Dentro', 'Fuera'], 0, 'La pelota está en el interior de la caja: dentro.', ['Mira si la pelota está en el interior.'], { v: { kind: 'spatial', relation: 'dentro', alt: 'Una pelota dentro de una caja' } }),
      ch('¿Dónde está la pelota?', ['Dentro', 'Fuera'], 1, 'La pelota no está en la caja: fuera.', ['¿Está en el interior de la caja?'], { v: { kind: 'spatial', relation: 'fuera', alt: 'Una pelota fuera de una caja' } }),
      ch('Tu mochila está en tu casa. ¿Está dentro o fuera de la casa?', ['Dentro', 'Fuera'], 0, 'Si está en la casa, está dentro de ella.', ['Piensa en el interior de tu casa.']),
    ],
    sum: ['Dentro: en el interior.', 'Fuera: no está en el interior.'],
  }),
  lesson({
    id: 'grande-y-pequeno', topic: 'pre-3-grande-pequeno', title: 'Grande y pequeño', obj: 'Comparar dos objetos y decir cuál es más grande y cuál más pequeño.', min: 4, d: 1,
    tags: ['grande', 'pequeno', 'tamano'],
    secs: [
      sec('Comparamos', 'Ponemos dos cosas una al lado de la otra. La que ocupa más espacio es la grande.', { v: { kind: 'bars', orientation: 'vertical', data: [{ label: 'A', value: 5 }, { label: 'B', value: 2 }], alt: 'Dos barras: la A es alta y la B es baja' } }),
      sec('Grande y pequeño', 'La otra es la pequeña. Pueden cambiar si las comparas con otra cosa.', { key: 'Comparar es mirar dos cosas a la vez.' }),
    ],
    ex: ex('¿Cuál es más grande?', 'Comparamos una barra alta (A) y una baja (B).', ['Miramos la altura.', 'La barra A llega más arriba.'], 'La A es la más grande.'),
    exs: [
      ch('¿Cuál es la barra más grande?', ['A', 'B'], 0, 'La barra A es más alta: es la grande.', ['Mira cuál llega más arriba.'], { v: { kind: 'bars', orientation: 'vertical', data: [{ label: 'A', value: 6 }, { label: 'B', value: 3 }], alt: 'Barra A alta y barra B baja' } }),
      ch('¿Cuál es la barra más pequeña?', ['A', 'B'], 1, 'La barra B es más baja: es la pequeña.', ['Busca la que llega menos arriba.'], { v: { kind: 'bars', orientation: 'vertical', data: [{ label: 'A', value: 2 }, { label: 'B', value: 5 }], alt: 'Barra A baja y barra B alta' } }),
      ch('Un elefante y un ratón: ¿cuál es más grande?', ['El elefante', 'El ratón'], 0, 'El elefante es mucho más grande.', ['Piensa en cómo son los animales.']),
    ],
    sum: ['Comparamos dos cosas.', 'Grande: ocupa más. Pequeño: ocupa menos.'],
  }),
  // ───────────────── 4 años
  lesson({
    id: 'contar-hasta-5', topic: 'pre-4-contar-5', title: 'Contamos hasta cinco', obj: 'Contar objetos y relacionar cada cantidad con su número.', min: 5, d: 1,
    tags: ['contar', 'conteo', 'hasta 5'],
    secs: [
      sec('Contar significa asignar', 'Decimos los números en orden y asignamos una palabra-número a cada objeto una sola vez. El último número que decimos indica cuántos objetos hay.', { v: { kind: 'counters', groups: [{ count: 5, shape: 'circulo', color: 'rojo' }], alt: 'Cinco círculos rojos' }, key: 'El último número dicho es la cantidad.' }),
      sec('Cómo contar bien', 'Mira todos los objetos antes de empezar. Señala cada objeto una sola vez. Si te pierdes, vuelve a empezar.', { v: { kind: 'tenFrame', filled: 5, alt: 'Marco de diez casillas con cinco llenas' } }),
    ],
    ex: ex('Tres pelotas', 'Hay tres pelotas. ¿Cuántas hay?', [['Señala una pelota y di «uno».', { kind: 'counters', groups: [{ count: 3, shape: 'circulo', color: 'naranja' }], alt: 'Tres círculos naranjas' }], 'Señala otra y di «dos».', 'Señala la última y di «tres».', 'El último número fue tres: hay 3.'], 'Hay 3 pelotas.'),
    exs: [
      ch('Cuenta las peras.', ['2', '3', '4'], 1, 'Contamos una, dos y tres. La cantidad es 3.', ['Señala cada una una sola vez.', 'Cuenta en voz alta: uno, dos…'], { v: { kind: 'counters', groups: [{ count: 3, shape: 'triangulo', color: 'verde' }], alt: 'Tres triángulos verdes' } }),
      ch('¿Cuántas estrellas hay?', ['3', '4', '5'], 1, 'Hay cuatro estrellas.', ['Cuenta de izquierda a derecha.'], { v: { kind: 'counters', groups: [{ count: 4, shape: 'estrella', color: 'amarillo' }], alt: 'Cuatro estrellas amarillas' } }),
      ch('¿Cuántos círculos hay?', ['5', '4', '3'], 0, 'Hay cinco círculos.', ['Cuéntalos sin saltarte ninguno.'], { v: { kind: 'counters', groups: [{ count: 5, shape: 'circulo', color: 'azul' }], alt: 'Cinco círculos azules' } }),
    ],
    sum: ['Contamos una vez cada objeto, en orden.', 'El último número que decimos es la cantidad.'],
  }),
  lesson({
    id: 'numero-y-cantidad', topic: 'pre-4-contar-5', title: 'Cada número, su cantidad', obj: 'Relacionar el número escrito (1 a 5) con la cantidad que representa.', min: 5, d: 1,
    tags: ['correspondencia', 'numeral', 'cantidad'],
    secs: [
      sec('El número dice cuántos', 'El número 3 representa tres cosas. Cada número va con una cantidad.', { v: { kind: 'counters', groups: [{ count: 3, shape: 'estrella', color: 'morado' }], alt: 'Tres estrellas moradas, que corresponden al número 3' } }),
      sec('Buscamos la pareja', 'Cuenta los objetos y busca el número que dice cuántos son.', { key: 'Número y cantidad forman una pareja.' }),
    ],
    ex: ex('Buscamos el número', 'Hay 4 cuadrados. ¿Qué número va con ellos?', [['Contamos los cuadrados: uno, dos, tres, cuatro.', { kind: 'counters', groups: [{ count: 4, shape: 'cuadrado', color: 'azul' }], alt: 'Cuatro cuadrados azules' }], 'El número que dice cuatro es el 4.'], 'El número 4.'),
    exs: [
      ch('Hay 2 círculos. ¿Qué número va con ellos?', ['1', '2', '5'], 1, 'Dos círculos se escriben con el número 2.', ['Cuenta los círculos.'], { v: { kind: 'counters', groups: [{ count: 2, shape: 'circulo', color: 'rojo' }], alt: 'Dos círculos rojos' } }),
      ch('El número 5. ¿Qué grupo tiene esa cantidad?', ['3 estrellas', '5 estrellas', '4 estrellas'], 1, 'El 5 va con cinco estrellas.', ['Cuenta cada grupo.']),
      ch('¿Qué número va con este grupo?', ['3', '4', '5'], 0, 'Hay tres: el número es 3.', ['Cuenta con el dedo.'], { v: { kind: 'counters', groups: [{ count: 3, shape: 'triangulo', color: 'naranja' }], alt: 'Tres triángulos naranjas' } }),
    ],
    sum: ['Cada número tiene una cantidad.', 'Contamos para encontrar la pareja.'],
  }),
  lesson({
    id: 'mas-menos-igual', topic: 'pre-4-mas-menos', title: 'Más, menos e igual', obj: 'Comparar dos grupos y decir dónde hay más, menos o igual cantidad.', min: 5, d: 1,
    tags: ['mas', 'menos', 'igual', 'comparar'],
    secs: [
      sec('Dónde hay más', 'Cuenta los dos grupos. El grupo con el número mayor tiene más.', { v: { kind: 'counters', groups: [{ count: 4, shape: 'circulo', color: 'rojo' }, { count: 2, shape: 'circulo', color: 'azul' }], alt: 'Cuatro círculos rojos y dos círculos azules' } }),
      sec('Menos e igual', 'El otro grupo tiene menos. Si cuentas lo mismo, hay igual cantidad.', { key: 'Más, menos o igual: depende de cuántos hay.' }),
    ],
    ex: ex('¿Dónde hay más?', 'Hay 4 rojos y 2 azules.', ['Contamos los rojos: 4.', 'Contamos los azules: 2.', '4 es más que 2.'], 'Hay más círculos rojos.'),
    exs: [
      ch('¿De qué color hay más?', ['Rojos', 'Azules'], 0, 'Hay 3 rojos y 1 azul: hay más rojos.', ['Cuenta cada color.'], { v: { kind: 'counters', groups: [{ count: 3, shape: 'circulo', color: 'rojo' }, { count: 1, shape: 'circulo', color: 'azul' }], alt: 'Tres círculos rojos y uno azul' } }),
      ch('¿Dónde hay menos?', ['Estrellas', 'Cuadrados'], 1, 'Hay 2 cuadrados y 4 estrellas: hay menos cuadrados.', ['Cuenta cada grupo.'], { v: { kind: 'counters', groups: [{ count: 4, shape: 'estrella', color: 'amarillo' }, { count: 2, shape: 'cuadrado', color: 'verde' }], alt: 'Cuatro estrellas y dos cuadrados' } }),
      ch('Hay 3 triángulos y 3 círculos. ¿Qué pasa?', ['Hay más triángulos', 'Hay igual cantidad', 'Hay más círculos'], 1, 'Los dos grupos tienen 3: hay igual cantidad.', ['Cuenta los dos grupos.'], { v: { kind: 'counters', groups: [{ count: 3, shape: 'triangulo', color: 'naranja' }, { count: 3, shape: 'circulo', color: 'azul' }], alt: 'Tres triángulos y tres círculos' } }),
    ],
    sum: ['Contamos para comparar.', 'Más, menos o igual.'],
  }),
  lesson({
    id: 'patron-ab', topic: 'pre-4-patron-ab', title: 'Patrones de dos elementos', obj: 'Reconocer un patrón que se repite (ABAB) y decir qué sigue.', min: 5, d: 1,
    tags: ['patrones', 'ab', 'repetir'],
    secs: [
      sec('Algo que se repite', 'Un patrón es algo que se repite siempre igual.', { v: { kind: 'pattern', items: ['rojo', 'azul', 'rojo', 'azul'], alt: 'Patrón: rojo, azul, rojo, azul' } }),
      sec('¿Qué sigue?', 'Mira el grupo que se repite y sigue el orden.', { key: 'En un patrón, el orden se repite.' }),
    ],
    ex: ex('Continuamos el patrón', 'rojo, azul, rojo, azul, … ¿qué sigue?', ['El grupo que se repite es rojo-azul.', 'Después de azul empieza otra vez: rojo.'], 'Sigue rojo.'),
    exs: [
      ch('¿Qué color sigue?', ['Rojo', 'Azul'], 0, 'Se repite rojo-azul. Después del azul viene rojo.', ['Dime el grupo que se repite.'], { v: { kind: 'pattern', items: ['rojo', 'azul', 'rojo', 'azul', '?'], alt: 'Patrón rojo, azul, rojo, azul y un espacio vacío' } }),
      ch('¿Qué forma sigue?', ['Círculo', 'Cuadrado'], 1, 'Se repite círculo-cuadrado. Después del círculo, cuadrado.', ['Mira lo último que hay.'], { v: { kind: 'pattern', items: ['circulo', 'cuadrado', 'circulo', '?'], alt: 'Patrón círculo, cuadrado, círculo y un espacio vacío' } }),
      ch('¿Cuál es el patrón?', ['verde, amarillo, verde, amarillo', 'verde, verde, amarillo, rojo'], 0, 'En el primero se repite verde-amarillo.', ['Busca el que repite el mismo grupo.']),
    ],
    sum: ['Un patrón se repite.', 'Para continuarlo, miramos qué grupo se repite.'],
  }),
  lesson({
    id: 'primero-despues-al-final', topic: 'pre-4-secuencias', title: 'Primero, después y al final', obj: 'Ordenar los pasos de una actividad con primero, después y al final.', min: 5, d: 1,
    tags: ['secuencia', 'orden', 'primero', 'despues'],
    secs: [
      sec('El orden importa', 'Las cosas pasan una detrás de otra. Algo va primero, otra cosa después y algo al final.', { key: 'Primero, después y al final.' }),
      sec('Un ejemplo', 'Para lavarte las manos: primero abres el agua, después usas jabón y al final te secas.'),
    ],
    ex: ex('Plantar una semilla', 'Primero ponemos tierra, después la semilla y al final agua.', ['Primero: tierra en la maceta.', 'Después: semilla.', 'Al final: agua.'], 'Tierra, semilla, agua.'),
    exs: [
      od('Ordena para lavarte las manos.', ['Abrir el agua', 'Usar jabón', 'Secarse las manos'], 'Primero abres el agua, después usas jabón y al final te secas.', ['¿Qué haces primero?', 'El agua va antes del jabón.']),
      ch('¿Qué va primero al vestirte?', ['Ponerte los zapatos', 'Ponerte los calcetines'], 1, 'Los calcetines van antes que los zapatos.', ['Piensa en lo que necesitas antes.']),
      od('Ordena la historia de una semilla.', ['Semilla', 'Brote', 'Flor'], 'Primero la semilla, después el brote y al final la flor.', ['Todo empieza con la semilla.']),
    ],
    sum: ['Ordenamos con primero, después y al final.', 'Cambiar el orden cambia lo que pasa.'],
  }),
  lesson({
    id: 'encima-debajo-al-lado', topic: 'pre-4-encima-debajo', title: 'Encima, debajo y al lado', obj: 'Describir la posición de un objeto: encima, debajo o al lado de otro.', min: 5, d: 1,
    tags: ['encima', 'debajo', 'al lado', 'posicion'],
    secs: [
      sec('Encima y debajo', 'Encima es arriba de algo. Debajo es abajo de algo.', { v: { kind: 'spatial', relation: 'encima', alt: 'Una pelota encima de una caja' } }),
      sec('Al lado', 'Al lado es junto a algo, en el costado.', { v: { kind: 'spatial', relation: 'al-lado', alt: 'Una pelota al lado de una caja' } }),
    ],
    ex: ex('¿Dónde está?', 'La pelota está arriba de la caja.', ['Miramos dónde está la pelota.', 'Está arriba: encima.'], 'Está encima.'),
    exs: [
      ch('¿Dónde está la pelota?', ['Encima', 'Debajo', 'Al lado'], 0, 'Está arriba de la caja: encima.', ['Mira si está arriba o abajo.'], { v: { kind: 'spatial', relation: 'encima', alt: 'Una pelota encima de una caja' } }),
      ch('¿Dónde está la pelota?', ['Encima', 'Debajo', 'Al lado'], 1, 'Está abajo de la caja: debajo.', ['La caja está arriba de la pelota.'], { v: { kind: 'spatial', relation: 'debajo', alt: 'Una pelota debajo de una caja' } }),
      ch('¿Dónde está la pelota?', ['Encima', 'Debajo', 'Al lado'], 2, 'Está en el costado de la caja: al lado.', ['No está arriba ni abajo.'], { v: { kind: 'spatial', relation: 'al-lado', alt: 'Una pelota al lado de una caja' } }),
    ],
    sum: ['Encima: arriba.', 'Debajo: abajo.', 'Al lado: junto.'],
  }),
  lesson({
    id: 'largo-y-corto', topic: 'pre-4-largo-corto', title: 'Largo y corto', obj: 'Comparar longitudes y ordenar tres objetos del más corto al más largo.', min: 5, d: 1,
    tags: ['largo', 'corto', 'longitud', 'comparar'],
    secs: [
      sec('Largo y corto', 'El objeto que se extiende más es el largo. El que se extiende menos es el corto.', { v: { kind: 'bars', orientation: 'horizontal', data: [{ label: 'Cinta A', value: 6 }, { label: 'Cinta B', value: 3 }], alt: 'Cinta A larga y cinta B corta' } }),
      sec('Empezar en el mismo lugar', 'Para comparar, empieza a medir desde el mismo punto.', { key: 'Compara empezando en el mismo lugar.' }),
    ],
    ex: ex('La cinta más larga', 'La cinta A llega más lejos que la B.', ['Las dos empiezan en el mismo lugar.', 'La A llega más lejos.'], 'La cinta A es la más larga.'),
    exs: [
      ch('¿Cuál cinta es más larga?', ['A', 'B'], 1, 'La B llega más lejos: es la más larga.', ['Mira dónde termina cada cinta.'], { v: { kind: 'bars', orientation: 'horizontal', data: [{ label: 'A', value: 3 }, { label: 'B', value: 7 }], alt: 'Cinta A corta y cinta B larga' } }),
      ch('¿Cuál cinta es más corta?', ['A', 'B'], 0, 'La A termina antes: es la más corta.', ['Busca la que termina primero.'], { v: { kind: 'bars', orientation: 'horizontal', data: [{ label: 'A', value: 2 }, { label: 'B', value: 6 }], alt: 'Cinta A muy corta y B larga' } }),
      od('Ordena del más corto al más largo.', ['Lápiz pequeño', 'Lápiz mediano', 'Lápiz largo'], 'Del más corto al más largo: pequeño, mediano, largo.', ['El más corto va primero.']),
    ],
    sum: ['Largo: se extiende más.', 'Corto: se extiende menos.'],
  }),
  // ───────────────── 5 años
  lesson({
    id: 'contar-hasta-10', topic: 'pre-5-hasta-10', title: 'Contamos hasta diez', obj: 'Contar colecciones de hasta 10 objetos y escribir el número.', min: 6, d: 2,
    tags: ['contar', 'conteo ascendente', 'hasta 10'], pre: ['contar-hasta-5'],
    secs: [
      sec('Agrupar ayuda a contar', 'Con un marco de diez es fácil: llenamos las casillas de izquierda a derecha.', { v: { kind: 'tenFrame', filled: 7, alt: 'Marco de diez con siete casillas llenas' }, key: 'Cinco y dos más son siete.' }),
      sec('Del uno al diez', 'Los números siguen el orden: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.', { v: { kind: 'numberLine', from: 0, to: 10, alt: 'Recta numérica del 0 al 10' } }),
    ],
    ex: ex('Contamos siete', 'Hay una fila llena de cinco y dos más.', [['Una fila llena son 5.', { kind: 'tenFrame', filled: 7, alt: 'Siete casillas llenas' }], 'Seguimos contando: 6, 7.'], 'Hay 7.'),
    exs: [
      nm('¿Cuántos puntos hay? Escribe el número.', 6, 'Cinco de la primera fila y uno más: 6.', ['Cuenta primero la fila de arriba.', 'Sigue contando desde 5.'], { v: { kind: 'tenFrame', filled: 6, alt: 'Seis casillas llenas' } }),
      nm('¿Cuántos círculos hay? Escribe el número.', 9, 'Contamos hasta nueve.', ['Agrupa de cinco en cinco.'], { v: { kind: 'counters', groups: [{ count: 9, shape: 'circulo', color: 'azul' }], alt: 'Nueve círculos azules' } }),
      ch('Dime cuántas estrellas hay.', ['8', '9', '10'], 2, 'Hay diez estrellas.', ['Cuenta de cinco en cinco.'], { v: { kind: 'counters', groups: [{ count: 10, shape: 'estrella', color: 'amarillo' }], alt: 'Diez estrellas amarillas' } }),
    ],
    sum: ['Podemos contar hasta 10.', 'Agrupar ayuda a contar más rápido.'],
  }),
  lesson({
    id: 'numero-siguiente', topic: 'pre-5-hasta-10', title: '¿Qué número viene después?', obj: 'Reconocer el número siguiente y el anterior en la serie del 1 al 10.', min: 5, d: 2,
    tags: ['siguiente', 'anterior', 'orden'],
    secs: [
      sec('Los números tienen un orden', 'Al avanzar una posición, decimos el número que sigue.', { v: { kind: 'numberLine', from: 0, to: 10, highlight: [3, 4], jumps: [{ from: 3, to: 4 }], alt: 'Recta del 0 al 10 con un salto del 3 al 4' }, key: 'Después del 3 viene el 4.' }),
      sec('Antes y después', 'El número que viene antes es el anterior. El que viene después es el siguiente.'),
    ],
    ex: ex('Después del 2', '¿Qué número viene después del 2?', ['Decimos: 1, 2…', 'El siguiente es 3.'], 'El 3.'),
    exs: [
      ch('¿Qué número viene después del 2?', ['1', '3', '5'], 1, 'La serie es 1, 2, 3, 4, 5. Después del 2 viene el 3.', ['Cuenta: uno, dos… ¿y luego?'], { wrong: { 0: 'El 1 viene antes del 2, no después.' } }),
      nm('¿Qué número viene después del 6?', 7, 'Después del 6 viene el 7.', ['Cuenta: cinco, seis…'], { v: { kind: 'numberLine', from: 0, to: 10, highlight: [6], alt: 'Recta con el 6 destacado' } }),
      nm('¿Qué número viene antes del 9?', 8, 'Antes del 9 viene el 8.', ['Cuenta hacia atrás desde el 9.']),
    ],
    sum: ['Siguiente: avanzar uno.', 'Anterior: retroceder uno.'],
  }),
  lesson({
    id: 'contar-hacia-atras', topic: 'pre-5-hasta-10', title: 'Contamos hacia atrás', obj: 'Contar de forma descendente desde 10 hasta 1.', min: 5, d: 2,
    tags: ['conteo descendente', 'hacia atras', 'cuenta regresiva'],
    secs: [
      sec('Hacia atrás', 'También podemos contar hacia atrás: 5, 4, 3, 2, 1.', { v: { kind: 'numberLine', from: 0, to: 10, highlight: [5, 4, 3, 2, 1], alt: 'Recta del 0 al 10 con los números 5, 4, 3, 2 y 1 destacados' } }),
      sec('Cuenta regresiva', 'Una cuenta regresiva baja de uno en uno hasta llegar a 1.', { key: 'Contar hacia atrás: cada número es uno menos.' }),
    ],
    ex: ex('Después del 5', 'Cuenta hacia atrás desde 5.', ['5.', '4, uno menos que 5.', '3, uno menos que 4.'], '5, 4, 3, 2, 1.'),
    exs: [
      nm('Cuenta hacia atrás: 5, 4, ¿cuál sigue?', 3, 'Uno menos que 4 es 3.', ['Retrocede un lugar desde 4.']),
      od('Ordena para una cuenta regresiva.', ['5', '4', '3', '2', '1'], 'Contamos hacia atrás: 5, 4, 3, 2, 1.', ['Empieza por el número más grande.']),
      nm('Cuenta hacia atrás: 10, 9, 8, ¿cuál sigue?', 7, 'Después del 8, hacia atrás, viene el 7.', ['Es uno menos que 8.']),
    ],
    sum: ['Contar hacia atrás es ir de mayor a menor.', 'Cada número es uno menos que el anterior.'],
  }),
  lesson({
    id: 'juntar-hasta-5', topic: 'pre-5-juntar-quitar', title: 'Juntar para saber cuántos hay', obj: 'Resolver sumas con resultado hasta 5 juntando dos grupos de objetos.', min: 6, d: 2,
    tags: ['suma', 'juntar', 'sumar'], pre: ['contar-hasta-10'],
    secs: [
      sec('Juntar dos grupos', 'Cuando juntamos dos grupos, contamos cuántos hay en total.', { v: { kind: 'counters', groups: [{ count: 2, shape: 'circulo', color: 'rojo' }, { count: 1, shape: 'circulo', color: 'azul' }], alt: 'Dos círculos rojos y un círculo azul' } }),
      sec('Contamos todo', '2 y 1 juntos son 3. Se escribe 2 + 1 = 3.', { key: '2 + 1 = 3' }),
    ],
    ex: ex('Dos y dos', 'Hay 2 estrellas y llegan 2 más.', [['Contamos las primeras: 2.', { kind: 'counters', groups: [{ count: 2, shape: 'estrella', color: 'amarillo' }, { count: 2, shape: 'estrella', color: 'amarillo' }], alt: 'Dos grupos de dos estrellas' }], 'Contamos todo desde el principio: 1, 2, 3, 4.'], 'Hay 4 estrellas.'),
    exs: [
      nm('2 + 1. ¿Cuántos hay en total?', 3, '2 y 1 más son 3.', ['Cuenta todos.'], { v: { kind: 'counters', groups: [{ count: 2, shape: 'circulo', color: 'rojo' }, { count: 1, shape: 'circulo', color: 'azul' }], alt: 'Dos círculos rojos y uno azul' } }),
      nm('3 + 2. ¿Cuántos hay en total?', 5, '3 y 2 más son 5.', ['Cuenta los de un grupo y sigue con el otro.'], { v: { kind: 'counters', groups: [{ count: 3, shape: 'triangulo', color: 'verde' }, { count: 2, shape: 'triangulo', color: 'naranja' }], alt: 'Tres triángulos verdes y dos naranjas' } }),
      ch('Tienes 1 galleta y recibes 3. ¿Cuántas tienes?', ['3', '4', '5'], 1, '1 y 3 juntos son 4.', ['Junta las galletas y cuenta.']),
    ],
    sum: ['Juntar es sumar.', 'Contamos todo para saber el total.'],
  }),
  lesson({
    id: 'quitar-hasta-5', topic: 'pre-5-juntar-quitar', title: 'Quitar para saber cuántos quedan', obj: 'Resolver restas con números hasta 5 quitando objetos de un grupo.', min: 6, d: 2,
    tags: ['resta', 'quitar', 'restar'], pre: ['juntar-hasta-5'],
    secs: [
      sec('Quitamos algunos', 'Si de un grupo quitamos algunos, contamos los que quedan.', { v: { kind: 'counters', groups: [{ count: 4, shape: 'circulo', color: 'rojo' }], crossed: 1, alt: 'Cuatro círculos, uno tachado' } }),
      sec('Los que quedan', '4 menos 1 es 3. Se escribe 4 − 1 = 3.', { key: '4 − 1 = 3' }),
    ],
    ex: ex('Comimos dos', 'Había 5 galletas y comimos 2.', [['Empezamos con 5 galletas.', { kind: 'counters', groups: [{ count: 5, shape: 'circulo', color: 'naranja' }], crossed: 2, alt: 'Cinco galletas, dos tachadas' }], 'Quitamos 2 (las tachadas).', 'Contamos las que quedan: 3.'], 'Quedan 3 galletas.'),
    exs: [
      nm('Hay 5 globos y se van 2. ¿Cuántos quedan?', 3, '5 menos 2 son 3.', ['Tacha 2 globos.'], { v: { kind: 'counters', groups: [{ count: 5, shape: 'circulo', color: 'azul' }], crossed: 2, alt: 'Cinco círculos, dos tachados' } }),
      nm('4 − 1. ¿Cuántos quedan?', 3, '4 menos 1 son 3.', ['Quita uno.'], { v: { kind: 'counters', groups: [{ count: 4, shape: 'estrella', color: 'amarillo' }], crossed: 1, alt: 'Cuatro estrellas, una tachada' } }),
      ch('Hay 3 pájaros y se va 1. ¿Cuántos quedan?', ['1', '2', '4'], 1, '3 menos 1 son 2.', ['Cuenta cuántos se quedan.'], { wrong: { 2: 'Restar es quitar: el resultado es menor que 3.' } }),
    ],
    sum: ['Restar es quitar.', 'Contamos los que quedan.'],
  }),
  lesson({
    id: 'patron-abc', topic: 'pre-5-patron-abc', title: 'Patrones de tres elementos', obj: 'Reconocer y continuar patrones de tres elementos (ABC).', min: 5, d: 2,
    tags: ['patrones', 'abc'], pre: ['patron-ab'],
    secs: [
      sec('Tres que se repiten', 'Algunos patrones repiten tres cosas en el mismo orden.', { v: { kind: 'pattern', items: ['rojo', 'azul', 'verde', 'rojo', 'azul', 'verde'], alt: 'Patrón rojo, azul, verde, repetido dos veces' } }),
      sec('Encontramos el grupo', 'Busca el grupo que se repite: rojo-azul-verde. Después del verde empieza otra vez.', { key: 'El grupo se repite siempre en el mismo orden.' }),
    ],
    ex: ex('¿Qué sigue?', 'rojo, azul, verde, rojo, azul, …', ['El grupo es rojo-azul-verde.', 'Ya pusimos rojo y azul.', 'Falta el verde.'], 'Sigue verde.'),
    exs: [
      ch('¿Qué sigue?', ['Rojo', 'Azul', 'Verde'], 2, 'El grupo es rojo-azul-verde: falta el verde.', ['Escribe el grupo que se repite.'], { v: { kind: 'pattern', items: ['rojo', 'azul', 'verde', 'rojo', 'azul', '?'], alt: 'Patrón rojo, azul, verde, rojo, azul y un espacio vacío' } }),
      ch('¿Qué forma sigue?', ['Círculo', 'Cuadrado', 'Triángulo'], 0, 'El grupo es círculo-cuadrado-triángulo: después del triángulo, círculo.', ['Mira lo último que hay.'], { v: { kind: 'pattern', items: ['circulo', 'cuadrado', 'triangulo', '?'], alt: 'Patrón círculo, cuadrado, triángulo y un espacio vacío' } }),
      ch('¿Cuál es un patrón de tres elementos?', ['A, B, C, A, B, C', 'A, A, B, C, B, A'], 0, 'En el primero se repite A-B-C.', ['Busca un grupo que se repita.']),
    ],
    sum: ['Un patrón puede repetir tres elementos.', 'Para continuarlo, encontramos el grupo.'],
  }),
  lesson({
    id: 'figuras-lados-esquinas', topic: 'pre-5-lados', title: 'Lados y esquinas', obj: 'Contar los lados y las esquinas del triángulo, el cuadrado y el rectángulo.', min: 6, d: 2,
    tags: ['lados', 'esquinas', 'formas'], pre: ['formas-circulo-cuadrado-triangulo'],
    secs: [
      sec('Lados y esquinas', 'Un lado es una línea del borde. Una esquina es donde se juntan dos lados.', { v: { kind: 'shape', shape: 'triangulo', color: 'naranja', alt: 'Un triángulo con 3 lados y 3 esquinas' } }),
      sec('Cuántos tiene', 'El triángulo tiene 3 lados y 3 esquinas. El cuadrado y el rectángulo tienen 4 lados y 4 esquinas. El círculo no tiene.', { v: { kind: 'shape', shape: 'rectangulo', color: 'azul', alt: 'Un rectángulo con 4 lados y 4 esquinas' } }),
    ],
    ex: ex('Contamos lados', '¿Cuántos lados tiene un cuadrado?', ['Recorremos el borde con el dedo.', 'Cada línea recta es un lado: 1, 2, 3, 4.'], 'Tiene 4 lados.'),
    exs: [
      nm('¿Cuántos lados tiene el triángulo?', 3, 'El triángulo tiene 3 lados.', ['Recorre el borde y cuenta.'], { v: { kind: 'shape', shape: 'triangulo', color: 'rojo', alt: 'Un triángulo rojo' } }),
      nm('¿Cuántas esquinas tiene el cuadrado?', 4, 'El cuadrado tiene 4 esquinas.', ['Cuenta dónde se juntan dos lados.'], { v: { kind: 'shape', shape: 'cuadrado', color: 'verde', alt: 'Un cuadrado verde' } }),
      ch('¿Qué forma no tiene esquinas ni lados rectos?', ['Triángulo', 'Círculo', 'Rectángulo'], 1, 'El círculo es redondo: no tiene esquinas.', ['Piensa en una rueda.']),
    ],
    sum: ['Triángulo: 3 lados y 3 esquinas.', 'Cuadrado y rectángulo: 4 lados y 4 esquinas.', 'Círculo: ninguna esquina.'],
  }),
  lesson({
    id: 'izquierda-y-derecha', topic: 'pre-5-izq-der', title: 'Izquierda y derecha', obj: 'Distinguir izquierda y derecha en un dibujo.', min: 5, d: 2,
    tags: ['izquierda', 'derecha', 'orientacion'], pre: ['encima-debajo-al-lado'],
    secs: [
      sec('Tus dos lados', 'Tienes una mano izquierda y una mano derecha. Escribimos de izquierda a derecha.', { v: { kind: 'spatial', relation: 'izquierda', alt: 'Una pelota a la izquierda de una caja' } }),
      sec('Mirando un dibujo', 'En un dibujo, izquierda es el lado de tu mano izquierda y derecha es el de tu mano derecha.', { v: { kind: 'spatial', relation: 'derecha', alt: 'Una pelota a la derecha de una caja' }, key: 'Izquierda y derecha cambian de lado.' }),
    ],
    ex: ex('¿Dónde está la pelota?', 'La pelota está del lado de tu mano izquierda.', ['Mira la pelota y la caja.', 'La pelota está a la izquierda de la caja.'], 'A la izquierda.'),
    exs: [
      ch('¿Dónde está la pelota respecto a la caja?', ['Izquierda', 'Derecha'], 0, 'La pelota está del lado izquierdo de la caja.', ['Piensa en tu mano izquierda.'], { v: { kind: 'spatial', relation: 'izquierda', alt: 'Una pelota a la izquierda de una caja' } }),
      ch('¿Dónde está la pelota respecto a la caja?', ['Izquierda', 'Derecha'], 1, 'La pelota está del lado derecho de la caja.', ['Piensa en tu mano derecha.'], { v: { kind: 'spatial', relation: 'derecha', alt: 'Una pelota a la derecha de una caja' } }),
      ch('Escribimos y leemos de…', ['derecha a izquierda', 'izquierda a derecha'], 1, 'En español leemos de izquierda a derecha.', ['Piensa en cómo lees una palabra.']),
    ],
    sum: ['Izquierda y derecha son lados opuestos.', 'Leemos de izquierda a derecha.'],
  }),
  lesson({
    id: 'mi-dia', topic: 'pre-5-tiempo', title: 'Mi día: mañana, tarde y noche', obj: 'Reconocer las partes del día y ordenar actividades cotidianas.', min: 5, d: 2,
    tags: ['tiempo', 'rutinas', 'dia', 'manana', 'tarde', 'noche'], pre: ['primero-despues-al-final'],
    secs: [
      sec('Las partes del día', 'El día tiene mañana, tarde y noche. Por la mañana sale el sol; por la noche hay oscuridad.', { key: 'Mañana, tarde y noche.' }),
      sec('Lo que hacemos', 'Desayunamos por la mañana, jugamos por la tarde y dormimos por la noche.'),
    ],
    ex: ex('¿Cuándo dormimos?', 'Dormimos cuando hay oscuridad.', ['La oscuridad llega por la noche.'], 'Dormimos por la noche.'),
    exs: [
      ch('¿Cuándo desayunamos?', ['Por la mañana', 'Por la noche'], 0, 'El desayuno es la primera comida del día.', ['Piensa en cuándo te despiertas.']),
      od('Ordena las partes del día.', ['Mañana', 'Tarde', 'Noche'], 'Primero la mañana, después la tarde y al final la noche.', ['El día empieza por la mañana.']),
      od('Ordena la rutina.', ['Despertar', 'Ir a la escuela', 'Cenar', 'Dormir'], 'Despertamos, vamos a la escuela, cenamos y dormimos.', ['¿Qué haces apenas abres los ojos?']),
    ],
    sum: ['El día tiene mañana, tarde y noche.', 'Las rutinas siguen un orden.'],
  }),
]
