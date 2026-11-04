import { useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, LockKeyhole, Mail } from 'lucide-react'
import Brand from './Brand'
import { supabase } from '../services/supabase'

interface Props { mode: 'request' | 'update'; onBack: () => void }

export default function PasswordRecovery({ mode, onBack }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true); setError(''); setMessage('')
    try {
      if (!supabase) throw new Error('La recuperación de contraseña requiere que Supabase esté configurado.')
      if (mode === 'request') {
        const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + '/restablecer-contrasena',
        })
        if (requestError) throw requestError
        setMessage('Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña. Revisa también la carpeta de spam.')
      } else {
        if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.')
        const { error: updateError } = await supabase.auth.updateUser({ password })
        if (updateError) throw updateError
        setMessage('Tu contraseña fue actualizada. Ya puedes volver a iniciar sesión.')
        setPassword('')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo completar la operación.')
    } finally { setBusy(false) }
  }

  return <div className="auth-shell"><section className="auth-card">
    <Brand />
    <button className="auth-back" type="button" onClick={onBack}><ArrowLeft size={16}/> Volver al inicio de sesión</button>
    <span className="auth-kicker">SEGURIDAD DE TU CUENTA</span>
    <h1>{mode === 'request' ? 'Recupera tu acceso.' : 'Crea una contraseña nueva.'}</h1>
    <p>{mode === 'request' ? 'Te enviaremos un enlace seguro al correo asociado a Garrett Math.' : 'Elige una contraseña nueva para volver a entrar a tu espacio educativo.'}</p>
    <form className="auth-form" onSubmit={submit}>
      {mode === 'request'
        ? <label>Correo electrónico<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required placeholder="tu@correo.com"/></label>
        : <label>Nueva contraseña<input type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={8} autoComplete="new-password" required placeholder="Al menos 8 caracteres"/></label>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      {message && <p className="auth-success" role="status"><CheckCircle2 size={16}/>{message}</p>}
      <button className="auth-primary" type="submit" disabled={busy}>{busy ? 'Procesando…' : mode === 'request' ? 'Enviar enlace de recuperación' : 'Actualizar contraseña'} {mode === 'request' ? <Mail size={17}/> : <LockKeyhole size={17}/>}</button>
    </form>
  </section><footer className="auth-footer">Garrett Math · Recuperación segura de cuenta</footer></div>
}
