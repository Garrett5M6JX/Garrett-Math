import { useState } from 'react'
import MultiplicationLab from '../components/MultiplicationLab'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, GripVertical, RotateCcw, Sparkles } from 'lucide-react'
import { navigateTo } from '../../router/navigation'
import { libRoutes } from '../routes'

type ShapeName = 'circle' | 'square' | 'triangle' | 'rectangle' | 'hexagon'
const INITIAL_ORDER = [8, 2, 10, 4, 6]

function NumberLineLab() {
  const [value, setValue] = useState(4)
  const [checked, setChecked] = useState(false)
  const target = 7
  const x = 34 + value * 48
  return <section className="lab-card" aria-labelledby="lab-number-title">
    <div className="lab-card-heading"><span className="lab-step">01 · RECTA NUMÉRICA</span><span className="lab-pill">Números</span></div>
    <h2 id="lab-number-title">Ubica el número</h2>
    <p>Desliza el marcador hasta el <b>{target}</b>. Observa cómo cambia su posición en la recta.</p>
    <div className="lab-line-wrap">
      <svg viewBox="0 0 548 112" role="img" aria-label={`Recta numérica del 0 al 10. Marcador en el ${value}.`} className="lab-number-svg">
        <line x1="34" y1="50" x2="514" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        {Array.from({length:11},(_,i)=><g key={i}><line x1={34+i*48} y1="42" x2={34+i*48} y2="60" stroke="currentColor" strokeWidth="2"/><text x={34+i*48} y="82" textAnchor="middle" fontSize="15" fill="currentColor">{i}</text></g>)}
        <circle cx={x} cy="50" r="13" fill="#6b62e8" stroke="white" strokeWidth="3"/>
        <path d={`M${x},31 l-7,-9 h14 z`} fill="#6b62e8"/>
      </svg>
    </div>
    <label className="lab-range-label" htmlFor="lab-number-range"><span>Tu marcador</span><strong>{value}</strong></label>
    <input id="lab-number-range" className="lab-range" type="range" min="0" max="10" step="1" value={value} onChange={e=>{setValue(Number(e.target.value));setChecked(false)}}/>
    <div className="lab-actions">
      <button className="lib-btn lib-btn-primary" type="button" onClick={()=>setChecked(true)}>Comprobar</button>
      <button className="lib-btn lib-btn-secondary" type="button" onClick={()=>{setValue(4);setChecked(false)}}><RotateCcw size={16}/> Reiniciar</button>
    </div>
    {checked && <p className={`lab-feedback ${value===target?'is-right':'is-wrong'}`} role="status">{value===target?'¡Muy bien! Has ubicado el 7.':'Todavía no. Cuenta las marcas desde el 0 e inténtalo otra vez.'}</p>}
  </section>
}

