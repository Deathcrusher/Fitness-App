/*
 * Trainings-Erinnerungen als wiederkehrende Kalendertermine (.ics).
 * Funktioniert ohne Server: der Kalender des Handys erinnert zuverlässig,
 * auch wenn FitFlow geschlossen ist.
 */
export const REMINDER_KEY = 'fitflow-reminder-v1'

export const WEEKDAYS = [
  ['MO', 'Mo'], ['TU', 'Di'], ['WE', 'Mi'], ['TH', 'Do'], ['FR', 'Fr'], ['SA', 'Sa'], ['SU', 'So'],
]
const JS_DAY = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }

export const DEFAULT_REMINDER = { days: ['MO', 'WE', 'FR'], time: '18:00', minutes: 45, alarm: 10 }

export function loadReminder() {
  try {
    const r = JSON.parse(localStorage.getItem(REMINDER_KEY) || 'null')
    if (!r || typeof r !== 'object') return DEFAULT_REMINDER
    return {
      days: Array.isArray(r.days) ? r.days.filter((d) => d in JS_DAY) : DEFAULT_REMINDER.days,
      time: /^\d{2}:\d{2}$/.test(r.time) ? r.time : DEFAULT_REMINDER.time,
      minutes: Number(r.minutes) > 0 ? Number(r.minutes) : DEFAULT_REMINDER.minutes,
      alarm: Number.isFinite(Number(r.alarm)) ? Number(r.alarm) : DEFAULT_REMINDER.alarm,
    }
  } catch {
    return DEFAULT_REMINDER
  }
}

const pad = (n) => String(n).padStart(2, '0')
const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
const utcStamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/** Erster Termin: heute (falls Uhrzeit noch nicht vorbei) oder der nächste gewählte Wochentag */
export function firstOccurrence(days, time, now = new Date()) {
  const [h, m] = time.split(':').map(Number)
  const wanted = new Set(days.map((d) => JS_DAY[d]))
  for (let add = 0; add < 8; add++) {
    const d = new Date(now)
    d.setDate(now.getDate() + add)
    d.setHours(h, m, 0, 0)
    if (wanted.has(d.getDay()) && d > now) return d
  }
  return null
}

/** Kalenderdatei mit einem wöchentlich wiederkehrenden Termin */
export function buildIcs({ days, time, minutes = 45, alarm = 10, name = 'FitFlow', url = null, now = new Date() }) {
  if (!days.length) return null
  const start = firstOccurrence(days, time, now)
  const end = new Date(start.getTime() + minutes * 60000)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FitFlow//Trainingserinnerung//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:fitflow-training-${days.join('')}-${time.replace(':', '')}@fitflow`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${days.join(',')}`,
    `SUMMARY:💪 Training – ${name}`,
    'DESCRIPTION:Zeit für dein Training in FitFlow. Die App schlägt dir den fälligen Tag vor.',
  ]
  if (url) lines.push(`URL:${url}`)
  if (alarm >= 0) {
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Gleich ist Training!', `TRIGGER:-PT${alarm}M`, 'END:VALARM')
  }
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return `${lines.join('\r\n')}\r\n`
}

/** Datei teilen (iOS/Android) oder herunterladen */
export async function deliverIcs(text, filename) {
  const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' })
  const file = new File([blob], filename, { type: 'text/calendar' })
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] })
      return 'shared'
    }
  } catch (e) {
    if (e?.name === 'AbortError') return 'cancelled'
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
  return 'downloaded'
}
