import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { starterCourses, type Lesson } from './data/curriculum'
import { stageInfo } from './data/stages'
import { LEVEL_OPTIONS, type AccountRole, type ChildProfile, type DemoAccount, type Level } from './types/models'
import CustomSelect from './components/CustomSelect'
import Brand from './components/Brand'
import { downloadBackup, restoreBackup } from './services/backup'
import { routes } from './router/routes'
import { NAVIGATE_EVENT, navigateTo } from './router/navigation'
import LibraryApp from './library/LibraryApp'
import AdminApp from './admin/AdminApp'
import PublicLibraryShell from './library/PublicLibraryShell'
import GarrettAiView from './components/garrett-ai/GarrettAiView'
import UniversityPreview from './university/UniversityPreview'
import { isLibraryPath, libRoutes } from './library/routes'
import { useCatalog } from './hooks/useCatalog'
import { useProgress } from './hooks/useProgress'
import { useFavorites } from './hooks/useFavorites'
import { aggregate, continueLesson, lessonsOfTopic, suggestNextLesson } from './library/logic/progress'
import { supabase, supabaseConfigured } from './services/supabase'
import {
  Atom, BookOpen, Brain, Calculator, Check, ChevronRight,
  Clock3, Compass, GraduationCap, House, LockKeyhole, Menu, Search,
  Settings2, Sparkles, Star, Sun, Moon, Target, Trophy, Users, X, ChevronDown, ArrowLeft, CalendarDays, NotebookPen, Medal, Layers3, Presentation, ClipboardList, FileText, Lightbulb, School, UserRound, Printer
} from 'lucide-react'

/**
 * Tarjetas de «rutas» de la pantalla de inicio. El avance NO se escribe a mano: se calcula con las lecciones
 * realmente completadas (ids de la Biblioteca para Preescolar/Primaria y del contenido heredado para Secundaria/Universidad).
 */
type RouteCard = { title: string; level: Level; subject: string; color: string; icon: typeof Calculator; libraryTopicIds?: string[]; libraryArea?: string; legacyStage?: Level; openTo?: string }
const courses: RouteCard[] = [
  { title: 'Contar y reconocer números', level: 'Preescolar', subject: 'Números y operaciones', color: 'mint', icon: Calculator, libraryTopicIds: ['pre-3-uno-dos-tres', 'pre-4-contar-5', 'pre-5-hasta-10'], openTo: libRoutes.topic('pre-4-contar-5') },
  { title: 'Sumas y restas', level: 'Primaria', subject: 'Aritmética básica', color: 'lavender', icon: Target, libraryTopicIds: ['pre-5-juntar-quitar', 'pri-1-sumar-restar', 'pri-2-suma-llevando'], openTo: libRoutes.topic('pri-1-sumar-restar') },
  { title: 'Fracciones sin miedo', level: 'Primaria', subject: 'Números racionales', color: 'peach', icon: BookOpen, libraryArea: 'fracciones', openTo: libRoutes.topic('pri-3-partes-iguales') },
  { title: 'Álgebra: primeros pasos', level: 'Secundaria', subject: 'Álgebra', color: 'blue', icon: Atom, legacyStage: 'Secundaria' },
  { title: 'Funciones y límites', level: 'Universidad', subject: 'Cálculo', color: 'pink', icon: Brain, legacyStage: 'Universidad' },
]
/** Id del grado de la Biblioteca que corresponde al perfil (los ids son pre-3…pre-5 y pri-1…pri-6). */
function libraryGradeId(stage: Level | null, year: string): string | undefined {
  const n = parseInt(year, 10)
  if (!Number.isFinite(n)) return undefined
  if (stage === 'Preescolar' && n >= 3 && n <= 5) return `pre-${n}`
  if (stage === 'Primaria' && n >= 1 && n <= 6) return `pri-${n}`
  return undefined
}

