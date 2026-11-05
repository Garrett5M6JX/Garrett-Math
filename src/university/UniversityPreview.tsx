import { ArrowLeft, Atom, BookOpen, Brain, Calculator, ChartNoAxesCombined, Clock3, GraduationCap, LockKeyhole, Sigma, Sparkles } from 'lucide-react'
import './university-preview.css'

type Props = { onBack: () => void; onLogin: () => void }

/** Vista informativa: no presenta asignaturas ni evaluaciones como contenido ya disponible. */
export default function UniversityPreview({ onBack, onLogin }: Props) {
  const areas = [
    { icon: Calculator, title: 'Cálculo', detail: 'Límites, continuidad, derivadas e integrales.' },
    { icon: Sigma, title: 'Álgebra lineal', detail: 'Vectores, matrices, espacios y transformaciones.' },
    { icon: Atom, title: 'Matemática discreta', detail: 'Lógica, conjuntos, combinatoria y grafos.' },
    { icon: ChartNoAxesCombined, title: 'Probabilidad y estadística', detail: 'Modelos, distribuciones e inferencia.' },
    { icon: Brain, title: 'Análisis matemático', detail: 'Rigor, sucesiones, series y demostraciones.' },
    { icon: BookOpen, title: 'Recursos académicos', detail: 'Bibliografía, guías y prácticas por asignatura.' },
  ]

  return (
    <main className="university-preview">
      <header className="university-preview-header">
        <button className="university-back" onClick={onBack}><ArrowLeft size={17} /> Volver al inicio</button>
        <span className="university-preview-status"><Sparkles size={14} /> VISTA PRELIMINAR</span>
        <button className="university-login" onClick={onLogin}>Acceder a mi cuenta</button>
      </header>

      <section className="university-hero">
        <div className="university-hero-copy">
          <span className="university-eyebrow"><GraduationCap size={16} /> APRENDIZAJE DE NIVEL SUPERIOR</span>
          <h1>Tu próximo nivel de <em>conocimiento.</em></h1>
          <p>Estamos preparando un espacio universitario para estudiar matemáticas con profundidad, conectar conceptos y comprender el porqué de cada procedimiento.</p>
          <div className="university-hero-actions">
            <button className="university-primary" onClick={onLogin}>Iniciar sesión <ArrowLeft size={16} className="university-arrow-flip" /></button>
            <span><LockKeyhole size={14} /> Contenido universitario en preparación</span>
          </div>
        </div>
        <div className="university-hero-art" aria-hidden="true">
          <div className="university-orbit orbit-a" />
          <div className="university-orbit orbit-b" />
          <div className="university-symbol"><Sigma size={76} strokeWidth={1.5} /></div>
          <span className="university-float float-pi">π</span>
          <span className="university-float float-integral">∫</span>
          <span className="university-float float-root">√x</span>
        </div>
      </section>

      <section className="university-section">
        <div className="university-section-heading">
          <span>ÁREAS DE ESTUDIO PREVISTAS</span>
          <h2>Una base para avanzar con rigor.</h2>
          <p>Estas áreas representan la estructura que estamos diseñando. No son todavía cursos publicados.</p>
        </div>
        <div className="university-area-grid">
          {areas.map(({ icon: Icon, title, detail }) => (
            <article className="university-area-card" key={title}>
              <span className="university-area-icon"><Icon size={22} /></span>
              <h3>{title}</h3>
              <p>{detail}</p>
              <span className="university-area-tag">En planificación</span>
            </article>
          ))}
        </div>
      </section>

      <section className="university-path">
        <div><span className="university-section-kicker">ESTRUCTURA ACADÉMICA</span><h2>De una ruta de aprendizaje a un programa completo.</h2><p>La futura experiencia podrá organizar carreras, asignaturas, períodos académicos, créditos, prerrequisitos, evaluaciones y recursos.</p></div>
        <div className="university-path-steps">
          {['Programa o carrera', 'Período académico', 'Asignatura', 'Unidad y lección'].map((step, index) => <div className="university-path-step" key={step}><span>{index + 1}</span>{step}</div>)}
        </div>
      </section>

      <footer className="university-preview-footer"><span>Una experiencia académica en construcción.</span><span><Clock3 size={14} /> Próximamente</span></footer>
    </main>
  )
}
