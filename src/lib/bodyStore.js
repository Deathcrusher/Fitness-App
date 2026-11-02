/*
 * Körperwerte pro Person: { rene: [{ date, weight, waist, chest, arm, thigh, hip }], … }
 * Liegt wie alles andere nur lokal (und landet automatisch im Backup).
 */
export const BODY_KEY = 'fitflow-body-v1'

export const BODY_FIELDS = {
  weight: { label: 'Körpergewicht', short: 'Gewicht', unit: 'kg', step: 0.1, min: 30, max: 250 },
  waist: { label: 'Bauchumfang', short: 'Bauch', unit: 'cm', step: 0.5, min: 40, max: 200 },
  chest: { label: 'Brustumfang', short: 'Brust', unit: 'cm', step: 0.5, min: 50, max: 200 },
  arm: { label: 'Oberarm', short: 'Arm', unit: 'cm', step: 0.5, min: 15, max: 70 },
  thigh: { label: 'Oberschenkel', short: 'Bein', unit: 'cm', step: 0.5, min: 30, max: 100 },
  hip: { label: 'Hüftumfang', short: 'Hüfte', unit: 'cm', step: 0.5, min: 50, max: 200 },
}

export function loadBody() {
  try {
    const v = JSON.parse(localStorage.getItem(BODY_KEY) || '{}')
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
  } catch {
    return {}
  }
}

export function saveBody(body) {
  try {
    localStorage.setItem(BODY_KEY, JSON.stringify(body))
  } catch {
    /* Speicher voll oder gesperrt */
  }
}

/** Werte eines Tages speichern; leere Felder werden entfernt */
export function upsertBody(body, owner, date, values) {
  const clean = {}
  for (const key of Object.keys(BODY_FIELDS)) {
    const n = Number(String(values[key] ?? '').replace(',', '.'))
    if (values[key] !== '' && values[key] != null && Number.isFinite(n) && n > 0) clean[key] = Math.round(n * 10) / 10
  }
  const list = (body[owner] || []).filter((e) => e.date !== date)
  if (Object.keys(clean).length) list.push({ date, ...clean })
  list.sort((a, b) => a.date.localeCompare(b.date))
  return { ...body, [owner]: list }
}

export function removeBody(body, owner, date) {
  return { ...body, [owner]: (body[owner] || []).filter((e) => e.date !== date) }
}

/** Verlauf eines Werts: [{ date, value }] */
export function seriesOf(entries, field) {
  return entries.filter((e) => e[field] > 0).map((e) => ({ date: e.date, value: e[field] }))
}

/** Veränderung gegenüber dem letzten Wert, der mindestens `days` Tage zurückliegt */
export function changeOver(series, days, today) {
  if (series.length < 2) return null
  const last = series[series.length - 1]
  const limit = new Date(`${today}T12:00:00`)
  limit.setDate(limit.getDate() - days)
  let ref = null
  for (const point of series) {
    if (new Date(`${point.date}T12:00:00`) <= limit) ref = point
  }
  if (!ref) ref = series[0]
  if (ref === last) return null
  return { diff: Math.round((last.value - ref.value) * 10) / 10, since: ref.date }
}
