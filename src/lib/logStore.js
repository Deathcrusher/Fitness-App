import { parseSets, timedSeconds } from './plans'
import { MOVES, moveFor } from './figure/moves'

/*
 * Satz-Protokoll pro Person und Übung.
 * log = { "rene::Rudern": [ { date, at, program, sets: [{ w, r }] }, … ] }
 */
const LOG_KEY = 'fitflow-log-v1'

export function loadLog() {
  try {
    const value = JSON.parse(localStorage.getItem(LOG_KEY) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

export function saveLog(log) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(log))
  } catch {
    /* Speicher voll oder gesperrt */
  }
}

/* "Knie heben – links" und "– rechts" zählen als eine Übung */
export const baseName = (name) => String(name || '').replace(/\s*[–-]\s*(links|rechts)\s*$/i, '').trim()
export const exKey = (owner, name) => `${owner}::${baseName(name)}`

export function entriesFor(log, owner, name) {
  return log[exKey(owner, name)] || []
}

export function lastEntry(log, owner, name, excludeDate) {
  const list = entriesFor(log, owner, name)
  for (let i = list.length - 1; i >= 0; i--) if (list[i].date !== excludeDate) return list[i]
  return null
}

export function upsertEntry(log, owner, name, date, sets, program) {
  const key = exKey(owner, name)
  const list = (log[key] || []).filter((entry) => entry.date !== date)
  const clean = sets.filter(Boolean).map((s) => ({ w: Number(s.w) || 0, r: Number(s.r) || 0 }))
  if (!clean.length) return { ...log, [key]: list }
  list.push({ date, at: new Date().toISOString(), program, sets: clean })
  list.sort((a, b) => a.date.localeCompare(b.date))
  return { ...log, [key]: list }
}

/** Ist die Übung eine mit Sätzen und Wiederholungen (also protokollierbar)? */
export function isLoggable(step) {
  if (!step || !['lower', 'upper', 'core'].includes(step.type)) return false
  if (timedSeconds(step.reps) != null) return false
  return /\d/.test(String(step.reps))
}

/** Wird die Übung typischerweise mit Gewicht gemacht? */
export function usesWeight(step) {
  const key = moveFor(step)
  if (key && MOVES[key]?.bell) return true
  return /hantel|curl|drück|rudern|seitheben|kettlebell|gewicht/i.test(`${step?.name} ${step?.detail}`)
}

export function targetRange(reps) {
  const per = parseSets(reps).per
  const range = per.match(/(\d+)\s*[-–]\s*(\d+)/)
  if (range) return [Number(range[1]), Number(range[2])]
  const single = per.match(/(\d+)/)
  return single ? [Number(single[1]), Number(single[1])] : [10, 10]
}

export const fmtKg = (w) => `${String(Math.round(w * 10) / 10).replace('.', ',')} kg`
export const fmtSet = (s) => (s.w > 0 ? `${fmtKg(s.w)} × ${s.r}` : `${s.r} Wdh.`)

export function bests(entries) {
  let maxW = 0
  let maxRAtMaxW = 0
  let maxR = 0
  for (const entry of entries) {
    for (const s of entry.sets) {
      if (s.w > maxW || (s.w === maxW && s.r > maxRAtMaxW)) {
        maxW = s.w
        maxRAtMaxW = s.r
      }
      if (s.r > maxR) maxR = s.r
    }
  }
  return { maxW, maxRAtMaxW, maxR, sessions: entries.length }
}

/** Neuer Rekord gegenüber allen früheren Einheiten? */
export function isRecord(previous, set) {
  if (!previous.length) return false
  const best = bests(previous)
  if (set.w > 0) return set.w > best.maxW || (set.w === best.maxW && set.r > best.maxRAtMaxW)
  return best.maxW === 0 && set.r > best.maxR
}

/** Steigerungsvorschlag nach dem Prinzip der doppelten Progression */
export function suggestion(last, range, step) {
  if (!last || !last.sets.length) return null
  const sets = last.sets
  const topW = Math.max(...sets.map((s) => s.w || 0))
  const allHit = sets.every((s) => s.r >= range[1])
  if (topW > 0) {
    if (allHit) {
      const inc = step?.type === 'lower' ? 2 : 1
      return { kind: 'up', w: topW + inc, r: range[0], text: `Steigern auf ${fmtKg(topW + inc)}` }
    }
    return { kind: 'hold', w: topW, r: Math.min(range[1], Math.max(...sets.map((s) => s.r)) + 1), text: `${fmtKg(topW)} halten` }
  }
  const maxR = Math.max(...sets.map((s) => s.r))
  if (allHit) return { kind: 'up', w: 0, r: maxR + 1, text: `Ziel: ${maxR + 1} Wdh.` }
  return { kind: 'hold', w: 0, r: range[1], text: `Ziel: ${range[1]} Wdh.` }
}

/** Startwerte für einen Satz */
export function draftFor({ log, owner, step, setIndex, today, sessionSets }) {
  const range = targetRange(step.reps)
  const prevThisSession = sessionSets?.[setIndex - 1]
  if (prevThisSession) return { w: prevThisSession.w, r: prevThisSession.r }
  const last = lastEntry(log, owner, step.name, today)
  const sug = suggestion(last, range, step)
  if (sug) return { w: sug.w, r: sug.r }
  if (last) {
    const s = last.sets[Math.min(setIndex, last.sets.length - 1)]
    return { w: s.w, r: s.r }
  }
  return { w: 0, r: range[0] }
}

export function volumeOf(sets) {
  return sets.reduce((n, s) => n + (s?.w || 0) * (s?.r || 0), 0)
}

/** Grobe Trainingsdauer in Minuten */
export function estimateMinutes(steps, pauseSeconds) {
  let sec = 0
  for (const step of steps) {
    const reps = String(step.reps)
    const minutes = reps.match(/(\d+)\s*(?:[-–]\s*\d+\s*)?Min/i)
    const timed = timedSeconds(reps)
    const { sets, isSet } = parseSets(reps)
    if (minutes) sec += Number(minutes[1]) * 60
    else if (timed != null) sec += (isSet ? sets : 1) * (timed + (step.type === 'warmup' ? 5 : pauseSeconds / 2))
    else sec += (isSet ? sets : 1) * (40 + pauseSeconds)
  }
  return Math.max(5, Math.round(sec / 60 / 5) * 5)
}
