import React, { useEffect, useRef, useState } from 'react'
import { Gauge, Pause, Play, RotateCcw } from 'lucide-react'
import { GROUND, LEN, R, A, VB_H, VB_W, cycleLength, rotate, sample, solve } from '../lib/figure/rig'
import { MOVES, moveFor } from '../lib/figure/moves'

export function animationFor(step) {
  return moveFor(step)
}

/* ---------- prozedurale Anteile (Kreise, Pedale, Hula) ---------- */
function applyDrive(def, pose, t) {
  if (!def.drive) return { pose, extra: {} }
  const p = { ...pose }
  const extra = {}
  if (def.drive === 'armCircles' || def.drive === 'armCirclesReverse') {
    const dirSign = def.drive === 'armCircles' ? 1 : -1
    const th = (t / 1.6) * Math.PI * 2 * dirSign
    const x = 44 + Math.cos(th) * 13
    const y = Math.sin(th) * 13
    p.hN = R(x, y)
    p.hF = R(-x, y)
  } else if (def.drive === 'ropeHands') {
    const th = (t / 0.36) * Math.PI * 2
    p.hN = R(14 + Math.cos(th) * 4, 40 + Math.sin(th) * 4)
    p.hF = R(10 + Math.cos(th) * 4, 41 + Math.sin(th) * 4)
  } else if (def.drive === 'pedal') {
    const th = (t / 1.1) * Math.PI * 2
    const c = [160, 160]
    p.fN = A(c[0] + Math.cos(th) * 14, c[1] + Math.sin(th) * 14)
    p.fF = A(c[0] - Math.cos(th) * 14, c[1] - Math.sin(th) * 14)
    p.faN = 8 + Math.sin(th) * 10
    p.faF = 8 - Math.sin(th) * 10
    extra.pedals = [[p.fN.x, p.fN.y], [p.fF.x, p.fF.y]]
  } else if (def.drive === 'hula') {
    const th = (t / 0.9) * Math.PI * 2
    p.hip = [150 + Math.sin(th) * 6, 106 - Math.abs(Math.cos(th)) * 1.5]
    p.lean = -Math.sin(th) * 5
    extra.hoop = th
  }
  return { pose: p, extra }
}

