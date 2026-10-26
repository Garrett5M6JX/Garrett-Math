import type { ReactNode } from 'react'
import type { ColorKey, ShapeKey, VisualSpec } from '../types'

const FILL: Record<ColorKey, string> = { rojo: '#e5484d', azul: '#3b82f6', verde: '#2f9e44', amarillo: '#f5b50a', morado: '#8b5cf6', naranja: '#f97316' }
const COLOR_NAMES = Object.keys(FILL) as ColorKey[]
const SHAPE_NAMES: ShapeKey[] = ['circulo', 'cuadrado', 'triangulo', 'estrella', 'rombo']
const INK = 'var(--vis-ink, #20243a)'

/** Dibuja una figura centrada en (cx, cy) con "radio" r. La forma, no solo el color, distingue cada elemento. */
function Glyph({ shape, color, cx, cy, r }: { shape: ShapeKey; color: ColorKey; cx: number; cy: number; r: number }) {
  const common = { fill: FILL[color], stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' as const }
  switch (shape) {
    case 'cuadrado': return <rect x={cx - r * 0.85} y={cy - r * 0.85} width={r * 1.7} height={r * 1.7} rx={3} {...common} />
    case 'triangulo': return <polygon points={`${cx},${cy - r} ${cx + r},${cy + r * 0.85} ${cx - r},${cy + r * 0.85}`} {...common} />
    case 'rombo': return <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} {...common} />
    case 'estrella': {
      const pts = Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2; const rad = i % 2 === 0 ? r : r * 0.45; return `${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}` }).join(' ')
      return <polygon points={pts} {...common} />
    }
    default: return <circle cx={cx} cy={cy} r={r * 0.9} {...common} />
  }
}
const asShape = (name: string): ShapeKey | null => (SHAPE_NAMES as string[]).includes(name) ? name as ShapeKey : null
const asColor = (name: string): ColorKey | null => (COLOR_NAMES as string[]).includes(name) ? name as ColorKey : null

function Frame({ w, h, alt, children }: { w: number; h: number; alt: string; children: ReactNode }) {
  return <figure className="vis"><svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={alt} style={{ maxWidth: Math.min(w, 520) }}><title>{alt}</title>{children}</svg></figure>
}

