import type { ReactNode } from 'react'

type BrandProps = { subtitle?: string; family?: boolean; action?: ReactNode }

export default function Brand({ subtitle = 'Aprender, paso a paso', family = false, action }: BrandProps) {
  return (
    <div className="auth-brand">
      <img className="althea-brand-symbol" src="/althea-mark.svg" alt="" aria-hidden="true" />
      <div><strong>Althea</strong><small>{subtitle}</small></div>
      {action}
    </div>
  )
}
