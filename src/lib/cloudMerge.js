// Deterministic, additive merge of durable FitFlow data from different devices.
// A complete immutable cloud snapshot is retained after every successful upload.
const parse = (value, fallback) => {
  try { return JSON.parse(value) ?? fallback } catch { return fallback }
}
const str = (value) => JSON.stringify(value)
const object = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const array = (value) => Array.isArray(value) ? value : []

function mergeHistory(a, b) {
  const rows = new Map()
  for (const e of [...array(b), ...array(a)]) {
    if (!e || typeof e !== 'object') continue
    const key = e.key || [e.date, e.programId, e.dayIndex].join(':')
    const prev = rows.get(key)
    if (!prev || String(e.updatedAt || e.completedAt || '') >= String(prev.updatedAt || prev.completedAt || '')) rows.set(key, e)
  }
  return [...rows.values()].sort((x, y) =>
    String(x.date || '').localeCompare(String(y.date || '')) ||
    String(x.completedAt || '').localeCompare(String(y.completedAt || '')))
}

function mergeLogs(a, b) {
  const result = {}
  for (const key of new Set([...Object.keys(object(b)), ...Object.keys(object(a))])) {
    const rows = new Map()
    for (const e of [...array(b?.[key]), ...array(a?.[key])]) {
      if (!e?.date) continue
      const prev = rows.get(e.date)
      if (!prev || String(e.at || '') >= String(prev.at || '')) rows.set(e.date, e)
    }
    result[key] = [...rows.values()].sort((x, y) => x.date.localeCompare(y.date))
  }
  return result
}
function mergeBody(a, b) {
  const result = {}
  for (const key of new Set([...Object.keys(object(b)), ...Object.keys(object(a))])) {
    const rows = new Map()
    for (const e of [...array(b?.[key]), ...array(a?.[key])]) {
      if (e?.date) rows.set(e.date, { ...(rows.get(e.date) || {}), ...e })
    }
    result[key] = [...rows.values()].sort((x, y) => x.date.localeCompare(y.date))
  }
  return result
}

// "local" wins conflicting preferences, while historical entries are unioned by stable IDs.
export function mergeFitflowData(local, remote) {
  const a = object(local)
  const b = object(remote)
  const out = { ...b, ...a }
  const mergeJSON = (key, combine, fallback) => {
    if (a[key] == null && b[key] == null) return
    out[key] = str(combine(parse(a[key], fallback), parse(b[key], fallback)))
  }
  mergeJSON('fitflow-history-v1', mergeHistory, [])
  mergeJSON('fitflow-log-v1', mergeLogs, {})
  mergeJSON('fitflow-body-v1', mergeBody, {})
  for (const key of ['fitflow-custom-plans-v1', 'fitflow-sets-v1', 'fitflow-videos-v1']) {
    if (a[key] != null || b[key] != null) {
      out[key] = str({ ...object(parse(b[key], {})), ...object(parse(a[key], {})) })
    }
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
}

export function sameFitflowData(a, b) {
  const keysA = Object.keys(object(a)).sort()
  const keysB = Object.keys(object(b)).sort()
  return keysA.length === keysB.length && keysA.every((key, i) => key === keysB[i] && a[key] === b[key])
}
