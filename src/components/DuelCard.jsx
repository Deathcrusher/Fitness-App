import React from 'react'
import { Crown, Swords } from 'lucide-react'
import { fmtVolume } from '../lib/storage'

function startOfWeek(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

/** Wochenwerte pro Person */
export function weekStats(history, ownerOf, owner, start = startOfWeek()) {
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  const list = history.filter((e) => {
    const d = new Date(`${e.date}T12:00:00`)
    return d >= start && d < end && ownerOf(e) === owner
  })
  return {
    count: list.length,
    minutes: Math.round(list.reduce((n, e) => n + (e.durationSec || 0), 0) / 60),
    sets: list.reduce((n, e) => n + (e.sets || 0), 0),
    volume: list.reduce((n, e) => n + (e.volume || 0), 0),
  }
}

/** Wer liegt vorn? Erst Trainings, dann Minuten. null bei Gleichstand. */
export function leaderOf(a, b) {
  if (a.count !== b.count) return a.count > b.count ? 'a' : 'b'
  if (a.minutes !== b.minutes) return a.minutes > b.minutes ? 'a' : 'b'
  return null
}

export default function DuelCard({ history, ownerOf, people, me, goal }) {
  const [pa, pb] = people
  const a = weekStats(history, ownerOf, pa.key)
  const b = weekStats(history, ownerOf, pb.key)
  const lead = a.count + b.count > 0 ? leaderOf(a, b) : null
  const together = a.count + b.count
  const target = goal * 2
  const side = (p, s, isLead) => (
    <div className={`duelSide${isLead ? ' lead' : ''}${p.key === me ? ' me' : ''}`}>
      {isLead && <span className="duelCrown" aria-label="Führt diese Woche"><Crown size={14} /></span>}
      <h4>{p.name}</h4>
      <span className="duelBig num">{s.count}<small>/{goal}</small></span>
      <ul>
        <li>{s.minutes} Min</li>
        <li>{s.sets} Sätze</li>
        {s.volume > 0 && <li>{fmtVolume(s.volume)}</li>}
      </ul>
    </div>
  )
  let note = 'Neue Woche, neues Duell – wer legt vor?'
  if (together > 0 && !lead) note = 'Gleichstand! Das nächste Training entscheidet.'
  else if (lead) note = `${(lead === 'a' ? pa : pb).name} führt diese Woche.`
  if (a.count >= goal && b.count >= goal) note = 'Beide haben das Wochenziel geschafft – stark! 🎉'

  return (
    <article className="duelCard">
      <div className="chartHead">
        <div>
          <h3><Swords size={17} /> {pa.name} vs. {pb.name}</h3>
          <p>Diese Woche</p>
        </div>
      </div>
      <div className="duelGrid">
        {side(pa, a, lead === 'a')}
        <span className="duelVs">VS</span>
        {side(pb, b, lead === 'b')}
      </div>
      <p className="duelNote">{note}</p>
      <div className="duelTogether">
        <p><span>Gemeinsam</span><span className="num">{together} von {target} Trainings</span></p>
        <i className="goalBar" aria-hidden="true"><b style={{ width: `${Math.min(100, (together / target) * 100)}%` }} /></i>
      </div>
    </article>
  )
}
