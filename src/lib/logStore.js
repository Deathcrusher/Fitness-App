import { parseSets, timedSeconds } from './plans'
import { MOVES, moveFor } from './figure/moves'
import { comebackFor, smartSuggestion } from './training'

/*
 * Satz-Protokoll pro Person und Übung.
 * log = { "rene::Rudern": [ { date, at, program, sets: [{ w, r, f? }] }, … ] }
 * f = Gefühl des Satzes: 1 leicht, 2 passt, 3 hart
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
  const clean = sets.filter(Boolean).map((s) => {
    const set = { w: Number(s.w) || 0, r: Number(s.r) || 0 }
    if ([1, 2, 3].includes(s.f)) set.f = s.f
    return set
  })
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

/** Steigerungsvorschlag: doppelte Progression plus Gefühl und Comeback nach Pausen */
export function suggestion(last, range, step, comeback = null) {
  return smartSuggestion(last, range, step, comeback)
}

/** Comeback-Status einer Übung (Pause erkannt?) */
export function comebackOf(log, owner, name, today) {
  return comebackFor(entriesFor(log, owner, name), today)
}

/** Startwerte für einen Satz */
export function draftFor({ log, owner, step, setIndex, today, sessionSets }) {
  const range = targetRange(step.reps)
  const prevThisSession = sessionSets?.[setIndex - 1]
  if (prevThisSession) return { w: prevThisSession.w, r: prevThisSession.r, f: prevThisSession.f }
  const last = lastEntry(log, owner, step.name, today)
  const sug = suggestion(last, range, step, comebackOf(log, owner, step.name, today))
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