function FractionLab() {
  const [parts,setParts]=useState(4)
  const [shaded,setShaded]=useState(2)
  const [showChallenge,setShowChallenge]=useState(false)
  const challengeOk=parts===4&&shaded===3
  const changeParts=(next:number)=>{const safe=Math.max(2,Math.min(12,next));setParts(safe);setShaded(Math.min(shaded,safe));setShowChallenge(false)}
  return <section className="lab-card" aria-labelledby="lab-fraction-title">
    <div className="lab-card-heading"><span className="lab-step">02 · TALLER DE FRACCIONES</span><span className="lab-pill">Fracciones</span></div>
    <h2 id="lab-fraction-title">Construye una fracción</h2>
    <p>Elige en cuántas partes iguales divides la barra y colorea las partes que quieras representar.</p>
    <div className="lab-fraction-visual" role="img" aria-label={`Barra dividida en ${parts} partes iguales, ${shaded} coloreadas. Representa ${shaded}/${parts}.`}>
      {Array.from({length:parts},(_,i)=><span key={i} className={i<shaded?'is-shaded':''}/>)}
    </div>
    <div className="lab-fraction-result"><strong>{shaded}/{parts}</strong><span>{shaded===0?'Ninguna parte coloreada':shaded===parts?'El entero completo':`${shaded} de ${parts} partes coloreadas`}</span></div>
    <div className="lab-control-row">
      <div><span className="lab-control-label">Partes iguales</span><div className="lab-stepper"><button type="button" aria-label="Quitar una parte" disabled={parts<=2} onClick={()=>changeParts(parts-1)}>−</button><b>{parts}</b><button type="button" aria-label="Añadir una parte" disabled={parts>=12} onClick={()=>changeParts(parts+1)}>+</button></div></div>
      <div><span className="lab-control-label">Partes coloreadas</span><div className="lab-stepper"><button type="button" aria-label="Quitar una parte coloreada" disabled={shaded<=0} onClick={()=>{setShaded(shaded-1);setShowChallenge(false)}}>−</button><b>{shaded}</b><button type="button" aria-label="Colorear una parte" disabled={shaded>=parts} onClick={()=>{setShaded(shaded+1);setShowChallenge(false)}}>+</button></div></div>
    </div>
    <div className="lab-actions"><button type="button" className="lib-btn lib-btn-primary" onClick={()=>setShowChallenge(true)}>Comprobar reto</button><button type="button" className="lib-btn lib-btn-secondary" onClick={()=>{setParts(4);setShaded(2);setShowChallenge(false)}}><RotateCcw size={16}/> Reiniciar</button></div>
    {showChallenge&&<p className={`lab-feedback ${challengeOk?'is-right':'is-wrong'}`} role="status">{challengeOk?'¡Correcto! Has representado tres cuartos (3/4).':'Reto: representa tres cuartos. Necesitas 4 partes iguales y colorear 3.'}</p>}
  </section>
}

function GeometryLab() {
  const [shape,setShape]=useState<ShapeName>('square')
  const [rotation,setRotation]=useState(0)
  const data:Record<ShapeName,{label:string;sides:string;description:string}>={circle:{label:'Círculo',sides:'0 lados rectos',description:'Una figura curva sin vértices.'},square:{label:'Cuadrado',sides:'4 lados iguales',description:'Tiene cuatro lados de la misma longitud y cuatro ángulos rectos.'},triangle:{label:'Triángulo',sides:'3 lados',description:'Tiene tres lados y tres vértices.'},rectangle:{label:'Rectángulo',sides:'4 lados',description:'Tiene cuatro ángulos rectos y los lados opuestos iguales.'},hexagon:{label:'Hexágono',sides:'6 lados',description:'Tiene seis lados y seis vértices.'}}
  const polygon=(n:number,r:number)=>Array.from({length:n},(_,i)=>{const a=(Math.PI*2*i)/n-Math.PI/2;return `${100+Math.cos(a)*r},${100+Math.sin(a)*r}`}).join(' ')
  return <section className="lab-card" aria-labelledby="lab-geometry-title">
    <div className="lab-card-heading"><span className="lab-step">03 · EXPLORADOR DE FIGURAS</span><span className="lab-pill">Geometría</span></div>
    <h2 id="lab-geometry-title">Explora las figuras</h2>
    <p>Selecciona una figura y gírala. Observa sus lados, vértices y propiedades.</p>
    <div className="lab-shape-stage">
      <svg viewBox="0 0 200 200" role="img" aria-label={data[shape].label} className="lab-shape-svg">
        <g transform={`rotate(${rotation} 100 100)`} fill="#8b83f3" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
          {shape==='circle'?<circle cx="100" cy="100" r="65"/>:shape==='square'?<rect x="38" y="38" width="124" height="124" rx="3"/>:shape==='rectangle'?<rect x="20" y="55" width="160" height="90" rx="3"/>:shape==='triangle'?<polygon points={polygon(3,72)}/>:<polygon points={polygon(6,72)}/>}
        </g>
      </svg>
      <div className="lab-shape-facts"><strong>{data[shape].label}</strong><span>{data[shape].sides}</span><p>{data[shape].description}</p></div>
    </div>
    <div className="lab-shape-picker" role="group" aria-label="Elegir figura">{(Object.keys(data) as ShapeName[]).map(key=><button key={key} type="button" className={shape===key?'active':''} aria-pressed={shape===key} onClick={()=>{setShape(key);setRotation(0)}}>{data[key].label}</button>)}</div>
    <label className="lab-range-label" htmlFor="lab-rotation"><span>Girar figura</span><strong>{rotation}°</strong></label>
    <input id="lab-rotation" className="lab-range" type="range" min="0" max="360" step="15" value={rotation} onChange={e=>setRotation(Number(e.target.value))}/>
  </section>
}

