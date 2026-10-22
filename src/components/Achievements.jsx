import React, { useState } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import BadgeIcon from './BadgeIcon'
import { evaluateAchievements, weekComparison } from '../lib/achievements'

function Delta({ now, before, unit = '' }) {
  if (!before && !now) return <span className="delta same">–</span>
  const diff = now - before
  if (diff === 0) return <span className="delta same"><Minus size={13} /> gleich</span>
  const Icon = diff > 0 ? ArrowUp : ArrowDown
  return <span className={`delta ${diff > 0 ? 'up' : 'down'}`}><Icon size={13} /> {Math.abs(diff).toLocaleString('de-DE')}{unit}</span>
}

export function WeekCompare({ history }) {
  const { current, previous } = weekComparison(history)
  const rows = [
    ['Trainings', current.count, previous.count, ''],
    ['Minuten', current.minutes, previous.minutes, ''],
    ['Volumen', current.volume, previous.volume, ' kg'],
  ]
  return (
    <article className="compareCard">
      <h3>Diese Woche</h3>
      <p className="compareHint">Verglichen mit dem gleichen Zeitraum der Vorwoche</p>
      <ul>
        {rows.map(([label, now, before, unit]) => (
          <li key={label}>
            <span>{label}</span>
            <strong className="num">{now.toLocaleString('de-DE')}{unit}</strong>
            <Delta now={now} before={before} unit={unit} />
          </li>
        ))}
      </ul>
    </article>
  )
}

export default function Achievements({ history, goal }) {
  const list = evaluateAchievements(history, goal)
  const unlocked = list.filter((a) => a.unlocked).length
  const [open, setOpen] = useState(null)
  return (
    <article className="badgeCard">
      <div className="badgeHead">
        <h3>Abzeichen</h3>
        <span>{unlocked} von {list.length}</span>
      </div>
      <div className="badgeGrid">
        {list.map((a) => (
          <button key={a.id} className={`badge${a.unlocked ? ' unlocked' : ''}${open === a.id ? ' open' : ''}`} onClick={() => setOpen(open === a.id ? null : a.id)} aria-label={`${a.title}: ${a.text}${a.unlocked ? ', freigeschaltet' : ''}`}>
            <BadgeIcon id={a.id} locked={!a.unlocked} />
            <strong>{a.title}</strong>
            {!a.unlocked && a.target > 1 && (
              <i className="badgeProgress" aria-hidden="true"><b style={{ width: `${(a.value / a.target) * 100}%` }} /></i>
            )}
          </button>
        ))}
      </div>
      {open && (() => {
        const a = list.find((x) => x.id === open)
        return <p className="badgeDetail">{a.text}{!a.unlocked && a.target > 1 ? ` – ${a.value.toLocaleString('de-DE')} von ${a.target.toLocaleString('de-DE')}` : ''}{a.unlocked ? ' ✓' : ''}</p>
      })()}
    </article>
  )
}