type AuthView = 'welcome' | 'role' | 'login' | 'register' | 'student-setup'
const authPath: Record<AuthView, string> = { welcome: routes.home, role: routes.registerRole, login: routes.login, register: routes.register, 'student-setup': routes.studentSetup }
function authViewFromPath(path: string): AuthView {
  if (path === '/iniciar-sesion') return 'login'
  if (path === '/crear-cuenta') return 'register'
  if (path === '/crear-cuenta/rol') return 'role'
  if (path === '/configurar-perfil') return 'student-setup'
  return 'welcome'
}
function App() {
  const [routePath, setRoutePath] = useState(() => window.location.pathname)
  const [authView, setAuthView] = useState<AuthView>(() => authViewFromPath(window.location.pathname))
  const navigate = (path: string, replace = false) => {
    if (window.location.pathname !== path) {
      if (replace) window.history.replaceState({}, '', path)
      else window.history.pushState({}, '', path)
    }
    setRoutePath(path)
  }
  const navigateAuth = (view: AuthView) => { setAuthView(view); navigate(authPath[view]) }
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname
      setRoutePath(path)
      setAuthView(authViewFromPath(path))
      setProfileOpen(path === '/perfil')
      if (path === '/profesor') setWorkspaceMode('teacher')
      if (path === '/estudiante' || path === '/estudiante/cursos') setWorkspaceMode('student')
    }
    const onNavigateEvent = () => setRoutePath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    window.addEventListener(NAVIGATE_EVENT, onNavigateEvent)
    return () => { window.removeEventListener('popstate', onPopState); window.removeEventListener(NAVIGATE_EVENT, onNavigateEvent) }
  }, [])
  useEffect(() => {
    if (routePath === routes.studentHome) { setProfileOpen(false); setSelectedStage(null); setWorkspaceMode('student') }
    if (routePath === routes.studentCourses) { setProfileOpen(false); setWorkspaceMode('student'); setSelectedStage((current) => current || (localStorage.getItem('garrett-math-stage') as Level | null)) }
    if (routePath === routes.studentProfile) setProfileOpen(true)
    if (routePath === routes.garrettAi) setProfileOpen(false)
    if (routePath === routes.teacherHome) setWorkspaceMode('teacher')
  }, [routePath])
  const [account, setAccount] = useState<DemoAccount | null>(() => { try { return JSON.parse(localStorage.getItem('garrett-math-demo-account') || 'null') as DemoAccount | null } catch { return null } })
  const [accountRole, setAccountRole] = useState<AccountRole>('student')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [ageDeclared, setAgeDeclared] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [recoveryNotice, setRecoveryNotice] = useState('')
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [recoveryBusy, setRecoveryBusy] = useState(false)
  const [recoverySessionReady, setRecoverySessionReady] = useState(false)
  const [authReady, setAuthReady] = useState(!supabaseConfigured)
  /** Id del usuario autenticado en Supabase (null en modo demo o sin sesión). Los datos solo se sincronizan con una sesión real. */
  const [authUserId, setAuthUserId] = useState<string | null>(null)
  useEffect(() => {
    if (!supabase) { setAuthReady(true); return }
    let alive = true
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase!.auth.getSession()
        if (!session?.user || !alive) { if (alive) { setAccount(null); try { localStorage.removeItem('garrett-math-demo-account') } catch { /* opcional */ }; setAuthReady(true) }; return }
        const user = session.user
        setAuthUserId(user.id)
        const { data: profile, error: profileError } = await supabase!.from('user_profiles').select('display_name, education_stage, education_year').eq('id', user.id).maybeSingle()
        if (profileError) console.error('No se pudo leer el perfil educativo (se continúa con los datos de la sesión):', profileError.message)
        if (!alive) return
        const metadata = user.user_metadata || {}
        const role: AccountRole = user.app_metadata?.assigned_role === 'teacher' ? 'teacher' : metadata.requested_role === 'parent' ? 'parent' : 'student'
        const restored: DemoAccount = { name: String(profile?.display_name || metadata.display_name || user.email?.split('@')[0] || 'Estudiante'), email: user.email || '', role, ageDeclared: Boolean(metadata.age_declaration_confirmed) }
        setAccount(restored)
        try { localStorage.setItem('garrett-math-demo-account', JSON.stringify(restored)) } catch { /* almacenamiento opcional */ }
        if (profile?.education_stage && LEVEL_OPTIONS.includes(profile.education_stage as Level)) setSelectedStage(profile.education_stage as Level)
        if (profile?.education_year) setSelectedYear(profile.education_year)
        if (role === 'parent') {
          const { data: children } = await supabase!.from('child_profiles').select('id, display_alias, education_stage, education_year').eq('guardian_id', user.id).order('created_at', { ascending: true })
          if (alive && children) setChildProfiles(children.map((child: { id: string; display_alias: string; education_stage: Level; education_year: string }) => ({ id: child.id, name: child.display_alias, stage: child.education_stage, year: child.education_year })))
        }
      } catch (error) { console.error('No se pudo restaurar la sesión de Althea:', error) }
      finally { if (alive) setAuthReady(true) }
    }
    void restoreSession()
    const { data: listener } = supabase!.auth.onAuthStateChange((event, session) => {
      setAuthUserId(session?.user?.id ?? null)
      if (event === 'PASSWORD_RECOVERY' && session?.user) setRecoverySessionReady(true)
      if (event === 'SIGNED_OUT' || !session) setRecoverySessionReady(false)
      if (!session) { setAccount(null); try { localStorage.removeItem('garrett-math-demo-account') } catch { /* opcional */ } }
    })
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [])
  const [setupStage, setSetupStage] = useState<Level>('Primaria')
  const [setupYear, setSetupYear] = useState('1.º grado')
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>(() => { try { return JSON.parse(localStorage.getItem('garrett-math-child-profiles') || '[]') as ChildProfile[] } catch { return [] } })
  const [childName, setChildName] = useState('')
  const [childStage, setChildStage] = useState<Level>('Primaria')
  const [childYear, setChildYear] = useState('1.º grado')
  const [activeLevel, setActiveLevel] = useState<Level | 'Todos'>(() => { try { return (localStorage.getItem('garrett-math-stage') as Level | null) || 'Todos' } catch { return 'Todos' } })
  const [selectedStage, setSelectedStage] = useState<Level | null>(() => { try { return (localStorage.getItem('garrett-math-stage') as Level | null) } catch { return null } })
  const [stageMenuOpen, setStageMenuOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileStage, setProfileStage] = useState<Level>('Primaria')
  const [profileYear, setProfileYear] = useState('1.º grado')
  const [profileMessage, setProfileMessage] = useState('')
  const [selectedYear, setSelectedYear] = useState(() => { try { return localStorage.getItem('garrett-math-year') || '' } catch { return '' } })
  const [openedLesson, setOpenedLesson] = useState<{ stage: Level; subject: string; year: string; lesson: Lesson } | null>(null)
  const [lessonChoice, setLessonChoice] = useState<number | null>(null)
  const [lessonChecked, setLessonChecked] = useState(false)
  const [workspaceMode, setWorkspaceMode] = useState<'student' | 'teacher'>('student')
  const [teacherStage, setTeacherStage] = useState<Level>('Primaria')
  const [teacherTopic, setTeacherTopic] = useState('Sumas y restas')
  const [worksheetGenerated, setWorksheetGenerated] = useState(false)
  const [teacherObjective, setTeacherObjective] = useState('Comprender el tema y resolver ejercicios paso a paso.')
  const [teacherMaterials, setTeacherMaterials] = useState('Cuaderno, lápiz y pizarra')
  const progress = useProgress(authUserId)
  const favorites = useFavorites(authUserId)
  const catalogState = useCatalog()
  const completedLessons = useMemo(() => Object.values(progress.map).filter((record) => record.status === 'completed').map((record) => record.lessonId), [progress.map])
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem('garrett-math-theme') === 'dark' ? 'dark' : 'light' } catch { return 'light' }
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('garrett-math-theme', theme) } catch { /* almacenamiento opcional */ }
  }, [theme])
  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [lessonOpen, setLessonOpen] = useState(false)
  const [lessonStage, setLessonStage] = useState<'intro' | 'practice' | 'result'>('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)

  const lessonQuestions = [
    { count: 2, objects: '🍎 🍎', prompt: '¿Cuántas manzanas hay?', options: [1, 2, 3], answer: 2, hint: 'Cuenta cada manzana una sola vez: una… y luego la otra.' },
    { count: 4, objects: '⭐ ⭐ ⭐ ⭐', prompt: 'Cuenta las estrellas.', options: [3, 4, 5], answer: 4, hint: 'Señala cada estrella mientras cuentas en voz alta.' },
    { count: 1, objects: '🦋', prompt: '¿Cuántas mariposas ves?', options: [1, 2, 3], answer: 1, hint: 'Aunque sea un solo objeto, también podemos contarlo.' },
    { count: 5, objects: '🐠 🐠 🐠 🐠 🐠', prompt: '¿Cuántos peces hay en el agua?', options: [4, 5, 3], answer: 5, hint: 'Cuenta de izquierda a derecha sin saltarte ningún pez.' },
    { count: 3, objects: '🌼 🌼 🌼', prompt: 'Cuenta las flores del jardín.', options: [2, 3, 4], answer: 3, hint: 'Cada flor cuenta como un objeto. ¿Qué número dices al terminar?' },
  ]

  const startLesson = () => {
    setLessonOpen(true); setLessonStage('intro'); setQuestionIndex(0); setSelectedAnswer(null); setScore(0); setAnswered(false); setMenuOpen(false)
  }
  const chooseAnswer = (answer: number) => {
    if (answered) return
    setSelectedAnswer(answer); setAnswered(true)
    if (answer === lessonQuestions[questionIndex].answer) setScore((value) => value + 1)
  }
  const nextQuestion = () => {
    if (questionIndex + 1 >= lessonQuestions.length) setLessonStage('result')
    else { setQuestionIndex((value) => value + 1); setSelectedAnswer(null); setAnswered(false) }
  }

  const lessonSequence = starterCourses.filter((course) => !openedLesson || course.stage === openedLesson.stage).flatMap((course) => course.subjects.flatMap((subject) => subject.lessons.map((lesson) => ({ stage: course.stage, subject: subject.title, year: course.name, lesson }))))
  const nextLesson = openedLesson ? (() => { const index = lessonSequence.findIndex((item) => item.lesson.id === openedLesson.lesson.id); return index >= 0 ? lessonSequence[index + 1] : undefined })() : undefined

  const isLibraryRoute = isLibraryPath(routePath)
  const libraryCatalog = catalogState.status === 'ready' ? catalogState.catalog : null
  const learnerStage = selectedStage ?? (account?.role === 'student' ? setupStage : null)
  const preferredGradeId = libraryGradeId(learnerStage, selectedYear || setupYear)
  const homeLesson = libraryCatalog ? (continueLesson(libraryCatalog, progress.map) ?? suggestNextLesson(libraryCatalog, progress.map, preferredGradeId)) : undefined
  const homeLessonIsContinuation = Boolean(homeLesson && progress.map[homeLesson.id]?.status === 'in_progress')
  /** Avance real de una tarjeta de ruta: lecciones completadas / lecciones existentes. */
  const routeStats = (card: RouteCard) => {
    let ids: string[] = []
    if (card.legacyStage) ids = starterCourses.filter((course) => course.stage === card.legacyStage).flatMap((course) => course.subjects.flatMap((subject) => subject.lessons.map((lesson) => lesson.id)))
    else if (libraryCatalog) {
      const topics = card.libraryTopicIds ? card.libraryTopicIds.map((id) => libraryCatalog.topicById.get(id)).filter((t) => t !== undefined) : (libraryCatalog.topicsByArea.get(card.libraryArea ?? '') ?? [])
      ids = topics.flatMap((topic) => lessonsOfTopic(libraryCatalog, topic.id)).map((lesson) => lesson.id)
    }
    const done = ids.filter((id) => progress.map[id]?.status === 'completed').length
    return { total: ids.length, done, percent: ids.length ? Math.round((done / ids.length) * 100) : 0 }
  }
  const librarySummary = libraryCatalog ? aggregate(libraryCatalog.lessons, progress.map) : null

  const filteredCourses = courses.filter((course) => {
    const studentStage = selectedStage || (account?.role === 'student' ? setupStage : null)
    const matchesLevel = account?.role !== 'student' && activeLevel === 'Todos' ? true : course.level === (studentStage || activeLevel)
    const matchesSearch = `${course.title} ${course.subject} ${course.level}`.toLowerCase().includes(search.toLowerCase())
    return matchesLevel && matchesSearch
  })

  const announce = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2800)
    setMenuOpen(false)
  }

  useEffect(() => { if (account?.role === 'teacher') setWorkspaceMode('teacher'); else if (account?.role === 'student') setWorkspaceMode('student'); if (window.location.pathname === '/perfil') setProfileOpen(true); if (window.location.pathname === '/estudiante/cursos') setSelectedStage((current) => current || (localStorage.getItem('garrett-math-stage') as Level | null)) }, [account?.role])
  useEffect(() => { try { if (selectedStage) localStorage.setItem('garrett-math-stage', selectedStage); else localStorage.removeItem('garrett-math-stage'); if (selectedYear) localStorage.setItem('garrett-math-year', selectedYear); else localStorage.removeItem('garrett-math-year') } catch { /* almacenamiento local opcional */ } }, [selectedStage, selectedYear])
  useEffect(() => { if (selectedStage) setProfileStage(selectedStage); if (selectedYear) setProfileYear(selectedYear) }, [selectedStage, selectedYear])
  useEffect(() => { try { localStorage.setItem('garrett-math-child-profiles', JSON.stringify(childProfiles)) } catch { /* almacenamiento local opcional */ } }, [childProfiles])
  useEffect(() => {
    if (!supabase || !account) return
    let alive = true
    const syncProfile = async () => {
      const { data: { user } } = await supabase!.auth.getUser()
      if (!user || !alive) return
      const payload = { id: user.id, display_name: account.name.slice(0, 100), education_stage: selectedStage || null, education_year: selectedYear || null, updated_at: new Date().toISOString() }
      const { error } = await supabase!.from('user_profiles').upsert(payload, { onConflict: 'id' })
      if (error) console.error('No se pudo sincronizar el perfil:', error.message)
    }
    void syncProfile()
    return () => { alive = false }
  }, [account?.name, selectedStage, selectedYear])

  useEffect(() => {
    if (!supabase || account?.role !== 'parent') return
    let alive = true
    const syncChildren = async () => {
      const { data: { user } } = await supabase!.auth.getUser()
      if (!user || !alive) return
      const localOnly = childProfiles.filter(child => typeof child.id === 'string' && child.id.startsWith('local-'))
      for (const child of localOnly) {
        const { error } = await supabase!.from('child_profiles').insert({ guardian_id: user.id, display_alias: child.name, education_stage: child.stage, education_year: child.year })
        if (error) console.error('No se pudo guardar el perfil infantil:', error.message)
      }
      const { data: updated } = await supabase!.from('child_profiles').select('id, display_alias, education_stage, education_year').eq('guardian_id', user.id).order('created_at', { ascending: true })
      if (alive && updated) setChildProfiles(updated.map((child: { id: string; display_alias: string; education_stage: Level; education_year: string }) => ({ id: child.id, name: child.display_alias, stage: child.education_stage, year: child.education_year })))
    }
    void syncChildren()
    return () => { alive = false }
  }, [account?.email, account?.role])

  const demoSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setAuthError('')
    if (!authEmail.includes('@')) { setAuthError('Escribe un correo electrónico válido.'); return }
    if (authPassword.length < 6) { setAuthError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (authView === 'register' && !authName.trim()) { setAuthError('Escribe el nombre o alias del perfil.'); return }
    if (!ageDeclared) { setAuthError('Confirma la declaración de edad para continuar.'); return }
    setAuthBusy(true)
    try {
      if (supabase) {
        if (authView === 'register') {
          const { data, error } = await supabase!.auth.signUp({
            email: authEmail.trim(), password: authPassword,
            options: { data: { display_name: authName.trim(), requested_role: accountRole, age_declaration_confirmed: ageDeclared } },
          })
          if (error) throw error
          if (!data.session) {
            setAuthError('Cuenta creada. Revisa tu correo para confirmar la dirección y luego inicia sesión.');
            setAuthView('login'); navigate(authPath.login); return
          }
        } else {
          const { error } = await supabase!.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword })
          if (error) throw error
        }
        const { data: userData } = await supabase!.auth.getUser()
        const user = userData.user
        const metadata = user?.user_metadata || {}
        const requestedRole = metadata.requested_role
        const safeRole: AccountRole = user?.app_metadata?.assigned_role === 'teacher' ? 'teacher' : requestedRole === 'parent' ? 'parent' : 'student'
        const nextAccount: DemoAccount = { name: String(metadata.display_name || authName.trim() || authEmail.split('@')[0]), email: authEmail.trim(), role: safeRole, ageDeclared: Boolean(metadata.age_declaration_confirmed ?? ageDeclared) }
        if (user) {
          const { error: profileError } = await supabase!.from('user_profiles').upsert({ id: user.id, display_name: nextAccount.name.slice(0, 100), updated_at: new Date().toISOString() }, { onConflict: 'id' })
          if (profileError) throw new Error(`La cuenta se autenticó, pero no se pudo guardar el perfil: ${profileError.message}`)
        }
        setAccount(nextAccount)
        try { localStorage.setItem('garrett-math-demo-account', JSON.stringify(nextAccount)) } catch { /* almacenamiento local opcional */ }
        if (safeRole === 'student') navigateAuth('student-setup')
        else { setWorkspaceMode(safeRole === 'teacher' ? 'teacher' : 'student'); navigate(safeRole === 'teacher' ? '/profesor' : '/familia') }
      } else {
        await new Promise(resolve => window.setTimeout(resolve, 250))
        const nextAccount: DemoAccount = { name: authName.trim() || authEmail.split('@')[0], email: authEmail.trim(), role: accountRole, ageDeclared }
        setAccount(nextAccount); try { localStorage.setItem('garrett-math-demo-account', JSON.stringify(nextAccount)) } catch { /* almacenamiento local opcional */ }
        if (accountRole === 'student') navigateAuth('student-setup')
        else { setWorkspaceMode(accountRole === 'teacher' ? 'teacher' : 'student'); navigate(accountRole === 'teacher' ? '/profesor' : '/familia') }
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'No se pudo iniciar sesión. Revisa la configuración de Supabase.')
    } finally { setAuthBusy(false) }
  }
  const sendPasswordRecovery = async () => {
    setAuthError(''); setRecoveryNotice('')
    if (!supabase) { setAuthError('La recuperación requiere una conexión activa con Supabase.'); return }
    if (!authEmail.trim() || !authEmail.includes('@')) { setAuthError('Escribe el correo de tu cuenta para enviarte el enlace de recuperación.'); return }
    setRecoveryBusy(true)
    try {
      const redirectTo = window.location.origin + '/restablecer-contrasena'
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), { redirectTo })
      if (error) throw error
      setRecoveryNotice('Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña. Revisa también la carpeta de spam.')
    } catch (error) { setAuthError(error instanceof Error ? error.message : 'No se pudo enviar el correo de recuperación.') }
    finally { setRecoveryBusy(false) }
  }
  const updateRecoveredPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setAuthError(''); setRecoveryNotice('')
    if (!supabase) { setAuthError('No hay conexión con Supabase.'); return }
    if (recoveryPassword.length < 8) { setAuthError('La nueva contraseña debe tener al menos 8 caracteres.'); return }
    setRecoveryBusy(true)
    try {
      // Supabase solo permite cambiar la clave desde una sesión válida del enlace de recuperación.
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session?.user || !recoverySessionReady) {
        throw new Error('Supabase no reconoció una sesión de recuperación válida. Solicita un enlace nuevo desde «¿Olvidaste tu contraseña?» y ábrelo en el mismo navegador.')
      }
      const { error } = await supabase.auth.updateUser({ password: recoveryPassword })
      if (error) throw error
      setRecoveryPassword('')
      setRecoverySessionReady(false)
      // El cambio de contraseña ya se completó; un fallo al cerrar sesión no debe presentarse como fallo del cambio.
      await supabase.auth.signOut().catch(() => undefined)
      setAccount(null); setAuthUserId(null)
      setRecoveryNotice('¡Contraseña actualizada correctamente! Ya puedes iniciar sesión con tu nueva contraseña.')
      navigateAuth('login')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.'
      setAuthError(message)
    } finally { setRecoveryBusy(false) }
  }
  const signOut = () => { if (supabase) void supabase!.auth.signOut(); setAccount(null); setAuthUserId(null); try { localStorage.removeItem('garrett-math-demo-account') } catch { /* almacenamiento opcional */ }; navigateAuth('welcome'); navigate('/'); setAuthError(''); setSelectedStage(null); setOpenedLesson(null); setProfileOpen(false) }
  useEffect(() => {
    if (!authReady) return
    const path = window.location.pathname
    if (path === '/admin') return
    if (!account && ['/estudiante', '/estudiante/cursos', '/perfil', '/profesor', '/familia', '/configurar-perfil'].includes(path)) navigate(routes.login, true)
    else if (account && ['/iniciar-sesion', '/crear-cuenta', '/crear-cuenta/rol', '/'].includes(path)) {
      if (account.role === 'teacher') navigate('/profesor', true)
      else if (account.role === 'parent') navigate('/familia', true)
      else if (!selectedStage) navigate('/configurar-perfil', true)
      else navigate('/estudiante', true)
    }
    if (account?.role === 'teacher' && path !== '/profesor' && path !== routes.universityPreview && !isLibraryPath(path)) navigate('/profesor', true)
    if (account?.role === 'parent' && path !== '/familia') navigate('/familia', true)
    if (account?.role === 'student' && path === '/profesor') navigate('/estudiante', true)
  }, [account, authReady, selectedStage])

  if (!authReady) return <div className="auth-shell"><div className="auth-card"><Brand /><p>Verificando tu sesión segura…</p></div></div>

  if (routePath === '/restablecer-contrasena') return <div className="auth-shell"><div className="auth-card"><Brand/><span className="auth-kicker">SEGURIDAD DE LA CUENTA</span><h1>Crear nueva contraseña</h1>{!authReady?<p>Verificando el enlace seguro de recuperación…</p>:!recoverySessionReady?<><p className="auth-error" role="alert">Este enlace no ha iniciado una sesión de recuperación válida o ya expiró.</p><p>Vuelve al inicio de sesión, selecciona «¿Olvidaste tu contraseña?» y solicita un enlace nuevo. Ábrelo en el mismo navegador donde vas a cambiar la contraseña.</p><button className="auth-primary" type="button" onClick={()=>navigateAuth('login')}>Volver al inicio de sesión <ChevronRight size={18}/></button></>:<><p>El enlace fue reconocido. Escribe una contraseña nueva para tu cuenta de Althea.</p><form className="auth-form" onSubmit={updateRecoveredPassword}><label>Nueva contraseña<input type="password" value={recoveryPassword} onChange={e=>setRecoveryPassword(e.target.value)} autoComplete="new-password" minLength={8} required placeholder="Al menos 8 caracteres"/></label>{authError&&<p className="auth-error" role="alert">{authError}</p>}<button className="auth-primary" type="submit" disabled={recoveryBusy}>{recoveryBusy?'Actualizando…':'Guardar nueva contraseña'} <ChevronRight size={18}/></button></form></>}</div></div>
  if (routePath === routes.universityPreview) return <UniversityPreview onBack={() => navigate(routes.home)} onLogin={() => navigate(routes.login)} />

  if (routePath === '/admin') return <AdminApp onExit={() => { if (account) navigate(account.role === 'teacher' ? '/profesor' : account.role === 'parent' ? '/familia' : '/estudiante'); else navigate('/iniciar-sesion') }} onNavigate={navigate} />

  if (!account && isLibraryPath(routePath)) return (
    <PublicLibraryShell theme={theme} onToggleTheme={toggleTheme} cloudAvailable={supabaseConfigured} onLogin={() => navigate(routes.login)} onRegister={() => navigate(routes.register)}>
      <LibraryApp progress={progress} favorites={favorites} signedIn={false} />
    </PublicLibraryShell>
  )

  if (!account && routePath === routes.garrettAi) return (
    <PublicLibraryShell theme={theme} onToggleTheme={toggleTheme} cloudAvailable={supabaseConfigured} onLogin={() => navigate(routes.login)} onRegister={() => navigate(routes.register)}>
      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '24px 16px' }}>
        <GarrettAiView initialStage="Primaria" onBack={() => navigate('/')} userRole="student" />
      </div>
    </PublicLibraryShell>
  )

  if (!account || authView === 'student-setup') {
    const finishStudentSetup = async () => { const year = setupYear || stageInfo[setupStage].years[0]; setSelectedStage(setupStage); setSelectedYear(year); setActiveLevel(setupStage); if (supabase) { const { data: { user } } = await supabase!.auth.getUser(); if (user) { const { error } = await supabase!.from('user_profiles').upsert({ id: user.id, display_name: account?.name?.slice(0, 100) || 'Estudiante', education_stage: setupStage, education_year: year, updated_at: new Date().toISOString() }, { onConflict: 'id' }); if (error) { setAuthError(`No se pudo guardar tu perfil: ${error.message}`); return } } } setAuthView('welcome'); navigate(routes.studentHome) }
    return <div className="auth-shell"><div className="auth-card"><Brand />
      {authView === 'student-setup' && account ? <><span className="auth-kicker">PERSONALIZA TU RECORRIDO</span><h1>¡Hola, {account.name}!</h1><p>Selecciona tu etapa y curso. Podrás revisarlos desde tu perfil.</p><CustomSelect label="Etapa educativa" value={setupStage} options={LEVEL_OPTIONS.map(x => ({ label: x, value: x }))} onChange={value => { const stage = value as Level; setSetupStage(stage); setSetupYear(stageInfo[stage].years[0]) }} /><CustomSelect label="Curso o año" value={setupYear} options={stageInfo[setupStage].years.map(x => ({ label: x, value: x }))} onChange={setSetupYear} /><button className="auth-primary" onClick={finishStudentSetup}>Entrar a mi espacio <ChevronRight size={18}/></button></> : authView === 'welcome' ? <><span className="auth-kicker">TU FUTURO EMPIEZA AQUÍ</span><h1>Las matemáticas empiezan <em>contigo.</em></h1><p>Un espacio para explorar, practicar y crecer a tu propio ritmo.</p><div className="auth-feature-list"><div><BookOpen/><span><b>Aprende por etapas</b><small>Desde preescolar hasta universidad</small></span></div><div><Target/><span><b>Practica con propósito</b><small>Lecciones y progreso sincronizado</small></span></div><div><Users/><span><b>Espacios para cada rol</b><small>Estudiantes, docentes y familias</small></span></div></div><button className="auth-primary" onClick={() => navigateAuth('role')}>Crear una cuenta <ChevronRight size={18}/></button><button className="auth-secondary" onClick={() => { navigateAuth('login'); setAccountRole('student') }}>Ya tengo una cuenta</button><p className="auth-demo-note"><LockKeyhole size={14}/> Las cuentas se guardan en Supabase cuando está configurado; si no, se usa el modo local.</p></> : authView === 'role' ? <><button className="auth-back" onClick={() => navigateAuth('welcome')}><ArrowLeft size={16}/> Volver</button><span className="auth-kicker">TIPO DE CUENTA</span><h1>¿Cómo usarás Althea?</h1><p>Elegiremos el espacio adecuado para ti.</p><div className="role-options">{([{id:'student',title:'Estudiante',desc:'Aprender y seguir mi progreso',icon:GraduationCap},{id:'teacher',title:'Profesor/a',desc:'Preparar clases y recursos',icon:Presentation},{id:'parent',title:'Representante',desc:'Administrar perfiles infantiles',icon:Users}] as const).map(r => <button key={r.id} className="role-option" onClick={() => { setAccountRole(r.id); navigateAuth('register'); setAuthError('') }}><r.icon size={23}/><span><b>{r.title}</b><small>{r.desc}</small></span><ChevronRight size={18}/></button>)}</div></> : <><button className="auth-back" onClick={() => { navigateAuth(authView === 'login' ? 'welcome' : 'role'); setAuthError('') }}><ArrowLeft size={16}/> Volver</button><span className="auth-kicker">{authView === 'register' ? 'CREAR PERFIL' : 'BIENVENIDO DE NUEVO'}</span><h1>{authView === 'register' ? 'Comencemos.' : 'Inicia sesión.'}</h1><p>{authView === 'register' ? `Cuenta de ${accountRole === 'student' ? 'estudiante' : accountRole === 'teacher' ? 'profesor/a' : 'representante'} ${supabaseConfigured ? 'con Supabase' : 'en modo local'}.` : supabaseConfigured ? 'Accede con tu cuenta de Supabase.' : 'Accede a una sesión de demostración en este dispositivo.'}</p><form onSubmit={demoSignIn} className="auth-form">{authView === 'register' && <label>Nombre o alias<input value={authName} onChange={e => setAuthName(e.target.value)} autoComplete="name" required placeholder="Cómo te llamamos"/></label>}<label>Correo electrónico<input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} autoComplete="email" required placeholder="tu@correo.com"/></label><label>{supabaseConfigured ? 'Contraseña' : 'Contraseña de demostración'}<input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} autoComplete={authView === 'login' ? 'current-password' : 'new-password'} minLength={6} required placeholder="Al menos 6 caracteres"/></label><label className="age-confirm"><input type="checkbox" checked={ageDeclared} onChange={e => setAgeDeclared(e.target.checked)}/><span>Confirmo la declaración de edad para continuar. Entiendo que esto <b>no equivale a consentimiento parental</b> ni sustituye los requisitos legales aplicables.</span></label>{authError && <p className="auth-error" role="alert">{authError}</p>}<button className="auth-primary" type="submit" disabled={authBusy}>{authBusy ? 'Procesando…' : supabaseConfigured ? (authView === 'register' ? 'Crear cuenta' : 'Iniciar sesión') : 'Continuar en modo demo'} <ChevronRight size={18}/></button></form><button className="auth-link" type="button" disabled={recoveryBusy} onClick={() => void sendPasswordRecovery()}>{recoveryBusy ? 'Enviando…' : '¿Olvidaste tu contraseña?'}</button>{recoveryNotice && <p className="auth-success" role="status">{recoveryNotice}</p>}{authError && authView !== 'register' && <p className="auth-error" role="status">{authError}</p>}<p className="auth-demo-note"><LockKeyhole size={14}/> {supabaseConfigured ? 'Autenticación mediante Supabase. Configura confirmación de correo y políticas de seguridad antes de producción.' : 'No se envían credenciales a ningún servidor.'}</p></>}
    </div><footer className="auth-footer">Althea V12.0.0 · Panel administrativo</footer></div>
  }

  if (account.role === 'parent') return <div className="auth-shell parent-shell"><div className="auth-card parent-card"><Brand family subtitle="Espacio familiar" action={<button className="auth-logout" onClick={signOut}>Cerrar sesión</button>} /><span className="auth-kicker">PERFILES EDUCATIVOS</span><h1>Hola, {account.name}</h1><p>Crea perfiles con alias; no hace falta que cada niño se registre por su cuenta.</p><form className="child-form" onSubmit={async e => { e.preventDefault(); if (!childName.trim()) return; const name = childName.trim(); if (supabase) { const { data: { user } } = await supabase!.auth.getUser(); if (!user) { setAuthError('Tu sesión ha caducado. Inicia sesión de nuevo.'); return } const { data, error } = await supabase!.from('child_profiles').insert({ guardian_id: user.id, display_alias: name.slice(0, 100), education_stage: childStage, education_year: childYear }).select('id, display_alias, education_stage, education_year').single(); if (error) { setAuthError(`No se pudo guardar el perfil infantil: ${error.message}`); return } if (data) setChildProfiles(old => [...old, { id: data.id, name: data.display_alias, stage: data.education_stage as Level, year: data.education_year }]) } else setChildProfiles(old => [...old, { id: `local-${Date.now()}`, name, stage: childStage, year: childYear }]); setChildName('') }}><label>Nombre o alias del perfil infantil<input value={childName} onChange={e => setChildName(e.target.value)} placeholder="Ej. Peque explorador" required/></label><label>Etapa<select value={childStage} onChange={e => { const stage = e.target.value as Level; setChildStage(stage); setChildYear(stageInfo[stage].years[0]) }}>{LEVEL_OPTIONS.map(x => <option key={x}>{x}</option>)}</select></label><label>Curso o año<select value={childYear} onChange={e => setChildYear(e.target.value)}>{stageInfo[childStage].years.map(x => <option key={x}>{x}</option>)}</select></label><button className="auth-primary" type="submit">Añadir perfil <Users size={17}/></button></form><h2>Perfiles de este dispositivo</h2>{childProfiles.length ? <div className="child-profile-list">{childProfiles.map(child => <article key={child.id}><div className="child-avatar"><UserRound/></div><div><b>{child.name}</b><small>{child.stage} · {child.year}</small><small>Perfil educativo</small></div><button aria-label={`Eliminar perfil ${child.name}`} onClick={async () => { if (supabase && typeof child.id === 'string' && !child.id.startsWith('local-')) { const { data: { user } } = await supabase!.auth.getUser(); if (user) { const { error } = await supabase!.from('child_profiles').delete().eq('id', child.id).eq('guardian_id', user.id); if (error) { setAuthError(`No se pudo eliminar el perfil: ${error.message}`); return } } } setChildProfiles(old => old.filter(x => x.id !== child.id)) }}><X size={17}/></button></article>)}</div> : <div className="parent-empty"><Users size={26}/><b>Aún no hay perfiles</b><span>Aquí aparecerán los perfiles educativos que agregues.</span></div>}<p className="auth-demo-note"><LockKeyhole size={14}/> Los perfiles se sincronizan con tu cuenta cuando Supabase está conectado.</p></div><footer className="auth-footer">Althea V12.0.0 · Espacio familiar</footer></div>

  if (lessonOpen) {
    const question = lessonQuestions[questionIndex]
    return (
      <div className={`lesson-shell ${theme === 'dark' ? 'theme-dark' : ''}`}>
        <header className="lesson-topbar">
          <button className="lesson-back" onClick={() => setLessonOpen(false)}><House size={17} /> Salir de la lección</button>
          <div className="lesson-brand"><img src="/althea-mark.svg" alt="" /> Althea</div>
          <span className="lesson-level-tag">PREESCOLAR</span>
        </header>
        <main className="lesson-main">
          {lessonStage !== 'result' && <div className="lesson-progress-wrap"><div className="lesson-progress-label"><span>{lessonStage === 'intro' ? 'ANTES DE EMPEZAR' : `ACTIVIDAD ${questionIndex + 1} DE ${lessonQuestions.length}`}</span><span>{lessonStage === 'intro' ? '¡Tú puedes!' : `${Math.round(((questionIndex + 1) / lessonQuestions.length) * 100)}%`}</span></div><div className="lesson-progress-track"><span style={{ width: lessonStage === 'intro' ? '0%' : `${((questionIndex + 1) / lessonQuestions.length) * 100}%` }} /></div></div>}
          {lessonStage === 'intro' && <section className="lesson-panel lesson-intro"><div className="lesson-badge"><Sparkles size={15} /> MI PRIMERA AVENTURA</div><h1>¡Vamos a contar<br/><span>del 1 al 5!</span></h1><p className="lesson-lead">Los números nos ayudan a saber cuántas cosas hay. ¡Vamos a descubrirlos juntos!</p><div className="number-ladder">{[1,2,3,4,5].map((n) => <div key={n} className={`number-card number-${n}`}><strong>{n}</strong><span>{['uno','dos','tres','cuatro','cinco'][n-1]}</span><small>{['●','● ●','● ● ●','● ● ● ●','● ● ● ● ●'][n-1]}</small></div>)}</div><div className="lesson-tip"><span className="tip-icon">✦</span><div><strong>Un consejo para contar</strong><p>Toca o señala cada objeto una sola vez. Di los números en orden y el último número te dice cuántos objetos hay.</p></div></div><button className="primary-button lesson-start-button" onClick={() => setLessonStage('practice')}>¡Empezar a practicar! <ChevronRight size={19} /></button></section>}
          {lessonStage === 'practice' && <section className="lesson-panel lesson-question-panel"><div className="question-kicker">VAMOS A PRACTICAR</div><h1>{question.prompt}</h1><p className="question-instruction">Mira con atención y elige el número correcto.</p><div className="counting-stage"><div className="object-cloud" aria-label={`${question.count} objetos`}>{question.objects}</div></div><div className="answer-options" role="group" aria-label="Opciones de respuesta">{question.options.map((option) => <button key={option} className={`answer-option ${answered && option === question.answer ? 'answer-correct' : ''} ${answered && selectedAnswer === option && option !== question.answer ? 'answer-wrong' : ''}`} onClick={() => chooseAnswer(option)} disabled={answered}><span className="answer-number">{option}</span><span>{['uno','dos','tres','cuatro','cinco'][option-1]}</span>{answered && option === question.answer && <Check size={18} />}</button>)}</div>{answered && <div className={`answer-feedback ${selectedAnswer === question.answer ? 'feedback-good' : 'feedback-help'}`} role="status"><span className="feedback-symbol">{selectedAnswer === question.answer ? '¡Muy bien!' : '¡Sigamos aprendiendo!'}</span><p>{selectedAnswer === question.answer ? `¡Exacto! Hay ${question.answer} ${question.answer === 1 ? 'objeto' : 'objetos'}. Contaste con atención.` : `La respuesta es ${question.answer}. ${question.hint}`}</p></div>}<div className="question-footer"><span><Star size={16} /> Cada intento te ayuda a aprender</span>{answered && <button className="primary-button" onClick={nextQuestion}>{questionIndex + 1 === lessonQuestions.length ? 'Ver resultado' : 'Siguiente'} <ChevronRight size={17} /></button>}</div></section>}
          {lessonStage === 'result' && <section className="lesson-panel lesson-result"><div className="result-medal"><Trophy size={44} /></div><div className="lesson-badge">LECCIÓN COMPLETADA</div><h1>¡Lo hiciste genial!</h1><p className="lesson-lead">Terminaste tu primera aventura de contar. Lo importante es seguir practicando.</p><div className="result-score"><strong>{score}<span> / {lessonQuestions.length}</span></strong><small>respuestas correctas</small></div><div className="result-message">{score === 5 ? '¡Excelente! Reconoces y cuentas grupos de objetos con mucha atención.' : score >= 3 ? '¡Buen trabajo! Ya estás aprendiendo a contar. Puedes repetir la lección para practicar un poco más.' : '¡Buen comienzo! Practicar te ayudará a reconocer mejor las cantidades. Inténtalo otra vez.'}</div><div className="result-actions"><button className="primary-button" onClick={startLesson}>Repetir la lección <Target size={17} /></button><button className="secondary-button" onClick={() => setLessonOpen(false)}>Volver al inicio</button></div></section>}
          <p className="lesson-footnote">Althea · Aprende a tu ritmo</p>
        </main>
      </div>
    )
  }

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''} ${workspaceMode === 'teacher' ? 'teacher-mode' : ''}`}>
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={23} strokeWidth={2.4} /></div>
          <div><strong>Garrett <span>Math</span></strong><small>Aprende a tu ritmo</small></div>
          <button className="mobile-close icon-button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><X size={19} /></button>
        </div>

        <div className="workspace-label">TU ESPACIO</div>
        <nav className="nav-list">
          {account.role === 'student' && <button className={`nav-item ${selectedStage === null && workspaceMode === 'student' && !isLibraryRoute && !profileOpen ? 'active' : ''}`} onClick={() => { setWorkspaceMode('student'); setSelectedStage(null); setProfileOpen(false); setMenuOpen(false); navigate(routes.studentHome) }}><House size={18} />Inicio</button>}
          {account.role === 'teacher' && <button className={`nav-item ${workspaceMode === 'teacher' && !isLibraryRoute && routePath !== routes.garrettAi ? 'active' : ''}`} onClick={() => { setWorkspaceMode('teacher'); setSelectedStage(null); setProfileOpen(false); setMenuOpen(false); navigate(routes.teacherHome) }}><Presentation size={18} />Espacio docente</button>}
          {account.role === 'teacher' && <button className={`nav-item ${routePath === libRoutes.home || routePath.startsWith(`${libRoutes.home}/`) ? 'active' : ''}`} aria-current={isLibraryRoute ? 'page' : undefined} onClick={() => { setProfileOpen(false); setMenuOpen(false); navigateTo(libRoutes.home) }}><BookOpen size={18} />Biblioteca matemática</button>}
          {account.role === 'teacher' && <button className={`nav-item ${routePath === routes.garrettAi ? 'active' : ''}`} aria-current={routePath === routes.garrettAi ? 'page' : undefined} onClick={() => { setProfileOpen(false); setMenuOpen(false); navigate(routes.garrettAi) }}><Brain size={18} />Garrett AI</button>}
          {account.role === 'student' && <button className={`nav-item ${isLibraryRoute && routePath !== libRoutes.myLearning ? 'active' : ''}`} aria-current={isLibraryRoute && routePath !== libRoutes.myLearning ? 'page' : undefined} onClick={() => { setProfileOpen(false); setMenuOpen(false); navigateTo(libRoutes.home) }}><BookOpen size={18} />Biblioteca matemática</button>}
          {account.role === 'student' && <button className={`nav-item ${routePath === routes.garrettAi ? 'active' : ''}`} aria-current={routePath === routes.garrettAi ? 'page' : undefined} onClick={() => { setProfileOpen(false); setMenuOpen(false); navigate(routes.garrettAi) }}><Brain size={18} />Garrett AI</button>}
          {account.role === 'student' && <button className={`nav-item ${routePath === libRoutes.myLearning ? 'active' : ''}`} aria-current={routePath === libRoutes.myLearning ? 'page' : undefined} onClick={() => { setProfileOpen(false); setMenuOpen(false); navigateTo(libRoutes.myLearning) }}><Trophy size={18} />Mi aprendizaje</button>}
          {account.role === 'student' && <button className={`nav-item ${profileOpen ? 'active' : ''}`} aria-current={profileOpen ? 'page' : undefined} onClick={() => { setProfileStage(selectedStage || setupStage); setProfileYear(selectedYear || setupYear); setProfileOpen(true); setMenuOpen(false); navigate(routes.studentProfile); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><UserRound size={18} />Perfil</button>}
        </nav>

        <div className="sidebar-divider" />
        <div className="workspace-label">TU APRENDIZAJE</div>
        <div className="weekly-card">
          <div className="weekly-icon"><Star size={18} fill="currentColor" /></div>
          <div className="weekly-content">
            <strong>Pequeños pasos</strong>
            <p>{librarySummary ? `${librarySummary.completed} de ${librarySummary.total} lecciones completadas.` : 'Un poco cada día hace la diferencia.'}</p>
            <div className="mini-progress" role="progressbar" aria-label="Lecciones completadas en la Biblioteca" aria-valuemin={0} aria-valuemax={100} aria-valuenow={librarySummary?.percent ?? 0}><span style={{ width: `${librarySummary?.percent ?? 0}%` }} /></div>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="profile-avatar">{workspaceMode === 'teacher' ? 'PD' : 'GM'}</div>
          <div className="profile-copy"><strong>{account.name}</strong><small>{workspaceMode === 'teacher' ? 'Profesor/a' : `${selectedStage ?? 'Estudiante'} · Demo local`}</small></div><button className="profile-logout" onClick={signOut} title="Cerrar sesión" aria-label="Cerrar sesión"><LockKeyhole size={15}/></button>
          <button className="icon-button settings-button" onClick={() => { setProfileStage(selectedStage || setupStage); setProfileYear(selectedYear || setupYear); setProfileOpen(true); setMenuOpen(false); navigate(routes.studentProfile); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label="Editar perfil educativo" title="Editar perfil educativo"><Settings2 size={18} /></button>
        </div>
      </aside>

      {menuOpen && <button className="mobile-overlay" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú"><Menu size={21} /></button>
          <div className="breadcrumb" data-route={routePath}>Mi espacio <ChevronRight size={15} /> <strong>{routePath === routes.garrettAi ? 'Garrett AI (Tutor)' : isLibraryRoute ? (routePath === libRoutes.myLearning ? 'Mi aprendizaje' : 'Biblioteca') : workspaceMode === 'teacher' ? 'Espacio docente' : profileOpen ? 'Mi perfil educativo' : selectedStage ?? 'Inicio'}</strong></div>
          <div className="topbar-actions">
            {!isLibraryRoute && <form className="search-box" role="search" onSubmit={(e) => { e.preventDefault(); const q = search.trim(); if (q) navigateTo(`${libRoutes.home}?q=${encodeURIComponent(q)}`) }}><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar un tema..." aria-label="Buscar un tema (Enter para buscar en la Biblioteca)" title="Pulsa Enter para buscar en la Biblioteca" /></form>}
            <button className={`theme-toggle ${routePath === routes.garrettAi ? 'active' : ''}`} onClick={() => { setProfileOpen(false); navigate(routes.garrettAi) }} aria-label="Abrir tutor Garrett AI" title="Abrir tutor Garrett AI"><Brain size={18} /><span>Garrett AI</span></button>
            <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'} title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}>{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}<span>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span></button>
          </div>
        </header>

        <div className="page-content">
          {routePath === routes.garrettAi ? (
            <GarrettAiView
              initialStage={selectedStage || setupStage}
              initialYear={selectedYear || setupYear}
              onBack={() => {
                if (account.role === 'teacher') navigate(routes.teacherHome)
                else navigate(routes.studentHome)
              }}
              userRole={account.role}
            />
          ) : isLibraryRoute ? (
            <LibraryApp progress={progress} favorites={favorites} signedIn preferredGradeId={preferredGradeId} />
          ) : profileOpen && account.role === 'student' ? (
            <section className="profile-page">
              <button className="back-link" onClick={() => { setProfileOpen(false); setProfileMessage(''); navigate(routes.studentHome) }}><ArrowLeft size={16} /> Volver a mi espacio</button>
              <div className="profile-hero"><div className="profile-hero-icon"><UserRound size={27}/></div><span className="section-kicker">TU CUENTA DE APRENDIZAJE</span><h1>Mi perfil educativo</h1><p>Actualiza tu etapa o grado cuando cambie tu recorrido. Podrás explorar todos los cursos de tu etapa actual.</p></div>
              <form className="profile-editor" onSubmit={e => { e.preventDefault(); setSelectedStage(profileStage); setSelectedYear(profileYear); setActiveLevel(profileStage); setSetupStage(profileStage); setSetupYear(profileYear); setProfileOpen(false); setProfileMessage(''); navigate(routes.studentHome); setNotice('Perfil educativo actualizado correctamente.'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                <label>Nombre o alias<input value={account.name} readOnly aria-describedby="profile-name-note"/></label><small id="profile-name-note" className="profile-help">El nombre de la cuenta de demostración se edita desde la configuración de cuenta en una versión futura.</small>
                <CustomSelect label="Etapa educativa" value={profileStage} options={LEVEL_OPTIONS.map(x => ({ label: x, value: x }))} onChange={value => { const next = value as Level; setProfileStage(next); setProfileYear(stageInfo[next].years[0]) }} />
                <CustomSelect label="Grado o curso actual" value={profileYear} options={stageInfo[profileStage].years.map(x => ({ label: x, value: x }))} onChange={setProfileYear} />
                <div className="profile-stage-note"><BookOpen size={18}/><span><strong>Tu etapa controla el catálogo</strong><small>Al guardar, se mostrarán los cursos de {profileStage}. Puedes explorar cualquier grado de esta etapa, no solo tu grado actual.</small></span></div>
                {profileMessage && <p role="status" className="profile-message">{profileMessage}</p>}
                <div className="profile-form-actions"><button type="button" className="secondary-button" onClick={() => { setProfileOpen(false); setProfileMessage(''); navigate(routes.studentHome) }}>Cancelar</button><button type="submit" className="primary-button"><Check size={17}/> Guardar cambios</button></div>
              </form>
              <section className="profile-backup-panel" aria-labelledby="backup-title">
                <div><span className="section-kicker">CONTROL DE TUS DATOS</span><h2 id="backup-title">Copia de seguridad local</h2><p>Exporta una copia de los perfiles, la etapa, el tema y el progreso guardados en este navegador. La copia no se envía a ningún servidor.</p></div>
                <div className="profile-form-actions"><button type="button" className="secondary-button" onClick={() => downloadBackup()}><FileText size={16}/> Descargar copia</button><label className="secondary-button backup-import-label">Restaurar copia<input type="file" accept="application/json,.json" hidden onChange={async e => { const file = e.currentTarget.files?.[0]; if (!file) return; try { await restoreBackup(file); setNotice('Copia restaurada. La aplicación se recargará.'); window.setTimeout(() => window.location.reload(), 500) } catch (error) { setNotice(error instanceof Error ? error.message : 'No se pudo restaurar la copia.') } finally { e.currentTarget.value = '' } }} /></label></div>
              </section>
              <div className="profile-note"><LockKeyhole size={17}/><p>Este perfil se guarda localmente en este navegador. Los permisos y la sincronización entre dispositivos se asegurarán al conectar autenticación y base de datos. No guardes información sensible en esta demo.</p></div>
            </section>
          ) : workspaceMode === 'teacher' ? (
            <section className="teacher-page">
              <section className="teacher-hero">
                <div className="eyebrow"><School size={16} /> ESPACIO DOCENTE</div>
                <h1>Enseñar también es <span>inspirar.</span></h1>
                <p>Prepara clases, organiza recursos y acompaña el aprendizaje matemático desde un solo lugar.</p>
                <div className="teacher-hero-actions"><button className="primary-button" onClick={() => { setTeacherTopic('Sumas y restas'); setWorksheetGenerated(false); announce('El generador de ejercicios está listo para configurar.') }}><ClipboardList size={17} /> Preparar ejercicios</button><button className="secondary-button" onClick={() => announce('Las guías docentes se irán ampliando por etapa y tema.')}><BookOpen size={17} /> Explorar guías</button></div>
              </section>
              <div className="teacher-stat-grid"><article><span className="teacher-stat-icon"><FileText size={20} /></span><div><strong>Guías de clase</strong><p>Planificaciones y explicaciones por tema</p></div></article><article><span className="teacher-stat-icon peach"><ClipboardList size={20} /></span><div><strong>Banco de ejercicios</strong><p>Actividades listas para adaptar</p></div></article><article><span className="teacher-stat-icon mint"><Users size={20} /></span><div><strong>Seguimiento del aula</strong><p>Preparado para futuras clases y grupos</p></div></article></div>
              <section className="teacher-builder">
                <div className="teacher-section-heading"><div><span className="section-kicker">HERRAMIENTA DE DEMOSTRACIÓN</span><h2>Preparar una práctica</h2><p>Selecciona una etapa y un tema para crear una pequeña hoja de ejercicios de ejemplo.</p></div></div>
                <div className="teacher-form-grid"><label>Etapa educativa<select value={teacherStage} onChange={(e) => { const next = e.target.value as Level; setTeacherStage(next); setTeacherTopic(stageInfo[next].subjects[0]); setWorksheetGenerated(false) }}>{(['Preescolar','Primaria','Secundaria','Universidad'] as Level[]).map((stage) => <option key={stage}>{stage}</option>)}</select></label><label>Tema<select value={teacherTopic} onChange={(e) => { setTeacherTopic(e.target.value); setWorksheetGenerated(false) }}>{stageInfo[teacherStage].subjects.map((topic) => <option key={topic}>{topic}</option>)}</select></label><label>Objetivo de la clase<input value={teacherObjective} onChange={(e) => setTeacherObjective(e.target.value)} placeholder="¿Qué aprenderá el grupo?" /></label><label>Materiales<input value={teacherMaterials} onChange={(e) => setTeacherMaterials(e.target.value)} placeholder="Materiales necesarios" /></label><button className="primary-button" onClick={() => setWorksheetGenerated(true)}><Sparkles size={17} /> Generar ejemplo</button></div>
                {worksheetGenerated && <div className="worksheet-preview"><div className="worksheet-title"><div><span className="section-kicker">HOJA DE PRÁCTICA · BORRADOR</span><h3>{teacherTopic}</h3><p>{teacherStage} · Material de demostración editable</p><p><strong>Objetivo:</strong> {teacherObjective}</p><p><strong>Materiales:</strong> {teacherMaterials}</p></div><button className="secondary-button" onClick={() => window.print()}><Printer size={16} /> Imprimir</button></div><ol>{(teacherStage === 'Preescolar' ? [`Cuenta 3 objetos y dibuja la cantidad.`, `¿Qué número viene después del 2?`, `Rodea el grupo que tiene más elementos.`] : teacherStage === 'Primaria' ? [`Resuelve una operación de ${teacherTopic.toLowerCase()} y explica tu estrategia.`, `Inventa un problema cotidiano que se resuelva con ${teacherTopic.toLowerCase()}.`, `Comprueba tu respuesta usando otra estrategia.`] : teacherStage === 'Secundaria' ? [`Resuelve un problema introductorio de ${teacherTopic.toLowerCase()}.`, `Explica cada paso y justifica la operación utilizada.`, `Crea un ejemplo parecido y verifica el resultado.`] : [`Define un problema introductorio de ${teacherTopic.toLowerCase()}.`, `Resuelve el problema mostrando hipótesis y procedimiento.`, `Interpreta el resultado y verifica sus condiciones.`]).map((item) => <li key={item}>{item}</li>)}</ol><p className="worksheet-disclaimer">Este borrador es una plantilla inicial, no una evaluación validada. Revísalo y adáptalo antes de utilizarlo en clase.</p></div>}
              </section>
              <section className="teacher-resource-section"><div className="teacher-section-heading"><div><span className="section-kicker">RECURSOS PARA ENSEÑAR</span><h2>Tu caja de herramientas</h2><p>La estructura inicial para futuras guías, ejercicios y recursos de aula.</p></div></div><div className="teacher-resource-grid"><button className="teacher-resource-card" onClick={() => announce('La guía didáctica se desarrollará con objetivos, conceptos previos, explicación, ejemplos y errores comunes.')}><span className="teacher-resource-icon"><BookOpen size={22}/></span><strong>Guías didácticas</strong><p>Objetivos, secuencia de clase, ejemplos y errores frecuentes.</p><span>Ver estructura <ChevronRight size={15}/></span></button><button className="teacher-resource-card" onClick={() => announce('El banco de ejercicios incluirá nivel de dificultad, solución explicada y etiquetas curriculares.')}><span className="teacher-resource-icon peach"><ClipboardList size={22}/></span><strong>Banco de ejercicios</strong><p>Problemas clasificados por tema, curso y dificultad.</p><span>Ver estructura <ChevronRight size={15}/></span></button><button className="teacher-resource-card" onClick={() => announce('La planificación de clase permitirá definir duración, materiales, actividades y evaluación.')}><span className="teacher-resource-icon mint"><CalendarDays size={22}/></span><strong>Planificador de clase</strong><p>Organiza inicio, explicación, práctica y cierre.</p><span>Ver estructura <ChevronRight size={15}/></span></button><button className="teacher-resource-card" onClick={() => announce('La sección de evaluación incluirá rúbricas, criterios y retroalimentación para estudiantes.')}><span className="teacher-resource-icon blue"><Medal size={22}/></span><strong>Evaluaciones y rúbricas</strong><p>Criterios claros para revisar comprensión y procedimientos.</p><span>Ver estructura <ChevronRight size={15}/></span></button></div></section>
              <div className="teacher-roadmap-note"><Lightbulb size={20}/><p><strong>Más adelante:</strong> perfiles de docentes, aulas virtuales, asignación de tareas, entrega de trabajos, calificaciones, seguimiento por estudiante y materiales compartidos. Estas funciones necesitarán cuentas, permisos y una base de datos segura.</p></div>
            </section>
          ) : openedLesson ? (
            <section className="content-lesson-page">
              <button className="back-link" onClick={() => { setOpenedLesson(null); setLessonChoice(null); setLessonChecked(false) }}><ArrowLeft size={16} /> Volver a {openedLesson.subject}</button>
              <div className="content-lesson-hero"><div className="eyebrow"><BookOpen size={15} /> {openedLesson.stage.toUpperCase()} · {openedLesson.year}</div><h1>{openedLesson.lesson.title}</h1><p>{openedLesson.lesson.objective}</p><div className="content-lesson-meta"><span><Clock3 size={15} /> {openedLesson.lesson.durationMinutes} minutos</span><span><Target size={15} /> Lección guiada</span>{completedLessons.includes(openedLesson.lesson.id) && <span className="completion-chip"><Check size={14}/> Completada</span>}</div></div>
              <div className="content-lesson-grid">
                <article className="content-lesson-card"><span className="section-kicker">1 · COMPRENDE LA IDEA</span><h2>Explicación</h2><p>{openedLesson.lesson.explanation}</p></article>
                <article className="content-lesson-card example-card"><span className="section-kicker">2 · MIRA UN EJEMPLO</span><h2>Ejemplo resuelto</h2><p>{openedLesson.lesson.example}</p></article>
              </div>
              <article className="content-lesson-card lesson-steps-card"><span className="section-kicker">3 · SIGUE LOS PASOS</span><h2>Cómo resolverlo</h2><ol>{openedLesson.lesson.guidedSteps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol></article>
              <article className="content-lesson-card lesson-practice-card"><span className="section-kicker">4 · COMPRUEBA LO APRENDIDO</span><h2>{openedLesson.lesson.exercise.prompt}</h2><div className="content-answer-grid">{openedLesson.lesson.exercise.options.map((option, index) => <button key={option} disabled={lessonChecked} className={`content-answer ${lessonChecked && index === openedLesson.lesson.exercise.answerIndex ? 'correct' : ''} ${lessonChecked && lessonChoice === index && index !== openedLesson.lesson.exercise.answerIndex ? 'incorrect' : ''}`} onClick={() => setLessonChoice(index)}>{option}</button>)}</div>{!lessonChecked ? <button className="primary-button" disabled={lessonChoice === null} onClick={() => { setLessonChecked(true); if (lessonChoice === openedLesson.lesson.exercise.answerIndex && !completedLessons.includes(openedLesson.lesson.id)) progress.completeSimple(openedLesson.lesson.id) }}>Comprobar respuesta <Check size={17}/></button> : <div className={`content-answer-feedback ${lessonChoice === openedLesson.lesson.exercise.answerIndex ? 'good' : 'help'}`} role="status"><strong>{lessonChoice === openedLesson.lesson.exercise.answerIndex ? '¡Muy bien!' : 'Vamos a revisarlo'}</strong><p>{openedLesson.lesson.exercise.explanation}</p><button className="secondary-button" onClick={() => { setLessonChoice(null); setLessonChecked(false) }}>Intentar de nuevo</button></div>}</article>
              {completedLessons.includes(openedLesson.lesson.id) && nextLesson && <div className="next-lesson-strip"><div><span className="section-kicker">SIGUIENTE PASO</span><strong>{nextLesson.lesson.title}</strong><p>{nextLesson.stage} · {nextLesson.year} · {nextLesson.lesson.durationMinutes} min</p></div><button className="primary-button" onClick={() => { setOpenedLesson(nextLesson); setLessonChoice(null); setLessonChecked(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Siguiente lección <ChevronRight size={17}/></button></div>}
              <div className="stage-roadmap-note"><div><NotebookPen size={20}/></div><p><strong>Contenido inicial de Althea.</strong> Las lecciones se están separando de la interfaz para que después podamos administrarlas desde una biblioteca y una base de datos. Esta muestra todavía no guarda calificaciones en una cuenta.</p></div>
            </section>
          ) : selectedStage ? (
            <section className="stage-page">
              <button className="back-link" onClick={() => { setSelectedStage(null); setSelectedYear(''); navigate(routes.studentHome) }}><ArrowLeft size={16} /> Volver al inicio</button>
              <div className="stage-hero">
                <div className="stage-hero-copy"><div className="eyebrow"><Sparkles size={15} /> TU ESPACIO DE APRENDIZAJE</div><div className="stage-heading-row"><h1>Matemáticas de <span>{selectedStage.toLowerCase()}</span></h1><span className="stage-age">{stageInfo[selectedStage].age}</span></div><p className="welcome-description">{stageInfo[selectedStage].description}</p><div className="stage-quick-stats"><span><BookOpen size={15} /> {stageInfo[selectedStage].subjects.length} áreas de estudio</span><span><Target size={15} /> A tu propio ritmo</span></div></div>
                <div className={`stage-hero-art ${stageInfo[selectedStage].color}`}><div className="stage-art-circle"><GraduationCap size={54} /></div><span className="stage-art-symbol symbol-one">＋</span><span className="stage-art-symbol symbol-two">÷</span><span className="stage-art-symbol symbol-three">π</span></div>
              </div>
              <div className="stage-year-panel"><div><span className="section-kicker">PERSONALIZA TU RECORRIDO</span><h2>¿Qué curso estás estudiando?</h2><p>Elige un año o curso para ver contenido adaptado a tu nivel.</p></div><label className="year-select-label">Curso o año<select value={selectedYear || stageInfo[selectedStage].years[0]} onChange={(e) => setSelectedYear(e.target.value)}>{stageInfo[selectedStage].years.map((year) => <option key={year}>{year}</option>)}</select></label></div>
              {(selectedStage === 'Preescolar' || selectedStage === 'Primaria') && <div className="lib-callout"><div><strong>Esta etapa ya está en la Biblioteca</strong><span>Lecciones con explicación, ejemplo resuelto y ejercicios con pistas, organizadas por grado, unidad y tema.</span></div><button type="button" className="primary-button" onClick={() => navigateTo(libraryGradeId(selectedStage, selectedYear || stageInfo[selectedStage].years[0]) ? libRoutes.grade(libraryGradeId(selectedStage, selectedYear || stageInfo[selectedStage].years[0]) as string) : libRoutes.stage(selectedStage === 'Preescolar' ? 'preescolar' : 'primaria'))}>Abrir {selectedYear || stageInfo[selectedStage].years[0]} en la Biblioteca <ChevronRight size={16} /></button></div>}
              <div className="stage-courses-heading"><div><span className="section-kicker">TODOS LOS CURSOS DE {selectedStage.toUpperCase()}</span><h2>Explora tu etapa completa</h2><p>Tu grado actual está guardado en el perfil, pero puedes entrar a cualquier otro curso de esta misma etapa.</p></div></div>
              <div className="stage-course-grid">{stageInfo[selectedStage].years.map((year, index) => <button type="button" key={year} className={`stage-course-card ${selectedYear === year ? 'current' : ''}`} onClick={() => setSelectedYear(year)}><span className="stage-course-number">{String(index + 1).padStart(2, '0')}</span><span className="stage-course-copy"><strong>{year}</strong><small>{selectedYear === year ? 'Curso seleccionado' : 'Explorar contenidos'}</small></span><ChevronRight size={18}/></button>)}</div>
              <div className="stage-section-heading"><div><span className="section-kicker">TU PLAN DE ESTUDIO</span><h2>Explora las áreas matemáticas</h2><p>Elige un tema para descubrir sus lecciones y actividades.</p></div></div>
              <div className="subject-grid">{stageInfo[selectedStage].subjects.map((subject, index) => { const SubjectIcon = [Calculator, Atom, Target, BookOpen, Brain, Compass][index % 6]; return <article className="subject-card" key={subject}><div className={`subject-icon ${stageInfo[selectedStage].color}`}><SubjectIcon size={22} /></div><div className="subject-card-copy"><span>ÁREA {String(index + 1).padStart(2, '0')}</span><h3>{subject}</h3><p>{index === 0 ? 'Empieza por los conceptos esenciales y avanza con ejemplos guiados.' : 'Teoría, ejemplos resueltos y ejercicios de práctica estarán organizados aquí.'}</p></div><button aria-label={`Explorar ${subject}`} onClick={() => { const libGrade = (selectedStage === 'Preescolar' || selectedStage === 'Primaria') ? libraryGradeId(selectedStage, selectedYear || stageInfo[selectedStage].years[0]) : undefined; if (libGrade) { navigateTo(libRoutes.grade(libGrade)); return } const course = starterCourses.find((item) => item.stage === selectedStage && item.name === (selectedYear || stageInfo[selectedStage].years[0])); const lessonSubject = course?.subjects.find((item) => item.title.toLowerCase() === subject.toLowerCase() || item.title.toLowerCase().includes(subject.toLowerCase()) || subject.toLowerCase().includes(item.title.toLowerCase())); const lesson = lessonSubject?.lessons[0]; if (lesson && course) { setOpenedLesson({ stage: selectedStage, subject, year: selectedYear || course.name, lesson }); setLessonChoice(null); setLessonChecked(false); window.scrollTo({ top: 0, behavior: 'smooth' }) } else { announce(`«${subject}» está en el plan de contenidos. Para Secundaria y Universidad esta versión solo incluye una lección de muestra por curso.`) } }}><ChevronRight size={18} /></button></article> })}</div>
              <div className="stage-bottom-grid"><article className="stage-goal-card"><div className="stage-card-icon"><Target size={21} /></div><div><span className="section-kicker">OBJETIVO DE ESTA ETAPA</span><h3>¿Qué vas a aprender?</h3><p>{stageInfo[selectedStage].goal}</p></div></article><article className="stage-study-card"><div className="stage-card-icon"><CalendarDays size={21} /></div><div><span className="section-kicker">RUTINA SUGERIDA</span><h3>Pequeños pasos, grandes avances</h3><p>Prueba sesiones cortas y regulares. Tu progreso se podrá guardar en tu perfil cuando activemos las cuentas.</p></div></article></div>
              <div className="stage-roadmap-note"><div><NotebookPen size={20} /></div><p><strong>Una ruta que crece contigo.</strong> Cada área tendrá explicaciones, ejemplos resueltos, ejercicios con pistas, evaluaciones y recomendaciones según tus avances.</p></div>
            </section>
          ) : (
          <>
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><Sparkles size={15} /> TU CAMINO DE APRENDIZAJE</div>
              <h1>Las matemáticas<br className="mobile-break" /> empiezan <span>contigo.</span></h1>
              <p className="welcome-description">Explora, practica y descubre que puedes llegar mucho más lejos de lo que imaginas.</p>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <div className="math-tile tile-plus">+</div><div className="math-tile tile-equals">=</div>
              <div className="math-tile tile-pi">π</div><div className="math-tile tile-root">√</div>
              <div className="art-center"><GraduationCap size={51} strokeWidth={1.7} /></div>
              <span className="sparkle sparkle-a">✦</span><span className="sparkle sparkle-b">✳</span>
            </div>
          </section>

          <section className="stats-grid" aria-label="Resumen de aprendizaje">
            <div className="stat-card"><div className="stat-icon stat-mint"><BookOpen size={20} /></div><div><span>Biblioteca</span><strong>{librarySummary ? `${librarySummary.total} lecciones` : 'Cargando…'}</strong><small>Preescolar y Primaria (borrador)</small></div></div>
            <div className="stat-card"><div className="stat-icon stat-purple"><Target size={20} /></div><div><span>Tu avance</span><strong>{librarySummary ? `${librarySummary.completed} completadas` : '—'}</strong><small>Solo cuentan las lecciones terminadas</small></div></div>
            <div className="stat-card"><div className="stat-icon stat-yellow"><Star size={20} /></div><div><span>Siguiente paso</span><strong>{homeLesson ? (homeLessonIsContinuation ? 'Continuar' : 'Empezar') : 'Explorar'}</strong><small>{homeLesson ? homeLesson.title : 'Busca un tema en la Biblioteca'}</small></div></div>
          </section>

          <section className="continue-card">
            <div className="continue-illustration"><div className="book-shape"><BookOpen size={38} /></div><span className="floating-number">1 2 3</span><span className="floating-dot dot-one" /><span className="floating-dot dot-two" /></div>
            <div className="continue-copy"><span className="section-kicker">{homeLesson ? (homeLessonIsContinuation ? 'CONTINÚA DONDE LO DEJASTE' : 'RECOMENDADO PARA TI') : 'EXPLORA LA BIBLIOTECA'}</span><h2>{homeLesson ? homeLesson.title : 'Descubre temas, lecciones y práctica'}</h2><p>{homeLesson ? homeLesson.objective : 'Busca por concepto o recorre los temas por etapa, grado y área matemática.'}</p>{homeLesson && <div className="lesson-meta"><span><BookOpen size={15} /> {homeLesson.exercises.length} ejercicios</span><span><Clock3 size={15} /> {homeLesson.minutes} min</span></div>}</div>
            <button className="primary-button continue-button" onClick={() => navigateTo(homeLesson ? libRoutes.lesson(homeLesson.id) : libRoutes.home)}>{homeLesson ? (homeLessonIsContinuation ? 'Continuar lección' : 'Comenzar lección') : 'Abrir la Biblioteca'} <ChevronRight size={18} /></button>
          </section>
          <section className="quick-activity" aria-label="Práctica rápida"><div><strong>Práctica rápida: contar hasta 5</strong><span>Actividad breve de Preescolar. No guarda progreso.</span></div><button type="button" className="secondary-button" onClick={startLesson}>Probar</button></section>

          <section className="courses-section">
            <div className="section-heading"><div><span className="section-kicker">UN MUNDO POR DESCUBRIR</span><h2>Explora las rutas matemáticas</h2><p>Entra en una etapa para encontrar cursos y contenidos pensados para tu nivel.</p></div><button className="text-button" onClick={() => { setActiveLevel('Todos'); setShowAll(!showAll); }}>{showAll ? 'Ver selección' : 'Ver todas'} <ChevronRight size={16} /></button></div>
            <div className="course-grid">
              {filteredCourses.map((course) => {
                const Icon = course.icon
                const stats = routeStats(course)
                return <article className="course-card" key={course.title}>
                  <div className={`course-art ${course.color}`}><div className="course-art-icon"><Icon size={29} strokeWidth={1.8} /></div><span className="course-level">{course.level}</span></div>
                  <div className="course-body"><span className="course-subject">{course.subject}</span><h3>{course.title}</h3><div className="course-progress-label"><span>{stats.percent ? `${stats.percent}% completado` : 'Aún por comenzar'}</span><span>{stats.total ? `${stats.done}/${stats.total}` : ''}</span></div><div className="course-progress" role="progressbar" aria-label={`Avance en ${course.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.percent}><span style={{ width: `${stats.percent}%` }} /></div><button className="course-link" onClick={() => { if (course.openTo) { navigateTo(course.openTo); return } setSelectedStage(course.level as Level); setSelectedYear(stageInfo[course.level as Level].years[0]); setStageMenuOpen(true); navigate(routes.studentCourses); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>{stats.done > 0 ? 'Continuar ruta' : course.openTo ? 'Abrir en la Biblioteca' : 'Explorar etapa'} <ChevronRight size={16} /></button></div>
                </article>
              })}
              {filteredCourses.length === 0 && <div className="empty-state"><Search size={25} /><strong>No encontramos ese tema</strong><span>Prueba con otra palabra o elige otro nivel.</span></div>}
            </div>
          </section>

          <section className="future-banner"><div className="future-icon"><Brain size={23} /></div><div><strong>Aprender con ayuda, cuando la necesites.</strong><p>Estamos preparando un tutor que pueda explicarte los ejercicios paso a paso.</p></div><span className="future-pill"><LockKeyhole size={13} /> Próximamente</span></section>
          <footer className="footer"><span>© 2026 Althea · Nombre provisional</span><span>Aprender es un proceso, no una carrera. <span className="footer-heart">♥</span></span></footer>
          </>
          )}
        </div>
      </main>

      {notice && <div className="toast" role="status"><Check size={17} />{notice}</div>}
    </div>
  )
}

export default App