function Counters({ spec }: { spec: Extract<VisualSpec, { kind: 'counters' }> }) {
  const cell = 44; const perRow = 10; const groupGap = 22
  const items: { x: number; y: number; shape: ShapeKey; color: ColorKey; crossed: boolean }[] = []
  let col = 0; let row = 0; let extra = 0
  spec.groups.forEach((group, gi) => {
    if (gi > 0) { extra += groupGap }
    for (let i = 0; i < group.count; i++) {
      if (col >= perRow) { col = 0; row++; extra = 0 }
      const crossed = gi === 0 && spec.crossed !== undefined && i >= group.count - spec.crossed
      items.push({ x: 26 + col * cell + extra, y: 26 + row * cell, shape: group.shape ?? 'circulo', color: group.color ?? 'azul', crossed })
      col++
    }
  })
  const width = Math.max(...items.map((i) => i.x), 26) + 30
  const height = Math.max(...items.map((i) => i.y), 26) + 30
  return <Frame w={width} h={height} alt={spec.alt}>{items.map((it, i) => <g key={i}><Glyph shape={it.shape} color={it.color} cx={it.x} cy={it.y} r={17} />{it.crossed && <path d={`M${it.x - 16},${it.y - 16} L${it.x + 16},${it.y + 16} M${it.x + 16},${it.y - 16} L${it.x - 16},${it.y + 16}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />}</g>)}</Frame>
}
function TenFrame({ spec }: { spec: Extract<VisualSpec, { kind: 'tenFrame' }> }) {
  return <Frame w={290} h={130} alt={spec.alt}>{Array.from({ length: 10 }, (_, i) => { const x = 10 + (i % 5) * 54; const y = 10 + Math.floor(i / 5) * 56; return <g key={i}><rect x={x} y={y} width={50} height={50} rx={6} fill="var(--vis-cell, #fff)" stroke={INK} strokeWidth={2} />{i < spec.filled && <circle cx={x + 25} cy={y + 25} r={16} fill={FILL.azul} stroke={INK} strokeWidth={2} />}</g> })}</Frame>
}
function NumberLine({ spec }: { spec: Extract<VisualSpec, { kind: 'numberLine' }> }) {
  const { from, to } = spec; const step = spec.step ?? 1; const w = 620; const x0 = 30; const x1 = w - 30
  const pos = (n: number) => x0 + ((n - from) / (to - from)) * (x1 - x0)
  const ticks: number[] = []; for (let n = from; n <= to; n += step) ticks.push(n)
  const labelEvery = ticks.length > 14 ? 2 : 1
  return <Frame w={w} h={130} alt={spec.alt}>
    <line x1={x0 - 10} y1={80} x2={x1 + 10} y2={80} stroke={INK} strokeWidth={3} strokeLinecap="round" />
    {ticks.map((n, i) => <g key={n}><line x1={pos(n)} y1={72} x2={pos(n)} y2={88} stroke={INK} strokeWidth={2} />{i % labelEvery === 0 && <text x={pos(n)} y={110} textAnchor="middle" fontSize={16} fontWeight={700} fill={INK}>{n}</text>}</g>)}
    {(spec.highlight ?? []).map((n) => <circle key={`h${n}`} cx={pos(n)} cy={80} r={9} fill={FILL.morado} stroke={INK} strokeWidth={2} />)}
    {(spec.jumps ?? []).map((j, i) => { const a = pos(j.from); const b = pos(j.to); const mid = (a + b) / 2; return <g key={i}><path d={`M${a},68 Q${mid},${68 - Math.min(48, Math.abs(b - a) / 2)} ${b},68`} fill="none" stroke={FILL.rojo} strokeWidth={3} /><polygon points={`${b},70 ${b - 7},58 ${b + 5},60`} fill={FILL.rojo} /></g> })}
  </Frame>
}
function ShapeVis({ spec }: { spec: Extract<VisualSpec, { kind: 'shape' }> }) {
  const fill = FILL[spec.color ?? 'azul']; const p = { fill, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const }
  const poly = (n: number, r: number) => Array.from({ length: n }, (_, i) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return `${(80 + Math.cos(a) * r).toFixed(1)},${(80 + Math.sin(a) * r).toFixed(1)}` }).join(' ')
  return <Frame w={160} h={160} alt={spec.alt}>{spec.shape === 'circulo' ? <circle cx={80} cy={80} r={60} {...p} /> : spec.shape === 'cuadrado' ? <rect x={25} y={25} width={110} height={110} rx={4} {...p} /> : spec.shape === 'rectangulo' ? <rect x={12} y={40} width={136} height={80} rx={4} {...p} /> : spec.shape === 'triangulo' ? <polygon points="80,18 142,134 18,134" {...p} /> : spec.shape === 'pentagono' ? <polygon points={poly(5, 66)} {...p} /> : <polygon points={poly(6, 66)} {...p} />}</Frame>
}
function PatternVis({ spec }: { spec: Extract<VisualSpec, { kind: 'pattern' }> }) {
  const cell = 58; const w = spec.items.length * cell + 14
  return <Frame w={w} h={84} alt={spec.alt}>{spec.items.map((item, i) => {
    const x = 10 + i * cell + cell / 2 - 4; const cx = x; const cy = 42
    if (item === '?') return <g key={i}><rect x={cx - 24} y={cy - 24} width={48} height={48} rx={8} fill="none" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" /><text x={cx} y={cy + 8} textAnchor="middle" fontSize={24} fontWeight={800} fill={INK}>?</text></g>
    const shape = asShape(item); const color = asColor(item)
    if (shape) return <Glyph key={i} shape={shape} color="azul" cx={cx} cy={cy} r={20} />
    if (color) return <circle key={i} cx={cx} cy={cy} r={20} fill={FILL[color]} stroke={INK} strokeWidth={2} />
    return <g key={i}><rect x={cx - 22} y={cy - 22} width={44} height={44} rx={8} fill="var(--vis-cell, #fff)" stroke={INK} strokeWidth={2} /><text x={cx} y={cy + 7} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK}>{item}</text></g>
  })}</Frame>
}
function FractionVis({ spec }: { spec: Extract<VisualSpec, { kind: 'fraction' }> }) {
  const { parts, shaded } = spec
  if (spec.form === 'circulo') {
    const r = 70; const c = 80
    return <Frame w={160} h={160} alt={spec.alt}>{Array.from({ length: parts }, (_, i) => {
      const a0 = (Math.PI * 2 * i) / parts - Math.PI / 2; const a1 = (Math.PI * 2 * (i + 1)) / parts - Math.PI / 2
      const d = parts === 1 ? `M${c - r},${c} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0` : `M${c},${c} L${c + r * Math.cos(a0)},${c + r * Math.sin(a0)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${c + r * Math.cos(a1)},${c + r * Math.sin(a1)} Z`
      return <path key={i} d={d} fill={i < shaded ? FILL.morado : 'var(--vis-cell, #fff)'} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    })}</Frame>
  }
  const w = 360; const cw = (w - 20) / parts
  return <Frame w={w} h={80} alt={spec.alt}>{Array.from({ length: parts }, (_, i) => <rect key={i} x={10 + i * cw} y={14} width={cw} height={52} fill={i < shaded ? FILL.morado : 'var(--vis-cell, #fff)'} stroke={INK} strokeWidth={2.5} />)}</Frame>
}
function PlaceValue({ spec }: { spec: Extract<VisualSpec, { kind: 'placeValue' }> }) {
  const h = spec.hundreds ?? 0; const items: ReactNode[] = []; let x = 10
  for (let i = 0; i < h; i++) { items.push(<g key={`h${i}`}><rect x={x} y={20} width={70} height={70} fill={FILL.azul} fillOpacity={0.25} stroke={INK} strokeWidth={2} />{Array.from({ length: 9 }, (_, k) => <g key={k}><line x1={x + (k + 1) * 7} y1={20} x2={x + (k + 1) * 7} y2={90} stroke={INK} strokeOpacity={0.35} /><line x1={x} y1={20 + (k + 1) * 7} x2={x + 70} y2={20 + (k + 1) * 7} stroke={INK} strokeOpacity={0.35} /></g>)}</g>); x += 80 }
  if (h > 0) x += 10
  for (let i = 0; i < spec.tens; i++) { items.push(<g key={`t${i}`}><rect x={x} y={20} width={14} height={70} fill={FILL.verde} fillOpacity={0.3} stroke={INK} strokeWidth={2} />{Array.from({ length: 9 }, (_, k) => <line key={k} x1={x} y1={20 + (k + 1) * 7} x2={x + 14} y2={20 + (k + 1) * 7} stroke={INK} strokeOpacity={0.4} />)}</g>); x += 22 }
  if (spec.tens > 0) x += 14
  for (let i = 0; i < spec.ones; i++) { items.push(<rect key={`o${i}`} x={x + (i % 5) * 18} y={i < 5 ? 62 : 82} width={14} height={14} fill={FILL.amarillo} stroke={INK} strokeWidth={2} />); }
  const w = x + Math.min(spec.ones, 5) * 18 + 14
  return <Frame w={Math.max(w, 120)} h={120} alt={spec.alt}>{items}</Frame>
}
function ArrayVis({ spec }: { spec: Extract<VisualSpec, { kind: 'array' }> }) {
  const g = 36
  return <Frame w={spec.cols * g + 20} h={spec.rows * g + 20} alt={spec.alt}>{Array.from({ length: spec.rows * spec.cols }, (_, i) => <circle key={i} cx={20 + (i % spec.cols) * g} cy={20 + Math.floor(i / spec.cols) * g} r={12} fill={FILL.azul} stroke={INK} strokeWidth={2} />)}</Frame>
}
function ClockVis({ spec }: { spec: Extract<VisualSpec, { kind: 'clock' }> }) {
  const hourAngle = ((spec.hour % 12) * 30 + spec.minute * 0.5) * (Math.PI / 180); const minAngle = spec.minute * 6 * (Math.PI / 180)
  const hand = (a: number, len: number) => ({ x2: 100 + Math.sin(a) * len, y2: 100 - Math.cos(a) * len })
  return <Frame w={200} h={200} alt={spec.alt}>
    <circle cx={100} cy={100} r={92} fill="var(--vis-cell, #fff)" stroke={INK} strokeWidth={4} />
    {Array.from({ length: 12 }, (_, i) => { const n = i + 1; const a = (n * 30 * Math.PI) / 180; return <text key={n} x={100 + Math.sin(a) * 74} y={100 - Math.cos(a) * 74 + 6} textAnchor="middle" fontSize={17} fontWeight={800} fill={INK}>{n}</text> })}
    <line x1={100} y1={100} {...hand(hourAngle, 46)} stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <line x1={100} y1={100} {...hand(minAngle, 68)} stroke={FILL.rojo} strokeWidth={4} strokeLinecap="round" />
    <circle cx={100} cy={100} r={6} fill={INK} />
  </Frame>
}
function BarsVis({ spec }: { spec: Extract<VisualSpec, { kind: 'bars' }> }) {
  const max = Math.max(...spec.data.map((d) => d.value), 1)
  if (spec.unitLabel) {
    const rowH = 44; const w = 120 + max * 34 + 20
    return <Frame w={w} h={spec.data.length * rowH + 50} alt={spec.alt}>
      {spec.data.map((d, r) => <g key={d.label}><text x={8} y={rowH * r + 34} fontSize={15} fontWeight={700} fill={INK}>{d.label}</text>{Array.from({ length: d.value }, (_, i) => <circle key={i} cx={125 + i * 34} cy={rowH * r + 28} r={13} fill={FILL.naranja} stroke={INK} strokeWidth={2} />)}</g>)}
      <circle cx={16} cy={spec.data.length * rowH + 28} r={8} fill={FILL.naranja} stroke={INK} strokeWidth={2} /><text x={32} y={spec.data.length * rowH + 33} fontSize={14} fontWeight={700} fill={INK}>= 1 {spec.unitLabel}</text>
    </Frame>
  }
  if (spec.orientation === 'horizontal') {
    const rowH = 46
    return <Frame w={360} h={spec.data.length * rowH + 10} alt={spec.alt}>{spec.data.map((d, i) => <g key={d.label}><text x={6} y={i * rowH + 32} fontSize={14} fontWeight={700} fill={INK}>{d.label}</text><rect x={90} y={i * rowH + 12} width={(d.value / max) * 250} height={28} rx={6} fill={FILL.azul} stroke={INK} strokeWidth={2} /></g>)}</Frame>
  }
  const colW = 70
  return <Frame w={spec.data.length * colW + 20} h={190} alt={spec.alt}>{spec.data.map((d, i) => { const bh = (d.value / max) * 130; return <g key={d.label}><rect x={20 + i * colW} y={150 - bh} width={44} height={bh} rx={6} fill={FILL.verde} stroke={INK} strokeWidth={2} /><text x={42 + i * colW} y={176} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>{d.label}</text></g> })}</Frame>
}
function SpatialVis({ spec }: { spec: Extract<VisualSpec, { kind: 'spatial' }> }) {
  const ball = (cx: number, cy: number) => <circle cx={cx} cy={cy} r={18} fill={FILL.rojo} stroke={INK} strokeWidth={3} />
  const box = (x: number, y: number) => <rect x={x} y={y} width={80} height={60} rx={6} fill={FILL.amarillo} fillOpacity={0.45} stroke={INK} strokeWidth={3} />
  const r = spec.relation
  return <Frame w={260} h={170} alt={spec.alt}>
    <line x1={10} y1={150} x2={250} y2={150} stroke={INK} strokeWidth={2} strokeOpacity={0.4} />
    {r === 'dentro' && <>{box(90, 90)}{ball(130, 130)}</>}
    {r === 'fuera' && <>{box(40, 90)}{ball(200, 130)}</>}
    {r === 'encima' && <>{box(90, 90)}{ball(130, 70)}</>}
    {r === 'debajo' && <>{box(90, 40)}{ball(130, 128)}</>}
    {r === 'al-lado' && <>{box(70, 90)}{ball(172, 130)}</>}
    {r === 'izquierda' && <>{box(130, 90)}{ball(60, 130)}</>}
    {r === 'derecha' && <>{box(50, 90)}{ball(200, 130)}</>}
  </Frame>
}
function RectGridVis({ spec }: { spec: Extract<VisualSpec, { kind: 'rectGrid' }> }) {
  const g = Math.min(38, 340 / Math.max(spec.w, spec.h)); const pad = 34
  return <Frame w={spec.w * g + pad * 2} h={spec.h * g + pad * 2} alt={spec.alt}>
    {Array.from({ length: spec.w * spec.h }, (_, i) => <rect key={i} x={pad + (i % spec.w) * g} y={pad + Math.floor(i / spec.w) * g} width={g} height={g} fill={FILL.azul} fillOpacity={0.22} stroke={INK} strokeWidth={1.5} />)}
    <rect x={pad} y={pad} width={spec.w * g} height={spec.h * g} fill="none" stroke={INK} strokeWidth={3} />
    {spec.showDims && <><text x={pad + (spec.w * g) / 2} y={pad - 10} textAnchor="middle" fontSize={16} fontWeight={800} fill={INK}>{spec.w}</text><text x={pad - 12} y={pad + (spec.h * g) / 2 + 6} textAnchor="middle" fontSize={16} fontWeight={800} fill={INK}>{spec.h}</text></>}
  </Frame>
}
function CoordinatesVis({ spec }: { spec: Extract<VisualSpec, { kind: 'coordinates' }> }) {
  const g = 52; const pad = 36; const n = spec.max
  const px = (x: number) => pad + x * g; const py = (y: number) => pad + (n - y) * g
  return <Frame w={pad * 2 + n * g} h={pad * 2 + n * g} alt={spec.alt}>
    {Array.from({ length: n + 1 }, (_, i) => <g key={i}><line x1={px(i)} y1={py(0)} x2={px(i)} y2={py(n)} stroke={INK} strokeOpacity={0.2} /><line x1={px(0)} y1={py(i)} x2={px(n)} y2={py(i)} stroke={INK} strokeOpacity={0.2} /><text x={px(i)} y={py(0) + 22} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK}>{i}</text><text x={px(0) - 14} y={py(i) + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK}>{i}</text></g>)}
    <line x1={px(0)} y1={py(0)} x2={px(n)} y2={py(0)} stroke={INK} strokeWidth={3} /><line x1={px(0)} y1={py(0)} x2={px(0)} y2={py(n)} stroke={INK} strokeWidth={3} />
    {spec.points.map((p) => <g key={p.label}><circle cx={px(p.x)} cy={py(p.y)} r={9} fill={FILL.rojo} stroke={INK} strokeWidth={2.5} /><text x={px(p.x) + 14} y={py(p.y) - 12} fontSize={17} fontWeight={800} fill={INK}>{p.label}</text></g>)}
  </Frame>
}
function AngleVis({ spec }: { spec: Extract<VisualSpec, { kind: 'angle' }> }) {
  const o = { x: 50, y: 150 }; const len = 130; const rad = (spec.degrees * Math.PI) / 180
  const end = { x: o.x + Math.cos(rad) * len, y: o.y - Math.sin(rad) * len }
  const arcR = 36; const arc = { x: o.x + Math.cos(rad) * arcR, y: o.y - Math.sin(rad) * arcR }
  return <Frame w={200} h={170} alt={spec.alt}>
    <line x1={o.x} y1={o.y} x2={o.x + len} y2={o.y} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <line x1={o.x} y1={o.y} x2={end.x} y2={end.y} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    {spec.degrees === 90 ? <path d={`M${o.x + 22},${o.y} L${o.x + 22},${o.y - 22} L${o.x},${o.y - 22}`} fill="none" stroke={FILL.rojo} strokeWidth={3} /> : <path d={`M${o.x + arcR},${o.y} A${arcR},${arcR} 0 0 0 ${arc.x},${arc.y}`} fill="none" stroke={FILL.rojo} strokeWidth={3} />}
  </Frame>
}

/** Representaciones visuales declarativas. Siempre incluyen texto alternativo (`alt`). */
export default function Visual({ spec }: { spec: VisualSpec }) {
  switch (spec.kind) {
    case 'counters': return <Counters spec={spec} />
    case 'tenFrame': return <TenFrame spec={spec} />
    case 'numberLine': return <NumberLine spec={spec} />
    case 'shape': return <ShapeVis spec={spec} />
    case 'pattern': return <PatternVis spec={spec} />
    case 'fraction': return <FractionVis spec={spec} />
    case 'placeValue': return <PlaceValue spec={spec} />
    case 'array': return <ArrayVis spec={spec} />
    case 'clock': return <ClockVis spec={spec} />
    case 'bars': return <BarsVis spec={spec} />
    case 'spatial': return <SpatialVis spec={spec} />
    case 'rectGrid': return <RectGridVis spec={spec} />
    case 'coordinates': return <CoordinatesVis spec={spec} />
    case 'angle': return <AngleVis spec={spec} />
  }
}
