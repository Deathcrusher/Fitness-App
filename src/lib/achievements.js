/*
 * Abzeichen – werden nur aus Verlauf und Satz-Log berechnet,
 * dadurch gibt es keinen zusätzlichen Speicher und nichts kann verloren gehen.
 */
const startOfWeekKey = (dateStr) => {
  const d = new Date(`${dateStr}T12:00:00`)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}

function longestWeekStreak(history) {
  const weeks = [...new Set(history.map((e) => startOfWeekKey(e.date)))].sort()
  let best = 0
  let run = 0
  let prev = null
  for (const w of weeks) {
    const expected = prev ? new Date(new Date(`${prev}T12:00:00`).getTime() + 7 * 86400000).toISOString().slice(0, 10) : null
    run = prev && expected === w ? run + 1 : 1
    best = Math.max(best, run)
    prev = w
  }
  return best
}

function bestGoalWeek(history) {
  const counts = {}
  for (const e of history) {
    const k = startOfWeekKey(e.date)
    counts[k] = (counts[k] || 0) + 1
  }
  return Math.max(0, ...Object.values(counts))
}

const hourOf = (e) => (e.completedAt ? new Date(e.completedAt).getHours() : 12)

export const ACHIEVEMENTS = [
  { id: 'first', title: 'Der Anfang', text: 'Erstes Training abgeschlossen', target: 1, value: (s) => s.count },
  { id: 'ten', title: 'Dranbleiber', text: '10 Trainings', target: 10, value: (s) => s.count },
  { id: 'fifty', title: 'Gewohnheit', text: '50 Trainings', target: 50, value: (s) => s.count },
  { id: 'hundred', title: 'Hundert', text: '100 Trainings', target: 100, value: (s) => s.count },
  { id: 'goal', title: 'Ziel erreicht', text: 'Wochenziel einmal geschafft', target: 1, value: (s) => (s.bestWeek >= s.goal ? 1 : 0) },
  { id: 'streak4', title: 'Vier Wochen', text: '4 Wochen am Stück trainiert', target: 4, value: (s) => s.streak },
  { id: 'streak12', title: 'Ein Quartal', text: '12 Wochen am Stück trainiert', target: 12, value: (s) => s.streak },
  { id: 'record', title: 'Persönliche Bestleistung', text: 'Ersten Rekord aufgestellt', target: 1, value: (s) => s.records },
  { id: 'records10', title: 'Rekordjäger', text: '10 Rekorde', target: 10, value: (s) => s.records },
  { id: 'ton', title: 'Eine Tonne', text: '1.000 kg in einem Training bewegt', target: 1000, value: (s) => s.bestVolume },
  { id: 'tons10', title: 'Schwergewicht', text: '10.000 kg insgesamt bewegt', target: 10000, value: (s) => s.totalVolume },
  { id: 'early', title: 'Frühaufsteher', text: 'Training vor 8 Uhr beendet', target: 1, value: (s) => s.early },
  { id: 'late', title: 'Nachtschicht', text: 'Training nach 21 Uhr beendet', target: 1, value: (s) => s.late },
]

export function achievementStats(history, goal = 3) {
  return {
    count: history.length,
    goal,
    bestWeek: bestGoalWeek(history),
    streak: longestWeekStreak(history),
    records: history.reduce((n, e) => n + (e.records || 0), 0),
    bestVolume: Math.max(0, ...history.map((e) => e.volume || 0)),
    totalVolume: history.reduce((n, e) => n + (e.volume || 0), 0),
    early: history.some((e) => hourOf(e) < 8) ? 1 : 0,
    late: history.some((e) => hourOf(e) >= 21) ? 1 : 0,
  }
}

export function evaluateAchievements(history, goal) {
  const stats = achievementStats(history, goal)
  return ACHIEVEMENTS.map((a) => {
    const value = a.value(stats)
    return { ...a, value: Math.min(value, a.target), unlocked: value >= a.target }
  })
}

export function newlyUnlocked(before, after, goal) {
  const was = new Set(evaluateAchievements(before, goal).filter((a) => a.unlocked).map((a) => a.id))
  return evaluateAchievements(after, goal).filter((a) => a.unlocked && !was.has(a.id))
}

/** Diese Woche gegen letzte Woche */
export function weekComparison(history, today = new Date()) {
  const start = new Date(today)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  const prevStart = new Date(start.getTime() - 7 * 86400000)
  const daysIn = Math.floor((today - start) / 86400000) + 1
  const prevSameSpanEnd = new Date(prevStart.getTime() + daysIn * 86400000)
  const pick = (from, to) => history.filter((e) => {
    const d = new Date(`${e.date}T12:00:00`)
    return d >= from && d < to
  })
  const sum = (list) => ({
    count: list.length,
    minutes: Math.round(list.reduce((n, e) => n + (e.durationSec || 0), 0) / 60),
    volume: list.reduce((n, e) => n + (e.volume || 0), 0),
  })
  return {
    current: sum(pick(start, new Date(start.getTime() + 7 * 86400000))),
    previous: sum(pick(prevStart, prevSameSpanEnd)),
    previousFull: sum(pick(prevStart, start)),
  }
}
