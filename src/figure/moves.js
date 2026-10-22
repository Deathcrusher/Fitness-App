import { A, ANKLE_Y as Y, GROUND, P, R, T, bodyLine } from './rig'

/*
 * Bewegungsbibliothek. Jede Übung: Ansicht, Keyframes (Pose, Dauer, Haltezeit,
 * Hinweis, Sprunghöhe), Hanteln, beanspruchte Muskeln (work) und Requisiten.
 * Blickrichtung in der Seitenansicht: nach rechts.
 */

/* ---------- Grundposen ---------- */
const STAND = { hip: [150, 105], lean: 0, head: 0, hN: R(4, 51), hF: R(-2, 51), fN: A(154, Y), fF: A(147, Y), faN: 0, faF: 0 }
const S = (o) => ({ ...STAND, ...o })
const FSTAND = { hip: [150, 106], lean: 0, head: 0, hN: R(6, 51), fN: A(159, Y) }
const F = (o) => ({ ...FSTAND, ...o })

const k = (pose, dur, hold = 0, cue, arc) => ({ pose, dur, hold, cue, arc })

/* Liegen auf dem Rücken: Kopf links, Füße rechts */
const LIE_Y = 172
const lying = (o) => ({
  hip: [138, LIE_Y], aim: [90, LIE_Y], headAbs: -90,
  hN: A(150, GROUND - 3), hF: A(146, GROUND - 3),
  fN: A(188, Y), fF: A(184, Y), faN: 0, faF: 0,
  ...o,
})

/* Stütz auf den Händen (Kopf rechts) */
const PU_TOP = bodyLine([212, 127], [100, 174])
const PU_LOW = bodyLine([220, 158], [100, 174])
const plankBase = (line, o) => ({
  hip: line.hip, lean: line.lean, head: 0,
  hN: A(214, GROUND - 3), hF: A(210, GROUND - 3),
  fN: A(100, 174), fF: A(97, 174), faN: 68, faF: 68,
  ...o,
})

const FA_PLANK = bodyLine([206, 152], [92, 173])

