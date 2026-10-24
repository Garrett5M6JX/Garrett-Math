import type { ReactNode } from 'react'
import { GraduationCap, Users } from 'lucide-react'

type BrandProps = { subtitle?: string; family?: boolean; action?: ReactNode }

export default function Brand({ subtitle = 'Aprender, paso a paso', family = false, action }: BrandProps) {
  return <div className="auth-brand"><span className={`auth-brand-mark ${family ? 'parent-mark' : ''}`}>{family ? <Users size={25} /> : <GraduationCap size={27} />}</span><div><strong>Garrett <span>Math</span></strong><small>{subtitle}</small></div>{action}</div>
}
