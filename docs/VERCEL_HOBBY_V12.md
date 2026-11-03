# Informe de compatibilidad con Vercel Hobby — Garrett Math V12

## Dictamen técnico

La arquitectura propuesta es compatible con Vercel Hobby: frontend estático Vite y dos funciones serverless Node.js, sin servidores persistentes, colas ni procesos de fondo obligatorios. La función Gemini está limitada a `maxDuration: 60` y el cliente SDK usa timeout predeterminado de 45 segundos (máximo configurable de 50 segundos).

La documentación vigente de Vercel indica que Hobby admite hasta 60 segundos cuando Fluid Compute no está activo y hasta 300 segundos con Fluid Compute. La configuración elegida usa el límite conservador de 60 segundos, por lo que no depende de Vercel Pro.

## Componentes

| Componente | Ejecución | Dependencia de Pro |
|---|---|---|
| React + Vite | Build estático | No |
| `api/garrett-ai.ts` | Función Node.js serverless, máximo 60 s | No |
| `api/garrett-ai-admin.ts` | Función Node.js serverless, máximo 10 s | No |
| Supabase Auth / PostgreSQL | Servicio externo ya utilizado por el proyecto | No es una función Vercel |
| Gemini API | Servicio externo facturable/cuotas según cuenta y modelo | No |

## Límites y condiciones

- La latencia real de Gemini puede provocar timeout; el cliente muestra un error y puede volver a intentar.
- La cuota de la API Gemini y los límites de facturación son independientes de Vercel.
- Vercel Hobby está sujeto a las condiciones de uso personal/no comercial del plan; si el uso del producto pasa a ser comercial, debe revisarse la elegibilidad del plan.
- No se usa streaming en esta implementación.
- No se ejecutan procesos en segundo plano.
- El proyecto debe desplegarse en runtime Node.js para las funciones TypeScript de `api/`.

## Verificación pendiente en la cuenta Vercel

No se puede verificar el plan, región, Fluid Compute, variables ni logs del proyecto sin acceso a la cuenta del propietario. Antes de producción:
1. Confirma el plan Hobby y su uso permitido.
2. Confirma el runtime Node.js.
3. Comprueba que `maxDuration: 60` se acepta en la configuración actual.
4. Configura las variables de servidor y vuelve a desplegar.
5. Prueba una consulta real y revisa Function Logs.

## Referencias oficiales

- https://vercel.com/docs/functions/configuring-functions/duration
- https://vercel.com/docs/functions/limitations
- https://vercel.com/docs/plans/hobby
