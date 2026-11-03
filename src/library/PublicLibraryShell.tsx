import type { ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import Brand from '../components/Brand'
import { libRoutes } from './routes'
import { Link } from './components/ui'
import { useLocationState } from '../router/navigation'

type Props = { theme: 'light' | 'dark'; onToggleTheme: () => void; onLogin: () => void; onRegister: () => void; cloudAvailable: boolean; children: ReactNode }

/** Marco para quien explora la Biblioteca sin cuenta. El progreso es local y de demostración. */
export default function PublicLibraryShell({ theme, onToggleTheme, onLogin, onRegister, cloudAvailable, children }: Props) {
  const { pathname } = useLocationState()
  const inLearning = pathname === libRoutes.myLearning
  return (
    <div className={`lib-public ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <header className="lib-public-bar">
        <Brand subtitle="Biblioteca de matemáticas" />
        <nav className="lib-public-nav" aria-label="Navegación principal">
          <Link to={libRoutes.home}>{pathname === libRoutes.home ? <span aria-current="page">Biblioteca</span> : 'Biblioteca'}</Link>
          <Link to={libRoutes.myLearning}>{inLearning ? <span aria-current="page">Mi aprendizaje</span> : 'Mi aprendizaje'}</Link>
          <Link to="/garrett-ai">{pathname === '/garrett-ai' ? <span aria-current="page">Garrett AI</span> : 'Garrett AI'}</Link>
          <button type="button" onClick={onToggleTheme} aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}>{theme === 'light' ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}</button>
          <button type="button" onClick={onLogin}>Iniciar sesión</button>
          <button type="button" className="lib-cta" onClick={onRegister}>Crear cuenta</button>
        </nav>
      </header>
      <main className="lib-public-main">
        <p className="lib-note lib-demo-banner" role="note">Estás explorando sin cuenta. Tu progreso y los temas guardados se almacenan solo en este navegador (modo demo){cloudAvailable ? '; inicia sesión para guardarlo en tu cuenta' : ''}.</p>
        {children}
      </main>
      <footer className="auth-footer">Garrett Math V12.0.0 · Contenido de demostración, sin revisión docente</footer>
    </div>
  )
}
