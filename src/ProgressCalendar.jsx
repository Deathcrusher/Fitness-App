import React from 'react'
import { CalendarCheck2, Flame, Trophy } from 'lucide-react'

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

function streakFor(history, today) {
  const completed = new Set(history.map((entry) => entry.date))
  let cursor = new Date(today)
  cursor.setHours(0, 0, 0, 0)
  if (!completed.has(dateKey(cursor))) cursor = addDays(cursor, -1)

  let streak = 0
  while (completed.has(dateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export default function ProgressCalendar({ history }) {
  const today = new Date()
  const todayKey = dateKey(today)
  const completedDates = new Set(history.map((entry) => entry.date))
  const weekStart = startOfWeek(today)
  const weekEnd = addDays(weekStart, 7)
  const thisWeek = history.filter((entry) => {
    const value = new Date(`${entry.date}T12:00:00`)
    return value >= weekStart && value < weekEnd
  }).length

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
          <Trophy size={22} />
          <strong>{history.length}</strong>
          <span>Trainings gesamt</span>
        </article>
        <article>
          <CalendarCheck2 size={22} />
          <strong>{thisWeek}</strong>
          <span>Diese Woche</span>
        </article>
        <article>
          <Flame size={22} />
          <strong>{streakFor(history, today)}</strong>
          <span>Tage in Serie</span>
        </article>
      </div>

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

      {history.length === 0 && (
        <p className="progressEmpty">Schließe dein erstes Training ab – dann erscheint hier dein erster Erfolg.</p>
      )}
    </section>
  )
}

function CheckMark() {
  return <span className="calendarCheck" aria-hidden="true">✓</span>
}
