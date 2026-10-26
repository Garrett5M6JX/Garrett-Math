import type { Catalog, Lesson, Topic } from '../types'

const isAvailable = (catalog: Catalog, topic: Topic) => (catalog.lessonsByTopic.get(topic.id)?.length ?? 0) > 0
export const areaOfTopic = (catalog: Catalog, topic: Topic) => catalog.areaById.get(catalog.unitById.get(topic.unitId)?.areaId ?? '')
export const gradeOfTopic = (catalog: Catalog, topic: Topic) => catalog.gradeById.get(catalog.unitById.get(topic.unitId)?.gradeId ?? '')

/** Tema anterior y siguiente con lecciones, dentro de la trayectoria del mismo área matemática. */
export function topicNeighbors(catalog: Catalog, topicId: string): { prev?: Topic; next?: Topic } {
  const topic = catalog.topicById.get(topicId)
  if (!topic) return {}
  const areaId = catalog.unitById.get(topic.unitId)?.areaId
  const path = areaId ? catalog.topicsByArea.get(areaId) ?? [] : []
  const index = path.findIndex((t) => t.id === topicId)
  if (index < 0) return {}
  return {
    prev: [...path.slice(0, index)].reverse().find((t) => isAvailable(catalog, t)),
    next: path.slice(index + 1).find((t) => isAvailable(catalog, t)),
  }
}
export function prerequisiteTopics(catalog: Catalog, topic: Topic): Topic[] {
  return topic.prerequisites.map((id) => catalog.topicById.get(id)).filter((t): t is Topic => Boolean(t))
}
export function dependentTopics(catalog: Catalog, topicId: string): Topic[] {
  return catalog.topics.filter((t) => t.prerequisites.includes(topicId))
}
/** Temas relacionados por etiquetas compartidas, mismo área y cercanía de grado. Prioriza temas con lecciones. */
export function relatedTopics(catalog: Catalog, topicId: string, limit = 4): Topic[] {
  const topic = catalog.topicById.get(topicId)
  if (!topic) return []
  const tags = new Set(topic.tags)
  const area = catalog.unitById.get(topic.unitId)?.areaId
  const grade = gradeOfTopic(catalog, topic)?.order ?? 0
  return catalog.topics
    .filter((t) => t.id !== topicId && isAvailable(catalog, t))
    .map((t) => {
      const shared = t.tags.filter((tag) => tags.has(tag)).length
      const sameArea = catalog.unitById.get(t.unitId)?.areaId === area ? 2 : 0
      const distance = Math.abs((gradeOfTopic(catalog, t)?.order ?? 0) - grade)
      return { t, score: shared * 3 + sameArea + (distance <= 1 ? 1 : 0) - distance * 0.1 }
    })
    .filter((x) => x.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit).map((x) => x.t)
}
export function lessonNeighbors(catalog: Catalog, lessonId: string): { prev?: Lesson; next?: Lesson; nextTopicFirst?: Lesson } {
  const lesson = catalog.lessonById.get(lessonId)
  if (!lesson) return {}
  const siblings = catalog.lessonsByTopic.get(lesson.topicId) ?? []
  const index = siblings.findIndex((l) => l.id === lessonId)
  const next = siblings[index + 1]
  const nextTopic = topicNeighbors(catalog, lesson.topicId).next
  return { prev: siblings[index - 1], next, nextTopicFirst: next ? undefined : nextTopic ? catalog.lessonsByTopic.get(nextTopic.id)?.[0] : undefined }
}
