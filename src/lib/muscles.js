import { moveFor } from './figure/moves'
import { parseSets, timedSeconds } from './plans'
import { baseName } from './logStore'

/* Muskelgruppen für die Heatmap. Waden fehlen bewusst – keine Übung trainiert sie gezielt. */
export const MUSCLES = {
  chest: 'Brust',
  shoulders: 'Schultern',
  back: 'Oberer Rücken',
  lowerback: 'Unterer Rücken',
  biceps: 'Bizeps',
  triceps: 'Trizeps',
  forearms: 'Unterarme',
  abs: 'Bauch',
  obliques: 'Seitl. Bauch',
  glutes: 'Po',
  quads: 'Oberschenkel vorn',
  hamstrings: 'Oberschenkel hinten',
}

/* Hauptmuskel = 1 Satz, Nebenmuskeln anteilig */
const MOVE_MUSCLES = {
  squat: { quads: 1, glutes: 1, hamstrings: 0.5, lowerback: 0.25 },
  lightSquat: { quads: 1, glutes: 0.5 },
  lunge: { quads: 1, glutes: 1, hamstrings: 0.5 },
  wallSit: { quads: 1, glutes: 0.5 },
  bridge: { glutes: 1, hamstrings: 0.5, lowerback: 0.25 },
  sideLegRaise: { glutes: 1, obliques: 0.25 },
  row: { back: 1, biceps: 0.5, shoulders: 0.25, lowerback: 0.25 },
  rowOneArm: { back: 1, biceps: 0.5, shoulders: 0.25 },
  curl: { biceps: 1, forearms: 0.5 },
  hammer: { biceps: 1, forearms: 1 },
  tricepsOverhead: { triceps: 1 },
  press: { shoulders: 1, triceps: 0.5 },
  lateral: { shoulders: 1 },
  pushup: { chest: 1, triceps: 0.5, shoulders: 0.5, abs: 0.25 },
  floorPress: { chest: 1, triceps: 0.5, shoulders: 0.25 },
  plank: { abs: 1, obliques: 0.5, shoulders: 0.25, lowerback: 0.25 },
  sidePlank: { obliques: 1, abs: 0.5, shoulders: 0.25 },
  mountainClimber: { abs: 1, quads: 0.25, shoulders: 0.25 },
  legRaise: { abs: 1 },
  bicycleCrunch: { abs: 1, obliques: 1 },
  russianTwist: { obliques: 1, abs: 0.5 },
}

const TYPE_FALLBACK = {
  lower: { quads: 1, glutes: 1 },
  upper: { back: 0.5, chest: 0.5, shoulders: 0.5 },
  core: { abs: 1, obliques: 0.5 },
}

/** Beanspruchte Muskeln einer Übung (nur Kraft- und Core-Übungen) */
export function musclesOf(step) {
  if (!step) return {}
  const type = step.type
  if (type && !['lower', 'upper', 'core'].includes(type)) return {}
  const key = moveFor(step)
  if (key && MOVE_MUSCLES[key]) return MOVE_MUSCLES[key]
  if (key) return {}
  return TYPE_FALLBACK[type] || {}
}

export function addMuscles(target, muscles, sets) {
  for (const [m, w] of Object.entries(muscles)) target[m] = (target[m] || 0) + w * sets
  return target
}

/** Geplante Sätze einer Übung (für zeitbasierte Übungen ohne Satz-Log) */
export function plannedSets(step, override) {
  if (override) return override
  const parsed = parseSets(step.reps)
  if (parsed.isSet) return parsed.sets
  return timedSeconds(step.reps) != null || /\d/.test(String(step.reps)) ? 1 : 0
}

const round = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [k, Math.round(v * 100) / 100]))

/**
 * Muskel-Sätze eines abgeschlossenen Trainings.
 * done: { [stepIndex]: true | 'skipped' }, sessionLog: { [stepIndex]: [sets] }
 */
export function workoutMuscles(steps, done, sessionLog, setsOf) {
  const out = {}
  steps.forEach((step, i) => {
    if (done[i] !== true) return
    const logged = (sessionLog[i] || []).filter(Boolean).length
    addMuscles(out, musclesOf(step), logged || plannedSets(step, setsOf?.(step)))
  })
  return round(out)
}

/** Muskel-Sätze aus dem Satz-Log eines Tages (für ältere Trainings ohne gespeicherte Werte) */
export function logMusclesOn(log, owner, date) {
  const out = {}
  const prefix = `${owner}::`
  for (const [key, entries] of Object.entries(log)) {
    if (!key.startsWith(prefix)) continue
    const entry = entries.find((e) => e.date === date)
    if (!entry) continue
    const name = baseName(key.slice(prefix.length))
    const muscles = musclesOf({ name, type: null })
    addMuscles(out, muscles, entry.sets.length)
  }
  return out
}

/**
 * Sätze pro Muskel im Zeitraum [from, to) für eine Person.
 * ownerOf(entry) liefert die Person eines Verlaufseintrags.
 */
export function muscleSetsFor({ history, log, owner, ownerOf, from, to }) {
  const out = {}
  const seen = new Set()
  for (const entry of history) {
    if (entry.date < from || entry.date >= to) continue
    if (ownerOf(entry) !== owner) continue
    if (entry.muscles) {
      for (const [m, v] of Object.entries(entry.muscles)) out[m] = (out[m] || 0) + v
    } else if (!seen.has(entry.date)) {
      seen.add(entry.date)
      for (const [m, v] of Object.entries(logMusclesOn(log, owner, entry.date))) out[m] = (out[m] || 0) + v
    }
  }
  return round(out)
}

/** Stufe 0–4 für die Einfärbung; ~10 Sätze pro Woche gelten als gut trainiert */
export function heatLevel(setsPerWeek) {
  if (setsPerWeek <= 0) return 0
  if (setsPerWeek < 3) return 1
  if (setsPerWeek < 6) return 2
  if (setsPerWeek < 10) return 3
  return 4
}
