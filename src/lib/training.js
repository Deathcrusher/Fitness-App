/*
 * Trainingslogik ohne UI: Comeback nach Pausen, geschätztes 1RM,
 * Gefühl (RPE) pro Satz und Scheibenrechner.
 */

const DAY = 86400000
const toDate = (key) => new Date(`${key}T12:00:00`)
export const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / DAY)

/** Gewicht auf sinnvolle Schritte runden (kleine Hanteln 0,5 kg, sonst 1 kg) */
export function roundWeight(w) {
  if (w <= 0) return 0
  return w < 10 ? Math.round(w * 2) / 2 : Math.round(w)
}

/* ---------- Gefühl pro Satz ---------- */
export const FEELS = [
  { value: 1, label: 'Leicht', short: 'leicht' },
  { value: 2, label: 'Passt', short: 'passt' },
  { value: 3, label: 'Hart', short: 'hart' },
]

/** Zusammenfassung des Gefühls einer Einheit: 'easy' | 'hard' | null */
export function sessionFeel(sets) {
  const rated = sets.filter((s) => s?.f)
  if (!rated.length) return null
  if (rated.some((s) => s.f === 3)) return 'hard'
  if (rated.every((s) => s.f === 1)) return 'easy'
  return null
}

/* ---------- Geschätztes Maximalgewicht (Epley) ---------- */
export function e1rm(set) {
  if (!set || !(set.w > 0) || !(set.r > 0)) return 0
  if (set.r === 1) return set.w
  // Über 15 Wiederholungen wird die Formel ungenau
  return set.w * (1 + Math.min(set.r, 15) / 30)
}

export function bestE1rm(sets) {
  return sets.reduce((best, s) => Math.max(best, e1rm(s)), 0)
}

/* ---------- Comeback nach Trainingspausen ---------- */
export const PAUSE_DAYS = 14

/** Wie stark nach einer Pause reduziert wird */
export function comebackFactor(gapDays) {
  if (gapDays >= 56) return 0.7
  if (gapDays >= 28) return 0.8
  if (gapDays >= PAUSE_DAYS) return 0.9
  return 1
}

const topWeight = (entry) => Math.max(0, ...entry.sets.map((s) => s.w || 0))
const topReps = (entry) => Math.max(0, ...entry.sets.map((s) => s.r || 0))

/**
 * Comeback-Status für eine Übung.
 * - 'restart': letzte Einheit liegt eine Pause zurück → reduziert einsteigen
 * - 'ramp': nach der Pause schon wieder trainiert, aber noch unter dem alten Niveau
 * Gibt null zurück, wenn keine Pause erkennbar ist.
 */
export function comebackFor(entries, today) {
  const past = entries.filter((e) => e.date < today && e.sets?.length)
  if (!past.length) return null
  const last = past[past.length - 1]
  const weighted = topWeight(last) > 0
  const value = (e) => (weighted ? topWeight(e) : topReps(e))

  const gap = daysBetween(last.date, today)
  if (gap >= PAUSE_DAYS) {
    const factor = comebackFactor(gap)
    const before = value(last)
    const target = weighted ? roundWeight(before * factor) : Math.max(1, Math.round(before * factor))
    return { kind: 'restart', gap, factor, before, target, weighted }
  }

  // Lücke innerhalb der letzten Einheiten suchen (max. 6 Wochen zurück)
  for (let i = past.length - 1; i > 0; i--) {
    if (daysBetween(past[i].date, today) > 42) break
    const pause = daysBetween(past[i - 1].date, past[i].date)
    if (pause >= PAUSE_DAYS) {
      const before = value(past[i - 1])
      const now = value(last)
      if (now >= before) return null
      return { kind: 'ramp', gap: pause, before, now, weighted, sessionsSince: past.length - i }
    }
  }
  return null
}

/* ---------- Steigerungsvorschlag ---------- */
export const fmtNum = (n) => String(Math.round(n * 10) / 10).replace('.', ',')
const fmtKg = (w) => `${fmtNum(w)} kg`

