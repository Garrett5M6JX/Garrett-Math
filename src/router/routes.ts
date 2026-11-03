/** Rutas canónicas de Garrett Math. La sesión continúa siendo de demostración local. */
export const routes = {
  home: '/',
  login: '/iniciar-sesion',
  registerRole: '/crear-cuenta/rol',
  register: '/crear-cuenta',
  studentSetup: '/configurar-perfil',
  studentHome: '/estudiante',
  studentCourses: '/estudiante/cursos',
  studentProfile: '/perfil',
  garrettAi: '/garrett-ai',
  teacherHome: '/profesor',
  familyHome: '/familia',
} as const

export type AppRoute = typeof routes[keyof typeof routes]

export function isPrivateRoute(path: string): boolean {
  return new Set<string>([routes.studentHome, routes.studentCourses, routes.studentProfile, routes.teacherHome, routes.familyHome]).has(path)
}