export const MOVES = {
  /* ---------------- Beine ---------------- */
  squat: {
    view: 'side', work: ['thigh', 'glute'],
    keys: [
      k(S({ hN: R(6, 50), hF: R(2, 50) }), 1.8, 0.5, 'Runter · einatmen'),
      k(S({ hip: [126, 141], lean: 40, head: -16, hN: R(50, 6), hF: R(47, 9) }), 1.2, 0.25, 'Hoch · ausatmen'),
    ],
  },
  lightSquat: {
    view: 'side', work: ['thigh', 'glute'],
    keys: [
      k(S({ hN: R(6, 50), hF: R(2, 50) }), 1.6, 0.4, 'Runter · einatmen'),
      k(S({ hip: [138, 126], lean: 22, head: -8, hN: R(44, 20), hF: R(41, 22) }), 1.1, 0.2, 'Hoch · ausatmen'),
    ],
  },
  lunge: {
    view: 'side', work: ['thigh', 'glute'], bell: 'end',
    keys: [
      k(S({ hip: [146, 113], lean: 3, fN: A(180, Y), fF: A(112, 175), faF: 42, hN: R(3, 52), hF: R(-1, 52) }), 1.8, 0.4, 'Runter · einatmen'),
      k(S({ hip: [141, 142], lean: 4, fN: A(180, Y), fF: A(112, 175), faF: 42, hN: R(3, 52), hF: R(-1, 52) }), 1.2, 0.25, 'Hoch · ausatmen'),
    ],
  },
  wallSit: {
    view: 'side', work: ['thigh'], props: { wall: 104 },
    keys: [
      k(S({ hip: [122, 141], lean: 0, fN: A(162, Y), fF: A(158, Y), hN: A(150, 136), hF: A(146, 137) }), 2.4, 0.2, 'Halten · ruhig atmen'),
      k(S({ hip: [122, 139], lean: 0, fN: A(162, Y), fF: A(158, Y), hN: A(150, 134), hF: A(146, 135) }), 2.4, 0.2, 'Halten · ruhig atmen'),
    ],
  },
  bridge: {
    view: 'side', work: ['glute', 'thigh'], props: { mat: true }, poles: { knee: [0.2, -1] },
    keys: [
      k(lying({ hip: [134, LIE_Y] }), 1.1, 0.3, 'Hoch · ausatmen'),
      k(lying({ hip: [126, 146], aim: [90, LIE_Y] }), 1.6, 0.8, 'Langsam ablegen'),
    ],
  },
  sideLegRaise: {
    view: 'front', cx: 150, work: ['thigh', 'glute'], props: { mat: true }, torsoWidth: 21,
    poles: { knee: [0, -1], elbow: [1, -1] },
    keys: [
      k({ hip: [166, 168], lean: -84, head: -12, hN: A(126, GROUND - 3), hF: A(62, GROUND - 4), fN: P(8, 74), fF: A(238, Y) }, 1.0, 0.3, 'Bein heben · ausatmen'),
      k({ hip: [166, 168], lean: -84, head: -12, hN: A(126, GROUND - 3), hF: A(62, GROUND - 4), fN: P(-30, 74), fF: A(238, Y) }, 1.4, 0.3, 'Senken · einatmen'),
    ],
  },

  /* ---------------- Oberkörper ---------------- */
  row: {
    view: 'side', work: ['torso', 'upper'], bell: 'end', poles: { elbow: [-0.6, -1] },
    keys: [
      k(S({ hip: [136, 111], lean: 62, head: -6, fN: A(160, Y), fF: A(155, Y), hN: R(3, 52), hF: R(-1, 52) }), 1.0, 0.25, 'Ziehen · ausatmen'),
      k(S({ hip: [136, 111], lean: 62, head: -6, fN: A(160, Y), fF: A(155, Y), hN: R(-20, 20), hF: R(-23, 21) }), 1.6, 0.45, 'Absenken · einatmen'),
    ],
  },
  rowOneArm: {
    view: 'side', work: ['torso', 'upper'], bell: 'end', bellHands: 'N', props: { bench: true },
    poles: { elbow: [-0.6, -1] },
    keys: [
      k(S({ hip: [132, 112], lean: 72, head: -4, fN: A(150, Y), fF: A(132, Y), hN: R(1, 52), hF: A(196, 139) }), 1.0, 0.25, 'Ziehen · ausatmen'),
      k(S({ hip: [132, 112], lean: 72, head: -4, fN: A(150, Y), fF: A(132, Y), hN: R(-20, 20), hF: A(196, 139) }), 1.6, 0.45, 'Absenken · einatmen'),
    ],
  },
  curl: {
    view: 'side', work: ['upper'], bell: 'end', poles: { elbow: [-1, 0.35] },
    keys: [
      k(S({ hN: R(4, 51), hF: R(0, 51) }), 1.1, 0.35, 'Hoch · ausatmen'),
      k(S({ hN: R(15, 4), hF: R(12, 6) }), 1.8, 0.3, 'Runter · einatmen'),
    ],
  },
  hammer: {
    view: 'side', work: ['upper', 'fore'], bell: 'perp', poles: { elbow: [-1, 0.35] },
    keys: [
      k(S({ hN: R(4, 51), hF: R(0, 51) }), 1.1, 0.35, 'Hoch · ausatmen'),
      k(S({ hN: R(16, 5), hF: R(13, 7) }), 1.8, 0.3, 'Runter · einatmen'),
    ],
  },
  tricepsOverhead: {
    view: 'side', work: ['upper'], bell: 'para', bellHands: 'shared', poles: { elbow: [0.25, -1] },
    keys: [
      k(S({ hN: R(-15, -7), hF: R(-17, -6) }), 1.2, 0.3, 'Strecken · ausatmen'),
      k(S({ hN: R(3, -53), hF: R(1, -53) }), 1.7, 0.4, 'Beugen · einatmen'),
    ],
  },
  press: {
    view: 'front', work: ['upper'], bell: 'perp', poles: { elbow: [1, 0.9] },
    keys: [
      k(F({ hN: R(19, -4) }), 1.1, 0.35, 'Drücken · ausatmen'),
      k(F({ hN: R(7, -52) }), 1.7, 0.35, 'Senken · einatmen'),
    ],
  },
  lateral: {
    view: 'front', work: ['upper'], bell: 'end', poles: { elbow: [1, -0.3] },
    keys: [
      k(F({ hN: R(9, 51) }), 1.2, 0.3, 'Heben · ausatmen'),
      k(F({ hN: R(51, 5) }), 1.7, 0.4, 'Senken · einatmen'),
    ],
  },
  pushup: {
    view: 'side', work: ['upper', 'torso'], props: { mat: true }, poles: { elbow: [-1, -0.4] },
    keys: [
      k(plankBase(PU_TOP), 1.7, 0.3, 'Senken · einatmen'),
      k(plankBase(PU_LOW), 1.1, 0.2, 'Drücken · ausatmen'),
    ],
  },
  floorPress: {
    view: 'side', work: ['upper', 'torso'], bell: 'end', props: { mat: true },
    poles: { elbow: [0.2, 1], knee: [0.2, -1] },
    keys: [
      k(lying({ hip: [134, LIE_Y], hN: R(3, -19), hF: R(0, -18), upperScale: 0.3 }), 1.1, 0.3, 'Drücken · ausatmen'),
      k(lying({ hip: [134, LIE_Y], hN: R(2, -53), hF: R(-1, -53), upperScale: 1 }), 1.7, 0.35, 'Senken · einatmen'),
    ],
  },

  /* ---------------- Core ---------------- */
  plank: {
    view: 'side', work: ['torso'], props: { mat: true }, poles: { elbow: [-0.3, 1] },
    keys: [
      k({ hip: FA_PLANK.hip, lean: FA_PLANK.lean, head: 0, hN: A(232, GROUND - 3), hF: A(228, GROUND - 3), fN: A(92, 173), fF: A(89, 173), faN: 70, faF: 70 }, 2.2, 0.3, 'Halten · ruhig atmen'),
      k({ hip: [FA_PLANK.hip[0], FA_PLANK.hip[1] - 2], lean: FA_PLANK.lean + 1.2, head: 0, hN: A(232, GROUND - 3), hF: A(228, GROUND - 3), fN: A(92, 173), fF: A(89, 173), faN: 70, faF: 70 }, 2.2, 0.3, 'Halten · ruhig atmen'),
    ],
  },
  sidePlank: {
    view: 'front', work: ['torso'], props: { mat: true },
    poles: { elbow: [-1, 1], knee: [0, 1] },
    keys: [
      k({ hip: [150, 152], lean: 75, head: -8, hN: A(222, GROUND - 3), hF: R(-6, -52), fN: A(80, 177), fF: A(80, 168) }, 1.6, 0.6, 'Hüfte heben'),
      k({ hip: [150, 145], lean: 72, head: -8, hN: A(222, GROUND - 3), hF: R(-6, -52), fN: A(80, 177), fF: A(80, 168) }, 1.6, 1.0, 'Halten · ruhig atmen'),
    ],
  },
  mountainClimber: {
    view: 'side', work: ['torso', 'thigh'], props: { mat: true }, poles: { knee: [1, 0.7] },
    keys: [
      k(plankBase(PU_TOP, { fN: A(156, 172), faN: 45 }), 0.3, 0.05, 'Knie im Wechsel zur Brust'),
      k(plankBase(PU_TOP, { fF: A(153, 172), faF: 45 }), 0.3, 0.05, 'Knie im Wechsel zur Brust'),
    ],
  },
  legRaise: {
    view: 'side', work: ['torso', 'thigh'], props: { mat: true },
    keys: [
      k(lying({ hip: [138, LIE_Y], fN: P(-10, 74.6), fF: P(-12, 74.6), faN: -20, faF: -20 }), 1.4, 0.3, 'Heben · ausatmen'),
      k(lying({ hip: [138, LIE_Y], fN: P(-86, 74.6), fF: P(-88, 74.6), faN: -100, faF: -100 }), 1.9, 0.2, 'Langsam senken'),
    ],
  },
  bicycleCrunch: {
    view: 'side', work: ['torso'], props: { mat: true }, poles: { knee: [0.6, -1], elbow: [1, -0.6] },
    keys: [
      k(lying({ hip: [140, LIE_Y], aim: [98, 150], headAbs: -66, hN: T(10, -12), hF: T(7, -12), fN: A(160, 132), fF: P(-20, 74), faN: -10, faF: -20 }), 0.65, 0.15, 'Ellbogen zum Knie'),
      k(lying({ hip: [140, LIE_Y], aim: [98, 150], headAbs: -66, hN: T(10, -12), hF: T(7, -12), fF: A(157, 132), fN: P(-20, 74), faF: -10, faN: -20 }), 0.65, 0.15, 'Seite wechseln'),
    ],
  },
  russianTwist: {
    view: 'front', work: ['torso'], props: { mat: true }, twist: true,
    poles: { knee: [1, -1], elbow: [0, -1] },
    keys: [
      k({ hip: [150, 168], lean: -20, torsoScale: 0.82, legScale: 0.62, head: 8, hN: A(108, 165), hF: A(110, 167), fN: A(164, 160), fF: A(136, 160) }, 0.75, 0.15, 'Drehen · ausatmen'),
      k({ hip: [150, 168], lean: 20, torsoScale: 0.82, legScale: 0.62, head: -8, hN: A(190, 167), hF: A(192, 165), fN: A(164, 160), fF: A(136, 160) }, 0.75, 0.15, 'Drehen · ausatmen'),
    ],
  },

  /* ---------------- Aufwärmen & Cardio ---------------- */
  march: {
    view: 'side', cue: 'Locker marschieren',
    keys: [
      k(S({ fN: A(162, 150), faN: 22, hN: R(-16, 48), hF: R(16, 48) }), 0.42),
      k(S({}), 0.42),
      k(S({ fF: A(156, 150), faF: 22, hN: R(16, 48), hF: R(-16, 48) }), 0.42),
      k(S({}), 0.42),
    ],
  },
  highKnees: {
    view: 'side', cue: 'Knie bis Hüfthöhe', work: ['thigh'],
    keys: [
      k(S({ fN: A(168, 128), faN: 30, hN: R(-18, 46), hF: R(22, 30) }), 0.32, 0, undefined, 3),
      k(S({}), 0.32),
      k(S({ fF: A(164, 128), faF: 30, hN: R(22, 30), hF: R(-18, 46) }), 0.32, 0, undefined, 3),
      k(S({}), 0.32),
    ],
  },
  highKneesOne: {
    view: 'side', cue: 'Knie bis Hüfthöhe', work: ['thigh'],
    keys: [
      k(S({ fN: A(168, 128), faN: 30, hN: R(-18, 46), hF: R(22, 30) }), 0.45, 0.1),
      k(S({}), 0.45, 0.1),
    ],
  },
  buttKicks: {
    view: 'side', cue: 'Ferse zum Po', work: ['shin'], poles: { knee: [0.3, 1] },
    keys: [
      k(S({ fN: A(124, 122), faN: 200, hN: R(16, 44), hF: R(-14, 46) }), 0.34),
      k(S({}), 0.34),
      k(S({ fF: A(121, 122), faF: 200, hN: R(-14, 46), hF: R(16, 44) }), 0.34),
      k(S({}), 0.34),
    ],
  },
  buttKicksOne: {
    view: 'side', cue: 'Ferse zum Po', work: ['shin'], poles: { knee: [0.3, 1] },
    keys: [
      k(S({ fN: A(124, 122), faN: 200, hN: R(16, 44), hF: R(-14, 46) }), 0.45, 0.1),
      k(S({}), 0.45, 0.1),
    ],
  },
  jumpingJack: {
    view: 'front', cue: 'Locker im Rhythmus',
    keys: [
      k(F({ hN: R(6, 51), fN: A(157, Y) }), 0.34, 0.04, undefined, 9),
      k(F({ hip: [150, 109], hN: R(30, -44), fN: A(181, Y) }), 0.34, 0.04, undefined, 9),
    ],
  },
  armCircles: {
    view: 'front', cue: 'Große, weiche Kreise', work: ['upper'], linear: true, drive: 'armCircles',
    keys: [k(F({ hN: R(52, 0) }), 1.6)],
  },
  armCirclesReverse: {
    view: 'front', cue: 'Große, weiche Kreise', work: ['upper'], linear: true, drive: 'armCirclesReverse',
    keys: [k(F({ hN: R(52, 0) }), 1.6)],
  },
  jumpRope: {
    view: 'side', cue: 'Leicht auf den Ballen', props: { rope: true },
    keys: [
      k(S({ hN: R(14, 40), hF: R(10, 41), faN: 0, faF: 0 }), 0.36, 0, undefined, 8),
    ],
    linear: true,
  },
  jumpRopeAir: {
    view: 'side', cue: 'Leicht auf den Ballen', drive: 'ropeHands',
    keys: [
      k(S({ hN: R(14, 40), hF: R(10, 41) }), 0.36, 0, undefined, 8),
    ],
    linear: true,
  },
  walk: {
    view: 'side', cue: 'Gleichmäßig gehen', linear: true, props: { treadmill: true },
    keys: [
      k(S({ hip: [150, 108], fN: A(174, Y), faN: -8, fF: A(126, 176), faF: 32, hN: R(-16, 49), hF: R(16, 49) }), 0.42),
      k(S({ hip: [150, 104], fN: A(150, Y), faN: 0, fF: A(156, 166), faF: 12, hN: R(0, 52), hF: R(0, 52) }), 0.42),
      k(S({ hip: [150, 108], fN: A(126, 176), faN: 32, fF: A(174, Y), faF: -8, hN: R(16, 49), hF: R(-16, 49) }), 0.42),
      k(S({ hip: [150, 104], fN: A(156, 166), faN: 12, fF: A(150, Y), faF: 0, hN: R(0, 52), hF: R(0, 52) }), 0.42),
    ],
  },
  bike: {
    view: 'side', cue: 'Gleichmäßig treten', work: ['thigh'], linear: true, drive: 'pedal',
    props: { bike: true }, poles: { knee: [1, -0.4], elbow: [0, 1] },
    keys: [k({ hip: [132, 106], lean: 28, head: -14, hN: A(194, 90), hF: A(190, 92), fN: A(160, 160), fF: A(160, 160), faN: 8, faF: 8 }, 1.1)],
  },
  hulaHoop: {
    view: 'front', cue: 'Hüfte kreisen lassen', work: ['torso'], linear: true, drive: 'hula',
    props: { hoop: true }, poles: { elbow: [1, -0.2] },
    keys: [k(F({ hN: R(20, -32), fN: A(166, Y) }), 0.9)],
  },
  breathe: {
    view: 'front', work: [],
    keys: [
      k(F({ hN: R(8, 51) }), 4.0, 1.0, 'Einatmen'),
      k(F({ hip: [150, 104.5], hN: R(30, -44) }), 4.0, 1.0, 'Ausatmen'),
    ],
  },
  stretch: {
    view: 'front', work: ['torso'],
    keys: [
      k(F({ hN: T(8, -53) }), 2.2, 0.6, 'Zur Seite neigen'),
      k(F({ lean: -18, hN: T(8, -53) }), 2.2, 1.4, 'Zurück zur Mitte'),
      k(F({ hN: T(8, -53) }), 2.2, 0.6, 'Andere Seite'),
      k(F({ lean: 18, hN: T(8, -53) }), 2.2, 1.4, 'Zurück zur Mitte'),
    ],
  },
}

