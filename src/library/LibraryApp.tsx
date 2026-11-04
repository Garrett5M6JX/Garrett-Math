import { useEffect, useRef } from 'react'
import { useCatalog } from '../hooks/useCatalog'
import type { ProgressApi } from '../hooks/useProgress'
import type { FavoritesApi } from '../hooks/useFavorites'
import { useLocationState } from '../router/navigation'
import { parseLibraryPath, rememberLibraryUrl } from './routes'
import LibraryHome from './pages/LibraryHome'
import { GradePage, NotFoundPage, StagePage } from './pages/BrowsePages'
import TopicPage from './pages/TopicPage'
import LessonPage from './pages/LessonPage'
import MyLearning from './pages/MyLearning'
import InteractiveLab from './pages/InteractiveLab'
import { ErrorState, LoadingState } from './components/ui'
import './library.css'

type Props = {
  progress: ProgressApi
  favorites: FavoritesApi
  /** `true` si hay una cuenta iniciada (estudiante o docente). Un visitante usa solo datos locales de demostración. */
  signedIn: boolean
  /** Id del grado del perfil educativo (p. ej. «pri-3») para recomendar por dónde seguir. */
  preferredGradeId?: string
}

/** Contenedor de la Biblioteca: resuelve la ruta, carga el catálogo y gestiona foco y desplazamiento al navegar. */
export default function LibraryApp({ progress, favorites, signedIn, preferredGradeId: preferredGradeIdProp }: Props) {
  const location = useLocationState()
  const route = parseLibraryPath(location.pathname)
  const catalogState = useCatalog()
  const mainRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  useEffect(() => { if (route.name === 'home') rememberLibraryUrl(location.pathname + location.search) }, [route.name, location.pathname, location.search])
  // Al cambiar de página (no al filtrar), vuelve arriba y lleva el foco al contenido para lectores de pantalla y teclado.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    window.scrollTo({ top: 0, behavior: 'auto' })
    mainRef.current?.focus({ preventScroll: true })
  }, [location.pathname])

  const catalog = catalogState.status === 'ready' ? catalogState.catalog : null
  const preferredGradeId = catalog && preferredGradeIdProp && catalog.gradeById.has(preferredGradeIdProp) ? preferredGradeIdProp : undefined

  return (
    <div className="gm-lib" ref={mainRef} tabIndex={-1} id="lib-main" aria-label="Biblioteca de matemáticas">
      {catalogState.status === 'loading' && <LoadingState />}
      {catalogState.status === 'error' && <ErrorState detail={catalogState.error} onRetry={catalogState.retry} />}
      {catalog && (() => {
        switch (route.name) {
          case 'home': return <LibraryHome catalog={catalog} progress={progress} favorites={favorites} preferredGradeId={preferredGradeId} />\n          case 'lab': return <InteractiveLab />
          case 'stage': return <StagePage catalog={catalog} progress={progress} id={route.id} />
          case 'grade': return <GradePage catalog={catalog} progress={progress} id={route.id} />
          case 'topic': return <TopicPage catalog={catalog} progress={progress} favorites={favorites} id={route.id} />
          case 'lesson': return <LessonPage key={route.id} catalog={catalog} progress={progress} id={route.id} />
          case 'my-learning': return <MyLearning catalog={catalog} progress={progress} favorites={favorites} preferredGradeId={preferredGradeId} signedIn={signedIn} />
          default: return <NotFoundPage />
        }
      })()}
    </div>
  )
}
