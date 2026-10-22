import React, { useMemo, useState } from 'react'
import { CalendarCheck2, Clock3, Flame, Trophy } from 'lucide-react'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export function dateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date, amount) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function startOfWeek(date) {
  const result = new Date(date)
  const weekday = (result.getDay() + 6) % 7
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - weekday)
  return result
}

export function weekStreak(history, today = new Date()) {
  const weeks = new Set(history.map((entry) => dateKey(startOfWeek(new Date(`${entry.date}T12:00:00`)))))
  let cursor = startOfWeek(today)
  if (!weeks.has(dateKey(cursor))) cursor = addDays(cursor, -7)
  let streak = 0
  while (weeks.has(dateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -7)
  }
  return streak
}


const METRICS = {
  count: { label: 'Trainings', unit: (v) => (v === 1 ? 'Training' : 'Trainings'), value: (list) => list.length },
  minutes: { label: 'Minuten', unit: () => 'Min', value: (list) => Math.round(list.reduce((n, e) => n + (e.durationSec || 0), 0) / 60) },
  sets: { label: 'Sätze', unit: (v) => (v === 1 ? 'Satz' : 'Sätze'), value: (list) => list.reduce((n, e) => n + (e.sets || 0), 0) },
  volume: { label: 'Volumen', unit: () => 'kg', value: (list) => list.reduce((n, e) => n + (e.volume || 0), 0) },
}

const compact = (v) => (v >= 1000 ? `${String(Math.round(v / 100) / 10).replace('.', ',')}k` : String(Math.round(v * 10) / 10).replace('.', ','))
const WEEKS = 8

function niceMax(value) {
  if (value <= 4) return 4
  const pow = 10 ** Math.floor(Math.log10(value))
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (step * pow >= value) return step * pow
  }
  return value
}