function OrderLab() {
  const [items,setItems]=useState(INITIAL_ORDER)
  const [dragged,setDragged]=useState<number|null>(null)
  const [result,setResult]=useState<'right'|'wrong'|null>(null)
  const move=(from:number,to:number)=>{if(from===to)return;setItems(current=>{const next=[...current];const [item]=next.splice(from,1);next.splice(to,0,item);return next});setResult(null)}
  const check=()=>setResult(items.every((n,i)=>n===(i+1)*2)?'right':'wrong')
  return <section className="lab-card lab-order-card" aria-labelledby="lab-order-title">
    <div className="lab-card-heading"><span className="lab-step">04 · DESAFÍO DE ORDEN</span><span className="lab-pill">Razonamiento</span></div>
    <h2 id="lab-order-title">Ordena de menor a mayor</h2>
    <p>Arrastra las tarjetas para ordenarlas. Si estás usando teclado o pantalla táctil, también puedes usar las flechas.</p>
    <ol className="lab-sort-list" aria-label="Números para ordenar">{items.map((n,i)=><li key={n} draggable onDragStart={()=>setDragged(i)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragged!==null)move(dragged,i);setDragged(null)}} onDragEnd={()=>setDragged(null)} className={dragged===i?'is-dragging':''}>
      <span className="lab-drag-handle" aria-hidden="true"><GripVertical size={18}/></span><strong>{n}</strong>
      <span className="lab-sort-buttons"><button type="button" disabled={i===0} aria-label={`Mover ${n} hacia arriba`} onClick={()=>move(i,i-1)}><ArrowUp size={16}/></button><button type="button" disabled={i===items.length-1} aria-label={`Mover ${n} hacia abajo`} onClick={()=>move(i,i+1)}><ArrowDown size={16}/></button></span>
    </li>)}</ol>
    <div className="lab-actions"><button type="button" className="lib-btn lib-btn-primary" onClick={check}>Comprobar orden</button><button type="button" className="lib-btn lib-btn-secondary" onClick={()=>{setItems(INITIAL_ORDER);setResult(null)}}><RotateCcw size={16}/> Mezclar de nuevo</button></div>
    {result&&<p className={`lab-feedback ${result==='right'?'is-right':'is-wrong'}`} role="status">{result==='right'?'¡Excelente! Ordenaste los números correctamente.':'Aún no están ordenados. Recuerda que cada número debe ser mayor que el anterior.'}</p>}
  </section>
}

export default function InteractiveLab() {
  return <div className="lab-page">
    <div className="lab-breadcrumb"><button type="button" onClick={()=>navigateTo(libRoutes.home)}><ArrowLeft size={16}/> Volver a la biblioteca</button><span>Laboratorio interactivo</span></div>
    <header className="lab-hero">
      <span className="lib-kicker"><Sparkles size={14}/> APRENDE EXPERIMENTANDO</span>
      <h1>Laboratorio matemático</h1>
      <p>Prueba, mueve, construye y descubre. Aquí puedes aprender matemáticas jugando con ideas y objetos interactivos.</p>
      <div className="lab-hero-stats"><span>5 actividades</span><span>Sin límite de intentos</span><span>Para practicar a tu ritmo</span></div>
    </header>
    <div className="lab-grid">
      <NumberLineLab/><FractionLab/><GeometryLab/><OrderLab/><MultiplicationLab/>
    </div>
    <aside className="lab-next-step"><div><strong>¿Quieres seguir aprendiendo?</strong><p>Explora las lecciones y ejercicios guiados de la biblioteca.</p></div><button type="button" className="lib-btn lib-btn-primary" onClick={()=>navigateTo(libRoutes.home)}>Ver lecciones <ArrowRight size={16}/></button></aside>
  </div>
}
