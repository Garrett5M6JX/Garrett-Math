# Guía de contenido de la Biblioteca

## Modelo

`Etapa → Grado → Área → Unidad → Tema → Lección → (secciones, ejemplo resuelto, ejercicios, resumen)`

- Todos los elementos tienen un **id estable** (slug en minúsculas). Los ids de lección se usan como `lesson_id` en `learning_progress`: **no los cambies** una vez publicados o se perderá el progreso asociado.
- Los ids de lecciones heredadas de la v9 (`contar-hasta-5`, `numero-siguiente`, `sumar-juntando`, `restar-quitar`) se conservaron para no perder el progreso existente.
- El contenido es dato puro (sin JSX). La presentación vive en `components/` y `library.css`.

## Dónde editar

| Qué | Archivo |
|---|---|
| Etapas, grados, áreas, unidades | `src/library/catalog/data/structure.ts` |
| Temas (mapa curricular y prerrequisitos) | `src/library/catalog/data/topics.ts` |
| Lecciones | `lessons-preescolar.ts`, `lessons-primaria-1-3.ts`, `lessons-primaria-4-6.ts` |
| Ayudantes de escritura | `src/library/catalog/helpers.ts` |

Un tema **sin lecciones** aparece como «en preparación». Para que pase a disponible, añade al menos una lección con `topic: '<id del tema>'`.

## Escribir una lección

```ts
lesson({
  id: 'mi-leccion', topic: 'pri-3-partes-iguales', title: '…', obj: 'Objetivo…', min: 8, d: 2, tags: ['…'],
  pre: ['otra-leccion'],                       // opcional: recomendación, no bloqueo
  secs: [sec('Título', 'Texto corto…', { key: 'Idea clave', v: { kind: 'fraction', parts: 4, shaded: 1, alt: 'Descripción del dibujo' } })],
  ex: ex('Título', 'Problema', ['Paso 1', ['Paso 2', visualOpcional]], 'Respuesta'),
  exs: [
    ch('¿…?', ['a', 'b', 'c'], 1, 'Explicación', ['Pista 1', 'Pista 2'], { wrong: { 0: 'Error frecuente' } }),
    nm('Escribe…', 12, 'Explicación', ['Pista']),
    fr('Escribe a/b…', 3, 4, 'Explicación', ['Pista'], { equiv: true }),   // equiv: acepta equivalentes
    od('Ordena…', ['primero', 'segundo', 'tercero'], 'Explicación', ['Pista']),   // en el orden CORRECTO
  ],
  sum: ['Idea 1', 'Idea 2'],
})
```

Reglas (las comprueba `validateCatalog` y las pruebas):

- Cada ejercicio: enunciado, explicación y **1–3 pistas**. Opciones sin repetir; `answerIndex` válido.
- Todo visual lleva `alt` (texto alternativo).
- Un tema nunca es prerrequisito de sí mismo, ni de un grado anterior, ni forma ciclos.
- Mínimo 2 ejercicios por lección. Por defecto se completa con el 70 % correcto (redondeado hacia arriba); puedes fijar `minSolved`.
- Los ejercicios numéricos de una sola operación se verifican automáticamente en las pruebas.

Después ejecuta `npm test`. Si el catálogo es inválido, la Biblioteca muestra un error en lugar de contenido roto.

## Revisión editorial

Cada lección tiene `reviewStatus: 'borrador' | 'revisado'`. **Toda** la colección actual es `borrador` y la interfaz muestra la insignia «Borrador sin revisión docente» en las lecciones y temas que la contienen. Cuando un docente valide una lección, cámbiala a `'revisado'` y la insignia dejará de mostrarse en ella. La prueba «todo el contenido está marcado como borrador» fallará entonces a propósito: actualízala para reflejar la nueva realidad.

## Migración futura a base de datos

La aplicación solo conoce `CatalogRepository.load(): Promise<Catalog>`. Para servir el catálogo desde Supabase (u otro origen), implementa esa interfaz devolviendo un `RawCatalog` validado con `validateCatalog` y pásala a `useCatalog`. No hace falta tocar componentes.