/**
 * Doppelte Progression, ergänzt um Gefühl und Comeback.
 * last: letzte Einheit, range: [min, max] Wiederholungen, step: Übung,
 * comeback: Ergebnis von comebackFor
 */
export function smartSuggestion(last, range, step, comeback) {
  if (!last || !last.sets.length) return null
  const sets = last.sets
  const topW = topWeight(last)
  const feel = sessionFeel(sets)
  const inc = step?.type === 'lower' ? 2 : 1

  if (comeback?.kind === 'restart') {
    const days = comeback.gap
    if (comeback.weighted) {
      return { kind: 'comeback', w: comeback.target, r: range[0], text: `Comeback: ${fmtKg(comeback.target)}`, note: `${days} Tage Pause – sanft mit ${Math.round(comeback.factor * 100)} % einsteigen.` }
    }
    return { kind: 'comeback', w: 0, r: comeback.target, text: `Comeback: ${comeback.target} Wdh.`, note: `${days} Tage Pause – sanft wieder reinkommen.` }
  }

  const allHit = sets.every((s) => s.r >= range[1])
  const allMin = sets.every((s) => s.r >= range[0])

  if (comeback?.kind === 'ramp' && feel !== 'hard' && allMin) {
    if (comeback.weighted) {
      const jump = Math.max(inc, roundWeight(comeback.before * 0.1))
      const w = Math.min(comeback.before, roundWeight(topW + jump))
      if (w > topW) return { kind: 'up', w, r: range[0], text: `Zurück zu ${fmtKg(w)}`, note: `Vor der Pause: ${fmtKg(comeback.before)}` }
    } else {
      const r = Math.min(comeback.before, comeback.now + Math.max(1, Math.round(comeback.before * 0.1)))
      if (r > comeback.now) return { kind: 'up', w: 0, r, text: `Ziel: ${r} Wdh.`, note: `Vor der Pause: ${comeback.before} Wdh.` }
    }
  }

  if (topW > 0) {
    if (allHit && feel !== 'hard') {
      const w = topW + (feel === 'easy' ? inc * 2 : inc)
      return { kind: 'up', w, r: range[0], text: `Steigern auf ${fmtKg(w)}`, note: feel === 'easy' ? 'Letztes Mal leicht – größerer Schritt.' : null }
    }
    const r = Math.min(range[1], Math.max(...sets.map((s) => s.r)) + 1)
    return { kind: 'hold', w: topW, r, text: `${fmtKg(topW)} halten`, note: allHit && feel === 'hard' ? 'Letztes Mal hart – erst sauber festigen.' : null }
  }
  const maxR = topReps(last)
  if (allHit && feel !== 'hard') {
    const r = maxR + (feel === 'easy' ? 2 : 1)
    return { kind: 'up', w: 0, r, text: `Ziel: ${r} Wdh.`, note: null }
  }
  return { kind: 'hold', w: 0, r: range[1], text: `Ziel: ${range[1]} Wdh.`, note: null }
}

/* ---------- Scheibenrechner ---------- */
export const DEFAULT_PLATES = [10, 5, 2.5, 1.25, 0.5]

/**
 * Welche Scheiben pro Seite auf die Stange müssen.
 * Gibt { perSide: [..], rest } zurück; rest > 0 heißt: nicht exakt erreichbar.
 */
export function platesFor(total, bar, plates = DEFAULT_PLATES) {
  const sorted = [...plates].filter((p) => p > 0).sort((a, b) => b - a)
  let side = Math.round(((total - bar) / 2) * 1000) / 1000
  if (side < 0) return { perSide: [], rest: side * 2, below: true }
  const perSide = []
  for (const p of sorted) {
    while (side + 1e-9 >= p) {
      perSide.push(p)
      side = Math.round((side - p) * 1000) / 1000
    }
  }
  return { perSide, rest: Math.round(side * 2 * 1000) / 1000, below: false }
}
