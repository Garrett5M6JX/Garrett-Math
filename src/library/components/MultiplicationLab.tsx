import { useState } from 'react'
import { RotateCcw } from 'lucide-react'

/** Práctica breve de multiplicación con factores ajustables y comprobación inmediata. */
export default function MultiplicationLab() {
  const [left, setLeft] = useState(6)
  const [right, setRight] = useState(7)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const expected = left * right
  const valid = answer.trim() !== '' && Number(answer) === expected

  const reset = () => {
    setLeft(6)
    setRight(7)
    setAnswer('')
    setChecked(false)
  }

  return (
    <section className="lab-card" aria-labelledby="lab-multiplication-title">
      <div className="lab-card-heading"><span className="lab-step">05 · TALLER DE MULTIPLICACIÓN</span><span className="lab-pill">Aritmética</span></div>
      <h2 id="lab-multiplication-title">Construye y resuelve</h2>
      <p>Modifica los factores, observa cómo cambia el producto y escribe el resultado.</p>
      <div className="lab-fraction-result" aria-live="polite">
        <strong>{left} × {right} = ?</strong>
        <span>Multiplica {left} grupos de {right} elementos.</span>
      </div>
      <div className="lab-control-row">
        <div>
          <span className="lab-control-label">Primer factor</span>
          <div className="lab-stepper">
            <button type="button" aria-label="Disminuir primer factor" disabled={left <= 1} onClick={() => { setLeft(v => v - 1); setChecked(false) }}>−</button>
            <b>{left}</b>
            <button type="button" aria-label="Aumentar primer factor" disabled={left >= 12} onClick={() => { setLeft(v => v + 1); setChecked(false) }}>+</button>
          </div>
        </div>
        <div>
          <span className="lab-control-label">Segundo factor</span>
          <div className="lab-stepper">
            <button type="button" aria-label="Disminuir segundo factor" disabled={right <= 1} onClick={() => { setRight(v => v - 1); setChecked(false) }}>−</button>
            <b>{right}</b>
            <button type="button" aria-label="Aumentar segundo factor" disabled={right >= 12} onClick={() => { setRight(v => v + 1); setChecked(false) }}>+</button>
          </div>
        </div>
      </div>
      <label className="lab-control-label" htmlFor="lab-multiplication-answer">Tu resultado</label>
      <input id="lab-multiplication-answer" className="lib-answer-input" type="number" min="1" max="144" inputMode="numeric" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false) }} placeholder="Escribe el producto" />
      <div className="lab-actions">
        <button type="button" className="lib-btn lib-btn-primary" onClick={() => setChecked(true)} disabled={answer.trim() === ''}>Comprobar</button>
        <button type="button" className="lib-btn lib-btn-secondary" onClick={reset}><RotateCcw size={16}/> Reiniciar</button>
      </div>
      {checked && <p className={`lab-feedback ${valid ? 'is-right' : 'is-wrong'}`} role="status">{valid ? '¡Correcto! Has encontrado el producto.' : `Casi. El resultado de ${left} × ${right} es ${expected}. Vuelve a intentarlo con otra combinación.`}</p>}
    </section>
  )
}
