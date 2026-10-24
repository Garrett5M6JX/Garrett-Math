import { Component, type ErrorInfo, type ReactNode } from 'react'
type Props = { children: ReactNode }
type State = { failed: boolean }
/** Fallback de interfaz para evitar una pantalla totalmente vacía ante errores de renderizado. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }
  static getDerivedStateFromError(): State { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Garrett Math render error', error, info) }
  render() {
    if (this.state.failed) return <main role="alert" style={{ maxWidth: 640, margin: '12vh auto', padding: 24, fontFamily: 'system-ui' }}><h1>Algo no salió como esperábamos</h1><p>La aplicación encontró un error al mostrar esta pantalla. Puedes recargarla; tus datos locales deberían seguir en este navegador.</p><button onClick={() => window.location.reload()}>Recargar Garrett Math</button></main>
    return this.props.children
  }
}