/* ---------- Übungsname → Bewegung ---------- */
const RULES = [
  [/hampelmann|jumping jack/i, 'jumpingJack'],
  [/seilspringen \(ohne seil\)/i, 'jumpRopeAir'],
  [/seilspring/i, 'jumpRope'],
  [/bergsteiger|mountain/i, 'mountainClimber'],
  [/wandsitz|wall sit/i, 'wallSit'],
  [/leichte kniebeuge/i, 'lightSquat'],
  [/kniebeuge|squat/i, 'squat'],
  [/ausfallschritt|lunge/i, 'lunge'],
  [/einarmig.*rudern/i, 'rowOneArm'],
  [/rudern|row/i, 'row'],
  [/hammer/i, 'hammer'],
  [/bizeps|curl/i, 'curl'],
  [/brustdrück|floor press/i, 'floorPress'],
  [/trizeps/i, 'tricepsOverhead'],
  [/schulterdrück|shoulder press/i, 'press'],
  [/seitheben|lateral/i, 'lateral'],
  [/liegestütz|push.?up/i, 'pushup'],
  [/glute|bridge|beckenheben/i, 'bridge'],
  [/unterarmstütz seitlich|side plank|seitstütz/i, 'sidePlank'],
  [/plank|unterarmstütz/i, 'plank'],
  [/russian|twist/i, 'russianTwist'],
  [/bicycle|fahrrad/i, 'bicycleCrunch'],
  [/beinheben liegend|seitlich.*bein/i, 'sideLegRaise'],
  [/beinheben|leg raise/i, 'legRaise'],
  [/arme kreisen \(andere/i, 'armCirclesReverse'],
  [/arme kreisen|armkreis/i, 'armCircles'],
  [/knie heben –|knie heben -/i, 'highKneesOne'],
  [/knie heben|high knee/i, 'highKnees'],
  [/ferse zum po –|ferse zum po -/i, 'buttKicksOne'],
  [/ferse zum po|anfersen/i, 'buttKicks'],
  [/hula/i, 'hulaHoop'],
  [/laufband|gehen|walking/i, 'walk'],
  [/hometrainer|ausfahren|cardio finish|fahrrad|bike|radfahren/i, 'bike'],
  [/atmen|breath/i, 'breathe'],
  [/dehnen|stretch|cooldown|cool-down/i, 'stretch'],
  [/marschier|aufwärm|warm-up|warmup|mobilis/i, 'march'],
]

export function moveFor(step) {
  const name = step?.name || ''
  for (const [re, key] of RULES) if (re.test(name)) return key
  return null
}
