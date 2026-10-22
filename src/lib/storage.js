import { examplePlans } from './plans'

/* Lokale Speicherung (localStorage) und Zeit-Helfer */

export const STORAGE_KEY = 'fitflow-state-v2'
export const CUSTOM_KEY = 'fitflow-custom-plans-v1'
export const VIDEOS_KEY = 'fitflow-videos-v1'
export const HISTORY_KEY = 'fitflow-history-v1'
export const SESSION_KEY = 'fitflow-session-v1'
export const THEME_KEY = 'fitflow-theme-v1'
export const GOAL_KEY = 'fitflow-goal-v1'
export const SETS_KEY = 'fitflow-sets-v1'

export function loadGoal() {
  try {
    const n = Number(localStorage.getItem(GOAL_KEY))
    return n >= 1 && n <= 7 ? n : 3
  } catch {
    return 3
  }
}

export function weekCountOf(history) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  return history.filter((e) => new Date(`${e.date}T12:00:00`) >= start).length
}

export const fmtVolume = (kg) => (kg >= 1000 ? `${(kg / 1000).toFixed(1).replace('.', ',')} t` : `${Math.round(kg)} kg`)
export const THEME_ORDER = ['system', 'light', 'dark']

export function loadTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return THEME_ORDER.includes(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

export function loadSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}')
    return {
      key: typeof parsed.key === 'string' ? parsed.key : null,
      startedAt: Number(parsed.startedAt) || null,
      elapsedMs: Math.max(0, Number(parsed.elapsedMs) || 0),
      running: Boolean(parsed.running && parsed.startedAt),
    }
  } catch {
    return { key: null, startedAt: null, elapsedMs: 0, running: false }
  }
}

export function sessionElapsed(session, now = Date.now()) {
  return session.elapsedMs + (session.running && session.startedAt ? now - session.startedAt : 0)
}

export function formatDuration(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const sec = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

export function humanDuration(milliseconds) {
  const minutes = Math.round(milliseconds / 60000)
  if (minutes < 1) return '< 1 Min'
  if (minutes < 60) return `${minutes} Min`
  return `${Math.floor(minutes / 60)} h ${minutes % 60} Min`
}


export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}
export function loadCustomPlans() {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY)
    if (raw === null) {
      const seeded = {}
      for (const p of examplePlans()) seeded[p.id] = p
      return seeded
    }
    const parsed = JSON.parse(raw)
    const out = {}
    for (const [k, v] of Object.entries(parsed)) {
      out[k] = { ...v, owner: v.owner || 'connie' }
    }
    return out
  } catch {
    return {}
  }
}
export function loadVideos() {
  try {
    const raw = localStorage.getItem(VIDEOS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Wert sicher speichern – volle oder gesperrte Speicher werden ignoriert */
export function persist(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  } catch {
    /* Speicher voll oder gesperrt */
  }
}
