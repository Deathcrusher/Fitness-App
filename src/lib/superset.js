/*
 * Supersätze: step.superset = true verbindet eine Übung mit der nächsten.
 * Ablauf: A1 Satz 1 → B1 Satz 1 → Pause → A1 Satz 2 → B1 Satz 2 → Pause …
 */

/** [start, end] der Supersatz-Gruppe, zu der Übung i gehört – oder null */
export function groupOf(steps, i) {
  if (!steps[i]) return null
  let start = i
  while (start > 0 && steps[start - 1]?.superset) start -= 1
  let end = i
  while (end < steps.length - 1 && steps[end]?.superset) end += 1
  return end > start ? [start, end] : null
}

/** Buchstabe und Position in der Gruppe, z. B. { letter: 'A', pos: 1, size: 2 } */
export function supersetLabel(steps, i) {
  const g = groupOf(steps, i)
  if (!g) return null
  let letter = 0
  for (let k = 0; k < g[0]; k++) {
    const other = groupOf(steps, k)
    if (other && other[0] === k) letter += 1
  }
  return { letter: String.fromCharCode(65 + letter), pos: i - g[0] + 1, size: g[1] - g[0] + 1, start: g[0], end: g[1] }
}

/** Nächster Partner im selben Durchgang (direkt, ohne Pause) – oder null */
export function partnerAfter(steps, i, setIndex, setsOf) {
  const g = groupOf(steps, i)
  if (!g) return null
  for (let j = i + 1; j <= g[1]; j++) if (setsOf(j) > setIndex) return { step: j, set: setIndex }
  return null
}

/**
 * Wohin es nach der Pause geht: { step, set } oder null (Training fertig).
 * done: Übungen, die damit abgeschlossen sind.
 */
export function afterRest(steps, i, setIndex, setsOf) {
  const g = groupOf(steps, i)
  if (!g) {
    if (setIndex < setsOf(i) - 1) return { step: i, set: setIndex + 1, done: [] }
    return i < steps.length - 1 ? { step: i + 1, set: 0, done: [i] } : { step: null, set: 0, done: [i] }
  }
  const round = setIndex + 1
  for (let j = g[0]; j <= g[1]; j++) if (setsOf(j) > round) return { step: j, set: round, done: [] }
  const done = []
  for (let j = g[0]; j <= g[1]; j++) done.push(j)
  return g[1] < steps.length - 1 ? { step: g[1] + 1, set: 0, done } : { step: null, set: 0, done }
}

/** Was als Nächstes kommt (für die Vorschau) */
export function upcoming(steps, i, setIndex, setsOf) {
  const partner = partnerAfter(steps, i, setIndex, setsOf)
  if (partner) return { kind: 'partner', ...partner }
  const next = afterRest(steps, i, setIndex, setsOf)
  if (next.step == null) return { kind: 'finish' }
  if (next.step === i) return { kind: 'set', ...next }
  if (groupOf(steps, i) && next.done.length === 0) return { kind: 'round', ...next }
  return { kind: 'step', ...next }
}