function WeeklyChart({ history, today }) {
  const [metric, setMetric] = useState('count')
  const weeks = useMemo(() => {
    const current = startOfWeek(today)
    return Array.from({ length: WEEKS }, (_, i) => {
      const start = addDays(current, (i - WEEKS + 1) * 7)
      const end = addDays(start, 7)
      const entries = history.filter((entry) => {
        const value = new Date(`${entry.date}T12:00:00`)
        return value >= start && value < end
      })
      return { start, entries }
    })
  }, [history, today])
  const [selected, setSelected] = useState(WEEKS - 1)
  const m = METRICS[metric]
  const values = weeks.map((w) => m.value(w.entries))
  const max = niceMax(Math.max(...values, 1))
  const pick = values[selected]
  const fmtDay = (d) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' })

  return (
    <article className="chartCard">
      <div className="chartHead">
        <div>
          <h3>Letzte 8 Wochen</h3>
          <p>
            <strong className="num">{pick.toLocaleString('de-DE')}</strong> {m.unit(pick)}
            <span> in der Woche ab {fmtDay(weeks[selected].start)}</span>
          </p>
        </div>
      </div>
      <div className="segmented small" role="tablist" aria-label="Kennzahl">
        {Object.entries(METRICS).map(([key, item]) => (
          <button key={key} role="tab" aria-selected={metric === key} className={metric === key ? 'active' : ''} onClick={() => setMetric(key)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="barChart" role="group" aria-label={`${m.label} pro Woche`}>
        <div className="barGrid" aria-hidden="true">
          <span data-value={compact(max)} />
          <span data-value={compact(max / 2)} />
          <span data-value={0} />
        </div>
        <div className="bars">
          {weeks.map((w, i) => (
            <button
              key={i}
              className={`barSlot${i === selected ? ' active' : ''}`}
              onClick={() => setSelected(i)}
              onMouseEnter={() => setSelected(i)}
              aria-label={`Woche ab ${fmtDay(w.start)}: ${values[i]} ${m.unit(values[i])}`}
              aria-pressed={i === selected}
            >
              <span className="barTrack" style={{ '--h': `${(values[i] / max) * 100}%` }}>
                {i === selected && <em className="num">{compact(values[i])}</em>}
                <span className="bar" style={{ height: `${(values[i] / max) * 100}%` }} />
              </span>
              <small>{i === WEEKS - 1 ? 'Jetzt' : fmtDay(w.start)}</small>
            </button>
          ))}
        </div>
      </div>
      {metric === 'volume' && !history.some((e) => e.volume) && (
        <p className="chartNote">Volumen = Gewicht × Wiederholungen. Es wird erfasst, sobald du beim Training Gewichte einträgst.</p>
      )}
      {(metric === 'minutes' || metric === 'sets') && history.some((e) => e.durationSec == null) && (
        <p className="chartNote">Zeit und Sätze werden seit Version 1.5 erfasst. Ältere Trainings zählen hier mit 0.</p>
      )}
    </article>
  )
}

function RecentList({ history }) {
  const recent = [...history].sort((a, b) => (b.completedAt || b.date).localeCompare(a.completedAt || a.date)).slice(0, 6)
  if (!recent.length) return null
  return (
    <article className="recentCard">
      <h3>Letzte Trainings</h3>
      <ul>
        {recent.map((entry) => {
          const date = new Date(`${entry.date}T12:00:00`)
          return (
            <li key={entry.key}>
              <span className="recentDate">
                <strong className="num">{date.getDate()}</strong>
                <small>{date.toLocaleDateString('de-DE', { month: 'short' })}</small>
              </span>
              <span className="recentCopy">
                <strong>{entry.dayName}</strong>
                <small>{entry.programName}</small>
              </span>
              <span className="recentMeta">
                {entry.durationSec ? <span><Clock3 size={13} /> {Math.max(1, Math.round(entry.durationSec / 60))} Min</span> : null}
                {entry.volume ? <span>{entry.volume.toLocaleString('de-DE')} kg</span> : entry.sets ? <span>{entry.sets} Sätze</span> : null}
                {entry.records ? <span className="recentRecord">{entry.records === 1 ? '1 Rekord' : `${entry.records} Rekorde`}</span> : null}
              </span>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

export default function ProgressCalendar({ history, goal = 3 }) {
  const today = new Date()
  const todayKey = dateKey(today)
  const completedDates = new Set(history.map((entry) => entry.date))
  const weekStart = startOfWeek(today)
  const weekEnd = addDays(weekStart, 7)
  const thisWeek = history.filter((entry) => {
    const value = new Date(`${entry.date}T12:00:00`)
    return value >= weekStart && value < weekEnd
  }).length

  const timed = history.filter((entry) => entry.durationSec)
  const avgMinutes = timed.length ? Math.round(timed.reduce((n, e) => n + e.durationSec, 0) / timed.length / 60) : 0

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const offset = (monthStart.getDay() + 6) % 7
  const gridStart = addDays(monthStart, -offset)
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
  const monthLabel = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(today)

  return (
    <section className="progressDashboard" aria-label="Trainingsfortschritt">
      <div className="progressIntro">
        <div>
          <p className="eyebrow"><CalendarCheck2 size={16} /> Dein Fortschritt</p>
          <h2>Dranbleiben lohnt sich</h2>
          <p>Fertige Trainings werden automatisch in deinem Kalender gespeichert.</p>
        </div>
      </div>

      <div className="progressStats">
        <article>
          <Trophy size={18} />
          <strong>{history.length}</strong>
          <span>Gesamt</span>
        </article>
        <article>
          <CalendarCheck2 size={18} />
          <strong>{thisWeek}<small>/{goal}</small></strong>
          <span>Wochenziel</span>
          <i className="goalBar" aria-hidden="true"><b style={{ width: `${Math.min(100, (thisWeek / goal) * 100)}%` }} /></i>
        </article>
        <article>
          <Flame size={18} />
          <strong>{weekStreak(history, today)}</strong>
          <span>Wochen-Serie</span>
        </article>
        <article>
          <Clock3 size={18} />
          <strong>{avgMinutes ? `${avgMinutes}′` : '–'}</strong>
          <span>Ø Dauer</span>
        </article>
      </div>

      {history.length > 0 && <WeeklyChart history={history} today={today} />}

      <article className="calendarCard">
        <div className="calendarHead">
          <h3>{monthLabel}</h3>
          <span><i /> Training absolviert</span>
        </div>
        <div className="calendarGrid calendarWeekdays" aria-hidden="true">
          {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="calendarGrid">
          {days.map((date) => {
            const key = dateKey(date)
            const completed = completedDates.has(key)
            const outside = date.getMonth() !== today.getMonth()
            return (
              <div
                key={key}
                className={`${completed ? 'completed ' : ''}${outside ? 'outside ' : ''}${key === todayKey ? 'today' : ''}`.trim()}
                aria-label={`${date.toLocaleDateString('de-DE')}${completed ? ': Training absolviert' : ''}`}
              >
                <span>{date.getDate()}</span>
                {completed && <CheckMark />}
              </div>
            )
          })}
        </div>
      </article>

      <RecentList history={history} />

      {history.length === 0 && (
        <p className="progressEmpty">Schließe dein erstes Training ab – dann erscheint hier dein erster Erfolg.</p>
      )}
    </section>
  )
}

function CheckMark() {
  return <span className="calendarCheck" aria-hidden="true">✓</span>
}