function useAnimationTime(active, rate = 1) {
  const clock = useRef(0)
  const [time, setTime] = useState(0)
  useEffect(() => {
    if (!active) return undefined
    let raf = 0
    let last = null
    let displayed = null
    const loop = (ts) => {
      if (last !== null) clock.current += Math.min((ts - last) / 1000, 0.08) * rate
      last = ts
      // About 30fps keeps the figure fluid without doing 60 React renders a second.
      if (displayed == null || ts - displayed >= 33) {
        setTime(clock.current)
        displayed = ts
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active, rate])
  const reset = () => { clock.current = 0; setTime(0) }
  return { time, reset }
}

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/* ---------- Zeichnen ---------- */
const f1 = (n) => n.toFixed(1)
function Seg({ a, b, w, cls, outline }) {
  const ends = { x1: f1(a[0]), y1: f1(a[1]), x2: f1(b[0]), y2: f1(b[1]) }
  return (
    <g className="ffBodySegment">
      {outline && <line {...ends} strokeWidth={w + 8} className="figGap" />}
      <line {...ends} strokeWidth={w + 4} className="ffFigContour" />
      <line {...ends} strokeWidth={w} className={cls} />
      <line {...ends} strokeWidth={Math.max(1.5, w * 0.17)} className="ffFigReflect" />
    </g>
  )
}

function Dumbbell({ at, axis, kind }) {
  if (kind === 'end') {
    return (
      <g className="figBell">
        <circle cx={f1(at[0])} cy={f1(at[1])} r={7} />
        <circle cx={f1(at[0])} cy={f1(at[1])} r={2.6} className="figBellCore" />
      </g>
    )
  }
  const ang = (Math.atan2(axis[1], axis[0]) * 180) / Math.PI + (kind === 'perp' ? 90 : 0)
  return (
    <g className="figBell" transform={`translate(${f1(at[0])} ${f1(at[1])}) rotate(${f1(ang)})`}>
      <rect x={-11} y={-2.2} width={22} height={4.4} rx={2.2} />
      <rect x={-16} y={-7} width={7} height={14} rx={2.5} />
      <rect x={9} y={-7} width={7} height={14} rx={2.5} />
    </g>
  )
}

function Props({ def, j, t, extra, layer }) {
  const props = def.props || {}
  const out = []
  if (layer === 'back') {
    if (props.wall) out.push(<rect key="wall" x={props.wall - 9} y={22} width={9} height={GROUND - 22} rx={2} className="figProp" />)
    if (props.mat) out.push(<rect key="mat" x={30} y={GROUND - 2} width={VB_W - 60} height={5} rx={2.5} className="figProp" />)
    if (props.bench) {
      out.push(
        <g key="bench" className="figProp">
          <rect x={176} y={141} width={90} height={9} rx={4} />
          <rect x={186} y={148} width={6} height={GROUND - 148} rx={2} />
          <rect x={250} y={148} width={6} height={GROUND - 148} rx={2} />
        </g>,
      )
    }
    if (props.treadmill) {
      out.push(
        <g key="tm" className="figProp">
          <rect x={70} y={GROUND - 1} width={168} height={8} rx={4} />
          <path d={`M232 ${GROUND - 1} L244 92`} className="figPropLine" />
          <rect x={232} y={84} width={22} height={10} rx={3} />
        </g>,
      )
    }
    if (props.bike) {
      const c = [160, 160]
      out.push(
        <g key="bike" className="figPropLines">
          <path d={`M110 ${GROUND} L238 ${GROUND}`} />
          <path d={`M132 116 L${c[0]} ${c[1]} L208 150 L200 96`} />
          <path d={`M188 92 L206 90`} />
          <circle cx={208} cy={150} r={23} className="figWheel" />
          <rect x={116} y={106} width={26} height={7} rx={3.5} className="figSeat" />
        </g>,
      )
    }
    if (props.hoop) {
      const th = extra.hoop || 0
      const cx = j.hip[0] - Math.sin(th) * 9
      const cy = j.hip[1] - 14
      out.push(<path key="hoopBack" d={`M${f1(cx - 46)} ${f1(cy)} A46 10 0 0 1 ${f1(cx + 46)} ${f1(cy)}`} className="figHoop back" />)
    }
  } else {
    if (props.hoop) {
      const th = extra.hoop || 0
      const cx = j.hip[0] - Math.sin(th) * 9
      const cy = j.hip[1] - 14
      out.push(<path key="hoopFront" d={`M${f1(cx - 46)} ${f1(cy)} A46 10 0 0 0 ${f1(cx + 46)} ${f1(cy)}`} className="figHoop" />)
    }
    if (props.rope) {
      const th = (t / 0.36) * Math.PI * 2
      const hand = [(j.haN[0] + j.haF[0]) / 2, (j.haN[1] + j.haF[1]) / 2]
      const apex = [hand[0] - Math.sin(th) * 34, hand[1] - Math.cos(th) * 84 + 6]
      const mid = [(hand[0] + apex[0]) / 2, (hand[1] + apex[1]) / 2]
      const d = [apex[0] - hand[0], apex[1] - hand[1]]
      const len = Math.hypot(d[0], d[1]) || 1
      const bend = 9
      const ctrl = [mid[0] + (d[1] / len) * bend, mid[1] - (d[0] / len) * bend]
      out.push(<path key="rope" d={`M${f1(hand[0])} ${f1(hand[1])} Q${f1(ctrl[0])} ${f1(ctrl[1])} ${f1(apex[0])} ${f1(apex[1])}`} className="figRope" />)
    }
    if (extra.pedals) {
      out.push(
        <g key="pedals" className="figPropLines thin">
          {extra.pedals.map((pp, i) => <path key={i} d={`M160 160 L${f1(pp[0])} ${f1(pp[1])}`} />)}
        </g>,
      )
    }
  }
  return out
}

const W = { torso: 22, torsoFront: 29, thigh: 15, shin: 12.5, foot: 8, upper: 12, fore: 10 }

function Figure({ def, j, t, extra }) {
  const work = new Set(def.work || [])
  const front = def.view === 'front'
  const handMidX = (j.haN[0] + j.haF[0]) / 2
  const farArm = front && def.twist ? (handMidX < j.hip[0] ? 'F' : 'N') : null
  const cls = (seg, side) => {
    const w = work.has(seg)
    if (front && farArm === side && (seg === 'upper' || seg === 'fore')) return w ? 'figWorkFar' : 'figFar'
    if (front) return w ? 'figWork' : 'figInk'
    if (side === 'F') return w ? 'figWorkFar' : 'figFar'
    return w ? 'figWork' : 'figInk'
  }
  const leg = (s) => {
    const o = !front && s === 'N'
    return (
      <g key={'leg' + s}>
        <Seg a={j['hp' + s]} b={j['kn' + s]} w={W.thigh} cls={cls('thigh', s)} outline={o} />
        <Seg a={j['kn' + s]} b={j['an' + s]} w={W.shin} cls={cls('shin', s)} outline={o} />
        <Seg a={j['an' + s]} b={j['to' + s]} w={W.foot} cls={cls('foot', s)} />
      </g>
    )
  }
  const bellKind = def.bell
  const bellAt = (s) => {
    if (!bellKind) return null
    if (def.bellHands === 'N' && s === 'F') return null
    if (def.bellHands === 'shared') {
      if (s === 'F') return null
      const mid = [(j.haN[0] + j.haF[0]) / 2, (j.haN[1] + j.haF[1]) / 2]
      return <Dumbbell key="bellS" at={mid} axis={[j.haN[0] - j.elN[0], j.haN[1] - j.elN[1]]} kind={bellKind} />
    }
    return <Dumbbell key={'bell' + s} at={j['ha' + s]} axis={[j['ha' + s][0] - j['el' + s][0], j['ha' + s][1] - j['el' + s][1]]} kind={bellKind} />
  }
  const arm = (s) => {
    const o = front || s === 'N'
    return (
      <g key={'arm' + s}>
        <Seg a={j['sh' + s]} b={j['el' + s]} w={W.upper} cls={cls('upper', s)} outline={o} />
        <Seg a={j['el' + s]} b={j['ha' + s]} w={W.fore} cls={cls('fore', s)} outline={o} />
        {bellAt(s)}
      </g>
    )
  }
  const torsoA = [j.hip[0] + j.up[0] * 3, j.hip[1] + j.up[1] * 3]
  const torsoB = [j.shoulder[0] - j.up[0] * 2, j.shoulder[1] - j.up[1] * 2]
  const torso = <Seg key="torso" a={torsoA} b={torsoB} w={def.torsoWidth || (front ? W.torsoFront : W.torso)} cls={cls('torso', 'N')} />
  const back = rotate([-1, 0], j.lean)
  const glute = !front && work.has('glute') && (
    <circle key="glute" cx={f1(j.hip[0] + back[0] * 4 + j.up[0] * 2)} cy={f1(j.hip[1] + back[1] * 4 + j.up[1] * 2)} r={10.5} className="figWorkFill" />
  )
  const head = (
    <g key="head" className="ffMotionHead">
      <circle cx={f1(j.head[0])} cy={f1(j.head[1])} r={LEN.headR + 2.2} className="ffFigHeadRim" />
      <circle cx={f1(j.head[0])} cy={f1(j.head[1])} r={LEN.headR} className="figHead" />
      <circle cx={f1(j.head[0] - 3)} cy={f1(j.head[1] - 3)} r={3.2} className="ffFigHeadShine" />
    </g>
  )
  const joints = (
    <g className="ffFigJoints">
      {[j.shN, j.elN, j.knN, j.hip].map((point, index) =>
        <circle key={index} cx={f1(point[0])} cy={f1(point[1])} r={index === 3 ? 3.8 : 3.2} />)}
    </g>
  )

  if (front) {
    return (
      <>
        {Props({ def, j, t, extra, layer: 'back' })}
        {leg('F')}
        {leg('N')}
        {farArm && arm(farArm)}
        {torso}
        {farArm !== 'F' && arm('F')}
        {farArm !== 'N' && arm('N')}
        {head}
        {joints}
        {Props({ def, j, t, extra, layer: 'front' })}
      </>
    )
  }
  return (
    <>
      {leg('F')}
      {arm('F')}
      {Props({ def, j, t, extra, layer: 'back' })}
      {torso}
      {glute}
      {head}
      {joints}
      {leg('N')}
      {arm('N')}
      {Props({ def, j, t, extra, layer: 'front' })}
    </>
  )
}

const FIGURE_FOCUS = {
  calfRaise: 'WADEN', romanianDeadlift: 'BEINRÜCKSEITE', wristCurl: 'UNTERARME',
  reverseCurl: 'UNTERARME', squat: 'OBERSCHENKEL', lunge: 'BEINE',
  row: 'RÜCKEN', rowOneArm: 'RÜCKEN', press: 'SCHULTERN',
  curl: 'BIZEPS', hammer: 'ARME', lateral: 'SCHULTERN',
  floorPress: 'BRUST', pushup: 'BRUST', plank: 'CORE',
  sidePlank: 'CORE', bridge: 'PO', tricepsOverhead: 'TRIZEPS',
}
function figureFocus(moveKey, def) {
  if (FIGURE_FOCUS[moveKey]) return FIGURE_FOCUS[moveKey]
  const work = def.work || []
  if (work.includes('shin')) return 'UNTERSCHENKEL'
  if (work.includes('fore')) return 'ARME'
  if (work.includes('thigh')) return 'BEINE'
  if (work.includes('torso')) return 'RUMPF'
  return 'BEWEGUNG'
}

export function FigureFrame({ moveKey, time, showCue = true, label }) {
  const def = MOVES[moveKey]
  if (!def) return null
  const s = sample(def, time)
  const { pose, extra } = applyDrive(def, s.pose, time)
  const j = solve(pose, def, s.lift)
  const duration = cycleLength(def)
  const progress = duration ? (((time % duration) + duration) % duration) / duration * 100 : 0
  const ghostSample = showCue ? sample(def, time + duration * 0.5) : null
  const ghost = ghostSample ? applyDrive(def, ghostSample.pose, time + duration * 0.5) : null
  const ghostJ = ghost ? solve(ghost.pose, def, ghostSample.lift) : null
  const lying = def.props?.mat
  const shadowRx = (lying ? 70 : 34) * (1 - Math.min(0.5, s.lift / 24))
  return (
    <div className={`exerciseFigure ffMotionScene${showCue ? ' ffMotionFull' : ' ffMotionThumb'}`}>
      {showCue && <div className="ffMotionHudTop">
        <span className="ffMotionEdition"><i /> MOVEMENT / STUDIO</span>
        <span className="ffMotionFocus">{figureFocus(moveKey, def)}</span>
      </div>}
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label={label || `Bewegungsanimation ${moveKey}`}>
        <g className="ffMotionBlueprint" aria-hidden="true">
          <circle cx={151} cy={99} r={83} />
          <circle cx={151} cy={99} r={64} />
          <path d="M24 99 H278 M151 17 V183" />
        </g>
        <line x1={14} y1={GROUND + 3} x2={VB_W - 14} y2={GROUND + 3} className="figGround" />
        <ellipse cx={f1(lying ? 150 : j.hip[0])} cy={GROUND + 2} rx={f1(shadowRx)} ry={4} className="figShadow" />
        {ghostJ && <g className="ffMotionGhost" aria-hidden="true"><Figure def={def} j={ghostJ} t={time + duration * 0.5} extra={ghost.extra} /></g>}
        <Figure def={def} j={j} t={time} extra={extra} />
      </svg>
      {showCue && <div className="ffMotionBottom">
        <div className="ffMotionCue"><span className="ffMotionCueDot" /><span key={s.cue || 'moving'}>{s.cue || 'Bewegung kontrolliert ausführen'}</span></div>
        <div className="ffMotionCycle" role="progressbar" aria-label="Fortschritt des Animationszyklus" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <div className="ffMotionCaption"><span>BEWEGUNGSABLAUF</span><span>{def.view === 'front' ? 'FRONTANSICHT' : 'SEITENANSICHT'}</span></div>
      </div>}
    </div>
  )
}

export default function ExerciseFigure({ step, label }) {
  const moveKey = moveFor(step)
  const def = moveKey ? MOVES[moveKey] : null
  const [paused, setPaused] = useState(prefersReducedMotion)
  const [speed, setSpeed] = useState(1)
  const { time, reset } = useAnimationTime(Boolean(def) && !paused, speed)
  if (!def) return null
  const changeSpeed = () => setSpeed((value) => value === 1 ? 0.75 : value === 0.75 ? 1.25 : 1)
  return (
    <div className="ffMotionPlayer">
      <FigureFrame moveKey={moveKey} time={time} label={label} />
      <div className="ffMotionControls" role="group" aria-label="Bewegungsanimation steuern">
        <span className="ffMotionLegend"><i /> Farbig markierte Muskeln sind besonders beteiligt</span>
        <div className="ffMotionButtons">
          <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Animation abspielen' : 'Animation pausieren'}>
            {paused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}
            <span>{paused ? 'Abspielen' : 'Pause'}</span>
          </button>
          <button type="button" onClick={changeSpeed} aria-label={`Animationstempo ändern, derzeit ${speed}fach`}>
            <Gauge size={15} /> <span>{String(speed).replace('.', ',')}×</span>
          </button>
          <button type="button" onClick={reset} aria-label="Animationszyklus zurücksetzen" title="Animation neu starten"><RotateCcw size={16} /></button>
        </div>
      </div>
    </div>
  )
}

export { MOVES, cycleLength }
