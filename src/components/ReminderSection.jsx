import React, { useEffect, useState } from 'react'
import { BellRing } from 'lucide-react'
import { REMINDER_KEY, WEEKDAYS, buildIcs, deliverIcs, loadReminder } from '../lib/reminders'
import { persist } from '../lib/storage'

const ALARMS = [[0, 'Zur Startzeit'], [10, '10 Min vorher'], [30, '30 Min vorher'], [60, '1 Std vorher']]

export default function ReminderSection({ name, goal }) {
  const [r, setR] = useState(loadReminder)
  const [status, setStatus] = useState(null)
  useEffect(() => { persist(REMINDER_KEY, r) }, [r])

  const toggleDay = (d) => {
    setStatus(null)
    setR((prev) => ({ ...prev, days: prev.days.includes(d) ? prev.days.filter((x) => x !== d) : WEEKDAYS.map(([k]) => k).filter((k) => k === d || prev.days.includes(k)) }))
  }

  async function addToCalendar() {
    const ics = buildIcs({ ...r, name, url: `${window.location.origin}/?tab=training` })
    if (!ics) return
    const result = await deliverIcs(ics, 'fitflow-training.ics')
    if (result === 'downloaded') setStatus('Datei gespeichert – öffne sie, um die Termine in deinen Kalender zu übernehmen.')
    else if (result === 'shared') setStatus('Wähle deinen Kalender aus, um die Termine zu übernehmen.')
  }

  return (
    <section className="setSection">
      <h4>Trainings-Erinnerung</h4>
      <p className="setHint">Legt wiederkehrende Termine mit Alarm in deinem Handy-Kalender an. Die erinnern zuverlässig, auch wenn FitFlow geschlossen ist.</p>
      <div className="dayChips" role="group" aria-label="Trainingstage">
        {WEEKDAYS.map(([key, label]) => (
          <button key={key} type="button" aria-pressed={r.days.includes(key)} className={r.days.includes(key) ? 'active' : ''} onClick={() => toggleDay(key)}>{label}</button>
        ))}
      </div>
      {r.days.length > 0 && r.days.length !== goal && (
        <p className="setHint">Dein Wochenziel sind {goal} Trainings – du hast {r.days.length} Tage gewählt.</p>
      )}
      <div className="fieldGrid">
        <label className="field">
          <span>Uhrzeit</span>
          <input type="time" value={r.time} onChange={(e) => { setStatus(null); setR((p) => ({ ...p, time: e.target.value || p.time })) }} />
        </label>
        <label className="field">
          <span>Alarm</span>
          <select value={r.alarm} onChange={(e) => setR((p) => ({ ...p, alarm: Number(e.target.value) }))}>
            {ALARMS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </label>
      </div>
      <button className="ghostBtn block" onClick={addToCalendar} disabled={!r.days.length}>
        <BellRing size={17} /> Zum Kalender hinzufügen
      </button>
      {status && <p className="setHint" role="status">{status}</p>}
      <p className="setHint subtle">Tage oder Uhrzeit geändert? Einfach erneut hinzufügen und den alten Termin im Kalender löschen.</p>
    </section>
  )
}
