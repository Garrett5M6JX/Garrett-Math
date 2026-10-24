import { ChevronDown } from 'lucide-react'

type Option = { label: string; value: string }
type CustomSelectProps = {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  className?: string
  name?: string
}

/** Selector reutilizable y estilizable. Conserva la semántica nativa y la navegación por teclado. */
export default function CustomSelect({ label, value, options, onChange, className = '', name }: CustomSelectProps) {
  return <label className={`custom-select-field ${className}`}>{label}<span className="custom-select-control"><select name={name} value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={17} aria-hidden="true" /></span></label>
}
