/*
 * Rig für die Übungsanimationen.
 * Koordinaten im SVG-System (y nach unten), viewBox 300 × 200.
 * Arme und Beine werden per 2-Knochen-IK an Zielpunkte geführt –
 * dadurch bleiben Füße und Hände dort, wo sie hingehören.
 */

export const VB_W = 300
export const VB_H = 200
export const GROUND = 184
export const ANKLE_Y = GROUND - 5
export const LEN = { torso: 45, upper: 28, fore: 26, thigh: 38, shin: 37, foot: 13, headR: 10.5 }
const HEAD_OFFSET = 22.5
const D2R = Math.PI / 180

const add = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s]
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l] }
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
export const upDir = (deg) => [Math.sin(deg * D2R), -Math.cos(deg * D2R)]
export const rotate = ([x, y], deg) => {
  const c = Math.cos(deg * D2R)
  const s = Math.sin(deg * D2R)
  return [x * c - y * s, x * s + y * c]
}
const leanOf = (up) => Math.atan2(up[0], -up[1]) / D2R

/* Zielangaben für Hände/Füße */
export const R = (x, y) => ({ m: 'r', x, y }) // relativ zur Schulter/Hüfte (Weltachsen)
export const A = (x, y) => ({ m: 'a', x, y }) // absolut
export const T = (x, y) => ({ m: 't', x, y }) // relativ, dreht mit dem Oberkörper
export const P = (angle, dist) => ({ m: 'p', x: angle, y: dist }) // polar (0° = nach vorne, + = nach unten)

/** Körperlinie (Plank, Liegestütz): Hüfte & Neigung aus Schulter und Knöchel */
export function bodyLine(shoulder, ankle) {
  const dir = norm(sub(ankle, shoulder))
  const hip = add(shoulder, dir, LEN.torso)
  return { hip, lean: leanOf([-dir[0], -dir[1]]) }
}

function target(spec, root, lean, lift) {
  if (!spec) return add(root, [0, 50])
  switch (spec.m) {
    case 'a': return [spec.x, spec.y - lift]
    case 't': return add(root, rotate([spec.x, spec.y], lean))
    case 'p': return [root[0] + Math.cos(spec.x * D2R) * spec.y, root[1] + Math.sin(spec.x * D2R) * spec.y]
    default: return [root[0] + spec.x, root[1] + spec.y]
  }
}

/** 2-Knochen-IK. pole = Richtung, in die das Gelenk zeigen soll. */
function ik(root, tgt, l1, l2, pole) {
  const dx = tgt[0] - root[0]
  const dy = tgt[1] - root[1]
  const d = Math.hypot(dx, dy) || 0.0001
  const dd = clamp(d, Math.abs(l1 - l2) + 0.01, l1 + l2 - 0.01)
  const ux = dx / d
  const uy = dy / d
  const along = (l1 * l1 + dd * dd - l2 * l2) / (2 * dd)
  const h = Math.sqrt(Math.max(0, l1 * l1 - along * along))
  const side = ux * pole[1] - uy * pole[0] >= 0 ? 1 : -1
  const joint = [root[0] + ux * along - uy * side * h, root[1] + uy * along + ux * side * h]
  return [joint, [root[0] + ux * dd, root[1] + uy * dd]]
}

const mirrorSpec = (spec, cx) => {
  if (!spec) return spec
  if (spec.m === 'a') return { ...spec, x: 2 * cx - spec.x }
  if (spec.m === 'p') return { ...spec, x: 180 - spec.x }
  return { ...spec, x: -spec.x }
}

/** Fehlende linke Seite in der Frontansicht spiegeln */
export function completePose(pose, def) {
  if (def.view !== 'front') return pose
  const cx = def.cx ?? 150
  const out = { ...pose }
  if (!out.hF) out.hF = mirrorSpec(out.hN, cx)
  if (!out.fF) out.fF = mirrorSpec(out.fN, cx)
  return out
}

