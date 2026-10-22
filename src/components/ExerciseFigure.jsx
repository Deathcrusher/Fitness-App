import React, { useEffect, useState } from 'react'
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

function useAnimationTime(active) {
  const [time, setTime] = useState(0)
  useEffect(() => {
    if (!active) return undefined
    let raf = 0
    let start = null
    const loop = (ts) => {
      if (start == null) start = ts
      setTime((ts - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])
  return time
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
  const line = <line x1={f1(a[0])} y1={f1(a[1])} x2={f1(b[0])} y2={f1(b[1])} strokeWidth={w} className={cls} />
  if (!outline) return line
  return (
    <>
      <line x1={f1(a[0])} y1={f1(a[1])} x2={f1(b[0])} y2={f1(b[1])} strokeWidth={w + 5} className="figGap" />
      {line}
    </>
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
  const head = <circle key="head" cx={f1(j.head[0])} cy={f1(j.head[1])} r={LEN.headR} className="figHead" />

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
      {leg('N')}
      {arm('N')}
      {Props({ def, j, t, extra, layer: 'front' })}
    </>
  )
}

export function FigureFrame({ moveKey, time, showCue = true, label }) {
  const def = MOVES[moveKey]
  if (!def) return null
  const s = sample(def, time)
  const { pose, extra } = applyDrive(def, s.pose, time)
  const j = solve(pose, def, s.lift)
  const lying = def.props?.mat
  const shadowRx = (lying ? 70 : 34) * (1 - Math.min(0.5, s.lift / 24))
  return (
    <div className="exerciseFigure">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label={label}>
        <line x1={14} y1={GROUND + 3} x2={VB_W - 14} y2={GROUND + 3} className="figGround" />
        <ellipse cx={f1(lying ? 150 : j.hip[0])} cy={GROUND + 2} rx={f1(shadowRx)} ry={4} className="figShadow" />
        <Figure def={def} j={j} t={time} extra={extra} />
      </svg>
      {showCue && s.cue && <span className="figCue" key={s.cue}>{s.cue}</span>}
    </div>
  )
}

export default function ExerciseFigure({ step, label }) {
  const moveKey = moveFor(step)
  const def = moveKey ? MOVES[moveKey] : null
  const reduce = prefersReducedMotion()
  const time = useAnimationTime(Boolean(def) && !reduce)
  if (!def) return null
  const t = reduce ? (def.keys[0].hold || 0) + def.keys[0].dur : time
  return <FigureFrame moveKey={moveKey} time={t} label={label} />
}

export { MOVES, cycleLength }
