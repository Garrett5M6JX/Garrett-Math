import { topic, withTopicOrder } from '../helpers'

/**
 * Mapa progresivo de temas. Los que no tienen lecciones asociadas en `lessons-*.ts`
 * aparecen en la interfaz como «en preparación» (nunca como contenido disponible).
 * Organización general NO ligada a un currículo oficial: requiere adaptación local.
 */
export const topics = withTopicOrder([
  // ── PREESCOLAR · 3 años
  topic('pre-3', 'numeros', 'uno-dos-tres', 'Uno, dos y tres', 'Reconoce y cuenta cantidades de 1 a 3 con objetos.', 1, ['contar', 'conteo', 'numeros', 'cantidades', 'uno dos tres']),
  topic('pre-3', 'patrones', 'agrupar', 'Agrupar por color y forma', 'Junta objetos que se parecen y descubre por qué van juntos.', 1, ['clasificar', 'clasificacion', 'agrupar', 'colores', 'formas']),
  topic('pre-3', 'geometria', 'formas', 'Círculo, cuadrado y triángulo', 'Reconoce las tres formas básicas en dibujos y objetos.', 1, ['formas', 'figuras', 'circulo', 'cuadrado', 'triangulo', 'geometria']),
  topic('pre-3', 'geometria', 'dentro-fuera', 'Dentro y fuera', 'Primeras relaciones espaciales: dentro y fuera de un lugar.', 1, ['posicion', 'espacio', 'dentro', 'fuera', 'orientacion']),
  topic('pre-3', 'medida', 'grande-pequeno', 'Grande y pequeño', 'Compara el tamaño de dos objetos.', 1, ['medidas', 'tamano', 'grande', 'pequeno', 'comparar']),
  // ── PREESCOLAR · 4 años
  topic('pre-4', 'numeros', 'contar-5', 'Contar y relacionar número y cantidad', 'Cuenta hasta 5 y une cada número con su cantidad.', 1, ['contar', 'conteo', 'numeros hasta 5', 'correspondencia', 'cantidad', 'numeral'], ['pre-3-uno-dos-tres']),
  topic('pre-4', 'numeros', 'mas-menos', 'Más, menos e igual', 'Compara dos grupos y decide dónde hay más, menos o la misma cantidad.', 1, ['comparar', 'comparacion', 'mas', 'menos', 'igual', 'cantidades'], ['pre-3-uno-dos-tres']),
  topic('pre-4', 'patrones', 'patron-ab', 'Patrones de dos elementos', 'Descubre qué viene después en patrones como rojo-azul, rojo-azul.', 1, ['patrones', 'repetir', 'secuencia', 'ab', 'continuar'], ['pre-3-agrupar']),
  topic('pre-4', 'patrones', 'secuencias', 'Primero, después y al final', 'Ordena los pasos de una historia o rutina.', 1, ['secuencia', 'orden', 'primero', 'despues', 'final', 'rutinas']),
  topic('pre-4', 'geometria', 'encima-debajo', 'Encima, debajo y al lado', 'Describe dónde está un objeto respecto a otro.', 1, ['posicion', 'espacio', 'encima', 'debajo', 'al lado', 'orientacion'], ['pre-3-dentro-fuera']),
  topic('pre-4', 'geometria', 'formas-objetos', 'Las formas en los objetos', 'Encuentra círculos, cuadrados y triángulos en el entorno.', 1, ['formas', 'figuras', 'objetos', 'entorno'], ['pre-3-formas']),
  topic('pre-4', 'medida', 'largo-corto', 'Largo y corto', 'Compara longitudes y ordena objetos del más corto al más largo.', 1, ['medidas', 'longitud', 'largo', 'corto', 'comparar'], ['pre-3-grande-pequeno']),
  // ── PREESCOLAR · 5 años
  topic('pre-5', 'numeros', 'hasta-10', 'Números hasta 10', 'Cuenta hasta 10, completa secuencias y cuenta hacia atrás.', 2, ['contar', 'conteo ascendente', 'conteo descendente', 'cuenta regresiva', 'numeros hasta 10', 'siguiente', 'anterior'], ['pre-4-contar-5']),
  topic('pre-5', 'numeros', 'mayor-menor', 'Mayor y menor entre números', 'Compara números del 1 al 10 y colócalos en la recta.', 2, ['comparar', 'mayor', 'menor', 'recta numerica', 'orden'], ['pre-4-mas-menos', 'pre-5-hasta-10']),
  topic('pre-5', 'operaciones', 'juntar-quitar', 'Juntar y quitar', 'Primeras sumas y restas con dibujos hasta 5.', 2, ['suma', 'resta', 'sumar', 'restar', 'juntar', 'quitar', 'operaciones'], ['pre-5-hasta-10']),
  topic('pre-5', 'patrones', 'patron-abc', 'Patrones de tres elementos', 'Reconoce y continúa patrones como rojo-azul-verde.', 2, ['patrones', 'secuencia', 'abc', 'repetir'], ['pre-4-patron-ab']),
  topic('pre-5', 'geometria', 'lados', 'Lados y esquinas', 'Cuenta los lados y las esquinas de las figuras.', 2, ['formas', 'figuras', 'lados', 'esquinas', 'vertices', 'geometria'], ['pre-3-formas']),
  topic('pre-5', 'geometria', 'izq-der', 'Izquierda y derecha', 'Distingue izquierda y derecha en dibujos y en tu cuerpo.', 2, ['posicion', 'orientacion', 'izquierda', 'derecha', 'lateralidad'], ['pre-4-encima-debajo']),
  topic('pre-5', 'medida', 'tiempo', 'Mi día: mañana, tarde y noche', 'Ordena las actividades del día y reconoce las partes del día.', 2, ['tiempo', 'rutinas', 'dia', 'manana', 'tarde', 'noche', 'secuencia'], ['pre-4-secuencias']),
  topic('pre-5', 'medida', 'medir-objetos', 'Medir con objetos', 'Mide cuántos clips o cubos miden dos objetos.', 2, ['medidas', 'medir', 'longitud', 'unidad no convencional'], ['pre-4-largo-corto']),
  // ── PRIMARIA · 1.º
  topic('pri-1', 'numeros', 'leer-escribir-20', 'Leer y escribir números hasta 20', 'Relaciona la cantidad, el nombre y la cifra de los números hasta 20.', 1, ['numeros', 'leer', 'escribir', 'numeros hasta 20', 'cifras', 'sistema numerico'], ['pre-5-hasta-10']),
  topic('pri-1', 'numeros', 'decenas-unidades', 'Decenas y unidades', 'Descompón números hasta 99 en decenas y unidades.', 1, ['valor posicional', 'decenas', 'unidades', 'descomponer', 'componer', 'numeros hasta 100'], ['pri-1-leer-escribir-20']),
  topic('pri-1', 'numeros', 'comparar', 'Comparar y ordenar números', 'Usa mayor que, menor que e igual para comparar números hasta 100.', 1, ['comparar', 'ordenar', 'mayor que', 'menor que', 'simbolos', 'orden'], ['pri-1-decenas-unidades']),
  topic('pri-1', 'numeros', 'contar-saltos', 'Contar de 2 en 2, de 5 en 5 y de 10 en 10', 'Cuenta con saltos para encontrar patrones en los números.', 2, ['contar', 'saltos', 'patrones', 'de 2 en 2', 'de 5 en 5', 'de 10 en 10'], ['pri-1-decenas-unidades']),
  topic('pri-1', 'operaciones', 'sumar-restar', 'Sumar y restar con objetos', 'Entiende sumar como juntar y restar como quitar, hasta 10.', 1, ['suma', 'resta', 'sumar', 'restar', 'juntar', 'quitar', 'operaciones'], ['pre-5-juntar-quitar']),
  topic('pri-1', 'operaciones', 'dobles-complementos', 'Dobles y complementos a 10', 'Estrategias de cálculo mental con dobles y parejas de 10.', 2, ['calculo mental', 'dobles', 'complementos', 'suma', 'estrategias'], ['pri-1-sumar-restar']),
  topic('pri-1', 'geometria', 'figuras', 'Figuras planas y sólidos del entorno', 'Reconoce círculos, triángulos, cuadrados, rectángulos, cubos y esferas.', 1, ['figuras planas', 'solidos', 'cuerpos geometricos', 'cubo', 'esfera'], ['pre-5-lados']),
  topic('pri-1', 'medida', 'hora-punto', 'La hora en punto', 'Lee la hora exacta en un reloj de manecillas.', 2, ['tiempo', 'hora', 'reloj', 'en punto', 'manecillas']),
  topic('pri-1', 'problemas', 'problemas-suma-resta', 'Problemas de sumar y restar', 'Resuelve historias sencillas con sumas y restas.', 2, ['problemas', 'situaciones cotidianas', 'suma', 'resta'], ['pri-1-sumar-restar']),
  // ── PRIMARIA · 2.º
  topic('pri-2', 'numeros', 'valor-posicional', 'Centenas, decenas y unidades', 'Lee, escribe y descompón números hasta 999.', 2, ['valor posicional', 'centenas', 'decenas', 'unidades', 'descomponer', 'numeros hasta 1000'], ['pri-1-decenas-unidades']),
  topic('pri-2', 'operaciones', 'suma-llevando', 'Sumar con llevadas', 'Suma números de dos cifras cuando las unidades pasan de 9.', 2, ['suma', 'llevadas', 'reagrupar', 'sumar', 'algoritmo', 'calculo'], ['pri-1-sumar-restar', 'pri-1-decenas-unidades']),
  topic('pri-2', 'operaciones', 'resta-prestando', 'Restar con reagrupación', 'Resta números de dos cifras cuando hay que reagrupar.', 3, ['resta', 'restar', 'prestar', 'reagrupar', 'llevadas'], ['pri-2-suma-llevando']),
  topic('pri-2', 'operaciones', 'grupos-iguales', 'Multiplicar: grupos iguales', 'Entiende la multiplicación como sumar grupos iguales.', 2, ['multiplicacion', 'multiplicar', 'grupos iguales', 'suma repetida', 'tablas', 'veces'], ['pri-1-sumar-restar']),
  topic('pri-2', 'medida', 'longitud', 'Medir longitudes con regla', 'Mide con centímetros y metros.', 2, ['medidas', 'longitud', 'regla', 'centimetros', 'metros'], ['pre-5-medir-objetos']),
  topic('pri-2', 'medida', 'dinero', 'Monedas y billetes', 'Reconoce el valor del dinero y calcula cambios sencillos.', 2, ['dinero', 'monedas', 'billetes', 'cambio', 'precios'], ['pri-1-decenas-unidades']),
  topic('pri-2', 'datos', 'pictogramas', 'Leer pictogramas', 'Interpreta datos representados con dibujos.', 2, ['datos', 'pictogramas', 'graficos', 'tablas', 'estadistica', 'leer datos'], ['pri-1-comparar']),
  // ── PRIMARIA · 3.º
  topic('pri-3', 'operaciones', 'dividir-repartir', 'Dividir: repartir en partes iguales', 'Entiende la división como repartir y como formar grupos.', 2, ['division', 'dividir', 'repartir', 'reparto', 'partes iguales', 'operaciones'], ['pri-2-grupos-iguales']),
  topic('pri-3', 'operaciones', 'tablas', 'Tablas de multiplicar del 3 al 9', 'Memoriza y usa las tablas con estrategias.', 3, ['tablas de multiplicar', 'multiplicacion', 'memorizar', 'calculo mental'], ['pri-2-grupos-iguales']),
  topic('pri-3', 'operaciones', 'calculo-mental', 'Cálculo mental y estimación', 'Estima resultados y calcula mentalmente con estrategias.', 3, ['calculo mental', 'estimacion', 'redondear', 'aproximar'], ['pri-2-suma-llevando']),
  topic('pri-3', 'fracciones', 'partes-iguales', 'Fracciones: partes iguales de un todo', 'Reconoce mitades, tercios y cuartos, y lee fracciones sencillas.', 2, ['fracciones', 'partes iguales', 'mitad', 'tercio', 'cuarto', 'numerador', 'denominador'], ['pri-3-dividir-repartir']),
  topic('pri-3', 'medida', 'perimetro', 'Perímetro de figuras', 'Calcula el perímetro de rectángulos y otras figuras sumando sus lados.', 2, ['perimetro', 'medidas', 'contorno', 'lados', 'rectangulo', 'geometria'], ['pri-2-longitud']),
  topic('pri-3', 'problemas', 'problemas-multiplicacion', 'Problemas de multiplicar y dividir', 'Resuelve situaciones de grupos iguales y repartos.', 3, ['problemas', 'multiplicacion', 'division', 'situaciones cotidianas'], ['pri-3-dividir-repartir']),
  // ── PRIMARIA · 4.º
  topic('pri-4', 'numeros', 'numeros-grandes', 'Números hasta 100 000', 'Lee, escribe y compara números grandes.', 3, ['numeros grandes', 'valor posicional', 'miles', 'leer', 'escribir'], ['pri-2-valor-posicional']),
  topic('pri-4', 'operaciones', 'multiplicar-2-cifras', 'Multiplicar por números de dos cifras', 'Multiplica usando descomposición y algoritmo.', 3, ['multiplicacion', 'algoritmo', 'descomposicion', 'propiedad distributiva'], ['pri-3-tablas']),
  topic('pri-4', 'fracciones', 'equivalentes', 'Fracciones equivalentes', 'Reconoce fracciones diferentes que representan la misma cantidad.', 2, ['fracciones', 'equivalentes', 'equivalencia', 'simplificar', 'amplificar'], ['pri-3-partes-iguales']),
  topic('pri-4', 'fracciones', 'comparar-fracciones', 'Comparar fracciones', 'Compara fracciones con igual denominador o igual numerador y con la recta.', 3, ['fracciones', 'comparar', 'mayor', 'menor', 'recta numerica'], ['pri-4-equivalentes']),
  topic('pri-4', 'fracciones', 'decimos', 'Décimos y números decimales', 'Relaciona fracciones con denominador 10 y números decimales.', 2, ['decimales', 'decimos', 'numeros decimales', 'fracciones decimales', 'coma decimal'], ['pri-3-partes-iguales']),
  topic('pri-4', 'geometria', 'angulos', 'Tipos de ángulos', 'Distingue ángulos rectos, agudos y obtusos.', 2, ['angulos', 'recto', 'agudo', 'obtuso', 'grados', 'geometria'], ['pri-1-figuras']),
  topic('pri-4', 'geometria', 'simetria', 'Simetría', 'Reconoce ejes de simetría en figuras.', 2, ['simetria', 'eje de simetria', 'figuras', 'geometria'], ['pri-1-figuras']),
  topic('pri-4', 'medida', 'area', 'Área de rectángulos', 'Calcula el área de rectángulos contando cuadrados y multiplicando.', 2, ['area', 'superficie', 'rectangulo', 'cuadrados', 'medidas', 'multiplicacion'], ['pri-3-perimetro', 'pri-2-grupos-iguales']),
  topic('pri-4', 'patrones', 'patrones-numericos', 'Patrones numéricos', 'Descubre la regla de una secuencia de números.', 3, ['patrones', 'secuencias', 'regla', 'algebra', 'sucesiones'], ['pri-1-contar-saltos']),
  // ── PRIMARIA · 5.º
  topic('pri-5', 'numeros', 'divisibilidad', 'Múltiplos, divisores y divisibilidad', 'Encuentra múltiplos y divisores y usa los criterios del 2, 3, 5 y 10.', 3, ['multiplos', 'divisores', 'divisibilidad', 'criterios', 'factores'], ['pri-3-dividir-repartir', 'pri-3-tablas']),
  topic('pri-5', 'numeros', 'primos', 'Números primos y compuestos', 'Distingue números primos de compuestos buscando divisores.', 3, ['primos', 'compuestos', 'divisores', 'factores'], ['pri-5-divisibilidad']),
  topic('pri-5', 'fracciones', 'sumar-fracciones', 'Sumar y restar fracciones con igual denominador', 'Suma y resta fracciones del mismo denominador y simplifica.', 3, ['fracciones', 'suma de fracciones', 'resta de fracciones', 'igual denominador', 'operaciones'], ['pri-4-equivalentes']),
  topic('pri-5', 'fracciones', 'decimales-operaciones', 'Operar con decimales', 'Suma y resta números decimales alineando la coma.', 3, ['decimales', 'suma', 'resta', 'coma decimal', 'operaciones'], ['pri-4-decimos']),
  topic('pri-5', 'geometria', 'coordenadas', 'Coordenadas en el plano', 'Ubica y lee puntos en el primer cuadrante.', 3, ['coordenadas', 'plano cartesiano', 'puntos', 'ejes', 'geometria', 'ubicacion'], ['pri-1-figuras']),
  topic('pri-5', 'medida', 'volumen', 'Volumen y capacidad', 'Mide el espacio que ocupa un cuerpo con cubos y litros.', 3, ['volumen', 'capacidad', 'litros', 'cubos', 'medidas'], ['pri-4-area']),
  // ── PRIMARIA · 6.º
  topic('pri-6', 'numeros', 'porcentajes', 'Porcentajes introductorios', 'Entiende el porcentaje como fracción de 100 y calcula 50 %, 25 % y 10 %.', 3, ['porcentajes', 'por ciento', 'porcentaje', 'fracciones', 'proporcion'], ['pri-4-equivalentes', 'pri-4-decimos']),
  topic('pri-6', 'operaciones', 'orden-operaciones', 'Orden de las operaciones', 'Resuelve operaciones combinadas respetando la jerarquía y los paréntesis.', 3, ['operaciones combinadas', 'jerarquia', 'parentesis', 'orden de operaciones', 'calculo'], ['pri-3-tablas']),
  topic('pri-6', 'fracciones', 'multiplicar-fracciones', 'Multiplicar fracciones', 'Calcula la fracción de una cantidad y multiplica fracciones.', 3, ['fracciones', 'multiplicacion', 'fraccion de una cantidad'], ['pri-5-sumar-fracciones']),
  topic('pri-6', 'datos', 'media', 'Media aritmética', 'Calcula e interpreta la media de un conjunto de datos.', 3, ['media', 'promedio', 'estadistica', 'datos', 'aritmetica'], ['pri-2-pictogramas', 'pri-3-dividir-repartir']),
  topic('pri-6', 'datos', 'probabilidad', 'Probabilidad intuitiva', 'Describe sucesos como seguros, posibles o imposibles y compara su posibilidad.', 3, ['probabilidad', 'azar', 'posible', 'imposible', 'seguro', 'dados'], ['pri-4-equivalentes']),
  topic('pri-6', 'patrones', 'proporcionalidad', 'Razón y proporcionalidad', 'Completa tablas de proporcionalidad y resuelve problemas de razón.', 3, ['proporcionalidad', 'razon', 'proporcion', 'regla de tres', 'tablas'], ['pri-3-tablas', 'pri-4-equivalentes']),
  topic('pri-6', 'patrones', 'expresiones', 'Expresiones con letras', 'Primeros pasos del álgebra: usar una letra para un número desconocido.', 3, ['algebra', 'expresiones', 'letras', 'incognita', 'pensamiento algebraico'], ['pri-4-patrones-numericos']),
])
