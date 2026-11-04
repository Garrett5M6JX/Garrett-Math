import type { Lesson, RawCatalog } from '../library/types'
import { validateCatalog } from '../library/catalog/build'

export type LessonValidation = { valid: boolean; errors: string[] }

/** Valida la estructura pedagógica de una lección antes de guardarla en Supabase. */
export function validateLessonContent(value: unknown, base: RawCatalog, id: string, topicId: string, title: string, order: number): LessonValidation {
 const errors: string[] = []
 if (!value || typeof value !== 'object' || Array.isArray(value)) return { valid:false, errors:['El contenido de la lección debe ser un objeto JSON.'] }
 const data=value as Record<string,unknown>
 const text=(v:unknown)=>typeof v==='string'&&v.trim().length>0
 if (!text(data.objective)) errors.push('Añade un objetivo de aprendizaje.')
 if (!Number.isInteger(data.minutes)||Number(data.minutes)<1||Number(data.minutes)>240) errors.push('La duración debe ser un número entero entre 1 y 240 minutos.')
 if (!Array.isArray(data.sections)||data.sections.length===0) errors.push('Añade al menos una sección teórica.')
 if (!data.workedExample||typeof data.workedExample!=='object'||!Array.isArray((data.workedExample as any).steps)||(data.workedExample as any).steps.length===0) errors.push('Incluye un ejemplo resuelto con al menos un paso.')
 if (!Array.isArray(data.exercises)||data.exercises.length<2) errors.push('Incluye al menos dos ejercicios.')
 if (!Array.isArray(data.summary)||data.summary.length===0||!data.summary.every(text)) errors.push('Añade un resumen con al menos una idea.')
 if (!Array.isArray(data.tags)) errors.push('Las etiquetas deben ser una lista.')
 if (!['1','2','3',1,2,3].includes(data.difficulty as any)) errors.push('Selecciona una dificultad válida (1, 2 o 3).')
 if (errors.length) return { valid:false, errors }
 const candidate={...data,id,topicId,title,order} as unknown as Lesson
 const catalog:RawCatalog={...base,lessons:[...base.lessons.filter(item=>item.id!==id),candidate]}
 let catalogErrors:string[]=[]
 try { catalogErrors=validateCatalog(catalog).filter(message=>message.includes('Lección')||message.includes('Ejercicio')||message.includes('prerrequisito de lecciones')) }
 catch { catalogErrors=['La estructura interna está incompleta: revisa secciones, ejemplo resuelto y ejercicios.'] }
 return {valid:catalogErrors.length===0,errors:catalogErrors}
}
