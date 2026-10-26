import type { Catalog, Topic } from '../types'
import { aggregate, lessonsOfTopic, topicStatus, type TopicStatus } from '../logic/progress'
import { areaOfTopic, gradeOfTopic } from '../logic/navigation'
import { libRoutes } from '../routes'
import { plural } from '../format'
import type { ProgressMap } from '../types'
import { AreaChip, DifficultyChip, FavoriteButton, Link, ProgressBar, StatusChip } from './ui'

type Props = { catalog: Catalog; topic: Topic; progress: ProgressMap; favorite: boolean; onToggleFavorite: () => void; matchedLessons?: string[] }

export default function TopicCard({ catalog, topic, progress, favorite, onToggleFavorite, matchedLessons = [] }: Props) {
  const lessons = lessonsOfTopic(catalog, topic.id)
  const agg = aggregate(lessons, progress)
  const status: TopicStatus = topicStatus(agg)
  const area = areaOfTopic(catalog, topic); const grade = gradeOfTopic(catalog, topic)
  const minutes = lessons.reduce((sum, l) => sum + l.minutes, 0)
  return (
    <article className={`lib-card topic-card ${status === 'planned' ? 'is-planned' : ''}`}>
      <div className="lib-card-top">
        {area && <AreaChip areaId={area.id} icon={area.icon} name={area.name} />}
        <FavoriteButton active={favorite} onToggle={onToggleFavorite} title={topic.title} />
      </div>
      <h3><Link to={libRoutes.topic(topic.id)} className="lib-card-link">{topic.title}</Link></h3>
      <p className="lib-card-desc">{topic.description}</p>
      {matchedLessons.length > 0 && <p className="lib-match">Coincide en: {matchedLessons.slice(0, 2).join(' · ')}</p>}
      <div className="lib-card-meta"><span>{grade?.name}</span><DifficultyChip level={topic.difficulty} /></div>
      {status === 'planned'
        ? <div className="lib-card-foot"><StatusChip status="planned" /><span className="lib-muted">Sin lecciones todavía</span></div>
        : <><ProgressBar percent={agg.percent} label={`Avance en ${topic.title}`} detail={`${agg.completed} de ${plural(agg.total, 'lección', 'lecciones')} · ${minutes} min`} /><div className="lib-card-foot"><StatusChip status={status} /></div></>}
    </article>
  )
}
