import type { ReactNode } from 'react'

export default function PublicLayout({ children, footer = 'Garrett Math v8.3 · Datos locales de demostración' }: { children: ReactNode; footer?: string }) {
  return <div className="auth-shell">{children}<footer className="auth-footer">{footer}</footer></div>
}