const lerp = (a, b, k) => a + (b - a) * k
function lerpValue(a, b, k) {
  if (a === undefined) return b
  if (b === undefined) return a
  if (typeof a === 'number') return lerp(a, b, k)
  if (Array.isArray(a)) return a.map((v, i) => lerp(v, b[i], k))
  if (a && typeof a === 'object') {
    if (a.m !== b.m) return k < 0.5 ? a : b
    return { m: a.m, x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) }
  }
  return k < 0.5 ? a : b
}
export function lerpPose(a, b, k) {
  const out = {}
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) out[key] = lerpValue(a[key], b[key], k)
  return out
}

const easeInOut = (t) => 0.5 - Math.cos(Math.PI * t) / 2

/** Pose zum Zeitpunkt t (Sekunden) */
export function sample(def, time) {
  const keys = def.keys
  const total = keys.reduce((n, k) => n + (k.hold || 0) + k.dur, 0)
  let t = ((time % total) + total) % total
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const next = keys[(i + 1) % keys.length]
    const cue = key.cue ?? def.cue ?? ''
    if (t < (key.hold || 0)) return { pose: completePose(key.pose, def), lift: 0, cue, index: i }
    t -= key.hold || 0
    if (t < key.dur) {
      const raw = t / key.dur
      const k = def.linear ? raw : easeInOut(raw)
      const pose = lerpPose(completePose(key.pose, def), completePose(next.pose, def), k)
      const lift = key.arc ? Math.sin(Math.PI * raw) * key.arc : 0
      return { pose, lift, cue, index: i }
    }
    t -= key.dur
  }
  return { pose: completePose(keys[0].pose, def), lift: 0, cue: keys[0].cue ?? def.cue ?? '', index: 0 }
}

export function cycleLength(def) {
  return def.keys.reduce((n, k) => n + (k.hold || 0) + k.dur, 0)
}

const DEFAULT_POLES = {
  side: { elbow: [-1, 0.6], knee: [1, -0.1] },
  front: { elbow: [1, 0.6], knee: [1, -0.15] },
}

/** Gelenkpositionen berechnen */
export function solve(p, def, lift = 0) {
  const front = def.view === 'front'
  const poles = { ...DEFAULT_POLES[front ? 'front' : 'side'], ...(def.poles || {}) }
  const hip = [p.hip[0], p.hip[1] - lift]
  const up = p.aim ? norm(sub([p.aim[0], p.aim[1] - lift], hip)) : upDir(p.lean || 0)
  const lean = leanOf(up)
  const right = [-up[1], up[0]]
  const shoulder = add(hip, up, LEN.torso * (p.torsoScale ?? 1))
  const headDir = p.headAbs != null ? upDir(p.headAbs) : upDir(lean + (p.head || 0))
  const head = add(shoulder, headDir, HEAD_OFFSET * (p.torsoScale ?? 1) ** 0.3)
  const j = { hip, shoulder, head, up, right, lean, front }
  const ls = p.legScale ?? 1
  const us = p.upperScale ?? 1

  for (const s of ['N', 'F']) {
    const sign = s === 'N' ? 1 : -1
    const sh = front ? add(shoulder, right, 15 * sign) : shoulder
    const hp = front ? add(hip, right, 8 * sign) : hip
    const mirror = (v) => (front && sign < 0 ? [-v[0], v[1]] : v)
    const elbowPole = mirror((p.elbowPole || poles.elbow))
    const kneePole = mirror((p.kneePole || poles.knee))

    const handT = target(p['h' + s], sh, lean, lift)
    const [elbow, hand] = ik(sh, handT, LEN.upper * us, LEN.fore, elbowPole)
    const ankleT = target(p['f' + s], hp, lean, lift)
    const [knee, ankle] = ik(hp, ankleT, LEN.thigh * ls, LEN.shin * ls, kneePole)

    let toe
    if (front) {
      const leg = norm(sub(ankle, hp))
      const ang = Math.atan2(-leg[0], leg[1]) / D2R
      toe = add(ankle, rotate([7 * sign, 3], ang))
    } else {
      const fa = (p['fa' + s] ?? 0) * D2R
      toe = [ankle[0] + Math.cos(fa) * LEN.foot, ankle[1] + Math.sin(fa) * LEN.foot]
    }
    Object.assign(j, {
      ['sh' + s]: sh, ['hp' + s]: hp, ['el' + s]: elbow, ['ha' + s]: hand,
      ['kn' + s]: knee, ['an' + s]: ankle, ['to' + s]: toe,
    })
  }
  return j
}
